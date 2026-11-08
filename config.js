/* ==========================================================================
   SINGE: Studies In Geography - game-wide settings (config.js)
   --------------------------------------------------------------------------
   Settings that apply to the whole game live here. Settings for one map
   (title, credit, pass mark, game modes, capitals, flags...) are in its
   folder: maps/<map>/settings.js. If a setting is missing here, js/game.js uses a default.
   Elsewhere:
     edugame.json   the version, the languages, the starting appearance ("options"), the
                    scores, and the packages: which maps each zip has
     lang/          every word the game shows, one file per language
   (Appearance and language are chosen by each learner in the kit's Options panel.)
   ========================================================================== */
window.SINGE_CONFIG = {

  // Wrong guesses allowed before the correct answer is highlighted.
  max_tries: 3,

  // Order of the mode buttons on each map's menu card.
  mode_order: ['practice', 'regions', 'capitals', 'flags'],

  // Which modes are on when a map's settings don't say. A map turns a mode on or off
  // with its own "modes" setting. (Capitals and Flags also need capital / flag data.)
  default_modes: { practice: true, regions: true, capitals: true, flags: false },

  // Modes that have a saved score (Practice has none).
  scored_modes: ['regions', 'capitals', 'flags'],

  // Accuracy goal (%) for each scored mode. A map can set its own in maps/<map>/settings.js.
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
  // A map can set its own "infinite_scroll" in maps/<map>/settings.js. (false = the map has edges.)
  infinite_scroll: true,

  // Tiny countries and island chains get a click circle while they are smaller than this many screen pixels.
  marker_px: 16,

  // Zoom defaults (a map can set its own zoom_levels / zoom_step).
  zoom_step: 1.5,                    // each press of + zooms in by this factor
  zoom_levels: 5                     // number of + presses from Full view to maximum zoom
};
