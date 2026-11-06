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

   Game-wide settings are in config.js; per-map settings are in map-settings/.
   All text the player sees comes from languages/<language>.js (interface) and
   languages/maps/<map>/<language>.js (map text) - see section 0a below.
   ========================================================================== */
(function () {
  'use strict';

  var CONFIG = loadConfig();           // game-wide settings from config.js (with defaults)
  var ENTRIES = (CONFIG.maps || []).map(function (m) {      // config.js maps: a name, or { id, file, ...settings that differ } (see config.js)
    var e = typeof m === 'string' ? { id: m } : m;
    var o = { file: e.file || e.id };
    Object.keys(e).forEach(function (k) { o[k] = e[k]; });
    return o;
  });
  var MAPS = [];                       // every map: shapes (maps/*.js) joined with settings (map-settings/*.js); filled in at start-up
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
      maps: [],
      default_theme: 'light',
      default_language: 'english',
      languages: ['english']
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
     Interface text: languages/<language>.js registers itself in window.SINGE_LANGUAGES
       ({ id, name, code, dir, text: { 'key': 'text' or { one:, other: } } }).
     Map text: languages/maps/<map>/<language>.js registers itself in window.GeoMapText
       ({ map, language, name, blurb, credit, regions: { '<region>': { name, capital, info, capital_info } } }).
     English is always loaded, and anything missing in the chosen language falls back to it
     (interface) or to the text in the map's settings file (map text).
     ===================================================================== */
  var LANGS = {};                      // language id -> its file contents
  var lang = CONFIG.default_language;  // the language in use
  var TEXT = {};                       // interface text of the language in use
  var pluralRules = null;              // plural rules of the language in use
  var MAPTEXT = {};                    // 'map id|language id' -> map text
  var mapTextState = {};               // 'map id|language id' -> 'ok' or 'none' (no such file)
  var mapTextSeen = 0;                 // how many window.GeoMapText entries are already indexed
  var warnedKeys = {};

  // The text for a key, with {placeholders} filled from params. A text given as
  // { one: ..., other: ... } is chosen by params.n using the language's plural rules.
  function tr(key, params) {
    var v = TEXT[key];
    if (v === undefined) v = LANGS.english && LANGS.english.text[key];
    if (v === undefined) {
      if (!warnedKeys[key]) { warnedKeys[key] = true; console.warn('SINGE: no text for "' + key + '".'); }
      return key;
    }
    if (v && typeof v === 'object') {
      var cat = 'other';
      try { if (pluralRules) cat = pluralRules.select(params && params.n); } catch (e) {}
      v = v[cat] !== undefined ? v[cat] : v.other;
    }
    return String(v).replace(/\{(\w+)\}/g, function (m, k) { return params && params[k] !== undefined ? params[k] : m; });
  }
  function modeLabel(mode) { return tr('mode.' + mode); }

  // Collect the languages that have registered themselves.
  function indexLanguages() {
    (window.SINGE_LANGUAGES || []).forEach(function (l) { if (l && l.id && l.text) LANGS[l.id] = l; });
  }
  // The languages offered to the player: the ones in config.js that loaded, in that order.
  function availableLanguages() {
    var out = (CONFIG.languages || []).filter(function (id) { return LANGS[id]; });
    return out.length ? out : ['english'];
  }
  // Switch the interface to language "lang" (static text, page language and direction).
  function applyLanguage() {
    var L = LANGS[lang] || LANGS.english;
    TEXT = L.text;
    try { pluralRules = new Intl.PluralRules(L.code || 'en'); } catch (e) { pluralRules = null; }
    if (L !== LANGS.english && !warnedKeys['@' + lang]) {          // tell translators what is still missing
      warnedKeys['@' + lang] = true;
      var missing = Object.keys(LANGS.english.text).filter(function (k) { return L.text[k] === undefined; });
      if (missing.length) console.warn('SINGE: languages/' + lang + '.js has no text for: ' + missing.join(', ') + ' (English is used).');
    }
    document.documentElement.lang = L.code || 'en';
    document.documentElement.dir = L.dir === 'rtl' ? 'rtl' : 'ltr';
    applyStaticText();
  }
  // Fill every element marked in index.html: data-i18n (its text), data-i18n-title (hover text),
  // data-i18n-aria (screen-reader label) and data-i18n-alt (picture description).
  function applyStaticText() {
    [['data-i18n', function (e, v) { e.textContent = v; }],
     ['data-i18n-title', function (e, v) { e.title = v; }],
     ['data-i18n-aria', function (e, v) { e.setAttribute('aria-label', v); }],
     ['data-i18n-alt', function (e, v) { e.alt = v; }]].forEach(function (a) {
      var list = document.querySelectorAll('[' + a[0] + ']');
      for (var i = 0; i < list.length; i++) a[1](list[i], tr(list[i].getAttribute(a[0])));
    });
    document.title = tr('site.title');
    if ($('fsBtn')) fsLabel();
    renderLanguageOption();
  }

  // Index newly loaded map text files, and warn about region names that do not exist.
  function indexMapText() {
    var all = window.GeoMapText || [];
    for (; mapTextSeen < all.length; mapTextSeen++) {
      var m = all[mapTextSeen];
      if (!m || !m.map || !m.language) continue;
      MAPTEXT[m.map + '|' + m.language] = m;
      var map = MAPS.filter(function (x) { return x.file === m.map; })[0];
      if (map && m.regions) Object.keys(m.regions).forEach(function (n) {
        if (!map.regions.some(function (r) { return r.name === n; })) {
          console.warn('SINGE: languages/maps/' + m.map + '/' + m.language + '.js mentions "' + n + '", which is not a region of that map.');
        }
      });
    }
  }
  // Make sure each map's text file for the language in use has been tried (the default language
  // needs none: its text is in the settings files). A missing file just means "not translated".
  function ensureMapText(done) {
    var L = lang;
    var seen = {};
    var todo = L === CONFIG.default_language ? [] : MAPS.filter(function (m) { if (seen[m.file]) return false; seen[m.file] = true; return !mapTextState[m.file + '|' + L]; });
    if (!todo.length) { done(); return; }
    var pending = todo.length;
    todo.forEach(function (m) {
      var s = document.createElement('script');
      function fin(ok) {
        mapTextState[m.file + '|' + L] = ok ? 'ok' : 'none';
        if (--pending === 0) { indexMapText(); done(); }
      }
      s.src = 'languages/maps/' + m.file + '/' + L + '.js';
      s.onload = function () { fin(true); };
      s.onerror = function () { fin(false); };
      document.head.appendChild(s);
    });
  }
  function mapTextFor(map) { return MAPTEXT[map.file + '|' + lang] || null; }
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
     Each map has two files with the same name: maps/<name>.js (shapes, generated)
     and map-settings/<name>.js (hand-edited settings). They are joined by "id".
     ===================================================================== */
  // World maps: pick the regions of the chosen scope. Every region of the shapes file is copied (the shapes
  // file is never changed). In 'un' scope a part (Alaska...) is merged into its country and everything that is
  // not a UN member / observer is drawn grey ("off"); in 'all' scope parts stay separate and "containers"
  // (countries whose every piece was split off, which have no marker position) are dropped.
  function worldScope(src, scope) {
    var by = {}, out = [];
    src.forEach(function (r) {
      var o = { name: r.name, kind: r.kind, d: r.d || '', s: r.s || '', mk: r.mk, sz: r.sz || 0, small: r.small, cont: r.cont, sub: r.sub, un: !!r.un, ins: {}, twin: r.twin, decor: !!r.decor, part_of: r.part_of, mkn: r.mkn };
      Object.keys(r.ins || {}).forEach(function (k) { o.ins[k] = [r.ins[k]]; });
      by[r.name] = o;
    });
    src.forEach(function (r) {
      var o = by[r.name], p = r.part_of && by[r.part_of];
      if (scope === 'un' && p) {                          // merge into the country
        if (p.s || o.s) p.s = (p.s || p.d) + (o.s || o.d);       // outlines (see tools/world.py) follow the shapes
        p.d += o.d;
        if (o.sz > p.sz || !p.mk) { p.sz = Math.max(p.sz, o.sz); p.small = o.small; p.mk = o.mk || p.mk; }
        Object.keys(o.ins).forEach(function (k) { p.ins[k] = (p.ins[k] || []).concat(o.ins[k]); });
        return;
      }
      if (scope === 'all' && !o.mk) return;               // empty container
      if (scope === 'un') o.off = !o.un && !o.decor;      // not in the game: drawn grey (a "decor" piece, like Annobón, is drawn plain)
      out.push(o);
    });
    return out.filter(function (o) { return o.d || o.mk; });
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
      var shape = shapes[entry.file];
      if (!shape) return;                                   // its file did not load (reported on the menu)
      var s = {}, base = settings[entry.file];
      if (!base) console.warn('SINGE: no settings file for map "' + entry.file + '" - using defaults.');
      Object.keys(base || {}).forEach(function (k) { s[k] = base[k]; });
      Object.keys(entry).forEach(function (k) { if (k !== 'id' && k !== 'file') s[k] = entry[k]; });   // what the config.js entry changes (scope, name...)
      var byName = s.regions || {}, known = {}, kindOf = {}, regions = [];
      // World-type maps (shape.wrap) list every country AND territory; "scope" decides which are in the game
      // ('un': UN members + Vatican + Palestine, parts merged into their country; 'all': everything, parts separate).
      var scope = shape.wrap ? (s.scope === 'all' ? 'all' : 'un') : undefined;
      var list = shape.wrap ? worldScope(shape.regions, scope) : shape.regions;
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
                  wrap: shape.wrap, strip: shape.strip, strip_y: shape.strip_y, total: shape.total, lakes: shape.lakes,
                  insets: mergeInsets(shape.insets, s.insets), scope: scope, max_map_height: s.max_map_height,
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
          EduGame.ready()    -> what was saved before (each board's best result, and the learner's options)
          EduGame.start()    -> a round begins (the helper times it)
          EduGame.finish()   -> a round ends: {acc: accuracy %}, on the board of that map and mode
        A "board" is one scored thing: a map in one mode. Its id is the map's id for the Regions game ("sierra_leone"),
        and "<map id>_capitals" / "<map id>_flags" for the other scored modes. Each board keeps the learner's BEST round:
        the highest accuracy, and for equal accuracy the shortest time (edugame.json: rank_by acc, then time).
        The helper saves each board as [accuracy, seconds, times played] in SCORM suspend_data (the same list SINGE has
        always saved, so earlier saves still work), and Kolibri Games builds its scoreboards from it.
        A round that does not reach the mode's pass mark (see goalFor) is played but not kept as a result.
        Learning systems get "incomplete" when the game opens and "passed" after a round that counts; Kolibri itself
        never gets a score (the helper takes care of that).
     ===================================================================== */
  var scores = {};      // board id -> [accuracy, seconds, times played] (the learner's kept results)
  var EG = window.EduGame || fallbackHelper();   // the kit's helper; a tiny stand-in when this page is opened straight from the repository
  var helperInfo = null;                          // what EduGame.ready() told us

  // The board of one map in one mode (the map's id is unique: the two World variants are "world" and "world_all").
  function saveId(map, mode) { return mode === 'regions' ? map.id : map.id + '_' + mode; }

  // Used only when edugame.js was not loaded (opening index.html from the repository, with no build): saves in this browser,
  // keeping the best round of each board like the real helper does. It is NOT used in any package made with the kit.
  function fallbackHelper() {
    var KEY = 'edugame:org.togetherings.singe', rec = {}, round = null;
    try { rec = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { rec = {}; }
    function write() { try { localStorage.setItem(KEY, JSON.stringify(rec)); } catch (e) {} return Promise.resolve(); }
    function results() {
      var out = {};
      Object.keys(rec).forEach(function (k) { if (k.charAt(0) !== '_' && Array.isArray(rec[k])) out[k] = { acc: rec[k][0], time: rec[k][1], plays: rec[k][2] }; });
      return out;
    }
    return {
      ready: function () { return Promise.resolve({ save: rec._save || null, results: results(), language: null, platform: 'local' }); },
      save: function (data) { rec._save = data; return write(); },
      start: function () { round = Date.now(); return Promise.resolve(); },
      finish: function (v, o) {
        var secs = Math.round((Date.now() - (round || Date.now())) / 100) / 10, id = o.board, old = rec[id];
        var plays = ((old && old[2]) || 0) + 1, kept = old ? { acc: old[0], time: old[1], plays: plays } : null, better = false;
        if (o.passed !== false) {
          better = !old || v.acc > old[0] || (v.acc === old[0] && secs < old[1]);
          if (better) kept = { acc: v.acc, time: secs, plays: plays }; else kept.plays = plays;
        }
        if (kept) rec[id] = [kept.acc, kept.time, kept.plays];
        return write().then(function () { return { values: { acc: v.acc, time: secs }, seconds: secs, kept: kept, newBest: better && !!old, passed: o.passed !== false }; });
      },
      complete: function () {}
    };
  }

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
      var o = (helperInfo.save && helperInfo.save.options) || {};      // the learner's own choices (Options page)
      if (o.theme === 'light' || o.theme === 'dark' || o.theme === 'auto') options.theme = o.theme;
      if (typeof o.language === 'string') options.language = o.language;
      done();
    }, function () { helperInfo = {}; done(); });
  }

  // One finished round: the helper keeps it if it counts, and the board's kept result comes back.
  // Resolves with { kept: [acc, secs, plays] or null, counted: bool, newBest: bool }; never rejects (a failed save is only logged).
  function recordResult(id, acc, secs, counts) {
    return EG.finish({ acc: acc }, { board: id, passed: counts }).then(function (r) {
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
  function show(screenId) {
    ['menu', 'game', 'results', 'options'].forEach(function (id) { $(id).classList.toggle('hidden', id !== screenId); });
    // maps with orientation: 'horizontal' use a wider page while being played
    var inGame = screenId === 'game' && !!g.map;
    document.body.classList.toggle('wide', inGame && g.map.orientation === 'horizontal');
    // a world map: the game bar is laid over the top of the map (nothing much is up there) to save height
    document.body.classList.toggle('overlay', inGame && !!g.map.wrap);
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
      if (lang !== CONFIG.default_language && !mapTextFor(map)) {     // no translation: say which language it is in
        var note = el('div', 'langNote', tr('menu.default_only', { 'default': LANGS[CONFIG.default_language].name }));
        note.title = tr('menu.default_only_hint', { language: LANGS[lang].name });
        card.appendChild(note);
      }
      var row = el('div', 'modes');
      modesFor(map).forEach(function (mode) {
        var b = el('button', 'modeBtn');
        b.appendChild(el('b', '', modeLabel(mode)));
        if (mode === 'practice') {
          b.appendChild(el('small', '', tr('menu.practice_hint')));
        } else {
          var goal = goalFor(map, mode), s = scores[saveId(map, mode)];
          if (goal) b.appendChild(el('small', 'goal', tr('menu.goal', { pct: goal })));
          b.appendChild(el('small', '', bestLine(saveId(map, mode))));
          if (s && s[2]) b.appendChild(el('small', '', tr('menu.completed', { n: s[2] })));
          if (goal && s && s[0] >= goal) { b.classList.add('met'); b.title = tr('menu.goal_met'); }
        }
        b.onclick = function () { startGame(map, mode); };
        row.appendChild(b);
      });
      card.appendChild(row);
      list.appendChild(card);
    });
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
    if (map.wrap) return [(lon + 180) * k, (millerY(map.projection.lat_top) - millerY(lat)) * k];
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
    (map.frames || []).forEach(function (f) {          // outlines around regions that were moved (e.g. Alaska)
      var box = document.createElementNS(SVG_NS, 'polygon');
      box.setAttribute('class', 'frame');
      box.setAttribute('points', f.pts.map(function (p) { return p.join(','); }).join(' '));
      svg.appendChild(box);
    });
    map.regions.forEach(function (r, i) {
      var d = r.d;                       // ready-made path wins if supplied
      if (!d) {
        d = 'M' + r.poly.map(function (p) {
          return ((p[0] - b[0]) * k).toFixed(1) + ',' + ((b[3] - p[1]) * k).toFixed(1);
        }).join('L') + 'Z';
      }
      var path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('d', d);
      path.setAttribute('class', r.inactive ? 'region inactive' : 'region');
      path.setAttribute('data-name', r.name);
      path.setAttribute('data-i', i);    // index back into map.regions
      svg.appendChild(path);
    });
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
    if (s) parent.appendChild(svgEl('path', { d: s, 'class': 'rstroke' }));
  }
  function buildWorld(map) {
    var svg = svgEl('svg', { viewBox: '0 0 ' + map.size[0] + ' ' + map.size[1] });
    var tile = svgEl('g', { 'class': 'tile' });
    // (No wide invisible "halo" outlines on a world map: the circles of tiny regions do that job, and a halo several
    // times bigger than a tiny island overlapped its neighbours - Wallis and Futuna next to Samoa, for one.)
    map.regions.forEach(function (r, i) { if (r.d) addRegion(tile, r, i, r.d, r.s); });
    // big lakes that cross borders (Great Lakes, Victoria, Malawi...) are drawn as water on top of the land
    (map.lakes || []).forEach(function (l) { tile.appendChild(svgEl('path', { d: l.d, 'class': 'lake' })); });
    svg.appendChild(tile);
    g.tile = tile;
    return svg;
  }
  function buildStrip(map) {
    var svg = svgEl('svg', { viewBox: '0 0 ' + map.strip[0] + ' ' + map.strip[1] });
    (map.insets || []).forEach(function (ins) {
      var clip = svgEl('clipPath', { id: 'clip_' + ins.id });
      clip.appendChild(svgEl('rect', { x: ins.x, y: ins.y, width: ins.w, height: ins.h }));
      svg.appendChild(clip);
      svg.appendChild(svgEl('rect', { 'class': 'inbox', x: ins.x, y: ins.y, width: ins.w, height: ins.h }));
      var grp = svgEl('g', { 'clip-path': 'url(#clip_' + ins.id + ')' });
      map.regions.forEach(function (r, i) {
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
    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, items = svg.querySelectorAll('.region, .frame');
    for (var i = 0; i < items.length; i++) {
      var b = items[i].getBBox();
      x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y);
      x1 = Math.max(x1, b.x + b.width); y1 = Math.max(y1, b.y + b.height);
    }
    var pad = (x1 - x0) * 0.012;
    svg.setAttribute('viewBox', [x0 - pad, y0 - pad, x1 - x0 + 2 * pad, y1 - y0 + 2 * pad].join(' '));
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
          clicks: 0, found: 0, start: Date.now(), timer: null, done: {}, grade: {},
          wrap: wrap, root: $('game'), ratio: 1,
          infinite: wrap && (map.infinite_scroll !== undefined ? !!map.infinite_scroll : !!CONFIG.infinite_scroll) };
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
      g.strip = buildStrip(map);
      if (cls) g.strip.setAttribute('class', cls);
    }
    // hovering a halo highlights its region (the halo is a separate shape)
    // (also for the region itself: a region drawn in two places, like Russia across the seam of a world map,
    // is highlighted in both)
    // Circles are linked too: hovering a circle (a region's marker or a capital) in a box lights up the same circle
    // (and the region) on the main map, on both copies of the world, and the other way round.
    function hoverHalo(e, on) {
      var t = e.target, cl = t.classList, k, els;
      if (!cl) return;
      if ((cl.contains('halo') || cl.contains('region')) && !cl.contains('inactive')) {
        els = g.root.querySelectorAll('.region[data-i="' + t.getAttribute('data-i') + '"], .mk[data-i="' + t.getAttribute('data-i') + '"]');
        for (k = 0; k < els.length; k++) els[k].classList.toggle('hover', on);
      } else if (cl.contains('mk')) {
        els = g.root.querySelectorAll('.region[data-i="' + t.getAttribute('data-i') + '"], .mk[data-i="' + t.getAttribute('data-i') + '"]');
        for (k = 0; k < els.length; k++) els[k].classList.toggle('hover', on);
      } else if (t.parentNode && t.parentNode.classList && t.parentNode.classList.contains('cap')) {
        els = g.root.querySelectorAll('.cap[data-c="' + t.parentNode.getAttribute('data-c') + '"]');
        for (k = 0; k < els.length; k++) els[k].classList.toggle('hover', on);
      }
    }
    [svg, g.strip].forEach(function (v) {
      if (!v) return;
      v.addEventListener('click', onMapClick);
      v.addEventListener('pointerover', function (e) { hoverHalo(e, true); });
      v.addEventListener('pointerout',  function (e) { hoverHalo(e, false); });
    });
    $('mapBox').appendChild(svg);
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
    if (!wrap) fitView(svg); else fitWorld();
    if (mode === 'capitals' || practice || wrap) addCapitals(svg, map);   // practice shows capitals too; world maps add markers
    if (mode !== 'capitals' && !wrap) addHalos(svg, map);
    $('promptFlag').classList.add('hidden');
    $('bar').classList.toggle('flagMode', mode === 'flags');     // layout: the flag takes the middle of row 1
    $('bar').classList.toggle('practice', practice);             // Practice has no timer or prompts
    var c = setupZoom(svg, map);
    c.onZoom = function (ratio) { g.ratio = ratio; sizeCircles(); };
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
    if (practice) {
      $('prompt').textContent = tr('prompt.practice');
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
    g.tries = 0;
    var region = g.map.regions[g.target], flag = $('promptFlag');
    if (g.mode === 'flags') {                        // show the flag; the player clicks its region
      $('prompt').textContent = tr('prompt.flag');
      flag.src = region.flag;
      flag.classList.remove('hidden');
    } else {
      $('prompt').textContent = tr('prompt.find', { name: regionStr(g.map, region, g.mode === 'capitals' ? 'capital' : 'name') });
    }
    $('feedback').textContent = '';
    $('found').textContent = g.found;
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

  function openInfo(item) {
    hideTip();
    $('infoTitle').textContent = item.title;
    $('infoSub').textContent = item.sub || '';
    var img = $('infoFlag');
    img.classList.toggle('hidden', !item.flag);
    if (item.flag) { img.src = item.flag; img.alt = tr('info.flag_of', { name: item.title }); }
    $('infoText').textContent = item.text || '';       // plain text (line breaks are kept)
    $('infoBack').classList.remove('hidden');
    $('infoClose').focus();
  }
  function closeInfo() { $('infoBack').classList.add('hidden'); }

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
      addCls(shape, 'notmain');
      setTimeout(function () { remCls(shape, 'notmain'); }, 700);
      $('feedback').textContent = tr('feedback.not_main', { name: regionStr(g.map, askedR, 'name') });
      return;
    }

    g.clicks++;
    if (membersOf(picked).indexOf(g.target) >= 0) {      // (any of the places a shared shape stands for is a right answer)
      // ---- correct ----
      var wasHinted = g.tries >= MAX_TRIES, usedRetry = g.tries > 0;
      var target = shapeEls(g.target);
      remCls(target, 'hint');
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
      g.wrong++; g.tries++;
      addCls(shape, 'wrong');
      setTimeout(function () { remCls(shape, 'wrong'); }, 350);
      var left = MAX_TRIES - g.tries;
      if (left > 0) {
        $('feedback').textContent = tr('feedback.retry', { n: left });
      } else {
        $('feedback').textContent = tr('feedback.hint');
        addCls(shapeEls(g.target), 'hint');   // reveal the answer
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
      var best = r.kept;
      $('resMap').textContent = tr('results.map', { map: mapStr(g.map, 'name'), mode: modeLabel(g.mode) });
      $('resAcc').textContent = tr('results.pct', { pct: acc });
      $('resTime').textContent = fmtTime(secs);
      var line = best ? tr('results.best', { acc: best[0], time: fmtTime(best[1]), n: best[2] }) : '';
      if (!r.counted) line = tr('results.not_counted', { pct: goal }) + (line ? ' ' + line : '');
      else if (r.newBest) line = tr('results.new_best') + ' ' + line;
      $('resBest').textContent = line;
      show('results');
    });
  }

  function leaveGame() {
    if (g.timer) clearInterval(g.timer);
    $('stripBox').style.marginTop = '';
    hideTip();
    closeInfo();
    buildMenu();
    show('menu');
  }

  /* =====================================================================
     5b. NAME LABEL (hover or tap)
     ===================================================================== */
  var tipTimer = null;
  function showTip(text, x, y, hideAfterMs) {
    var t = $('tip');
    t.textContent = text;
    t.style.left = (x + 12) + 'px';
    t.style.top = (y + 14) + 'px';
    t.classList.remove('hidden');
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
    var c = { moved: false, step: step, zoomBy: zoomBy, reset: reset, move: move, up: up, onZoom: null };
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
    var W = map.size[0], H = map.size[1], SH = map.strip ? map.strip[1] : 0;
    var TOT = map.total || (H + SH), overlap = map.strip_y ? H - map.strip_y : 0;   // map units
    var maxW = Math.min(map.page_width || 2000, vw, (map.max_map_height || 100000) * W / H + sideX) - sideX;
    var both = vh >= (map.fit_all_min_height || 800);
    function setW(w) {
      document.body.style.setProperty('--pageW', Math.round(w + sideX) + 'px');
      $('stripBox').style.marginTop = (-overlap * w / W).toFixed(1) + 'px';          // the boxes overlap the map's empty bottom
    }
    var w = Math.max(500, Math.min(1400, maxW));
    for (var pass = 0; pass < 3; pass++) {                      // measure the space around the map, size, measure again
      setW(w);
      var mapBox = $('mapBox').getBoundingClientRect(), strip = $('stripBox').getBoundingClientRect(), fRect = fr.getBoundingClientRect();
      var chrome = fRect.height + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom) - (strip.bottom - mapBox.top);
      var topSpace = mapBox.top + (window.pageYOffset || 0);
      w = Math.max(500, Math.min(both ? (vh - chrome - 1) * W / TOT : (vh - topSpace - 4) * W / H, maxW));
    }
    setW(w);
    sizeCircles();
  }
  window.addEventListener('orientationchange', checkRotate);
  $('rotateOk').onclick = function () { rotateDismissed = true; checkRotate(); };
  window.addEventListener('resize', function () { checkRotate(); if (g.svg && !$('game').classList.contains('hidden')) { fitWorld(); sizeCircles(); } });
  $('infoClose').onclick = closeInfo;

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
  $('infoBack').onclick = function (e) { if (e.target === this) closeInfo(); };   // click outside the card
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeInfo(); });
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
    $('flagBack').classList.remove('hidden');
    $('flagClose').focus();
  }
  function closeFlag() { $('flagBack').classList.add('hidden'); }
  $('promptFlag').onclick = openFlag;
  $('promptFlag').onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openFlag(); } };
  $('flagBack').onclick = closeFlag;                 // click anywhere to close
  $('flagClose').onclick = closeFlag;
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeFlag(); });

  // ---- Options (saved with the learner's other saves) ----
  var options = { theme: CONFIG.default_theme, language: null };
  var darkQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  // The learner's choices are read from the helper's save in loadScores() and saved with it.
  function saveOptions() { EG.save({ options: { theme: options.theme, language: options.language } }); }

  // Light or dark: "auto" follows the device's own setting (and changes with it).
  function applyTheme() {
    var dark = options.theme === 'dark' || (options.theme === 'auto' && darkQuery && darkQuery.matches);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }
  if (darkQuery) {
    var onDeviceChange = function () { if (options.theme === 'auto') applyTheme(); };
    if (darkQuery.addEventListener) darkQuery.addEventListener('change', onDeviceChange);
    else if (darkQuery.addListener) darkQuery.addListener(onDeviceChange);
  }
  // Language choice on the Options page: a drop-down if there is more than one language,
  // otherwise just the name of the only one.
  function renderLanguageOption() {
    var sel = $('langSel'), name = $('langName');
    if (!sel || !name) return;
    var ids = availableLanguages();
    sel.innerHTML = '';
    ids.forEach(function (id) {
      var o = el('option', '', LANGS[id] ? LANGS[id].name : id);
      o.value = id;
      sel.appendChild(o);
    });
    sel.value = lang;
    sel.classList.toggle('hidden', ids.length < 2);
    name.textContent = ids.length < 2 ? (LANGS[lang] ? LANGS[lang].name : lang) : '';
  }
  // The player chose another language: switch the text, then redraw the menu once the map text is in.
  function setLanguage(id) {
    if (!LANGS[id] || id === lang) return;
    lang = id;
    options.language = id;
    saveOptions();
    applyLanguage();
    ensureMapText(function () { if (lang === id) buildMenu(); });
  }
  function showOptions() {
    var radios = document.getElementsByName('theme');
    for (var i = 0; i < radios.length; i++) radios[i].checked = radios[i].value === options.theme;
    show('options');
  }
  (function bindOptions() {
    var radios = document.getElementsByName('theme');
    for (var i = 0; i < radios.length; i++) {
      radios[i].onchange = function () {
        if (!this.checked) return;
        options.theme = this.value;
        saveOptions();
        applyTheme();
      };
    }
    $('langSel').onchange = function () { setLanguage(this.value); };
    $('optBtn').onclick = showOptions;
    $('optBack').onclick = function () { show('menu'); };
  })();

  // ---- Load the languages and maps named in config.js, then start ----
  // Each name in config.maps has a shapes file (required) and a settings file (optional).
  // Each name in config.languages has a language file (languages/<name>.js).
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

  indexLanguages();                                  // english.js is already loaded by index.html
  var files = [], loaded = {};
  (CONFIG.languages || []).forEach(function (n) { if (!LANGS[n]) files.push({ src: 'languages/' + n + '.js', kind: 'lang' }); });
  ENTRIES.forEach(function (e) {
    if (loaded[e.file]) return;                      // the same map can be listed twice (the World map in two scopes)
    loaded[e.file] = true;
    files.push({ src: 'maps/' + e.file + '.js', kind: 'shapes' });
    files.push({ src: 'map-settings/' + e.file + '.js', kind: 'settings' });
  });
  // First what was saved (the learner's options and results), at the same time as the files load; then start.
  var pendingStart = 2;
  function start() {
    if (--pendingStart) return;
    indexLanguages();
    var ids = availableLanguages();
    if (ids.indexOf(CONFIG.default_language) < 0) CONFIG.default_language = ids[0];
    if (!options.language && helperInfo && helperInfo.language) {          // the language the learning system or Kolibri uses
      var want = String(helperInfo.language).toLowerCase().split(/[-_]/)[0];
      ids.forEach(function (id) { if (!options.language && String((LANGS[id].code || '')).toLowerCase().split(/[-_]/)[0] === want) options.language = id; });
    }
    lang = ids.indexOf(options.language) >= 0 ? options.language : CONFIG.default_language;
    applyTheme();
    MAPS = buildMaps();
    indexMapText();
    applyLanguage();
    ensureMapText(function () {
      buildMenu();
      document.body.classList.remove('loading');
    });
  }
  loadScores(start);
  loadFiles(files, start);
})();
