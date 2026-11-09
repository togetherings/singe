/* ==========================================================================
   MAP SETTINGS: United States   (hand-edited - the map SHAPES are in maps/us/shapes.js)
   --------------------------------------------------------------------------
   See maps/sierra_leone/settings.js for an explanation of every setting.
   Settings that are specific to this map:
     include_territories  true: Guam, Puerto Rico, the U.S. Virgin Islands, American Samoa
                          and the Northern Mariana Islands are on the map and in every game mode.
                          false: they are not shown, and every game mode asks only for the 50 states
                          (Washington D.C. stays drawn, but is not asked about).
   Alaska, Hawaii and the territories are drawn closer and resized (see tools/us.py), but capital
   locations below are the REAL latitude/longitude: the game moves them along with their region.
   Washington D.C. is not a state capital, but it is the national capital and is included in Capitals
   mode (hide_in_practice keeps its circle out of Practice mode). Anything left empty ('') is not shown.
   ========================================================================== */
(window.GeoMapSettings = window.GeoMapSettings || []).push({
  id: 'us',
  name: 'United States',
  blurb: 'Find the 50 states, D.C. and 5 territories',
  image: 'maps/us/flag.svg',
  credit: 'Boundaries: U.S. Census Bureau (public domain). Alaska, Hawaii and the territories are moved closer and resized, and Washington D.C. is enlarged.',
  orientation: 'horizontal',
  zoom_levels: 5,
  pass_accuracy: { regions: 80, capitals: 0, flags: 0 },
  skip: true,
  modes: { practice: true, regions: true, capitals: true, flags: false },
  include_territories: true,

  regions: {
    'Alabama': {
      capital: { name: 'Montgomery', lat: 32.3777, lon: -86.3, info: '' },
      info: '',
      flag: ''
    },
    'Alaska': {
      capital: { name: 'Juneau', lat: 58.3019, lon: -134.4197, info: '' },
      info: '',
      flag: ''
    },
    'American Samoa': {
      capital: { name: 'Pago Pago', lat: -14.2756, lon: -170.702, info: '' },
      info: '',
      flag: ''
    },
    'Arizona': {
      capital: { name: 'Phoenix', lat: 33.4484, lon: -112.074, info: '' },
      info: '',
      flag: ''
    },
    'Arkansas': {
      capital: { name: 'Little Rock', lat: 34.7465, lon: -92.2896, info: '' },
      info: '',
      flag: ''
    },
    'California': {
      capital: { name: 'Sacramento', lat: 38.5816, lon: -121.4944, info: '' },
      info: '',
      flag: ''
    },
    'Colorado': {
      capital: { name: 'Denver', lat: 39.7392, lon: -104.9903, info: '' },
      info: '',
      flag: ''
    },
    'Connecticut': {
      capital: { name: 'Hartford', lat: 41.7658, lon: -72.6734, info: '' },
      info: '',
      flag: ''
    },
    'Delaware': {
      capital: { name: 'Dover', lat: 39.1582, lon: -75.5244, info: '' },
      info: '',
      flag: ''
    },
    'District of Columbia': {
      // Washington, D.C. is the US capital. It is only a target in Capitals mode (hide_in_practice),
      // so in Practice mode D.C. appears just as a region.
      capital: { name: 'Washington, D.C.', lat: 38.8951, lon: -77.0364, info: '', hide_in_practice: true },
      info: '',
      flag: ''
    },
    'Florida': {
      capital: { name: 'Tallahassee', lat: 30.4383, lon: -84.2807, info: '' },
      info: '',
      flag: ''
    },
    'Georgia': {
      capital: { name: 'Atlanta', lat: 33.749, lon: -84.388, info: '' },
      info: '',
      flag: ''
    },
    'Guam': {
      capital: { name: 'Hagåtña', lat: 13.4757, lon: 144.7489, info: '' },
      info: '',
      flag: ''
    },
    'Hawaii': {
      capital: { name: 'Honolulu', lat: 21.3069, lon: -157.8583, info: '' },
      info: '',
      flag: ''
    },
    'Idaho': {
      capital: { name: 'Boise', lat: 43.615, lon: -116.2023, info: '' },
      info: '',
      flag: ''
    },
    'Illinois': {
      capital: { name: 'Springfield', lat: 39.7817, lon: -89.6501, info: '' },
      info: '',
      flag: ''
    },
    'Indiana': {
      capital: { name: 'Indianapolis', lat: 39.7684, lon: -86.1581, info: '' },
      info: '',
      flag: ''
    },
    'Iowa': {
      capital: { name: 'Des Moines', lat: 41.5868, lon: -93.625, info: '' },
      info: '',
      flag: ''
    },
    'Kansas': {
      capital: { name: 'Topeka', lat: 39.0473, lon: -95.6752, info: '' },
      info: '',
      flag: ''
    },
    'Kentucky': {
      capital: { name: 'Frankfort', lat: 38.2009, lon: -84.8733, info: '' },
      info: '',
      flag: ''
    },
    'Louisiana': {
      capital: { name: 'Baton Rouge', lat: 30.4515, lon: -91.1871, info: '' },
      info: '',
      flag: ''
    },
    'Maine': {
      capital: { name: 'Augusta', lat: 44.3106, lon: -69.7795, info: '' },
      info: '',
      flag: ''
    },
    'Maryland': {
      capital: { name: 'Annapolis', lat: 38.9784, lon: -76.4922, info: '' },
      info: '',
      flag: ''
    },
    'Massachusetts': {
      capital: { name: 'Boston', lat: 42.3601, lon: -71.0589, info: '' },
      info: '',
      flag: ''
    },
    'Michigan': {
      capital: { name: 'Lansing', lat: 42.7325, lon: -84.5555, info: '' },
      info: '',
      flag: ''
    },
    'Minnesota': {
      capital: { name: 'Saint Paul', lat: 44.9537, lon: -93.09, info: '' },
      info: '',
      flag: ''
    },
    'Mississippi': {
      capital: { name: 'Jackson', lat: 32.2988, lon: -90.1848, info: '' },
      info: '',
      flag: ''
    },
    'Missouri': {
      capital: { name: 'Jefferson City', lat: 38.5767, lon: -92.1735, info: '' },
      info: '',
      flag: ''
    },
    'Montana': {
      capital: { name: 'Helena', lat: 46.5891, lon: -112.0391, info: '' },
      info: '',
      flag: ''
    },
    'Nebraska': {
      capital: { name: 'Lincoln', lat: 40.8136, lon: -96.7026, info: '' },
      info: '',
      flag: ''
    },
    'Nevada': {
      capital: { name: 'Carson City', lat: 39.1638, lon: -119.7674, info: '' },
      info: '',
      flag: ''
    },
    'New Hampshire': {
      capital: { name: 'Concord', lat: 43.2081, lon: -71.5376, info: '' },
      info: '',
      flag: ''
    },
    'New Jersey': {
      capital: { name: 'Trenton', lat: 40.2206, lon: -74.7597, info: '' },
      info: '',
      flag: ''
    },
    'New Mexico': {
      capital: { name: 'Santa Fe', lat: 35.687, lon: -105.9378, info: '' },
      info: '',
      flag: ''
    },
    'New York': {
      capital: { name: 'Albany', lat: 42.6526, lon: -73.7562, info: '' },
      info: '',
      flag: ''
    },
    'North Carolina': {
      capital: { name: 'Raleigh', lat: 35.7796, lon: -78.6382, info: '' },
      info: '',
      flag: ''
    },
    'North Dakota': {
      capital: { name: 'Bismarck', lat: 46.8083, lon: -100.7837, info: '' },
      info: '',
      flag: ''
    },
    'Northern Mariana Islands': {
      capital: { name: 'Saipan', lat: 15.2123, lon: 145.7545, info: '' },
      info: '',
      flag: ''
    },
    'Ohio': {
      capital: { name: 'Columbus', lat: 39.9612, lon: -82.9988, info: '' },
      info: '',
      flag: ''
    },
    'Oklahoma': {
      capital: { name: 'Oklahoma City', lat: 35.4676, lon: -97.5164, info: '' },
      info: '',
      flag: ''
    },
    'Oregon': {
      capital: { name: 'Salem', lat: 44.9429, lon: -123.0351, info: '' },
      info: '',
      flag: ''
    },
    'Pennsylvania': {
      capital: { name: 'Harrisburg', lat: 40.2732, lon: -76.8867, info: '' },
      info: '',
      flag: ''
    },
    'Puerto Rico': {
      capital: { name: 'San Juan', lat: 18.4655, lon: -66.1057, info: '' },
      info: '',
      flag: ''
    },
    'Rhode Island': {
      capital: { name: 'Providence', lat: 41.824, lon: -71.4128, info: '' },
      info: '',
      flag: ''
    },
    'South Carolina': {
      capital: { name: 'Columbia', lat: 34.0007, lon: -81.0348, info: '' },
      info: '',
      flag: ''
    },
    'South Dakota': {
      capital: { name: 'Pierre', lat: 44.3683, lon: -100.351, info: '' },
      info: '',
      flag: ''
    },
    'Tennessee': {
      capital: { name: 'Nashville', lat: 36.1627, lon: -86.7816, info: '' },
      info: '',
      flag: ''
    },
    'Texas': {
      capital: { name: 'Austin', lat: 30.2672, lon: -97.7431, info: '' },
      info: '',
      flag: ''
    },
    'U.S. Virgin Islands': {
      capital: { name: 'Charlotte Amalie', lat: 18.3419, lon: -64.9307, info: '' },
      info: '',
      flag: ''
    },
    'Utah': {
      capital: { name: 'Salt Lake City', lat: 40.7608, lon: -111.891, info: '' },
      info: '',
      flag: ''
    },
    'Vermont': {
      capital: { name: 'Montpelier', lat: 44.2601, lon: -72.5754, info: '' },
      info: '',
      flag: ''
    },
    'Virginia': {
      capital: { name: 'Richmond', lat: 37.5407, lon: -77.436, info: '' },
      info: '',
      flag: ''
    },
    'Washington': {
      capital: { name: 'Olympia', lat: 47.0379, lon: -122.9007, info: '' },
      info: '',
      flag: ''
    },
    'West Virginia': {
      capital: { name: 'Charleston', lat: 38.3498, lon: -81.6326, info: '' },
      info: '',
      flag: ''
    },
    'Wisconsin': {
      capital: { name: 'Madison', lat: 43.0731, lon: -89.4012, info: '' },
      info: '',
      flag: ''
    },
    'Wyoming': {
      capital: { name: 'Cheyenne', lat: 41.14, lon: -104.8202, info: '' },
      info: '',
      flag: ''
    }
  }
});
