/* ==========================================================================
   SINGE: Studies In Geography - game logic (js/game.js)
   Loaded AFTER the map modules in maps/*.js (see index.html).

   GAME MODES (each map turns them on or off in its settings file; see modesFor() below)
     practice  hover / tap regions to read their names; click for more information (no score)
     regions   click the named region (has a saved score)
     capitals  click the circle marking the capital city that is named
               (only offered when the map's regions have a "capital")
     flags     a flag is shown; click the region it belongs to
               (only offered when the map's regions have a "flag" image)

   Game-wide settings are in config.js. Each map has a folder, maps/<map>/, with shapes.js, settings.js
   and lang/<code>.json (its translations). Which maps a zip has is set by its package in edugame.json.
   All text the player sees comes from lang/<code>.json (interface, read with EduGame.t) and the maps'
   own files - see section 0a below. The EduGame Kit's helper (edugame.js) chooses the language, and
   draws the header with the Options button (appearance and language).
   ========================================================================== */
(function () {
  'use strict';

  var EG = window.EduGame;             // the kit's helper (made by "edugame build" / "edugame preview")
  if (!EG) {
    document.body.textContent = 'Open SINGE with "edugame preview ." or from a zip made with "edugame build": see docs/GUIDE.md.';
    return;
  }
  var CONFIG = loadConfig();           // game-wide settings from config.js (with defaults)
  // The maps of this zip: its package's "maps" in edugame.json. Each is a map's folder name, or
  // { id, file, scope } for a map listed more than once (the World map: UN countries, and everything).
  // "shapes": another map's shapes file to draw (the Africa maps draw the World map's: maps/world/shapes.js).
  var PACKAGE_MAPS = (EG.config.package && EG.config.package.config && EG.config.package.config.maps) || CONFIG.maps || [];
  var ENTRIES = PACKAGE_MAPS.map(function (m) {
    var e = typeof m === 'string' ? { id: m } : m;
    var o = { file: e.file || e.id };
    o.shapes = e.shapes || o.file;
    Object.keys(e).forEach(function (k) { o[k] = e[k]; });
    return o;
  });
  var MAPS = [];                       // every map: shapes (maps/<map>/shapes.js) joined with settings (maps/<map>/settings.js); filled in at start-up
  var loadErrors = [];                 // map files that could not be loaded
  var MAX_TRIES = CONFIG.max_tries;    // wrong guesses allowed before the answer is highlighted
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var $ = function (id) { return document.getElementById(id); };

  // Read config.js; anything missing falls back to these defaults.
  function loadConfig() {
    var c = {
      max_tries: 3,
      mode_order: ['practice', 'regions', 'capitals', 'flags'],
      default_modes: { practice: true, regions: true, capitals: true, flags: false },
      scored_modes: ['regions', 'capitals', 'flags'],
      pass_accuracy: { regions: 80, capitals: 0, flags: 0 },
      skip_enabled: null,
      zoom_step: 1.5,
      zoom_levels: 5,
      fullscreen_button: false,          // show the Full Screen button (hidden: Kolibri has its own full page mode)
      infinite_scroll: true,             // world-type maps: dragging sideways goes round without end (a map can override)
      marker_px: 16,                     // tiny regions smaller than this many screen pixels get a click circle
      maps: []
    };
    var user = window.SINGE_CONFIG || {};
    Object.keys(user).forEach(function (k) {
      var v = user[k];
      if (v && typeof v === 'object' && !Array.isArray(v) && c[k]) {      // merge small tables like mode_label
        Object.keys(v).forEach(function (kk) { c[k][kk] = v[kk]; });
      } else {
        c[k] = v;
      }
    });
    return c;
  }

  /* =====================================================================
     0a. LANGUAGE
     Interface text: lang/<code>.json, read with EduGame.t (the helper picks the language: the learner's choice
       in Options, then Kolibri's or the learning system's, the browser's, and the default - the first in edugame.json).
       index.html marks text with data-t="<key>" (and data-t-attr="title:<key>,aria-label:<key>"); the helper fills it in.
     Map text: maps/<map>/lang/<code>.json ({ name, blurb, credit, variants: { '<entry id>': {name, blurb} },
       regions: { '<region>': { name, capital, info, capital_info } } }), laid over the settings file's text
       (which is in the default language). Anything left out keeps the default language's text.
     ===================================================================== */
  var DEFAULT_LANG = EG.config.languages[0];
  var lang = DEFAULT_LANG;             // the language in use (EduGame.language())
  var MAPTEXT = {};                    // 'map file|language' -> map text, or null (no translation)

  function tr(key, params) { return EG.t(key, params); }
  function modeLabel(mode) { return tr('mode.' + mode); }
  function languageName(code) {
    var l = EG.languages().filter(function (x) { return x.code === code; })[0];
    return l ? l.name : code;
  }

  // Load each map's translation into the language in use (the default language needs none: its text is in the
  // settings files). A missing file just means "not translated".
  function ensureMapText(done) {
    var L = lang, seen = {};
    var todo = L === DEFAULT_LANG ? [] : MAPS.filter(function (m) {
      if (seen[m.file]) return false;
      seen[m.file] = true;
      return !MAPTEXT.hasOwnProperty(m.file + '|' + L);
    });
    Promise.all(todo.map(function (m) {
      return EG.loadLanguage('maps/' + m.file + '/lang', { language: L }).then(function (text) {
        MAPTEXT[m.file + '|' + L] = text;
        if (text && text.regions) Object.keys(text.regions).forEach(function (n) {
          if (!m.regions.some(function (r) { return r.name === n; })) {
            console.warn('SINGE: maps/' + m.file + '/lang/' + L + '.json mentions "' + n + '", which is not a region of that map.');
          }
        });
      });
    })).then(done, done);
  }
  function mapTextFor(map) { return lang === DEFAULT_LANG ? null : MAPTEXT[map.file + '|' + lang] || null; }
  // Map-level text (field: 'name', 'blurb' or 'credit'): translated if available, else the settings file's.
  function mapStr(map, field) {
    var m = mapTextFor(map), v = m && m.variants && m.variants[map.id];      // a map used twice (the two World maps) can be translated apart
    return (v && v[field]) || (m && m[field]) || map[field];
  }
  // Region-level text (field: 'name', 'capital', 'info' or 'capital_info').
  function regionStr(map, r, field) {
    var m = mapTextFor(map), x = m && m.regions && m.regions[r.name];
    if (x && x[field]) return x[field];
    return field === 'name' ? r.name : field === 'capital' ? (r.capital && r.capital.name) :
           field === 'info' ? r.info : (r.capital && r.capital.info);
  }

  /* =====================================================================
     0. LOADING MAPS
     Each map has a folder, maps/<name>/, with shapes.js (generated) and settings.js (hand-edited).
     They are joined by "id".
     ===================================================================== */
  // World maps: pick the regions of the chosen scope. Every region of the shapes file is copied (the shapes
  // file is never changed). In 'un' scope a part (Alaska...) is merged into its country and everything that is
  // not a UN member / observer is drawn grey ("off"); in 'all' scope parts stay separate and "containers"
  // (countries whose every piece was split off, which have no marker position) are dropped.
  // merge: { part: country } puts more parts into a country in 'un' scope (the Africa maps: Somaliland into Somalia).
  function worldScope(src, scope, merge) {
    var by = {}, out = [];
    merge = merge || {};
    src.forEach(function (r) {
      var o = { name: r.name, kind: r.kind, d: r.d || '', s: r.s || '', mk: r.mk, sz: r.sz || 0, small: r.small, cont: r.cont, sub: r.sub, un: !!r.un, ins: {}, twin: r.twin, decor: !!r.decor, part_of: r.part_of, mkn: r.mkn };
      Object.keys(r.ins || {}).forEach(function (k) { o.ins[k] = [r.ins[k]]; });
      by[r.name] = o;
    });
    src.forEach(function (r) {
      var o = by[r.name], into = r.part_of || (scope === 'un' && merge[r.name]), p = into && by[into];
      if (scope === 'un' && p) {                          // merge into the country
        if (!r.part_of && merge[r.name]) p.s = joinOutline((p.s || p.d) + (o.s || o.d));   // one country: no border between them
        else if (p.s || o.s) p.s = (p.s || p.d) + (o.s || o.d);  // outlines (see tools/world.py) follow the shapes
        p.d += o.d;
        if (o.sz > p.sz || !p.mk) { p.sz = Math.max(p.sz, o.sz); p.small = o.small; p.mk = o.mk || p.mk; }
        Object.keys(o.ins).forEach(function (k) { p.ins[k] = (p.ins[k] || []).concat(o.ins[k]); });
        return;
      }
      if (scope === 'all' && !o.mk) return;               // empty container
      if (scope === 'un') o.off = !o.un && !o.decor;      // not in the game: drawn grey (a "decor" piece, like Annobón, is drawn plain)
      if (r.kind === 'none') o.off = true;                // held by nobody, or disputed with no line (Bir Tawil): grey in every scope
      out.push(o);
    });
    return out.filter(function (o) { return o.d || o.mk; });
  }
  // The outline of shapes put together (a "merge": Somaliland into Somalia): every edge of their paths except the ones
  // they share, which are drawn twice, once by each (tools/world.py simplifies a shared border once, so both have the
  // same points). Returns an outline path for "s" (see addRegion). Paths use M m L l H h V v Z z, as the shapes files do.
  function joinOutline(d) {
    var edges = [], count = {}, x = 0, y = 0, sx = 0, sy = 0, cmd = '', m, re = /([MmLlHhVvZz])|(-?\d*\.?\d+(?:e-?\d+)?)/g, nums = [];
    function key(a, b, c, e) { return a < c || (a === c && b < e) ? a + ',' + b + ',' + c + ',' + e : c + ',' + e + ',' + a + ',' + b; }
    function edge(nx, ny) {
      if (nx !== x || ny !== y) { var k = key(x, y, nx, ny); count[k] = (count[k] || 0) + 1; edges.push([x, y, nx, ny, k]); }
      x = nx; y = ny;
    }
    function run() {                                   // the numbers after a command
      var step = /[HhVv]/.test(cmd) ? 1 : 2;
      for (var i = 0; i + step <= nums.length; i += step) {
        var a = nums[i], b = nums[i + 1];
        if (cmd === 'M' || cmd === 'm') {
          if (i === 0) { x = cmd === 'M' ? a : x + a; y = cmd === 'M' ? b : y + b; sx = x; sy = y; }
          else edge(cmd === 'M' ? a : x + a, cmd === 'M' ? b : y + b);   // (more pairs after M are lines)
        }
        else if (cmd === 'L') edge(a, b);
        else if (cmd === 'l') edge(x + a, y + b);
        else if (cmd === 'H') edge(a, y);
        else if (cmd === 'h') edge(x + a, y);
        else if (cmd === 'V') edge(x, a);
        else if (cmd === 'v') edge(x, y + a);
      }
      nums = [];
    }
    while ((m = re.exec(d))) {
      if (m[1]) {
        run(); cmd = m[1];
        if (cmd === 'Z' || cmd === 'z') { edge(sx, sy); }
      } else nums.push(parseFloat(m[2]));
    }
    run();
    var out = '', lastX = null, lastY = null;
    edges.forEach(function (e) {
      if (count[e[4]] > 1) return;                     // shared: inside the joined shape
      if (e[0] !== lastX || e[1] !== lastY) out += 'M' + e[0] + ',' + e[1];
      out += 'L' + e[2] + ',' + e[3];
      lastX = e[2]; lastY = e[3];
    });
    return out;
  }
  // Titles of the boxes under a world map: the shapes file's, overridden by the settings file's "insets".
  function mergeInsets(shapeInsets, settingsInsets) {
    return (shapeInsets || []).map(function (ins) {
      var o = {}; Object.keys(ins).forEach(function (k) { o[k] = ins[k]; });
      var t = settingsInsets && settingsInsets[ins.id] && settingsInsets[ins.id].title;
      if (t) o.title = t;
      return o;
    });
  }

  function buildMaps() {
    var settings = {}, maps = [];
    var shapes = {};
    (window.GeoMapSettings || []).forEach(function (s) { settings[s.id] = s; });
    (window.GeoMapShapes || []).forEach(function (sh) { shapes[sh.id] = sh; });
    ENTRIES.forEach(function (entry) {
      var shape = shapes[entry.shapes];
      if (!shape) return;                                   // its file did not load (reported on the menu)
      var s = {}, base = settings[entry.file];
      if (!base) console.warn('SINGE: no settings file for map "' + entry.file + '" - using defaults.');
      Object.keys(base || {}).forEach(function (k) { s[k] = base[k]; });
      var variant = (s.variants || {})[entry.id] || {};                   // a map listed twice: each has its own name and blurb
      Object.keys(variant).forEach(function (k) { s[k] = variant[k]; });
      Object.keys(entry).forEach(function (k) { if (k !== 'id' && k !== 'file') s[k] = entry[k]; });   // what the package's entry changes (scope)
      var byName = s.regions || {}, known = {}, kindOf = {}, regions = [];
      // World-type maps (shape.wrap) list every country AND territory; "scope" decides which are in the game
      // ('un': UN members + Vatican + Palestine, parts merged into their country; 'all': everything, parts separate).
      var scope = shape.wrap ? (s.scope === 'all' ? 'all' : 'un') : undefined;
      var list = shape.wrap ? worldScope(shape.regions, scope, s.merge) : shape.regions;
      // A WINDOW on a world map (the Africa maps): only the regions named in "in_game" are asked about; the others
      // are drawn grey, like the countries outside the UN in 'un' scope. The view fits the regions in the game.
      var inGame = null;
      if (s.in_game) {
        inGame = {};
        s.in_game.forEach(function (n) { inGame[n] = true; });
        list.forEach(function (r) { if (!inGame[r.name] && !r.decor) r.off = true; });
        s.in_game.forEach(function (n) {
          if (!list.some(function (r) { return r.name === n && !r.off; })) console.warn('SINGE: "' + n + '" in in_game of ' + entry.id + ' is not a region of this map in this scope.');
        });
      }
      var insets = s.insets === false ? [] : mergeInsets(shape.insets, s.insets);
      shape.regions.forEach(function (r) { known[r.name] = true; });
      // include_territories: false hides every region the shapes file calls a "territory"
      // (and boxes drawn for them). "district" regions (Washington D.C.) stay drawn but are not asked about.
      var noTerritories = s.include_territories === false;
      list.forEach(function (r) {
        kindOf[r.name] = r.kind;
        if (noTerritories && r.kind === 'territory') return;
        var inactive = (noTerritories && r.kind === 'district') || !!r.off || !!r.decor;
        var rs = inactive ? {} : (byName[r.name] || {}), c = rs.capital, capital = null;
        if (c && c.name) {
          if (typeof c.lat === 'number' && typeof c.lon === 'number') {
            capital = { name: c.name, lonlat: [c.lon, c.lat], info: c.info, hideInPractice: c.hide_in_practice, withRegion: c.with,
                      nudge: c.nudge };       // nudge: [lat, lon] where the circle sits while the map is zoomed out (see nudge_zoom_levels)
          } else {
            console.warn('SINGE: capital "' + c.name + '" of ' + r.name + ' needs numeric lat and lon.');
          }
        }
        regions.push({ name: r.name, d: r.d, small: r.small, inset: r.inset, kind: r.kind, inactive: inactive,
                       off: r.off, mk: r.mk, sz: r.sz, ins: r.ins, cont: r.cont, sub: r.sub, s: r.s, twin: r.twin, part_of: r.part_of, mkn: r.mkn,
                       province: rs.province, info: rs.info, flag: rs.flag, capital: capital });
      });
      // COMBINED PLACES: a "twin" (Sint Maarten) has no shape of its own: it shares the shape, circles and capital circle
      // of its "host" (Saint Martin) but is still a separate entry in every game mode. host = number of the region that
      // has the shape; members = numbers of everything that shares it (on the host).
      var at = {};
      regions.forEach(function (r, i) { at[r.name] = i; });
      regions.forEach(function (r, i) {
        if (r.twin === undefined || at[r.twin] === undefined) return;
        r.host = at[r.twin];
        var h = regions[r.host];
        (h.members = h.members || [r.host]).push(i);
      });
      Object.keys(byName).forEach(function (n) {      // catch typos in region names
        if (!known[n]) console.warn('SINGE: settings for "' + entry.file + '" mention "' + n + '", which is not a region in the map shapes.');
      });
      var frames = (shape.frames || []).filter(function (f) { return !(noTerritories && kindOf[f.region] === 'territory'); });
      maps.push({ id: entry.id, file: entry.file, name: s.name || entry.id, blurb: s.blurb || '', credit: s.credit || '', image: s.image,
                  bounds: shape.bounds, scale: shape.scale, projection: shape.projection,
                  origin: shape.origin, size: shape.size, frames: frames,
                  zoom_levels: s.zoom_levels, zoom_step: s.zoom_step, orientation: s.orientation,
                  pass_accuracy: s.pass_accuracy, skip: s.skip, modes: s.modes, regions: regions,
                  wrap: shape.wrap, strip: insets.length ? shape.strip : null, strip_y: insets.length ? shape.strip_y : null,
                  total: insets.length ? shape.total : null, lakes: shape.lakes, window: !!inGame, view_pad: s.view_pad,
                  insets: insets, scope: scope, max_map_height: s.max_map_height,
                  infinite_scroll: s.infinite_scroll, page_width: s.page_width, fit_all_min_height: s.fit_all_min_height,
                  circle_ratio: s.circle_ratio, marker_px: s.marker_px, nudge_zoom_levels: s.nudge_zoom_levels });
    });
    Object.keys(settings).forEach(function (id) {
      if (!ENTRIES.some(function (e) { return e.file === id; })) console.warn('SINGE: settings for "' + id + '" have no matching map shapes file.');
    });
    return maps;
  }

  /* =====================================================================
     1. SAVING AND SCORES: the EduGame Kit's save helper (edugame.js)
        SINGE is a "Scored Game" made with the EduGame Kit (github.com/togetherings/edugame-kit). The helper
        finds out where the game runs (Kolibri, Moodle and other SCORM systems, RACHEL, Kiwix, a web page...) and saves
        there. This file only does three things with it:
          EduGame.ready()    -> what was saved before (each board's best result)
          EduGame.start()    -> a round begins (the helper times it)
          EduGame.finish()   -> a round ends: {acc: accuracy %}, on the board of that map and mode
        A "board" is one scored thing: a map in one mode. Its id is the map's id for the Regions game ("sierra_leone"),
        and "<map id>_capitals" / "<map id>_flags" for the other scored modes. Each board keeps the learner's BEST round:
        the highest accuracy, and for equal accuracy the shortest time (edugame.json: rank_by acc, then time).
        The helper saves each board as [accuracy, seconds, times played] in SCORM suspend_data, and Kolibri Games
        builds its scoreboards from it.
        A round that does not reach the mode's pass mark (see goalFor) is played but not kept as a result.
        Learning systems get "incomplete" when the game opens and "passed" after a round that counts; Kolibri itself
        never gets a score (the helper takes care of that).
     ===================================================================== */
  var scores = {};      // board id -> [accuracy, seconds, times played] (the learner's kept results)
  var helperInfo = null;                          // what EduGame.ready() told us

  // The board of one map in one mode (the map's id is unique: the two World variants are "world" and "world_all").
  function saveId(map, mode) { return mode === 'regions' ? map.id : map.id + '_' + mode; }

  // The accuracy goal (%) for one mode of a map: the map's own setting if it has one, otherwise the
  // default in config.js. 0 means "no goal": every finished round counts as a result.
  function goalFor(map, mode) {
    var own = map.pass_accuracy && map.pass_accuracy[mode];
    var v = (own !== undefined && own !== null) ? own : (CONFIG.pass_accuracy && CONFIG.pass_accuracy[mode]);
    return +v > 0 ? +v : 0;
  }

  // Is the skip feature on for this mode of this map? config.js "skip_enabled" (true / false) overrides
  // every map; when it is null the map's own "skip" setting decides (true if not set).
  // A map's "skip" can be true / false, or per mode: { regions: true, capitals: false }.
  function skipEnabled(map, mode) {
    if (CONFIG.skip_enabled === true || CONFIG.skip_enabled === false) return CONFIG.skip_enabled;
    var s = map.skip;
    if (s && typeof s === 'object') return s[mode] !== false;
    return s !== false;
  }

  // Read what the helper has: every board's kept result. (done: called with nothing, once everything is read)
  function loadScores(done) {
    EG.ready().then(function (info) {
      helperInfo = info || {};
      scores = {};
      var res = helperInfo.results || {};
      Object.keys(res).forEach(function (id) {
        var r = res[id];
        if (r && typeof r.acc === 'number') scores[id] = [r.acc, r.time || 0, r.plays || 0];
      });
      done();
    }, function () { helperInfo = {}; done(); });
  }

  // One finished round: the helper keeps it if it counts, and the board's kept result comes back.
  // Resolves with { kept: [acc, secs, plays] or null, counted: bool, newBest: bool }; never rejects (a failed save is only logged).
  function recordResult(id, acc, secs, counts) {
    return EG.finish({ acc: acc }, { board: id, passed: counts }).then(function (r) {
      // A round that counts is when learning systems get "passed"; on the website it also ticks this set of maps
      // on the kit's menu page (menu.html), which shows a set as done once its page called complete().
      if (r.passed) EG.complete();
      var k = r.kept;
      if (k && typeof k.acc === 'number') scores[id] = [k.acc, k.time || 0, k.plays || 0];
      return { kept: scores[id] || null, counted: !!r.passed, newBest: !!r.newBest };
    }, function (err) {
      console.warn('SINGE: the result could not be saved: ' + (err && err.message));
      return { kept: scores[id] || null, counted: counts, newBest: false };
    });
  }

  /* =====================================================================
     2. SMALL HELPERS
     ===================================================================== */
  function fmtTime(secs) {
    secs = Math.round(secs);
    var m = Math.floor(secs / 60), s = secs % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }
  function shuffle(arr) {               // Fisher-Yates shuffle (returns a copy)
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  // Which lines of the bar, and the zoom buttons, lie over the map: the map's "overlay" setting, e.g.
  // overlay: { buttons: false, prompt: false, feedback: true, zoom: true } (the default). A world map (not a window)
  // lays everything over its top, where there is little but sea and ice.
  function overlayOf(map) {
    var o = map.overlay || {}, world = !!map.wrap && !map.window;
    function pick(k, d) { return typeof o[k] === 'boolean' ? o[k] : d; }
    return { buttons: pick('buttons', world), prompt: pick('prompt', world), feedback: pick('feedback', true), zoom: pick('zoom', true) };
  }
  function applyLayout(map) {
    var o = overlayOf(map);
    [['row1', o.buttons], ['row2', o.prompt], ['feedback', o.feedback]].forEach(function (r) {
      (r[1] ? $('mapTop') : $('bar')).appendChild($(r[0]));      // (in order, so the lines keep their order)
    });
    $('mapWrap').classList.toggle('zoomOver', o.zoom);
    placeZoom();
  }
  function show(screenId) {
    ['menu', 'game', 'results'].forEach(function (id) { $(id).classList.toggle('hidden', id !== screenId); });
    // maps with orientation: 'horizontal' use a wider page while being played
    var inGame = screenId === 'game' && !!g.map;
    if (inGame) applyLayout(g.map);
    document.body.classList.toggle('wide', inGame && g.map.orientation === 'horizontal');
    // a world map: the game bar is laid over the top of the map (nothing much is up there) to save height
    document.body.classList.toggle('overlay', inGame && !!g.map.wrap && !g.map.window);   // (a window's top edge has land: the bar stays above it)
    checkRotate();
    if (inGame && g.map.page_width) document.body.style.setProperty('--pageW', g.map.page_width + 'px');
    else document.body.style.removeProperty('--pageW');
  }
  // Phones held upright with a wide map: ask for the device to be turned (it can be dismissed; the game still works).
  // (Browsers only allow a real orientation lock in full screen, so this is a request, not a lock - see startGame.)
  var rotateDismissed = false;
  function checkRotate() {
    var need = !rotateDismissed && g && g.map && g.map.orientation === 'horizontal' && !$('game').classList.contains('hidden') &&
               window.innerHeight > window.innerWidth && Math.min(window.innerWidth, window.innerHeight) < 700;
    document.body.classList.toggle('needRotate', !!need);
  }
  function el(tag, cls, text) {         // tiny helper to make an HTML element
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  // Which game modes does this map offer? A mode must be switched on (the map's "modes" setting,
  // or default_modes in config.js) and the map needs the data for it (capitals / flags).
  var warnedModes = {};
  function modesFor(map) {
    var out = [];
    CONFIG.mode_order.forEach(function (mode) {
      var set = map.modes && map.modes[mode] !== undefined;
      var wanted = set ? !!map.modes[mode] : !!CONFIG.default_modes[mode];
      if (!wanted) return;
      var hasData = mode === 'capitals' ? map.regions.some(function (r) { return r.capital; }) :
                    mode === 'flags'    ? map.regions.some(function (r) { return r.flag; }) : true;
      if (!hasData) {
        if (set && !warnedModes[map.id + mode]) {
          warnedModes[map.id + mode] = true;
          console.warn('SINGE: map "' + map.id + '" turns on mode "' + mode + '" but has no ' + (mode === 'capitals' ? 'capitals' : 'flags') + '.');
        }
        return;
      }
      out.push(mode);
    });
    return out;
  }

  /* =====================================================================
     3. MENU - one card per map, with a button for each game mode
     ===================================================================== */
  function bestLine(id) {
    var s = scores[id];
    return s ? tr('menu.best', { acc: s[0], time: fmtTime(s[1]) }) : tr('menu.not_played');
  }

  function buildMenu() {
    var list = $('menuList');
    list.innerHTML = '';
    if (!MAPS.length) {
      list.textContent = tr('menu.no_maps');
    }
    loadErrors.forEach(function (src) { list.appendChild(el('p', 'credit', tr('menu.load_error', { file: src }))); });
    var done = 0, total = 0;                          // "3 of 40 done": game modes (not Practice) whose goal is met
    MAPS.forEach(function (map) {
      var card = el('div', 'mapCard');
      if (map.image) {                                // optional picture, floated right (see .mapImg in index.html)
        var pic = el('img', 'mapImg');
        pic.src = map.image;
        pic.alt = '';                                  // decorative: the map name is right next to it
        pic.title = mapStr(map, 'name');               // hover text: the map's name
        pic.onerror = function () { pic.style.display = 'none'; };
        card.appendChild(pic);
      }
      card.appendChild(el('h3', '', mapStr(map, 'name')));
      card.appendChild(el('div', 'blurb', mapStr(map, 'blurb') || ''));
      if (lang !== DEFAULT_LANG && !mapTextFor(map)) {     // no translation: say which language it is in
        var note = el('div', 'langNote', tr('menu.default_only', { 'default': languageName(DEFAULT_LANG) }));
        note.title = tr('menu.default_only_hint', { language: languageName(lang) });
        card.appendChild(note);
      }
      var row = el('div', 'modes');
      modesFor(map).forEach(function (mode) {
        var b = el('button', 'modeBtn');
        b.setAttribute('data-map', map.id); b.setAttribute('data-mode', mode);
        b.appendChild(el('b', '', modeLabel(mode)));
        if (mode === 'practice') {
          b.appendChild(el('small', '', tr('menu.practice_hint')));
        } else {
          var goal = goalFor(map, mode), s = scores[saveId(map, mode)];
          if (goal) b.appendChild(el('small', 'goal', tr('menu.goal', { pct: goal })));
          b.appendChild(el('small', '', bestLine(saveId(map, mode))));
          if (s && s[2]) b.appendChild(el('small', '', tr('menu.completed', { n: s[2] })));
          if (goal && s && s[0] >= goal) { b.classList.add('met'); b.title = tr('menu.goal_met'); }
          total++;
          if (s && (!goal || s[0] >= goal)) done++;  // (a mode with no goal is done once played)
        }
        b.onclick = function () { startGame(map, mode); };
        row.appendChild(b);
      });
      card.appendChild(row);
      list.appendChild(card);
    });
    $('menuDone').textContent = total ? tr('menu.done', { n: done, total: total }) : '';
  }

  /* =====================================================================
     3b. PROJECTION (only for maps that use one, like the United States)
     Same maths as albers() in tools/map_generation.py - keep the two in step.
     ===================================================================== */
  function albers(lon, lat, p) {            // lon/lat -> flat x, y on a unit sphere
    var rad = Math.PI / 180;
    var n = (Math.sin(p.p1 * rad) + Math.sin(p.p2 * rad)) / 2;
    var c = Math.pow(Math.cos(p.p1 * rad), 2) + 2 * n * Math.sin(p.p1 * rad);
    var rho0 = Math.sqrt(c - 2 * n * Math.sin(p.lat0 * rad)) / n;
    var dl = ((lon - p.lon0 + 540) % 360) - 180;          // wraps across the 180th meridian
    var rho = Math.sqrt(c - 2 * n * Math.sin(lat * rad)) / n, theta = n * dl * rad;
    return [rho * Math.sin(theta), rho0 - rho * Math.cos(theta)];
  }
  // Where on the SVG a longitude/latitude lies for this map and region (regions with an
  // "inset", such as Alaska, are moved and resized, so their capitals must be too).
  function millerY(lat) {                   // Miller cylindrical, in degree-equivalents (same as miller() in tools/world.py)
    var r = Math.max(-89, Math.min(89, lat)) * Math.PI / 180;
    return 1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * r)) * 180 / Math.PI;
  }
  // Position inside one of the boxes under a world map (a copy of the world, enlarged).
  function insetXY(ins, lon, lat) {
    var dl = lon - ins.lon0;
    while (dl < -90) dl += 360;
    while (dl > 270) dl -= 360;
    return [ins.x + dl * ins.s, ins.y + (millerY(ins.lat1) - millerY(lat)) * ins.s];
  }
  function inInset(ins, lon, lat) {
    var dl = lon - ins.lon0;
    while (dl < -90) dl += 360;
    while (dl > 270) dl -= 360;
    return dl >= 0 && dl <= ins.lon1 - ins.lon0 && lat >= ins.lat0 && lat <= ins.lat1;
  }
  function toXY(map, region, lon, lat) {
    var k = map.scale || 100, P, ins = region && region.inset;
    if (map.wrap) return [(lon + 180) * k * (map.projection.x_scale || 1), (millerY(map.projection.lat_top) - millerY(lat)) * k];   // (x_scale: the British Isles map is squeezed sideways)
    if (!map.projection) { var b = map.bounds; return [(lon - b[0]) * k, (b[3] - lat) * k]; }
    if (ins) {
      P = albers(lon, lat, ins.proj);
      if (ins.rot) { var cr = Math.cos(ins.rot), sr = Math.sin(ins.rot); P = [P[0] * cr - P[1] * sr, P[0] * sr + P[1] * cr]; }
      P = [ins.qx + (P[0] - ins.ax) * ins.s, ins.qy + (P[1] - ins.ay) * ins.s];
    } else {
      P = albers(lon, lat, map.projection);
    }
    return [(P[0] - map.origin[0]) * k, (map.origin[1] - P[1]) * k];
  }

  /* =====================================================================
     4. DRAWING THE MAP
     Converts each region's [lon,lat] points to SVG coordinates.
     ===================================================================== */
  function buildSvg(map) {
    var b = map.bounds, k = map.scale || 100;
    var w = map.projection ? map.size[0] : Math.round((b[2] - b[0]) * k);
    var h = map.projection ? map.size[1] : Math.round((b[3] - b[1]) * k);
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    function addRegion(r, i) {
      var d = r.d;                       // ready-made path wins if supplied
      if (!d) {
        d = 'M' + r.poly.map(function (p) {
          return ((p[0] - b[0]) * k).toFixed(1) + ',' + ((b[3] - p[1]) * k).toFixed(1);
        }).join('L') + 'Z';
      }
      var path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('d', d);
      path.setAttribute('class', r.inactive ? (r.off ? 'region inactive off' : 'region inactive') : 'region');
      path.setAttribute('data-name', r.name);
      path.setAttribute('data-i', i);    // index back into map.regions
      svg.appendChild(path);
    }
    // grey neighbours ("off": France's) first, then the boxes of moved regions (Alaska, Réunion), which hide whatever is
    // under them (an opaque sea-coloured back, then the box), then the grey neighbours drawn INSIDE a box (Brazil and
    // Suriname beside French Guiana), then the regions in the game
    map.regions.forEach(function (r, i) { if (r.off && !r.inset) addRegion(r, i); });
    (map.frames || []).forEach(function (f) {          // outlines around regions that were moved (e.g. Alaska)
      var pts = f.pts.map(function (p) { return p.join(','); }).join(' ');
      ['frame-back', 'frame'].forEach(function (cls) {
        var box = document.createElementNS(SVG_NS, 'polygon');
        box.setAttribute('class', cls);
        box.setAttribute('points', pts);
        svg.appendChild(box);
      });
    });
    map.regions.forEach(function (r, i) { if (r.off && r.inset) addRegion(r, i); });
    map.regions.forEach(function (r, i) { if (!r.off) addRegion(r, i); });
    return svg;
  }

  // CIRCLES. Three kinds of round click targets sit on top of the regions:
  //   .cap  capital city (Capitals mode, and Practice mode). A <g> holding a click area, a ring and a dot
  //   .mk   marker of a tiny region (world maps: Regions / Flags / Practice modes). Shown only while the
  //         region is smaller than "marker_px" on screen, so tiny countries and small island chains can be found
  // Both keep the same size on screen while zooming (see sizeCircles).
  var BIG_SZ = 400;                  // regions bigger than this (map units) never need a marker

  // Where each capital goes: [{ i: region number, xy: [x, y] }] on the main map, or inside box "ins" of a world map.
  function capList(map, ins) {
    var out = [], byName = {};
    map.regions.forEach(function (r, i) { byName[r.name] = i; });
    map.regions.forEach(function (r, i) {
      if (r.host !== undefined) return;                                 // a twin shares its host's circle (see buildMaps)
      // the capitals this circle stands for: one, or (combined places) one per place, with the circle in the middle
      var caps = (r.members || [i]).map(function (j) { return map.regions[j].capital; }).filter(function (c) {
        return c && !(g.mode === 'practice' && c.hideInPractice);       // e.g. Washington D.C. is only a region in Practice
      });
      if (!caps.length) return;
      // ll = real place; lln = where the circle sits while the map is zoomed out (moved apart from close neighbours)
      var ll = [0, 0], lln = [0, 0];
      caps.forEach(function (c) {
        var n = c.nudge ? [c.nudge[1], c.nudge[0]] : c.lonlat;               // (nudge is [lat, lon])
        ll[0] += c.lonlat[0] / caps.length; ll[1] += c.lonlat[1] / caps.length;
        lln[0] += n[0] / caps.length; lln[1] += n[1] / caps.length;
      });
      var w = g.mode === 'practice' && r.capital ? byName[r.capital.withRegion] : undefined;   // Practice: also stands for this region
      if (!ins) { out.push({ i: i, xy: toXY(map, r, lln[0], lln[1]), xy0: toXY(map, r, ll[0], ll[1]), w: w }); return; }
      if (r.ins && r.ins[ins.id] && inInset(ins, ll[0], ll[1])) {              // (the boxes never zoom: always the moved place)
        var q = insetXY(ins, lln[0], lln[1]);
        out.push({ i: i, xy: q, xy0: q, w: w });
      }
    });
    return out;
  }
  // Where each tiny-region marker goes: [{ i, x, y, sz }].
  function markerList(map, ins) {
    var out = [];
    map.regions.forEach(function (r, i) {
      if (r.inactive || r.host !== undefined || g.sharedWith[i]) return;   // (a twin has no marker: its host's; Practice: a region that shares its circle with a capital has none)
      if (!ins) {
        var n = r.mkn || r.mk;                            // (mkn: where the circle sits while zoomed out, if it was moved)
        if (r.mk && r.sz < BIG_SZ) out.push({ i: i, x: n[0], y: n[1], x0: r.mk[0], y0: r.mk[1], sz: r.sz });
      } else {
        ((r.ins && r.ins[ins.id]) || []).forEach(function (p) { if (p.sz < BIG_SZ) out.push({ i: i, x: p.mk[0], y: p.mk[1], x0: p.mk[0], y0: p.mk[1], sz: p.sz }); });
      }
    });
    return out;
  }
  // Distance from each item to its nearest neighbour: its click area may not be bigger than half of that,
  // so neighbouring click areas never overlap (important on the crowded East Coast, in Europe, the Caribbean).
  // (data-d: with the circles where they sit while zoomed out; data-d0: with them at their real places)
  function nearest(items) {
    items.forEach(function (a) {
      var d = Infinity, d0 = Infinity;
      items.forEach(function (b) {
        if (b === a) return;
        d = Math.min(d, Math.hypot(a.x - b.x, a.y - b.y));
        d0 = Math.min(d0, Math.hypot((a.x0 === undefined ? a.x : a.x0) - (b.x0 === undefined ? b.x : b.x0),
                                     (a.y0 === undefined ? a.y : a.y0) - (b.y0 === undefined ? b.y : b.y0)));
      });
      a.el.setAttribute('data-d', d);
      a.el.setAttribute('data-d0', d0);
      if (a.x0 !== undefined && (a.x0 !== a.x || a.y0 !== a.y)) {     // a moved circle: remember both places
        a.el.setAttribute('data-x0', a.x0); a.el.setAttribute('data-y0', a.y0);
        a.el.setAttribute('data-x1', a.x); a.el.setAttribute('data-y1', a.y);
      }
    });
  }
  function circle(cls, i, attr, x, y) {
    var c = document.createElementNS(SVG_NS, 'circle');
    c.setAttribute('class', cls);
    if (attr) c.setAttribute(attr, i);
    c.setAttribute('cx', x.toFixed(1));
    c.setAttribute('cy', y.toFixed(1));
    return c;
  }
  function placeMarkers(parent, list) {
    list.forEach(function (m) {
      m.el = circle('mk', m.i, 'data-i', m.x, m.y);
      m.el.setAttribute('data-sz', m.sz);
      m.el.setAttribute('data-name', g.map.regions[m.i].name);
      parent.appendChild(m.el);
    });
    nearest(list);
  }
  // Capitals: one <g class="cap" data-c=index> per capital holding a click area, a ring and a hidden black dot.
  // "mks" are the markers of the same container: in Practice mode a capital that sits on its own region's
  // marker is hidden while that marker is showing (the marker then works for both the country and the capital).
  function placeCaps(parent, list, mks) {
    var placed = [];
    list.forEach(function (c) {
      var grp = document.createElementNS(SVG_NS, 'g');
      grp.setAttribute('class', g.mode === 'practice' ? 'cap found' : 'cap');   // practice: dot shown
      grp.setAttribute('data-c', c.i);
      if (c.w !== undefined) grp.setAttribute('data-w', c.w);      // this circle is also the region number c.w (Rome + Vatican City)
      grp.appendChild(circle('hit', c.i, 'data-c', c.xy[0], c.xy[1]));    // invisible, bigger: easy to tap
      grp.appendChild(circle('ring', c.i, 'data-c', c.xy[0], c.xy[1]));
      grp.appendChild(circle('dot', c.i, null, c.xy[0], c.xy[1]));
      if (g.mode === 'practice') {
        (mks || []).forEach(function (m) {
          if (m.i === c.i && Math.hypot(m.x - c.xy[0], m.y - c.xy[1]) < 2.5 * g.capR) grp.setAttribute('data-co', c.i);
        });
      }
      parent.appendChild(grp);
      placed.push({ el: grp, x: c.xy[0], y: c.xy[1], x0: c.xy0 ? c.xy0[0] : c.xy[0], y0: c.xy0 ? c.xy0[1] : c.xy[1] });
    });
    nearest(placed);
  }
  // Add the capital circles (and, on world maps, the markers) to the map on screen.
  function addCapitals(svg, map) {
    g.capR = svg.viewBox.baseVal.width * (map.circle_ratio || 0.011);   // circle radius in map units
    var wantCaps = g.mode === 'capitals' || g.mode === 'practice';
    g.sharedWith = {};
    if (g.mode === 'practice') map.regions.forEach(function (r) {
      var w = r.capital && r.capital.withRegion;
      map.regions.forEach(function (q, k) { if (w && q.name === w) g.sharedWith[k] = true; });
    });
    if (!g.wrap) { placeCaps(svg, capList(map, null), []); return; }
    var wantMk = g.mode !== 'capitals';
    var mainMk = wantMk ? markerList(map, null) : [];
    placeMarkers(g.tile, mainMk);
    var boxMk = {};
    (map.insets || []).forEach(function (ins) {
      boxMk[ins.id] = wantMk ? markerList(map, ins) : [];
      placeMarkers(g.strip, boxMk[ins.id]);
    });
    if (wantCaps) {
      placeCaps(g.tile, capList(map, null), mainMk);
      (map.insets || []).forEach(function (ins) { placeCaps(g.strip, capList(map, ins), boxMk[ins.id]); });
    }
    if (g.infinite) {                                 // second copy of the world, one world-width to the right
      var copy = g.tile.cloneNode(true);
      copy.setAttribute('transform', 'translate(' + map.size[0] + ',0)');
      g.svg.appendChild(copy);
    }
  }

  // Keep circles the same size on screen while zoomed (ratio = current view / full view), and show or
  // hide the markers of tiny regions. Called after every zoom / pan and when the window changes size.
  function sizeCircles() {
    if (!g.svg) return;
    sizeIn(g.svg, g.ratio || 1, false);
    if (g.strip) sizeIn(g.strip, 1, true);
  }
  // Circles that were moved apart from a close neighbour sit at the moved place only on the most zoomed-out levels
  // ("nudge_zoom_levels", 2 = the first two); zoomed in further they are back at their real places. The boxes never zoom.
  function nudgeOn(ratio, fixed) {
    if (fixed) return true;
    var L = g.map.nudge_zoom_levels === undefined ? 2 : g.map.nudge_zoom_levels, step = g.map.zoom_step || CONFIG.zoom_step;
    return ratio > Math.pow(step, -(L - 1)) * 0.9;
  }
  function placeAt(e, on) {                           // move a circle (or the three circles of a capital) to its real / moved place
    if (!e.hasAttribute('data-x0')) return;
    var x = e.getAttribute(on ? 'data-x1' : 'data-x0'), y = e.getAttribute(on ? 'data-y1' : 'data-y0');
    var parts = e.tagName === 'g' ? e.querySelectorAll('circle') : [e];
    for (var k = 0; k < parts.length; k++) { parts[k].setAttribute('cx', x); parts[k].setAttribute('cy', y); }
  }
  function sizeIn(svg, ratio, fixed) {
    var moved = nudgeOn(ratio, fixed), dAttr = moved ? 'data-d' : 'data-d0';
    var m = svg.getScreenCTM(), px = m && m.a > 0 ? m.a : 1;          // screen pixels per map unit
    var markerPx = g.map.marker_px || CONFIG.marker_px;
    var base = Math.max(g.capR * ratio, 4 / px);                       // circle radius in map units (at least 4 pixels)
    var shown = {}, i, half;
    var mks = svg.querySelectorAll('.mk');
    for (i = 0; i < mks.length; i++) {
      var mk = mks[i], on = +mk.getAttribute('data-sz') * px < markerPx;
      shown[mk.getAttribute('data-i')] = shown[mk.getAttribute('data-i')] || on;
      mk.style.display = on ? '' : 'none';
      placeAt(mk, moved);
      if (on) mk.setAttribute('r', Math.min(base, +mk.getAttribute(dAttr) / 2));
    }
    var groups = svg.querySelectorAll('.cap');
    for (i = 0; i < groups.length; i++) {
      var grp = groups[i];
      placeAt(grp, moved);
      half = +grp.getAttribute(dAttr) / 2;                             // room available around this capital
      // click area: 3x the circle in Capitals mode (easy to tap), same size as the circle in Practice mode
      var hit = Math.min((g.mode === 'practice' ? 1 : 3) * base, half);
      var ring = Math.min(base, hit);
      grp.querySelector('.hit').setAttribute('r', hit);
      grp.querySelector('.ring').setAttribute('r', ring);
      grp.querySelector('.dot').setAttribute('r', ring * 0.4);
      var co = grp.getAttribute('data-co');
      grp.style.display = (co !== null && shown[co]) ? 'none' : '';
    }
  }

  // Small regions (flagged by the map generator) get an invisible wide outline ("halo") so a
  // finger can hit them. It is drawn under all regions, so it only covers empty space.
  function addHalos(svg, map) {
    var shapes = svg.querySelectorAll('.region'), first = svg.firstChild;
    map.regions.forEach(function (r, i) {
      if (!r.small || r.inactive) return;
      var halo = document.createElementNS(SVG_NS, 'path');
      halo.setAttribute('d', shapes[i].getAttribute('d'));
      halo.setAttribute('class', 'halo');
      halo.setAttribute('data-i', i);
      svg.insertBefore(halo, first);
    });
  }

  /* =====================================================================
     5. GAME LOGIC
     ===================================================================== */
  var g = {};   // state of the current game (reset in startGame)

  // WORLD MAPS (shapes file with "wrap"): the main svg holds one "tile" of the world; a second copy is added
  // to its right (see addCapitals) so dragging past the edge shows the other side. The boxes under the map
  // (Caribbean, Pacific) are a separate svg that never moves or zooms.
  function svgEl(tag, attrs) {
    var e = document.createElementNS(SVG_NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }
  // A region's shape. When the shapes file gives an outline "s" (a region with edges that must not be drawn: the
  // seam between the two copies of the world, or a merged leased area) the fill has no outline of its own and a
  // separate outline path follows it.
  function addRegion(parent, r, i, d, s) {
    var cls = r.inactive ? (r.off ? 'region inactive off' : 'region inactive') : 'region';
    parent.appendChild(svgEl('path', { d: d, 'class': s ? cls + ' nostroke' : cls, 'data-name': r.name, 'data-i': i }));
    if (s) parent.appendChild(svgEl('path', { d: s, 'class': r.off ? 'rstroke off' : 'rstroke' }));   // (grey for a grey region: Cyprus)
  }
  // Grey regions first, so a border shared by a grey region and one in the game is drawn in the game's colour.
  function inOrder(map, each) {
    map.regions.forEach(function (r, i) { if (r.off) each(r, i); });
    map.regions.forEach(function (r, i) { if (!r.off) each(r, i); });
  }
  function buildWorld(map) {
    var svg = svgEl('svg', { viewBox: '0 0 ' + map.size[0] + ' ' + map.size[1] });
    var tile = svgEl('g', { 'class': 'tile' });
    // (No wide invisible "halo" outlines on a world map: the circles of tiny regions do that job, and a halo several
    // times bigger than a tiny island overlapped its neighbours - Wallis and Futuna next to Samoa, for one.)
    inOrder(map, function (r, i) { if (r.d) addRegion(tile, r, i, r.d, r.s); });
    // big lakes that cross borders (Great Lakes, Victoria, Malawi...) are drawn as water on top of the land
    (map.lakes || []).forEach(function (l) { tile.appendChild(svgEl('path', { d: l.d, 'class': 'lake' })); });
    svg.appendChild(tile);
    g.tile = tile;
    return svg;
  }
  // Lakes on a map with grey regions: the shore is grey, and the stretches of it inside a region in the game are drawn
  // again in the game's colour (a copy of the outline clipped to those regions: a region's shape covers its share of
  // the lake). So a lake shared with a grey country is grey on that country's side. Needs the map on the page.
  function greyLakes(tile) {
    var lakes = tile.querySelectorAll('.lake'), regs = tile.querySelectorAll('.region:not(.off)');
    if (!lakes.length || !tile.querySelector('.region.off')) return;
    var boxes = [];
    for (var j = 0; j < regs.length; j++) boxes.push(regs[j].getBBox());
    for (var i = 0; i < lakes.length; i++) {
      var lake = lakes[i], lb = lake.getBBox(), clip = null;
      lake.classList.add('off');
      for (j = 0; j < regs.length; j++) {
        var bx = boxes[j];
        if (bx.x > lb.x + lb.width || bx.x + bx.width < lb.x || bx.y > lb.y + lb.height || bx.y + bx.height < lb.y) continue;
        if (!clip) clip = svgEl('clipPath', { id: 'lakeIn' + i });
        clip.appendChild(svgEl('path', { d: regs[j].getAttribute('d') }));
      }
      if (!clip) continue;
      lake.parentNode.insertBefore(clip, lake.nextSibling);
      lake.parentNode.insertBefore(svgEl('path', { d: lake.getAttribute('d'), 'class': 'lakeline', 'clip-path': 'url(#lakeIn' + i + ')' }), clip.nextSibling);
    }
  }
  function buildStrip(map) {
    var svg = svgEl('svg', { viewBox: '0 0 ' + map.strip[0] + ' ' + map.strip[1] });
    (map.insets || []).forEach(function (ins) {
      var clip = svgEl('clipPath', { id: 'clip_' + ins.id });
      clip.appendChild(svgEl('rect', { x: ins.x, y: ins.y, width: ins.w, height: ins.h }));
      svg.appendChild(clip);
      svg.appendChild(svgEl('rect', { 'class': 'inbox', x: ins.x, y: ins.y, width: ins.w, height: ins.h }));
      var grp = svgEl('g', { 'clip-path': 'url(#clip_' + ins.id + ')' });
      inOrder(map, function (r, i) {
        ((r.ins && r.ins[ins.id]) || []).forEach(function (p) { if (p.d) addRegion(grp, r, i, p.d, p.s); });
      });
      svg.appendChild(grp);
      if (ins.chains) svg.appendChild(svgEl('path', { 'class': 'chain', d: ins.chains }));   // boxes around the island groups
      // the title is INSIDE the box, at the top right (where there is room)
      var title = svgEl('text', { 'class': 'intitle', x: ins.x + ins.w - 14, y: ins.y + 70, 'text-anchor': 'end' });
      title.textContent = insetTitle(map, ins);
      svg.appendChild(title);
    });
    return svg;
  }
  // Title of a box under a world map: translated if the map's language file has it (insets: { id: 'title' }).
  function insetTitle(map, ins) {
    var m = mapTextFor(map);
    return (m && m.insets && m.insets[ins.id]) || ins.title;
  }

  // Crop the view to what is actually drawn (some regions may have been switched off).
  // Needs the map to be visible, because it measures the shapes.
  function fitView(svg) {
    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, items = svg.querySelectorAll('.region:not(.off), .frame');   // (grey neighbours are cut by the view)
    for (var i = 0; i < items.length; i++) {
      var b = items[i].getBBox();
      x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y);
      x1 = Math.max(x1, b.x + b.width); y1 = Math.max(y1, b.y + b.height);
    }
    var pad = (x1 - x0) * 0.012;
    svg.setAttribute('viewBox', [x0 - pad, y0 - pad, x1 - x0 + 2 * pad, y1 - y0 + 2 * pad].join(' '));
  }

  // A WINDOW on a world map (settings "in_game", the Africa maps): the view is the box around the regions in the game,
  // with some room around it ("view_pad", a share of the box's longer side) so the grey neighbours show. The map
  // can't be zoomed out or dragged beyond it. Needs the map to be visible, because it measures the shapes.
  function fitWindow(svg) {
    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, items = svg.querySelectorAll('.region:not(.inactive)');
    for (var i = 0; i < items.length; i++) {
      var b = items[i].getBBox();
      x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y);
      x1 = Math.max(x1, b.x + b.width); y1 = Math.max(y1, b.y + b.height);
    }
    var pad = Math.max(x1 - x0, y1 - y0) * (g.map.view_pad === undefined ? 0.05 : g.map.view_pad);
    g.view = { x: x0 - pad, y: y0 - pad, w: x1 - x0 + 2 * pad, h: y1 - y0 + 2 * pad };
    svg.setAttribute('viewBox', [g.view.x, g.view.y, g.view.w, g.view.h].join(' '));
  }

  function startGame(map, mode) {
    if (g.timer) clearInterval(g.timer);
    var practice = mode === 'practice';
    var indices = map.regions.map(function (_, i) { return i; }).filter(function (i) {
      var r = map.regions[i];
      if (r.inactive) return false;                      // e.g. Washington D.C. when territories are switched off
      return mode === 'capitals' ? !!r.capital : mode === 'flags' ? !!r.flag : true;
    });
    var wrap = !!map.wrap;
    g = { map: map, mode: mode, order: shuffle(indices), pos: 0, wrong: 0, tries: 0,
          clicks: 0, found: 0, start: Date.now(), timer: null, done: {}, grade: {}, triesOf: {},
          wrap: wrap, root: $('game'), ratio: 1,
          infinite: wrap && (map.infinite_scroll !== undefined ? !!map.infinite_scroll : !!CONFIG.infinite_scroll) };
    kb.key = null; ptrMouse = null;
    $('mapBox').innerHTML = '';
    $('stripBox').innerHTML = '';
    // The boxes under a world map are pulled up over the map with a negative margin (see fitWorld). That margin must go when the
    // next map has no boxes, or it would pull the frame's bottom edge and the credit up over the map.
    $('stripBox').style.marginTop = '';
    var svg = wrap ? buildWorld(map) : buildSvg(map);
    var cls = mode === 'capitals' ? 'capitals' : practice ? 'practice' : '';   // capitals: regions turn plain green
    if (cls) svg.setAttribute('class', cls);
    g.svg = svg;
    if (wrap) {
      svg.style.maxHeight = 'none';                                 // the size is set by fitWorld() from the window height
      g.strip = map.insets.length ? buildStrip(map) : null;          // (a window on the world has no boxes)
      if (g.strip && cls) g.strip.setAttribute('class', cls);
    }
    // hovering a halo highlights its region (the halo is a separate shape)
    // (also for the region itself: a region drawn in two places, like Russia across the seam of a world map,
    // is highlighted in both)
    // Circles are linked too: hovering a circle (a region's marker or a capital) in a box lights up the same circle
    // (and the region) on the main map, on both copies of the world, and the other way round.
    function hoverHalo(e, on) {
      var t = e.target, cl = t.classList, k, els, key = null;
      if (!cl) return;
      if ((cl.contains('halo') || cl.contains('region') || cl.contains('mk')) && !cl.contains('inactive')) {
        els = g.root.querySelectorAll('.region[data-i="' + t.getAttribute('data-i') + '"], .mk[data-i="' + t.getAttribute('data-i') + '"]');
        for (k = 0; k < els.length; k++) els[k].classList.toggle('hover', on);
        if (g.mode !== 'capitals') key = 'r' + t.getAttribute('data-i');
      } else if (t.parentNode && t.parentNode.classList && t.parentNode.classList.contains('cap')) {
        els = g.root.querySelectorAll('.cap[data-c="' + t.parentNode.getAttribute('data-c') + '"]');
        for (k = 0; k < els.length; k++) els[k].classList.toggle('hover', on);
        key = 'c' + t.parentNode.getAttribute('data-c');
      }
      if (!key) return;
      if (on) ptrMouse = key; else if (ptrMouse === key) ptrMouse = null;
      drawPointers();
    }
    [svg, g.strip].forEach(function (v) {
      if (!v) return;
      v.addEventListener('click', onMapClick);
      v.addEventListener('pointerover', function (e) { hoverHalo(e, true); });
      v.addEventListener('pointerout',  function (e) { hoverHalo(e, false); });
    });
    $('mapBox').appendChild(svg);
    if (wrap) greyLakes(g.tile);
    if (g.strip) {                                   // the fixed boxes: no zoom, but they have name labels too
      $('stripBox').appendChild(g.strip);
      g.strip.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        var label = labelFor(e.target);
        if (label) showTip(label, e.clientX, e.clientY); else hideTip();
      });
      g.strip.addEventListener('pointerleave', hideTip);
    }
    $('gameCredit').textContent = mapStr(map, 'credit') || '';     // (before fitWorld, which measures the page)
    show('game');                                    // must be visible before measuring shapes
    try {                                            // ask for landscape where the browser allows it (usually only in full screen)
      if (map.orientation === 'horizontal' && screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(function () {});
    } catch (e) {}
    if (wrap && map.window) fitWindow(svg);         // (before fitWorld: the view decides the map's shape)
    if (!wrap) fitView(svg); else fitWorld();
    if (mode === 'capitals' || practice || wrap) addCapitals(svg, map);   // practice shows capitals too; world maps add markers
    if (mode !== 'capitals' && !wrap) addHalos(svg, map);
    $('promptFlag').classList.add('hidden');
    $('game').classList.toggle('flagMode', mode === 'flags');    // layout: the flag alone on line 2
    $('game').classList.toggle('practice', practice);            // Practice has no timer or prompts
    var c = setupZoom(svg, map);
    c.onZoom = function (ratio) { g.ratio = ratio; sizeCircles(); kbRing(); drawPointers(); };
    sizeCircles();
    $('gameCredit').textContent = mapStr(map, 'credit') || '';
    g.pending = g.order.slice();                     // prompts not shown yet
    g.skipped = [];                                  // prompts skipped, waiting for the others to cycle first
    $('total').textContent = g.order.length;
    // Practice: how many regions and capitals the map has (shown where Time / Found are in the other modes)
    var capCount = map.regions.filter(function (r) { return !r.inactive && r.capital; }).length;
    $('totRegLabel').textContent = modeLabel('regions');
    $('totReg').textContent = g.order.length;
    $('totCapLabel').textContent = modeLabel('capitals');
    $('totCap').textContent = capCount;
    $('totals').classList.toggle('noCaps', !capCount);
    $('skipBtns').classList.toggle('hidden', practice || !skipEnabled(map, mode));
    focusMap();
    if (practice) {
      showPrompt();
      $('feedback').textContent = '';
    } else {
      g.target = undefined;
      nextTarget();
      tick();
      g.timer = setInterval(tick, 500);    // the count-up timer
      EG.start({ board: saveId(map, mode) });    // the helper times the round
    }
  }

  function tick() { $('time').textContent = fmtTime(Math.floor((Date.now() - g.start) / 1000)); }

  // Every on-screen copy of something: a region may be drawn on both tiles of a world map and in a box
  // under it, so state (found, hint, hover...) is always applied to all copies.
  // COMBINED PLACES (Saint Martin + Sint Maarten, Sint Eustatius + Saba): they are drawn as one shape with one circle,
  // numbered as the HOST. hostOf(i) = the number its shapes carry; membersOf(h) = every entry that shape stands for.
  // g.done[i] = true once entry i was answered (g.grade[i]: 0 first try, 1 retry, 2 hint), so a shared shape only
  // changes colour when ALL its entries are answered.
  function hostOf(i) { var r = g.map.regions[i]; return r.host !== undefined ? r.host : i; }
  function membersOf(h) { return g.map.regions[h].members || [h]; }
  function groupDone(h) { return membersOf(h).every(function (j) { return g.done[j]; }); }
  function regionEls(i) { return g.root.querySelectorAll('.region[data-i="' + hostOf(i) + '"]'); }
  // The shapes the player clicks for region number i in the current mode (a capital circle, or the region and its marker).
  function shapeEls(i) {
    var h = hostOf(i);
    return g.root.querySelectorAll(g.mode === 'capitals' ? '.cap[data-c="' + h + '"]'
                                                          : '.region[data-i="' + h + '"], .mk[data-i="' + h + '"]');
  }
  function addCls(list, names) { for (var k = 0; k < list.length; k++) list[k].classList.add.apply(list[k].classList, names.split(' ')); }
  function remCls(list, names) { for (var k = 0; k < list.length; k++) list[k].classList.remove.apply(list[k].classList, names.split(' ')); }
  function hasCls(list, name) { return list.length > 0 && list[0].classList.contains(name); }

  // The next prompt: anything not seen yet comes first; skipped ones only come back after
  // every other prompt has been through.
  function takeNext() { return g.pending.length ? g.pending.shift() : g.skipped.shift(); }

  // Skip (right arrow): put this prompt at the back of the line and show the next one.
  function skipPrompt() {
    if (g.finished || !(g.pending.length || g.skipped.length)) return;   // nothing else to show
    g.skipped.push(g.target);
    nextTarget(takeNext());
  }
  // Back (left arrow): return to the most recently skipped prompt; the current one waits its turn again.
  function backPrompt() {
    if (g.finished || !g.skipped.length) return;
    g.pending.unshift(g.target);
    nextTarget(g.skipped.pop());
  }

  // Show a prompt (the name of the next thing to find).
  function nextTarget(index) {
    if (g.target !== undefined && g.svg) {          // clear the old prompt's hint / flash
      remCls(shapeEls(g.target), 'hint wrong');
    }
    g.target = index !== undefined ? index : takeNext();
    $('skipPrev').disabled = !g.skipped.length;
    $('skipNext').disabled = !(g.pending.length || g.skipped.length);
    // Wrong tries belong to the prompt, so skipping and coming back doesn't wipe them (nor the hint).
    g.tries = g.triesOf[g.target] || 0;
    var region = g.map.regions[g.target], flag = $('promptFlag');
    if (g.mode === 'flags') {                        // show the flag; the player clicks its region
      flag.src = region.flag;
      flag.classList.remove('hidden');
    }
    showPrompt();
    var left = MAX_TRIES - g.tries;
    $('feedback').textContent = !g.tries ? '' : left > 0 ? tr('feedback.retry', { n: left }) : tr('feedback.hint');
    if (g.tries && left <= 0) addCls(shapeEls(g.target), 'hint');   // the answer was shown before: show it again
    drawPointers();
    $('found').textContent = g.found;
  }

  // The prompt's words (made again when the learner chooses another language in Options).
  function showPrompt() {
    if (g.mode === 'practice') $('prompt').textContent = tr('prompt.practice');
    else if (g.mode === 'flags') $('prompt').textContent = tr('prompt.flag');
    else if (g.target !== undefined) {
      $('prompt').textContent = tr('prompt.find', { name: regionStr(g.map, g.map.regions[g.target], g.mode === 'capitals' ? 'capital' : 'name') });
    }
  }

  // Text for the hover label of an element, or null if it has none right now. A shape shared by combined places
  // shows the names of those that are answered (all of them in Practice mode), like "Saint Martin / Sint Maarten".
  function labelFor(t) {
    if (!t || !t.getAttribute) return null;
    var i = t.getAttribute('data-i'), c = t.getAttribute('data-c'), practice = g.mode === 'practice', parts = [];
    if (i !== null) {
      membersOf(+i).forEach(function (j) {
        if (!(practice || ((g.mode === 'regions' || g.mode === 'flags') && g.done[j]))) return;
        var r = g.map.regions[j], nm = regionStr(g.map, r, 'name');
        // a marker works for both the country and its capital
        if (practice && t.classList.contains('mk') && r.capital) nm += ' \u2013 ' + tr('label.capital', { name: regionStr(g.map, r, 'capital') });
        parts.push(nm);
      });
      if (parts.length) return parts.join(' / ');
    }
    if (c !== null && (practice || g.mode === 'capitals')) {
      var mem = membersOf(+c);
      var w = t.parentNode.getAttribute('data-w');            // a circle shared by a capital and a region
      mem.forEach(function (j) {
        var r = g.map.regions[j];
        if (r.capital && (practice || g.done[j])) parts.push(regionStr(g.map, r, 'capital'));
      });
      if (!parts.length) return null;
      if (w !== null && mem.length === 1) return tr('label.shared', { capital: parts[0], region: regionStr(g.map, g.map.regions[+w], 'name') });
      return parts.join(' / ');
    }
    return null;
  }

  // What does the information panel show for the thing that was clicked (practice mode)?
  // Returns null when the map has no information for it - then only the name label shows.
  // Combined places (one shape, several entries) show all their entries in one panel.
  function infoFor(t) {
    if (!t || !t.getAttribute) return null;
    var i = t.getAttribute('data-i'), c = t.getAttribute('data-c'), mem, names = [], texts = [];
    function uniq(list) { return list.filter(function (x, k) { return x && list.indexOf(x) === k; }); }
    if (c !== null) {                                    // a capital city
      mem = membersOf(+c).map(function (j) { return g.map.regions[j]; }).filter(function (r) { return r.capital && regionStr(g.map, r, 'capital_info'); });
      if (mem.length) {
        return { title: uniq(mem.map(function (r) { return regionStr(g.map, r, 'capital'); })).join(' / '),
                 sub: tr('info.capital_of', { region: uniq(mem.map(function (r) { return regionStr(g.map, r, 'name'); })).join(' / ') }),
                 text: uniq(mem.map(function (r) { return regionStr(g.map, r, 'capital_info'); })).join('\n\n') };
      }
    } else if (i !== null) {                             // a region
      mem = membersOf(+i).map(function (j) { return g.map.regions[j]; });
      var any = mem.some(function (r) { return r.info || r.flag || regionStr(g.map, r, 'info'); });
      if (any) {
        mem.forEach(function (r) { names.push(regionStr(g.map, r, 'name')); texts.push(regionStr(g.map, r, 'info')); });
        return { title: names.join(' / '), flag: mem.length === 1 ? mem[0].flag : '', text: uniq(texts).join('\n\n') };
      }
    }
    return null;
  }

  // The panels over the page (information, list of keys, big flag): the kit's EduGame.dialog holds the keyboard
  // while one is open (Tab stays inside, Escape, its × or a click outside closes it). Closed in a game, the keyboard
  // goes back to the map; on the menu, to the button that opened it.
  function panel(back, card, close) {
    return EduGame.dialog($(back), { card: $(card), close: $(close),
      show: function (el) { el.classList.remove('hidden'); }, hide: function (el) { el.classList.add('hidden'); },
      onClose: function () { if (!onMenu()) focusMap(); } });
  }
  var infoPanel = panel('infoBack', 'infoCard', 'infoClose'), keysPanel = panel('keysBack', 'keysCard', 'keysClose'),
      flagPanel = panel('flagBack', 'flagCard', 'flagClose');

  function openInfo(item) {
    hideTip();
    $('infoTitle').textContent = item.title;
    $('infoSub').textContent = item.sub || '';
    var img = $('infoFlag');
    img.classList.toggle('hidden', !item.flag);
    if (item.flag) { img.src = item.flag; img.alt = tr('info.flag_of', { name: item.title }); }
    $('infoText').textContent = item.text || '';       // plain text (line breaks are kept)
    infoPanel.open();
  }
  function closeInfo() { infoPanel.close(); }

  function onMapClick(e) {
    var t = e.target;
    if (e.currentTarget === g.svg && zc && zc.moved) { zc.moved = false; return; }     // that was a drag, not a click
    if (g.mode === 'practice') {                          // practice: open the information panel if there is one
      var item = infoFor(t);
      if (item) { openInfo(item); return; }
    }
    var label = labelFor(t), own = t.getAttribute && t.getAttribute(g.mode === 'capitals' ? 'data-c' : 'data-i');
    // tap on touch screens: show the name of what is already answered (a shape shared by combined places that is
    // only half answered still takes a click: it is the other place that is asked for)
    if (label && (g.mode === 'practice' || own === null || groupDone(+own))) { showTip(label, e.clientX, e.clientY, 1800); return; }
    if (g.mode === 'practice' || g.finished) return;

    // Which region number did the player pick?
    var attr = g.mode === 'capitals' ? 'data-c' : 'data-i';
    var v = t.getAttribute && t.getAttribute(attr);
    if (v === null || v === undefined) return;
    var picked = +v, shape = shapeEls(picked);   // the visible shapes (a halo, marker or hit circle counts as its region)
    if (groupDone(picked)) return;               // (a shape shared by combined places is only finished when all of them are)

    // A far-away part of the country that is asked for (Alaska for the United States, Corsica for France...) is not the
    // answer, but it is not a mistake either: it flashes yellow, is not counted, and the player is told what to click.
    var pickedR = g.map.regions[picked], askedR = g.map.regions[g.target];
    if (g.mode !== 'capitals' && pickedR.part_of && pickedR.part_of === askedR.name) {
      addCls(shape, 'notmain'); drawPointers();
      setTimeout(function () { remCls(shape, 'notmain'); drawPointers(); }, 700);
      $('feedback').textContent = tr('feedback.not_main', { name: regionStr(g.map, askedR, 'name') });
      return;
    }

    g.clicks++;
    if (membersOf(picked).indexOf(g.target) >= 0) {      // (any of the places a shared shape stands for is a right answer)
      // ---- correct ----
      var wasHinted = g.tries >= MAX_TRIES, usedRetry = g.tries > 0;
      var target = shapeEls(g.target);
      remCls(target, 'hint'); drawPointers();
      g.done[g.target] = true;
      g.grade[g.target] = wasHinted ? 2 : usedRetry ? 1 : 0;
      if (groupDone(picked)) {                           // colour the shape by the worst result of its entries:
        var worst = Math.max.apply(null, membersOf(picked).map(function (j) { return g.grade[j]; }));
        if (g.mode === 'capitals') {
          addCls(target, 'found');
          // green = first try, yellow = later try, red = needed the hint
          addCls(target, worst === 2 ? 'hinted' : worst === 1 ? 'retry' : 'first');
        } else {
          addCls(target, 'done');
          if (worst === 2) addCls(target, 'hinted');                 // red: needed the hint
          else if (worst === 1) addCls(target, 'retry');             // yellow: right on 2nd/3rd try
        }
      }
      g.found++;
      if (!g.pending.length && !g.skipped.length) finishGame(); else nextTarget(takeNext());
    } else {
      // ---- wrong ----
      g.wrong++; g.tries++; g.triesOf[g.target] = g.tries;
      addCls(shape, 'wrong');
      setTimeout(function () { remCls(shape, 'wrong'); }, 350);
      var left = MAX_TRIES - g.tries;
      if (left > 0) {
        $('feedback').textContent = tr('feedback.retry', { n: left });
      } else {
        $('feedback').textContent = tr('feedback.hint');
        addCls(shapeEls(g.target), 'hint');   // reveal the answer
        drawPointers();
      }
    }
  }

  function finishGame() {
    g.finished = true;
    clearInterval(g.timer);
    var secs = Math.floor((Date.now() - g.start) / 1000);
    var total = g.order.length;
    // Accuracy = correct clicks / all clicks (100% means no wrong clicks).
    var acc = Math.round(100 * total / g.clicks);
    var goal = goalFor(g.map, g.mode), counts = !goal || acc >= goal;      // below the pass mark: played, but not kept as a result
    var shown = g;                                                          // (the player may leave before the helper answers)
    recordResult(saveId(g.map, g.mode), acc, secs, counts).then(function (r) {
      if (g !== shown) return;
      g.result = { acc: acc, secs: secs, goal: goal, r: r };
      showResult();
      show('results');
      if (kb.used) $('againBtn').focus();       // keyboard players carry on from the results
    });
  }
  // The results page's words (made again when the learner chooses another language in Options).
  function showResult() {
    var x = g.result;
    if (!x) return;
    var acc = x.acc, secs = x.secs, goal = x.goal, r = x.r, best = r.kept;
    {
      $('resMap').textContent = tr('results.map', { map: mapStr(g.map, 'name'), mode: modeLabel(g.mode) });
      $('resAcc').textContent = tr('results.pct', { pct: acc });
      $('resTime').textContent = fmtTime(secs);
      var line = best ? tr('results.best', { acc: best[0], time: fmtTime(best[1]), n: best[2] }) : '';
      if (!r.counted) line = tr('results.not_counted', { pct: goal }) + (line ? ' ' + line : '');
      else if (r.newBest) line = tr('results.new_best') + ' ' + line;
      $('resBest').textContent = line;
    }
  }

  function leaveGame() {
    if (g.timer) clearInterval(g.timer);
    kbClear();
    $('kbdHint').classList.add('hidden');
    $('stripBox').style.marginTop = '';
    hideTip();
    closeInfo();
    buildMenu();
    show('menu');
    // the keyboard goes back to the button of the game just left (and the page scrolls to it)
    var mb = g.map && $('menuList').querySelector('.modeBtn[data-map="' + g.map.id + '"][data-mode="' + g.mode + '"]');
    if (mb) mb.focus();
  }

  /* =====================================================================
     5b. NAME LABEL (hover or tap)
     ===================================================================== */
  var tipTimer = null;
  function showTip(text, x, y, hideAfterMs) {
    var t = $('tip');
    t.textContent = text;
    t.classList.remove('hidden');
    // Below and to the right of the pointer, or on the other side where it would go off the screen
    // (a tap near the right edge of a phone). A label wider than the screen wraps.
    var W = document.documentElement.clientWidth, H = document.documentElement.clientHeight, M = 4;
    t.style.maxWidth = (W - 2 * M) + 'px';
    t.style.whiteSpace = t.scrollWidth > W - 2 * M ? 'normal' : '';
    var w = t.offsetWidth, h = t.offsetHeight;
    var left = x + 12, top = y + 14;
    if (left + w > W - M) left = x - 12 - w;
    if (top + h > H - M) top = y - 14 - h;
    t.style.left = Math.max(M, Math.min(left, W - M - w)) + 'px';
    t.style.top = Math.max(M, Math.min(top, H - M - h)) + 'px';
    clearTimeout(tipTimer);
    if (hideAfterMs) tipTimer = setTimeout(hideTip, hideAfterMs);
  }
  function hideTip() { $('tip').classList.add('hidden'); }

  /* =====================================================================
     5c. ZOOM AND PAN (works by changing the SVG's viewBox)
       - buttons + and - and Full  - mouse wheel while the cursor is over the map
       - two-finger pinch       - click and drag to move when zoomed in
     ===================================================================== */
  var zc = null;        // controller for the map currently on screen

  function setupZoom(svg, map) {
    var step = map.zoom_step || CONFIG.zoom_step;
    var maxZoom = Math.pow(step, map.zoom_levels || CONFIG.zoom_levels);   // furthest we can zoom in
    var vb = svg.getAttribute('viewBox').split(' ').map(Number);
    var base = { x: vb[0], y: vb[1], w: vb[2], h: vb[3] };   // the whole map
    var view = { x: base.x, y: base.y, w: base.w, h: base.h }; // the part currently shown
    var ptrs = {};                                   // fingers / mouse currently down
    var c = { moved: false, step: step, zoomBy: zoomBy, reset: reset, move: move, up: up, onZoom: null,
              show: showPoint, pan: pan, zoomOn: zoomAt };
    c.base = base;
    zc = c;

    // Write the view to the SVG, keeping it inside the map.
    function apply() {
      if (g.infinite) view.x = base.x + (((view.x - base.x) % base.w) + base.w) % base.w;   // round the world
      else view.x = Math.max(base.x, Math.min(base.x + base.w - view.w, view.x));
      view.y = Math.max(base.y, Math.min(base.y + base.h - view.h, view.y));
      svg.setAttribute('viewBox', [view.x, view.y, view.w, view.h].join(' '));
      if (c.onZoom) c.onZoom(view.w / base.w);
    }
    // Screen position -> map coordinates.
    function toMap(cx, cy) {
      var pt = svg.createSVGPoint(); pt.x = cx; pt.y = cy;
      return pt.matrixTransform(svg.getScreenCTM().inverse());
    }
    // Zoom by "factor" keeping map point (mx, my) still on screen.
    function zoomAt(factor, mx, my) {
      var w = Math.min(base.w, Math.max(base.w / maxZoom, view.w / factor));
      var r = w / view.w;
      view.x = mx - (mx - view.x) * r;
      view.y = my - (my - view.y) * r;
      view.w = w; view.h = base.h * w / base.w;
      apply();
    }
    function reset() { view = { x: base.x, y: base.y, w: base.w, h: base.h }; apply(); }   // the "Full" button
    // Keyboard: bring map point (mx, my) into view if it's near or past the edge (the zoom stays the same).
    function showPoint(mx, my) {
      if (g.infinite) mx += Math.round((view.x + view.w / 2 - mx) / base.w) * base.w;   // the nearest copy of the world
      var mxg = view.w * 0.12, myg = view.h * 0.12;
      if (mx < view.x + mxg || mx > view.x + view.w - mxg) view.x = mx - view.w / 2;
      if (my < view.y + myg || my > view.y + view.h - myg) view.y = my - view.h / 2;
      apply();
    }
    function pan(fx, fy) { view.x += fx * view.w; view.y += fy * view.h; apply(); }   // keyboard: Shift + arrows
    function zoomBy(f) { zoomAt(f, view.x + view.w / 2, view.y + view.h / 2); }  // buttons: zoom on centre
    function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
    function two() { var k = Object.keys(ptrs); return k.length === 2 ? [ptrs[k[0]], ptrs[k[1]]] : null; }

    svg.addEventListener('wheel', function (e) {     // wheel over the map zooms it (no ctrl needed);
      e.preventDefault();                            // over the rest of the page it scrolls as normal
      var d = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaY;
      var m = toMap(e.clientX, e.clientY);
      zoomAt(Math.exp(-d * 0.0025), m.x, m.y);
    }, { passive: false });

    svg.addEventListener('pointerdown', function (e) {
      ptrs[e.pointerId] = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY };
      if (Object.keys(ptrs).length === 1) c.moved = false;
      hideTip();
    });
    svg.addEventListener('pointermove', function (e) {   // hover label (mouse only)
      if (e.pointerType === 'touch' || Object.keys(ptrs).length) return;
      var label = labelFor(e.target);
      if (label) showTip(label, e.clientX, e.clientY); else hideTip();
    });
    svg.addEventListener('pointerleave', hideTip);

    function move(e) {                               // called for every pointer move on the page
      var p = ptrs[e.pointerId]; if (!p) return;
      var pair = two(), before = pair && dist(pair[0], pair[1]);
      var cxB = pair && (pair[0].x + pair[1].x) / 2, cyB = pair && (pair[0].y + pair[1].y) / 2;
      var dx = e.clientX - p.x, dy = e.clientY - p.y;
      p.x = e.clientX; p.y = e.clientY;
      if (pair) {                                    // two fingers: pinch to zoom + drag
        c.moved = true;
        var m = toMap(cxB, cyB);
        pair = two();
        zoomAt(dist(pair[0], pair[1]) / before, m.x, m.y);
        var s = svg.getScreenCTM().a;
        view.x -= ((pair[0].x + pair[1].x) / 2 - cxB) / s;
        view.y -= ((pair[0].y + pair[1].y) / 2 - cyB) / s;
        apply();
      } else if (Object.keys(ptrs).length === 1) {   // one finger / mouse: drag the map
        if (!c.moved && Math.hypot(p.x - p.sx, p.y - p.sy) < 5) return;   // small wobble = a click
        c.moved = true; hideTip();
        var sc = svg.getScreenCTM().a;               // screen pixels per map unit
        view.x -= dx / sc; view.y -= dy / sc;
        apply();
      }
    }
    function up(e) { delete ptrs[e.pointerId]; }
    return c;
  }

  /* =====================================================================
     5d. KEYBOARD
       While a map is on screen it has the keyboard (Escape goes back to the menu):
         Tab / Shift+Tab  the next / previous place, in reading order (rows from the top, left to right)
         arrow keys       the nearest place that way        Shift + arrows   move the map
         Enter or Space   answer with the highlighted place (Practice: its information)
         + - Page Up Page Down  zoom    Home or 0  the whole map    . and ,  Skip and Back    ?  the list of keys
       The highlight never names a place the learner hasn't found (in Practice it does, like hovering).
     ===================================================================== */
  var kb = { key: null, used: false, hintTimer: null };
  var ptrMouse = null;                               // the place under the mouse ('r' + region, 'c' + capital)

  // The pointer outline (index.html, "Pointer"): for the places under the mouse and the keyboard, a copy of each
  // shape's outline added at the end of its own group, so it's drawn above every neighbour's border (a ring round a
  // circle). The copies ignore the mouse. Drawn again after zooming (a ring's size is in screen pixels).
  function drawPointers() {
    if (!g.root) return;
    var old = g.root.querySelectorAll('.ptr'), k;
    for (k = 0; k < old.length; k++) old[k].parentNode.removeChild(old[k]);
    // the hint and the wrong-part flash too (the hint's outline flashes, index.html)
    var flash = g.root.querySelectorAll('#mapBox .hint, #stripBox .hint, #mapBox .notmain, #stripBox .notmain');
    [ptrMouse, kb.key, flash].forEach(function (key, n) {
      if (!key || (n === 1 && key === ptrMouse)) return;
      var els = n === 2 ? key : kbEls(key);
      for (var e = 0; e < els.length; e++) {
        if (n < 2 && (els[e].classList.contains('hint') || els[e].classList.contains('notmain'))) continue;   // drawn below
        var cls0 = n === 2 && els[e].classList.contains('hint') ? ' ptr-flash' : '';
        var el = els[e].classList.contains('cap') ? els[e].querySelector('.ring') : els[e];
        if (!el || el.style.display === 'none' || (els[e].style && els[e].style.display === 'none')) continue;
        if (el.classList.contains('region') && !el.getAttribute('d')) continue;
        ['ptr ptr-edge', 'ptr ptr-band'].forEach(function (cls) {
          var c;
          if (el.tagName === 'circle') {
            var m = el.getScreenCTM(), px = m ? Math.abs(m.a) || 1 : 1;
            c = document.createElementNS(SVG_NS, 'circle');
            c.setAttribute('cx', el.getAttribute('cx')); c.setAttribute('cy', el.getAttribute('cy'));
            c.setAttribute('r', +el.getAttribute('r') + 4 / px);                       // a ring round it, 4 pixels out
          } else {
            c = el.cloneNode(false);
            c.removeAttribute('style');
            var nx = el.nextElementSibling;              // a region with an outline of its own: the pointer follows that
            if (el.classList.contains('nostroke') && nx && nx.classList.contains('rstroke')) c.setAttribute('d', nx.getAttribute('d'));
          }
          c.setAttribute('class', cls + (cls.indexOf('band') > 0 ? cls0 : ''));
          c.setAttribute('aria-hidden', 'true');
          (el.tagName === 'circle' && els[e].classList.contains('cap') ? els[e].parentNode : el.parentNode).appendChild(c);
        });
      }
    });
  }   // key: the highlighted place ('r' + region number, 'c' + capital)

  function kbEls(key) {
    var i = key.slice(1);
    return g.root.querySelectorAll(key.charAt(0) === 'c' ? '.cap[data-c="' + i + '"]' : '.region[data-i="' + i + '"], .mk[data-i="' + i + '"]');
  }
  function kbClear() {
    if (kb.key && g.root) remCls(kbEls(kb.key), 'kbd');
    kb.key = null;
    kbRing();
    drawPointers();
  }
  // A small place (a circle, a tiny island) also gets a ring at least 26 pixels across around it, so the highlight
  // can be seen. It follows zooming and moving the map. (The copy of the place that is on screen is used.)
  function kbRing() {
    var ring = $('kbdRing');
    if (!kb.key || $('game').classList.contains('hidden')) { ring.classList.add('hidden'); return; }
    var els = kbEls(kb.key), box = null, W = document.documentElement.clientWidth, H = document.documentElement.clientHeight;
    for (var k = 0; k < els.length; k++) {
      if (els[k].style.display === 'none') continue;
      var r = els[k].getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      if (r.right < 0 || r.left > W || r.bottom < 0 || r.top > H) continue;
      if (!box || r.width * r.height < box.width * box.height) box = r;   // the smallest copy on screen (a circle)
    }
    if (!box || Math.max(box.width, box.height) >= 26) { ring.classList.add('hidden'); return; }
    var d = 26, cx = box.left + box.width / 2, cy = box.top + box.height / 2;
    ring.style.left = (cx - d / 2) + 'px'; ring.style.top = (cy - d / 2) + 'px';
    ring.style.width = ring.style.height = d + 'px';
    ring.classList.remove('hidden');
  }
  // Every place that can be chosen right now, with a position in map units (the boxes under a world map count as
  // being below it): [{ key, el, x, y, strip }]. The first copy of each place is used: the main map's, then a box's.
  function kbTargets() {
    var out = [], seen = {}, wantR = g.mode !== 'capitals', wantC = g.mode === 'capitals' || g.mode === 'practice';
    var main = g.wrap ? g.tile : g.svg, W = zc ? zc.base.w : 1, H = zc ? zc.base.h : 1;
    var sel = (wantR ? ['.region:not(.inactive)', '.mk'] : []).concat(wantC ? ['.cap'] : []).join(',');
    function from(root, strip) {
      if (!root) return;
      var els = root.querySelectorAll(sel), sx = 1, sy0 = 0;
      if (strip) { var vb = root.viewBox.baseVal; sx = W / vb.width; sy0 = zc.base.y + H - vb.y * sx; }
      for (var k = 0; k < els.length; k++) {
        var el = els[k], cap = el.classList.contains('cap'), key = cap ? 'c' + el.getAttribute('data-c') : 'r' + el.getAttribute('data-i');
        if (seen[key] || el.style.display === 'none') continue;
        seen[key] = true;
        var x, y, r = !cap && g.map.regions[+key.slice(1)], c0 = cap ? el.querySelector('.ring') : el;
        if (c0.tagName === 'circle') { x = +c0.getAttribute('cx'); y = +c0.getAttribute('cy'); }
        else if (!strip && r && r.mk) { x = r.mk[0]; y = r.mk[1]; }                  // a country's own middle (not its overseas parts')
        else { var b = el.getBBox(); x = b.x + b.width / 2; y = b.y + b.height / 2; }
        out.push({ key: key, el: cap ? el.querySelector('.hit') : el, x: strip ? x * sx : x, y: strip ? sy0 + y * sx : y, strip: strip });
      }
    }
    from(main, false);
    from(g.strip, true);
    return out;
  }
  function kbFind(list, key) { for (var k = 0; k < list.length; k++) if (list[k].key === key) return list[k]; return null; }
  function kbDx(a, b) {                              // b.x - a.x, the short way round on a world map
    var d = b.x - a.x, W = zc ? zc.base.w : 0;
    if (g.infinite && !a.strip && !b.strip) d -= Math.round(d / W) * W;
    return d;
  }
  // Highlight a place, keep it in view, and say what may be said about it.
  function kbSet(t) {
    kbClear();
    kb.key = t.key;
    addCls(kbEls(t.key), 'kbd');
    drawPointers();
    setTimeout(kbRing, 0);
    if (t.strip) { try { g.strip.scrollIntoView({ block: 'nearest' }); } catch (e) {} }
    else if (zc) zc.show(t.x, t.y);
    var el = kbFind(kbTargets(), t.key), r = el ? el.el.getBoundingClientRect() : null;
    var label = el ? labelFor(el.el) : null;
    if (label && r) showTip(label, r.left + r.width / 2, r.top + r.height / 2); else hideTip();
    $('kbdSay').textContent = label || tr('keys.unknown');
  }
  // Answered already: a region or circle found, or a capital found (in a game Tab passes over these)
  function kbDone(t) {
    var e = t.el, c = e.parentNode;
    return e.classList.contains('done') || !!(c && c.classList && c.classList.contains('cap') && c.classList.contains('found'));
  }
  function kbStep(dir) {                             // Tab: reading order (in a game, only places not answered yet)
    var list = kbTargets(); if (!list.length) return;
    var row = (zc ? zc.base.h : 1) / 14;
    list.sort(function (a, b) {
      var ra = Math.floor(a.y / row), rb = Math.floor(b.y / row);
      return ra !== rb ? ra - rb : a.x - b.x;
    });
    var at = -1, n = list.length, all = g.mode === 'practice';
    for (var k = 0; k < n; k++) if (list[k].key === kb.key) at = k;
    if (at < 0) at = dir > 0 ? -1 : n;               // nothing highlighted: start from the first (or the last)
    for (var step = 1; step <= n; step++) {          // the next one that may be chosen (from where the highlight is,
      var t = list[(at + dir * step + 2 * n) % n];   // even if that place has just been answered)
      if (all || !kbDone(t)) return kbSet(t);
    }
  }
  function kbMove(dx, dy) {                          // arrows: the nearest place in that direction
    var list = kbTargets(); if (!list.length) return;
    var cur = kb.key && kbFind(list, kb.key);
    if (!cur) {                                      // nothing highlighted yet: start in the middle of what's shown
      var v = g.svg.viewBox.baseVal, mid = { x: v.x + v.width / 2, y: v.y + v.height / 2, strip: false }, near = null, nd = Infinity;
      list.forEach(function (t) { var d = Math.hypot(kbDx(mid, t), t.y - mid.y); if (!t.strip && d < nd) { nd = d; near = t; } });
      return kbSet(near || list[0]);
    }
    var best = null, bs = Infinity, wide = null, ws = Infinity;
    list.forEach(function (t) {
      if (t.key === cur.key) return;
      var ox = kbDx(cur, t), oy = t.y - cur.y, along = ox * dx + oy * dy, side = Math.abs(ox * dy - oy * dx);
      if (along <= 0) return;
      var score = along + 2 * side;
      if (side <= along * 1.5) { if (score < bs) { bs = score; best = t; } }    // within about 56 degrees of the arrow
      else if (score < ws) { ws = score; wide = t; }
    });
    if (best || wide) kbSet(best || wide);
  }
  function kbChoose() {
    var t = kb.key && kbFind(kbTargets(), kb.key);
    if (!t) return kbStep(1);
    var r = t.el.getBoundingClientRect();
    onMapClick({ target: t.el, currentTarget: null, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 });
    if (kb.key && g.mode !== 'practice') {           // say how it went, and the place's name once it's found
      var lab = labelFor(t.el);
      $('kbdSay').textContent = lab || '';
    }
  }
  function kbZoom(f) {
    if (!zc) return;
    var t = kb.key && kbFind(kbTargets(), kb.key);
    if (t && !t.strip) zc.zoomOn(f, t.x, t.y); else zc.zoomBy(f);
    if (t && !t.strip) zc.show(t.x, t.y);
  }
  function focusMap() {
    if ($('game').classList.contains('hidden')) return;
    try { $('mapBox').focus({ preventScroll: true }); } catch (e) {}
  }
  function kbShowHint() {
    if (kb.used) return;
    kb.used = true;
    $('kbdHint').classList.remove('hidden');
    clearTimeout(kb.hintTimer);
    kb.hintTimer = setTimeout(function () { $('kbdHint').classList.add('hidden'); }, 8000);
  }
  // The list of keys. Opened on the menu it has the menu's keys first, then the map's; in a game only the map's.
  function isFlagKey(e) { var c = String(e.key).toLowerCase(); return c === 'f' || c === 'd'; }   // F for flag, D for drapeau
  function onMenu() { return !$('menu').classList.contains('hidden'); }
  function openKeys() {
    hideTip();
    $('keysCard').classList.toggle('onMenu', onMenu());
    $('keysCard').classList.toggle('flagMode', !onMenu() && g.mode === 'flags');
    keysPanel.open();
  }
  function closeKeys() { keysPanel.close(); }

  document.addEventListener('keydown', function (e) {
    // (A panel's Escape and Tab are the kit's EduGame.dialog's, and the Options panel's are its own: both come first.)
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
    if (keysPanel.isOpen() || infoPanel.isOpen() || flagPanel.isOpen()) {
      if (isFlagKey(e) && flagPanel.isOpen()) { e.preventDefault(); closeFlag(); }   // F (D) again closes the big flag
      return;
    }
    if ($('game').classList.contains('hidden')) {    // the menu (its arrow keys: EduGame.arrowNav, below) or the results
      var mt = e.target;
      if (!onMenu() || (mt && mt.closest && mt.closest('.eg-overlay')) || (mt && /^(INPUT|SELECT|TEXTAREA)$/.test(mt.tagName))) return;
      if (e.key === '?' || e.key === '/') { e.preventDefault(); openKeys(); }
      return;
    }
    var t = e.target, tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    if (t && t.closest && t.closest('.eg-overlay')) return;                  // the kit's Options panel
    var onButton = tag === 'BUTTON' || tag === 'A' || (t && t.getAttribute && t.getAttribute('role') === 'button');
    var k = e.key, done = true, step = zc ? zc.step : 1.5;
    if (k === 'Tab') kbStep(e.shiftKey ? -1 : 1);
    else if (k === 'ArrowLeft' || k === 'ArrowRight' || k === 'ArrowUp' || k === 'ArrowDown') {
      var dx = k === 'ArrowLeft' ? -1 : k === 'ArrowRight' ? 1 : 0, dy = k === 'ArrowUp' ? -1 : k === 'ArrowDown' ? 1 : 0;
      if (e.shiftKey) { if (zc) zc.pan(dx * 0.25, dy * 0.25); } else kbMove(dx, dy);
    }
    else if ((k === 'Enter' || k === ' ') && !onButton) kbChoose();
    else if (k === '+' || k === '=' || k === 'PageUp') kbZoom(step);
    else if (k === '-' || k === '_' || k === 'PageDown') kbZoom(1 / step);
    // (0 by the key's place, so the 0 key works on a French keyboard too, where it types à without Shift)
    else if (k === 'Home' || k === '0' || e.code === 'Digit0' || e.code === 'Numpad0') { if (zc) zc.reset(); }
    // (; too: next to , on a French keyboard, where . needs Shift)
    else if (k === '.' || k === '>' || k === ';') { if (!$('skipBtns').classList.contains('hidden')) skipPrompt(); }
    else if (k === ',' || k === '<') { if (!$('skipBtns').classList.contains('hidden')) backPrompt(); }
    else if (k === '?' || k === '/') openKeys();
    else if (isFlagKey(e)) { if (g.mode === 'flags') openFlag(); else done = false; }
    else if (k === 'Escape') leaveGame();
    else done = false;
    if (!done) return;
    e.preventDefault();
    if (k !== 'Escape' && k !== '?' && k !== '/' && !isFlagKey(e)) { kbShowHint(); if (document.activeElement !== $('mapBox')) focusMap(); }
  });
  // A button clicked with the mouse gives the keyboard back to the map; so does a click on the map, which also
  // drops the keyboard highlight (the mouse is in charge then).
  $('row1').addEventListener('click', function (e) { if (e.target.closest('button') && e.target.id !== 'backBtn') focusMap(); });
  $('zoomBtns').addEventListener('click', function () { focusMap(); });
  // The zoom buttons go just under the button and prompt lines laid over the map (index.html, --topH). The feedback
  // line is centred and narrow, so they don't move when a message comes and goes.
  function placeZoom() {
    var h = 0, top = $('mapTop');
    ['row1', 'row2'].forEach(function (id) { var el = $(id); if (el.parentNode === top) h = Math.max(h, el.offsetTop + el.offsetHeight); });
    $('mapWrap').style.setProperty('--topH', h + 'px');
  }
  if (window.ResizeObserver) new ResizeObserver(placeZoom).observe($('mapTop'));
  $('mapBox').addEventListener('pointerdown', function () { kbClear(); });
  $('keysBtn').onclick = openKeys;
  $('menuKeys').onclick = openKeys;
  // The menu's arrow keys: the nearest mode button that way, Home and End the first and last (the kit's).
  EduGame.arrowNav($('menuList'), '.modeBtn');

  /* =====================================================================
     6. START UP
     ===================================================================== */
  $('zoomIn').onclick   = function () { if (zc) zc.zoomBy(zc.step); };
  $('zoomOut').onclick  = function () { if (zc) zc.zoomBy(1 / zc.step); };
  $('zoomFull').onclick = function () { if (zc) zc.reset(); };
  window.addEventListener('pointermove', function (e) { if (zc) zc.move(e); });
  window.addEventListener('pointerup',     function (e) { if (zc) zc.up(e); });
  window.addEventListener('pointercancel', function (e) { if (zc) zc.up(e); });
  // WORLD MAP SIZE. The map is as big as the window allows ("max_map_height", if the settings give one, is a limit). On a window at least "fit_all_min_height" tall the
  // map AND the boxes fit together; on a shorter one (a 768p laptop) just the map fits and the page scrolls to the
  // boxes. The boxes overlap the bottom of the map (where it is empty). The width is set through the page width (--pageW).
  function fitWorld() {
    if (!g.wrap || !g.map || $('game').classList.contains('hidden')) return;
    var map = g.map, vh = window.innerHeight, vw = document.documentElement.clientWidth;
    var fr = $('frame'), cs = getComputedStyle(fr);
    var sideX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) + parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth);
    var W = g.view ? g.view.w : map.size[0], H = g.view ? g.view.h : map.size[1], SH = map.strip ? map.strip[1] : 0;   // (g.view: a window)
    var TOT = map.total || (H + SH), overlap = map.strip_y ? H - map.strip_y : 0;   // map units
    var maxW = Math.min(map.page_width || 2000, vw, (map.max_map_height || 100000) * W / H + sideX) - sideX;
    var both = vh >= (map.fit_all_min_height || 800);
    function setW(w) {
      // A tall window (East Africa) can be narrower than the bar above it needs: the page keeps room for the bar and
      // the map is centred in it at its own width.
      if (g.view) { g.svg.style.width = Math.round(w) + 'px'; g.svg.style.margin = '0 auto'; }
      document.body.style.setProperty('--pageW', Math.round((g.view ? Math.max(w, 620) : w) + sideX) + 'px');
      $('stripBox').style.marginTop = (-overlap * w / W).toFixed(1) + 'px';          // the boxes overlap the map's empty bottom
    }
    var minW = g.view ? 320 : 500;                              // (a window on the world can be tall and narrow: East Africa)
    var w = Math.max(minW, Math.min(1400, maxW));
    for (var pass = 0; pass < 3; pass++) {                      // measure the space around the map, size, measure again
      setW(w);
      var mapBox = $('mapBox').getBoundingClientRect(), strip = $('stripBox').getBoundingClientRect(), fRect = fr.getBoundingClientRect();
      var head = document.querySelector('.eg-header');            // the kit's header (title and Options), above the frame
      var chrome = fRect.height + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom) - (strip.bottom - mapBox.top) +
                   (head ? head.getBoundingClientRect().height : 0);
      var topSpace = mapBox.top + (window.pageYOffset || 0);
      w = Math.max(minW, Math.min(both ? (vh - chrome - 1) * W / TOT : (vh - topSpace - 4) * W / H, maxW));
    }
    setW(w);
    sizeCircles();
  }
  window.addEventListener('orientationchange', checkRotate);
  $('rotateOk').onclick = function () { rotateDismissed = true; checkRotate(); };
  window.addEventListener('scroll', function () { if (kb.key) kbRing(); }, { passive: true });
  window.addEventListener('resize', function () { if (kb.key) setTimeout(kbRing, 50); checkRotate(); if (g.svg && !$('game').classList.contains('hidden')) { fitWorld(); sizeCircles(); } });

  // ---- Full Screen button (in the header; hidden where the browser does not allow it) ----
  var fsRoot = document.documentElement;
  function fsElement() { return document.fullscreenElement || document.webkitFullscreenElement || null; }
  function fsLabel() { $('fsBtn').textContent = tr(fsElement() ? 'fullscreen.exit' : 'fullscreen.enter'); }
  // (switched off in config.js: Kolibri has its own full page mode; set fullscreen_button: true to bring it back)
  if (!CONFIG.fullscreen_button || !(document.fullscreenEnabled || document.webkitFullscreenEnabled)) {
    $('siteHeader').classList.add('hidden');
  } else {
    $('fsBtn').onclick = function () {
      try {
        if (fsElement()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
        else (fsRoot.requestFullscreen || fsRoot.webkitRequestFullscreen).call(fsRoot);
      } catch (e) {}
    };
    document.addEventListener('fullscreenchange', function () { fsLabel(); setTimeout(function () { fitWorld(); sizeCircles(); }, 100); });
    document.addEventListener('webkitfullscreenchange', function () { fsLabel(); setTimeout(function () { fitWorld(); sizeCircles(); }, 100); });
  }
  $('skipNext').onclick = skipPrompt;
  $('skipPrev').onclick = backPrompt;
  $('backBtn').onclick = leaveGame;
  $('menuBtn').onclick = leaveGame;
  $('againBtn').onclick = function () { startGame(g.map, g.mode); };

  // ---- Full-size flag pop-up (Flags mode) ----
  function openFlag() {
    var src = $('promptFlag').getAttribute('src');
    if (!src) return;
    $('flagBig').src = src;
    flagPanel.open();
  }
  function closeFlag() { flagPanel.close(); }
  $('promptFlag').onclick = openFlag;
  $('promptFlag').onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openFlag(); } };
  $('flagCard').onclick = closeFlag;                 // a click on the flag closes it too

  // ---- Another language chosen in Options (the kit's panel). Appearance is the kit's too: the page gets
  // data-theme="light" or "dark", and the colours at the top of index.html follow it. ----
  EG.on('languagechange', function (e) {
    lang = e.language;
    if ($('fsBtn')) fsLabel();
    ensureMapText(function () {
      if (lang !== e.language) return;
      buildMenu();
      if (!$('game').classList.contains('hidden')) {
        showPrompt();
        $('gameCredit').textContent = mapStr(g.map, 'credit') || '';
        $('totRegLabel').textContent = modeLabel('regions');
        $('totCapLabel').textContent = modeLabel('capitals');
      }
      if (!$('results').classList.contains('hidden')) showResult();
    });
  });

  // ---- Load the maps of this package, then start ----
  // Each map has a shapes file (required) and a settings file (optional) in its folder.
  function loadFiles(files, done) {
    var pending = files.length;
    if (!pending) { done(); return; }
    function finish() { if (--pending === 0) done(); }
    files.forEach(function (f) {
      var s = document.createElement('script');
      s.src = f.src;
      s.onload = finish;
      s.onerror = function () {
        if (f.kind === 'shapes') loadErrors.push(f.src);
        else console.warn('SINGE: could not load ' + f.src);
        finish();
      };
      document.head.appendChild(s);
    });
  }

  var files = [], loaded = {};
  ENTRIES.forEach(function (e) {                     // the same map can be listed twice (the World map in two scopes)
    if (!loaded['s|' + e.shapes]) files.push({ src: 'maps/' + e.shapes + '/shapes.js', kind: 'shapes' });
    if (!loaded['m|' + e.file]) files.push({ src: 'maps/' + e.file + '/settings.js', kind: 'settings' });
    loaded['s|' + e.shapes] = loaded['m|' + e.file] = true;
  });
  // First what was saved (the results, and the language), at the same time as the files load; then start.
  var pendingStart = 2;
  function start() {
    if (--pendingStart) return;
    lang = EG.language();
    MAPS = buildMaps();
    if ($('fsBtn')) fsLabel();
    ensureMapText(function () {
      buildMenu();
      document.body.classList.remove('loading');
    });
  }
  loadScores(start);
  loadFiles(files, start);
})();
