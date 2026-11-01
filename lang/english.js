/* ==========================================================================
   SINGE: Studies In Geography - INTERFACE TEXT: English (the default language)
   --------------------------------------------------------------------------
   Every piece of text the game shows - on the pages, buttons, hover text and
   messages - is listed here, so a translator only has to copy this file,
   change the file name (french.js, spanish.js...), and translate the text.

   TO ADD A LANGUAGE
     1. Copy this file to lang/<language>.js (use the same name for "id" below).
     2. Change id, name, code and dir, then translate every line under "text".
        Leave the {words in braces} exactly as they are: the game fills them in
        (for example {name} becomes the name of a region). You may move them.
     3. Add the id to the "languages" list in config.js.
   Anything you leave out is shown in English, and the browser console (F12)
   lists the missing lines.

   A line can also give different wording for one and for many, for example
     { one: 'Completed {n} time', other: 'Completed {n} times' }
   (languages with more forms - few, many, zero, two - can add those names;
   "other" is always required).

   Text about a particular MAP (its title, region names, capitals) is not here:
   see lang/maps/<map>/<language>.js.
   ========================================================================== */
(window.SINGE_LANGUAGES = window.SINGE_LANGUAGES || []).push({
  id: 'english',          // must equal this file's name (without .js)
  name: 'English',        // how the language is listed on the Options page - write it in the language itself
  code: 'en',             // language code (used for plural rules and the page's lang attribute)
  dir: 'ltr',             // 'ltr' = left to right, 'rtl' = right to left (Arabic, Hebrew...)

  text: {
    // ---- every page ----
    'site.title': 'SINGE: Studies In Geography',     // header and browser tab
    'common.close': 'Close',
    'fullscreen.enter': 'Full Screen',                 // header button
    'fullscreen.exit': 'Exit Full Screen',

    // ---- Menu page ----
    'menu.title': 'Choose a map',
    'menu.intro': 'Click each place as its name appears.',
    'menu.options': 'Options',
    'menu.no_maps': 'No maps found. Check the "maps" list in config.js and that the map files are included.',
    'menu.load_error': 'Could not load {file}',
    'menu.practice_hint': 'Learn the names',                   // under the Practice button
    'menu.goal': 'Goal: {pct}%',                               // accuracy goal shown on a mode button
    'menu.goal_met': 'Goal reached',                           // hover text on a button whose goal is met
    'menu.best': 'Best: {acc}% in {time}',
    'menu.not_played': 'Not played yet',
    'menu.completed': { one: 'Completed {n} time', other: 'Completed {n} times' },
    // Shown on a map that has no translation into the language the player chose.
    // {default} is the default language (named in its own language), {language} is the chosen one.
    'menu.default_only': '{default} only',
    'menu.default_only_hint': 'This map is not available in {language} yet.',

    // ---- Game modes (menu buttons and results page) ----
    'mode.practice': 'Practice',
    'mode.regions': 'Regions',
    'mode.capitals': 'Capitals',
    'mode.flags': 'Flags',

    // ---- Game page ----
    'game.back': 'Back to menu',
    'game.time': 'Time',
    'game.found': 'Found',
    'label.capital': 'Capital: {name}',
    'label.shared': '{capital} and {region}',          // hover text of one circle that is both a capital and a region (Rome, Vatican City)                // hover text of a circle that marks both a country and its capital
    'zoom.in': 'Zoom In',                                      // hover text of the + button
    'zoom.out': 'Zoom Out',                                    // hover text of the - button
    'zoom.full': 'Full',                                       // text on the button that shows the whole map
    'zoom.full_hint': 'Fit to Full Map',                      // hover text of that button
    'skip.next': 'Skip for now',                               // hover text of the skip button
    'skip.prev': 'Go back to the previous skipped one',        // hover text of the back button
    'skip.next_icon': '→',                                // arrow on the skip button (right arrow)
    'skip.prev_icon': '←',                                // arrow on the back button (left arrow)
    'prompt.find': 'Find: {name}',                             // {name}: a region or a city
    'prompt.flag': 'Which region has this flag?',
    'prompt.practice': 'Practice: point at or tap a region or city to see its name.',
    'feedback.retry': { one: 'Not quite. {n} try left.', other: 'Not quite. {n} tries left.' },
    'feedback.hint': 'That one is highlighted - click it.',
    'feedback.not_main': 'That is part of {name}, but not its main area. Click on the main area of {name}.',   // a far-away part (island, Alaska...) was clicked for its country
    'rotate.hint': 'This map is wide. Please turn your device sideways.',
    'rotate.continue': 'Continue anyway',

    // ---- Flags and information panel ----
    'flag.alt': 'The flag to identify',
    'flag.hint': 'Click to see it full size',
    'flag.full_alt': 'The flag, full size',
    'info.capital_of': 'Capital of {region}',
    'info.flag_of': 'Flag of {name}',

    // ---- Results page ----
    'results.title': 'Finished!',
    'results.map': '{map} - {mode}',
    'results.accuracy': 'Accuracy:',
    'results.pct': '{pct}%',                                   // a percentage on its own
    'results.time': 'Time:',
    'results.best': { one: 'Best: {acc}% accuracy, fastest {time} (played {n} time)',
                      other: 'Best: {acc}% accuracy, fastest {time} (played {n} times)' },
    'results.again': 'Play again',
    'results.menu': 'Back to menu',

    // ---- Options page ----
    'options.title': 'Options',
    'options.appearance': 'Appearance',
    'options.theme_light': 'Light',
    'options.theme_dark': 'Dark',
    'options.theme_auto': 'Auto',
    'options.theme_auto_hint': '(follows this device\'s light or dark setting)',
    'options.language': 'Language',
    'options.back': 'Back to menu'
  }
});
