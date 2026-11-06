/* ==========================================================================
   SINGE: Studies In Geography - game-wide settings (config.js)
   --------------------------------------------------------------------------
   Settings that apply to the whole game live here. Settings for one map
   (title, credit, pass mark, game modes, capitals, flags...) are in that map's
   file in map-settings/. If a setting is missing here, js/game.js uses a default.
   ========================================================================== */
window.SINGE_CONFIG = {

  // Version of SINGE, as major.minor.patch (see CHANGELOG.md). Shown in the browser console for support.
  version: '0.3.0',

  // The maps in the game, in the order they appear on the menu. Each is the file name used in
  // both maps/<name>.js (shapes) and map-settings/<name>.js (settings); the files are loaded
  // automatically, so nothing needs adding to index.html. The name must equal the map's "id".
  //
  // A map can be listed more than once, with different settings, by writing it as an object:
  //   { id: 'world_all', file: 'world', scope: 'all', name: '...', blurb: '...' }
  // "id" is this entry's own name (its scores are saved under it, so never change it once people have played),
  // "file" is the map's files, and anything else (scope, name, blurb, pass_accuracy, modes...) replaces that
  // setting from the map's settings file. The World map is listed twice: UN countries only, and everything.
  // (The packages for Kolibri each list their own maps: see tools/packages.json and docs/GUIDE.md.)
  maps: [
    'sierra_leone',
    'us',
    { id: 'world', file: 'world', scope: 'un', name: 'World: UN countries',
      blurb: 'Find the 193 UN member countries, plus Vatican City and Palestine' },
    { id: 'world_all', file: 'world', scope: 'all', name: 'World: all countries, territories and islands',
      blurb: 'Find every country, territory and island of the world, including the small ones' }
  ],

  // Appearance a new user starts with: 'light', 'dark', or 'auto' (follow the device).
  // Each user can change it on the Options page.
  default_theme: 'light',

  // Wrong guesses allowed before the correct answer is highlighted.
  max_tries: 3,

  // LANGUAGES. Each name is a file in languages/ (languages/english.js, languages/french.js...) holding every piece of
  // text the game shows; the files are loaded automatically. Players choose one on the Options page
  // (with only one language listed, the Options page just shows its name).
  // The default language is used until a player chooses another. Map settings files (map-settings/)
  // must be written in the default language, and maps can add translations in languages/maps/<map>/<language>.js.
  // Text for the game modes (Practice, Regions...) is in the language files too.
  default_language: 'english',
  languages: ['english', 'french'],

  // Order of the mode buttons on each map's menu card.
  mode_order: ['practice', 'regions', 'capitals', 'flags'],

  // Which modes are on when a map's settings don't say. A map turns a mode on or off
  // with its own "modes" setting. (Capitals and Flags also need capital / flag data.)
  default_modes: { practice: true, regions: true, capitals: true, flags: false },

  // Modes that have a saved score (Practice has none).
  scored_modes: ['regions', 'capitals', 'flags'],

  // Accuracy goal (%) for each scored mode. A map can set its own in map-settings/<name>.js.
  // 0 = no goal: the mode is not required for SCORM "passed" and no goal is shown on the menu.
  // SCORM becomes "passed" when every goal that is above 0 has been reached.
  pass_accuracy: { regions: 80, capitals: 0, flags: 0 },

  // Skip buttons (right arrow skips the current prompt; left arrow returns to the last skipped one).
  // null: each map decides in its own settings file (the default, on when a map doesn't say).
  // true / false: forces skipping on / off in every map.
  skip_enabled: null,

  // The Full Screen button (in a header at the top of the page). Off: Kolibri has its own full page mode.
  fullscreen_button: false,

  // World-type maps (the World map and later continent maps): dragging sideways goes round the world without end.
  // A map can set its own "infinite_scroll" in map-settings/. (false = the map has edges.)
  infinite_scroll: true,

  // Tiny countries and island chains get a click circle while they are smaller than this many screen pixels.
  marker_px: 16,

  // Zoom defaults (a map can set its own zoom_levels / zoom_step).
  zoom_step: 1.5,                    // each press of + zooms in by this factor
  zoom_levels: 5                     // number of + presses from Full view to maximum zoom
};
