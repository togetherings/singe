/* ==========================================================================
   MAP SETTINGS: British Isles   (hand-edited - the shapes come from tools/british_isles.py)
   --------------------------------------------------------------------------
   See maps/sierra_leone/settings.js for the settings every map has, and maps/africa/settings.js for those of a
   WINDOW map (in_game, insets: false, view_pad): the map opens on the regions in "in_game", and every other region
   of the shapes file (France, Belgium, the Netherlands, Norway, the Faroe Islands...) is drawn grey.
   The shapes are cut from Natural Earth 5.1.2: the UK's four nations, Ireland, the Isle of Man, Jersey and Guernsey,
   with Cornwall (and the Isles of Scilly) and the Isle of Wight cut out of England, and the Hebrides, Orkney and Shetland
   out of Scotland. (The Isle of Wight is separate only on this map: the World and Europe maps keep it in the UK.)
   Flags: the World map's folder (maps/world/flags/), so the Countries package lists each one it uses.
   ========================================================================== */
(window.GeoMapSettings = window.GeoMapSettings || []).push({
  id: 'british_isles',
  name: 'British Isles',
  blurb: 'Find the nations, islands and Crown Dependencies of Great Britain and Ireland',
  credit: 'Boundaries: Natural Earth 5.1.2 (public domain, naturalearthdata.com); Cornwall from its admin-1 border. Flags: Wikipedia (public domain).',
  image: 'maps/british_isles/flag.svg',   // the UK's and Ireland's flags, split diagonally (made from maps/world/flags/gb.svg and ie.svg)
  orientation: 'vertical',
  insets: false,
  infinite_scroll: false,
  view_pad: 0.04,
  page_width: 1600,
  fit_all_min_height: 600,
  circle_ratio: 0.009,
  marker_px: 16,
  zoom_levels: 4,
  pass_accuracy: { regions: 80, capitals: 0, flags: 0 },
  skip: true,
  nudge_zoom_levels: 2,
  modes: { practice: true, regions: true, capitals: true, flags: true },
  in_game: [
    'England', 'Scotland', 'Wales', 'Northern Ireland', 'Ireland', 'Isle of Man', 'Jersey', 'Guernsey', 'Cornwall', 'Isle of Wight',
    'Hebrides', 'Orkney Islands', 'Shetland Islands'
  ],

  regions: {
    'England': {
      capital: { name: 'London', lat: 51.5074, lon: -0.1278, info: '' },
      info: '',
      flag: 'maps/world/flags/gb-eng.svg'
    },
    'Scotland': {
      capital: { name: 'Edinburgh', lat: 55.9533, lon: -3.1883, info: '' },
      info: '',
      flag: 'maps/world/flags/gb-sct.svg'
    },
    'Wales': {
      capital: { name: 'Cardiff', lat: 51.4816, lon: -3.1791, info: '' },
      info: '',
      flag: 'maps/world/flags/gb-wls.svg'
    },
    'Northern Ireland': {
      capital: { name: 'Belfast', lat: 54.5973, lon: -5.9301, info: '' },
      info: 'The Ulster Banner shown here was the flag of Northern Ireland\'s government from 1953 to 1972. Since then the Union Flag is Northern Ireland\'s only official flag.',
      flag: 'maps/world/flags/gb-nir.svg'
    },
    'Ireland': {
      capital: { name: 'Dublin', lat: 53.3498, lon: -6.2603, info: '' },
      info: '',
      flag: 'maps/world/flags/ie.svg'
    },
    'Isle of Man': {
      capital: { name: 'Douglas', lat: 54.1523, lon: -4.4861, info: '' },
      info: 'A Crown Dependency: it governs itself and is not part of the United Kingdom.',
      flag: 'maps/world/flags/im.svg'
    },
    'Jersey': {
      capital: { name: 'St Helier', lat: 49.1858, lon: -2.11, info: '' },
      info: 'A Crown Dependency: it governs itself and is not part of the United Kingdom.',
      flag: 'maps/world/flags/je.svg'
    },
    'Guernsey': {
      capital: { name: 'St Peter Port', lat: 49.455, lon: -2.5367, info: '' },
      info: 'A Crown Dependency, with Alderney and Sark: it governs itself and is not part of the United Kingdom.',
      flag: 'maps/world/flags/gg.svg'
    },
    'Cornwall': {
      capital: { name: 'Truro', lat: 50.2632, lon: -5.051, info: '' },
      info: 'A county of England, with the Isles of Scilly. The Cornish were recognised as a national minority in 2014, and Cornwall has its own language and flag (Saint Piran\'s cross).',
      flag: 'maps/world/flags/gb-con.svg'
    },
    'Isle of Wight': {
      capital: { name: 'Newport', lat: 50.7004, lon: -1.2930, info: '' },
      info: 'A ceremonial county of England, and the largest island in England.',
      flag: 'maps/world/flags/gb-iow.svg'
    },
    'Hebrides': {
      capital: { name: 'Stornoway', lat: 58.209, lon: -6.387, info: '' },
      info: 'Islands off the west coast of Scotland: the Outer Hebrides (Na h-Eileanan Siar) and the Inner Hebrides (Skye, Mull, Islay and others). The flag is the Western Isles Council\'s, of the Outer Hebrides.',
      flag: 'maps/world/flags/gb-els.svg'
    },
    'Orkney Islands': {
      capital: { name: 'Kirkwall', lat: 58.981, lon: -2.96, info: '' },
      info: 'Islands north of mainland Scotland, part of Scotland.',
      flag: 'maps/world/flags/gb-ork.svg'
    },
    'Shetland Islands': {
      capital: { name: 'Lerwick', lat: 60.155, lon: -1.145, info: '' },
      info: 'The most northerly islands of the United Kingdom, part of Scotland.',
      flag: 'maps/world/flags/gb-zet.svg'
    }
  }
});
