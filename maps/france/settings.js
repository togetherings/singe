/* ==========================================================================
   MAP SETTINGS: France   (hand-edited - the map SHAPES are in maps/france/shapes.js, made by tools/france.py)
   --------------------------------------------------------------------------
   See maps/sierra_leone/settings.js for the settings every map has. France's 18 regions: the twelve of the Hexagon,
   Corsica, and the five overseas regions, which the shapes file moves into boxes (like Alaska and Hawaii on the US
   map). The neighbouring countries are grey ("off" in the shapes file) and never asked about. Capitals are each
   region's prefecture; their locations are the REAL latitude/longitude: the game moves them along with their region.
   ========================================================================== */
(window.GeoMapSettings = window.GeoMapSettings || []).push({
  id: 'france',
  name: 'France',
  blurb: 'Find the 18 regions of France, overseas regions included',
  image: 'maps/france/flag.svg',
  credit: 'Boundaries: Natural Earth 5.1.2 (public domain, naturalearthdata.com), its departments merged into regions. The overseas regions are moved closer and resized.',
  orientation: 'horizontal',
  zoom_levels: 5,
  pass_accuracy: { regions: 80, capitals: 0, flags: 0 },
  skip: true,
  modes: { practice: true, regions: true, capitals: true, flags: false },
  regions: {
    'Auvergne-Rhône-Alpes': {
      capital: { name: 'Lyon', lat: 45.764, lon: 4.8357, info: '' },
      info: '',
      flag: ''
    },
    'Bourgogne-Franche-Comté': {
      capital: { name: 'Dijon', lat: 47.322, lon: 5.0415, info: '' },
      info: '',
      flag: ''
    },
    'Brittany': {
      capital: { name: 'Rennes', lat: 48.1173, lon: -1.6778, info: '' },
      info: '',
      flag: ''
    },
    'Centre-Val de Loire': {
      capital: { name: 'Orléans', lat: 47.903, lon: 1.9093, info: '' },
      info: '',
      flag: ''
    },
    'Corsica': {
      capital: { name: 'Ajaccio', lat: 41.9192, lon: 8.7386, info: '' },
      info: 'An island in the Mediterranean, with more self-government than the other regions (a "territorial collectivity").',
      flag: ''
    },
    'French Guiana': {
      capital: { name: 'Cayenne', lat: 4.9224, lon: -52.3135, info: '' },
      info: 'An overseas region in South America, between Suriname and Brazil.',
      flag: ''
    },
    'Grand Est': {
      capital: { name: 'Strasbourg', lat: 48.5734, lon: 7.7521, info: '' },
      info: '',
      flag: ''
    },
    'Guadeloupe': {
      capital: { name: 'Basse-Terre', lat: 15.9985, lon: -61.7255, info: '' },
      info: 'An overseas region in the Caribbean. Its capital, Basse-Terre, is smaller than Pointe-à-Pitre.',
      flag: ''
    },
    'Hauts-de-France': {
      capital: { name: 'Lille', lat: 50.6292, lon: 3.0573, info: '' },
      info: '',
      flag: ''
    },
    'Martinique': {
      capital: { name: 'Fort-de-France', lat: 14.6161, lon: -61.0588, info: '' },
      info: 'An overseas region in the Caribbean.',
      flag: ''
    },
    'Mayotte': {
      capital: { name: 'Mamoudzou', lat: -12.7806, lon: 45.2278, info: '' },
      info: 'An overseas region in the Indian Ocean, between Madagascar and Africa: the newest region of France (2011).',
      flag: ''
    },
    'Normandy': {
      capital: { name: 'Rouen', lat: 49.4432, lon: 1.0999, info: '' },
      info: '',
      flag: ''
    },
    'Nouvelle-Aquitaine': {
      capital: { name: 'Bordeaux', lat: 44.8378, lon: -0.5792, info: '' },
      info: '',
      flag: ''
    },
    'Occitania': {
      capital: { name: 'Toulouse', lat: 43.6047, lon: 1.4442, info: '' },
      info: '',
      flag: ''
    },
    'Pays de la Loire': {
      capital: { name: 'Nantes', lat: 47.2184, lon: -1.5536, info: '' },
      info: '',
      flag: ''
    },
    'Provence-Alpes-Côte d\'Azur': {
      capital: { name: 'Marseille', lat: 43.2965, lon: 5.3698, info: '' },
      info: '',
      flag: ''
    },
    'Réunion': {
      capital: { name: 'Saint-Denis', lat: -20.8789, lon: 55.4481, info: '' },
      info: 'An overseas region in the Indian Ocean, east of Madagascar.',
      flag: ''
    },
    'Île-de-France': {
      capital: { name: 'Paris', lat: 48.8566, lon: 2.3522, info: '' },
      info: '',
      flag: ''
    }
  }
});
