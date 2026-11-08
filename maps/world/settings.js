/* ==========================================================================
   MAP SETTINGS: World   (hand-edited - the map SHAPES are in maps/world/shapes.js)
   --------------------------------------------------------------------------
   See maps/sierra_leone/settings.js for an explanation of the settings every map has.
   Settings that are specific to this map:
     scope             'un'  the 193 UN member states, plus Vatican City and Palestine, are the regions of the
                             game. Everything else is drawn in grey and is not asked about, and parts of a
                             country (Alaska, French Guiana, Svalbard...) belong to that country.
                       'all' every country AND territory is a region of its own, and the far-away parts of a
                             country are separate regions too (Alaska, Hawaii, French Guiana, Kaliningrad...).
                       (a different scope is a different game, so its scores are saved separately)
     infinite_scroll   true: dragging the map sideways goes round the world without end. false: the map has edges.
                       (config.js has the default.)
     max_map_height   (optional) the map is never drawn taller than this many pixels. Not set here: the map is as big as
                       the window allows (see fit_all_min_height)
     page_width        widest the page may be, in pixels
     fit_all_min_height  the map is made smaller to fit the WINDOW HEIGHT: the map and the boxes under it together
                       when the window is at least this tall (px), otherwise just the map (a 768p laptop) and the
                       page scrolls to the boxes
     nudge_zoom_levels circles that were moved apart from a close neighbour (nudge: [lat, lon] of a capital, or a region's
                       circle) sit at the moved place only for this many of the most zoomed-out levels; zoomed in further
                       they are back at their real places
     circle_ratio      size of the capital and tiny-country circles (share of the map's width)
     marker_px         a country smaller than this many screen pixels gets a circle, so it can be found and clicked
                       (it disappears as you zoom in and the shape gets bigger)
     insets            the fixed boxes under the map, which do not scroll or zoom: title of each box
     variants          the map is listed twice in edugame.json's packages ("world" and "world_all"), with a
                       different scope; each variant's name and blurb (translations: maps/world/lang/<code>.json)
   Region settings: only regions with a capital are listed. A capital is { name, lat, lon, info }.
   Capitals are Natural Earth populated places. Where a country has several capitals, the most populated
   city was used (South Africa -> Johannesburg, Netherlands -> The Hague, Benin -> Cotonou, Israel -> Tel Aviv...);
   change any of them here. Territories have no capital unless another state recognises them as sovereign.
   Capitals are real latitude/longitude. Anything left empty ('') is not shown.
   Combined places: Saint Martin + Sint Maarten and Sint Eustatius + Saba are ONE region and ONE circle on the
   map (they are next to each other), but each keeps its own entry here (capital, info, flag) and its own question
   in every game mode: either can be answered by clicking the shared circle. Their capitals are added by hand.
   Doha / Manama and Apia are moved so their circles are apart from their neighbours' (the circles of their regions
   are moved the same way, see NUDGE_MARKER in world.py).
   Two more exceptions: Brazzaville and Kinshasa (4 km apart) are each moved 0.3 degrees away from the other so that
   their circles can be full size; and Vatican City has no capital (it is only a region). A capital with
   with: 'Vatican City' (Rome) is the same circle as that region in Practice mode.
   ========================================================================== */
(window.GeoMapSettings = window.GeoMapSettings || []).push({
  id: 'world',
  name: 'World',
  blurb: 'Find the countries of the world',
  credit: 'Boundaries and capitals: Natural Earth (public domain, naturalearthdata.com). Borders follow Natural Earth\'s de facto lines. Small countries are marked with circles, and the Caribbean and the Pacific Islands are shown enlarged in the boxes below the map.',
  orientation: 'horizontal',
  scope: 'all',
  infinite_scroll: true,
  page_width: 2000,
  fit_all_min_height: 800,
  circle_ratio: 0.0045,
  marker_px: 16,
  zoom_levels: 5,
  variants: {
    world: { name: 'World: UN countries', blurb: 'Find the 193 UN member countries, plus Vatican City and Palestine' },
    world_all: { name: 'World: all countries, territories and islands',
                 blurb: 'Find every country, territory and island of the world, including the small ones' }
  },
  insets: { caribbean: { title: 'Caribbean Islands' }, pacific: { title: 'Pacific Islands' } },
  pass_accuracy: { regions: 80, capitals: 0, flags: 0 },
  skip: true,
  nudge_zoom_levels: 2,
  modes: { practice: true, regions: true, capitals: true, flags: true },

  regions: {
    'Aruba': {
      info: '',
      flag: 'maps/world/flags/aw.svg'
    },
    'Afghanistan': {
      capital: { name: 'Kabul', lat: 34.5186, lon: 69.1813, info: '' },
      info: '',
      flag: 'maps/world/flags/af.svg'
    },
    'Angola': {
      capital: { name: 'Luanda', lat: -8.8363, lon: 13.2325, info: '' },
      info: '',
      flag: 'maps/world/flags/ao.svg'
    },
    'Anguilla': {
      info: '',
      flag: 'maps/world/flags/ai.svg'
    },
    'Albania': {
      capital: { name: 'Tirana', lat: 41.3275, lon: 19.8189, info: '' },
      info: '',
      flag: 'maps/world/flags/al.svg'
    },
    'Åland Islands': {
      info: '',
      flag: 'maps/world/flags/ax.svg'
    },
    'Andorra': {
      capital: { name: 'Andorra', lat: 42.5108, lon: 1.5266, info: '' },
      info: '',
      flag: 'maps/world/flags/ad.svg'
    },
    'United Arab Emirates': {
      capital: { name: 'Abu Dhabi', lat: 24.4667, lon: 54.3666, info: '' },
      info: '',
      flag: 'maps/world/flags/ae.svg'
    },
    'Argentina': {
      capital: { name: 'Buenos Aires', lat: -34.6107, lon: -58.4325, info: '' },
      info: '',
      flag: 'maps/world/flags/ar.svg'
    },
    'Armenia': {
      capital: { name: 'Yerevan', lat: 40.1831, lon: 44.5116, info: '' },
      info: '',
      flag: 'maps/world/flags/am.svg'
    },
    'American Samoa': {
      info: '',
      flag: 'maps/world/flags/as.svg'
    },
    'Antigua and Barbuda': {
      capital: { name: 'Saint John\'s', lat: 17.118, lon: -61.85, info: '' },
      info: '',
      flag: 'maps/world/flags/ag.svg'
    },
    'Australia': {
      capital: { name: 'Canberra', lat: -35.283, lon: 149.129, info: '' },
      info: '',
      flag: 'maps/world/flags/au.svg'
    },
    'Austria': {
      capital: { name: 'Vienna', lat: 48.202, lon: 16.3647, info: '' },
      info: '',
      flag: 'maps/world/flags/at.svg'
    },
    'Azerbaijan': {
      capital: { name: 'Baku', lat: 40.3972, lon: 49.8603, info: '' },
      info: '',
      flag: 'maps/world/flags/az.svg'
    },
    'Burundi': {
      capital: { name: 'Bujumbura', lat: -3.3761, lon: 29.36, info: '' },
      info: '',
      flag: 'maps/world/flags/bi.svg'
    },
    'Belgium': {
      capital: { name: 'Brussels', lat: 50.8353, lon: 4.3314, info: '' },
      info: '',
      flag: 'maps/world/flags/be.svg'
    },
    'Benin': {
      capital: { name: 'Cotonou', lat: 6.363, lon: 2.4044, info: '' },
      info: '',
      flag: 'maps/world/flags/bj.svg'
    },
    'Burkina Faso': {
      capital: { name: 'Ouagadougou', lat: 12.3723, lon: -1.5267, info: '' },
      info: '',
      flag: 'maps/world/flags/bf.svg'
    },
    'Bangladesh': {
      capital: { name: 'Dhaka', lat: 23.725, lon: 90.4066, info: '' },
      info: '',
      flag: 'maps/world/flags/bd.svg'
    },
    'Bulgaria': {
      capital: { name: 'Sofia', lat: 42.6853, lon: 23.3147, info: '' },
      info: '',
      flag: 'maps/world/flags/bg.svg'
    },
    'Bahrain': {
      capital: { name: 'Manama', lat: 26.2361, lon: 50.5831, info: '', nudge: [27.136, 49.983] },
      info: '',
      flag: 'maps/world/flags/bh.svg'
    },
    'The Bahamas': {
      capital: { name: 'Nassau', lat: 25.0834, lon: -77.35, info: '' },
      info: '',
      flag: 'maps/world/flags/bs.svg'
    },
    'Bosnia and Herzegovina': {
      capital: { name: 'Sarajevo', lat: 43.85, lon: 18.383, info: '' },
      info: '',
      flag: 'maps/world/flags/ba.svg'
    },
    'Saint Barthélemy': {
      info: '',
      flag: 'maps/world/flags/bl.svg'
    },
    'Belarus': {
      capital: { name: 'Minsk', lat: 53.9019, lon: 27.5647, info: '' },
      info: '',
      flag: 'maps/world/flags/by.svg'
    },
    'Belize': {
      capital: { name: 'Belmopan', lat: 17.252, lon: -88.7671, info: '' },
      info: '',
      flag: 'maps/world/flags/bz.svg'
    },
    'Bermuda': {
      info: '',
      flag: 'maps/world/flags/bm.svg'
    },
    'Bolivia': {
      capital: { name: 'La Paz', lat: -16.496, lon: -68.1519, info: '' },
      info: '',
      flag: 'maps/world/flags/bo.svg'
    },
    'Brazil': {
      capital: { name: 'Brasília', lat: -15.7814, lon: -47.918, info: '' },
      info: '',
      flag: 'maps/world/flags/br.svg'
    },
    'Barbados': {
      capital: { name: 'Bridgetown', lat: 13.102, lon: -59.6165, info: '' },
      info: '',
      flag: 'maps/world/flags/bb.svg'
    },
    'Brunei': {
      capital: { name: 'Bandar Seri Begawan', lat: 4.8833, lon: 114.9333, info: '' },
      info: '',
      flag: 'maps/world/flags/bn.svg'
    },
    'Bhutan': {
      capital: { name: 'Thimphu', lat: 27.473, lon: 89.639, info: '' },
      info: '',
      flag: 'maps/world/flags/bt.svg'
    },
    'Botswana': {
      capital: { name: 'Gaborone', lat: -24.6463, lon: 25.9119, info: '' },
      info: '',
      flag: 'maps/world/flags/bw.svg'
    },
    'Central African Republic': {
      capital: { name: 'Bangui', lat: 4.3666, lon: 18.5583, info: '' },
      info: '',
      flag: 'maps/world/flags/cf.svg'
    },
    'Canada': {
      capital: { name: 'Ottawa', lat: 45.4186, lon: -75.702, info: '' },
      info: '',
      flag: 'maps/world/flags/ca.svg'
    },
    'Switzerland': {
      capital: { name: 'Bern', lat: 46.9167, lon: 7.467, info: '' },
      info: '',
      flag: 'maps/world/flags/ch.svg'
    },
    'Chile': {
      capital: { name: 'Santiago', lat: -33.4402, lon: -70.6505, info: '' },
      info: '',
      flag: 'maps/world/flags/cl.svg'
    },
    'China': {
      capital: { name: 'Beijing', lat: 39.9017, lon: 116.3942, info: '' },
      info: '',
      flag: 'maps/world/flags/cn.svg'
    },
    'Côte d\'Ivoire': {
      capital: { name: 'Abidjan', lat: 5.3231, lon: -4.0202, info: '' },
      info: '',
      flag: 'maps/world/flags/ci.svg'
    },
    'Cameroon': {
      capital: { name: 'Yaoundé', lat: 3.8686, lon: 11.5147, info: '' },
      info: '',
      flag: 'maps/world/flags/cm.svg'
    },
    'Democratic Republic of the Congo': {
      capital: { name: 'Kinshasa', lat: -4.3278, lon: 15.313, info: '', nudge: [-4.571, 15.49] },
      info: '',
      flag: 'maps/world/flags/cd.svg'
    },
    'Republic of the Congo': {
      capital: { name: 'Brazzaville', lat: -4.2572, lon: 15.2827, info: '', nudge: [-4.014, 15.115] },
      info: '',
      flag: 'maps/world/flags/cg.svg'
    },
    'Cook Islands': {
      info: '',
      flag: 'maps/world/flags/ck.svg'
    },
    'Colombia': {
      capital: { name: 'Bogota', lat: 4.5984, lon: -74.0853, info: '' },
      info: '',
      flag: 'maps/world/flags/co.svg'
    },
    'Comoros': {
      capital: { name: 'Moroni', lat: -11.7042, lon: 43.2402, info: '' },
      info: '',
      flag: 'maps/world/flags/km.svg'
    },
    'Cabo Verde': {
      capital: { name: 'Praia', lat: 14.9167, lon: -23.5167, info: '' },
      info: '',
      flag: 'maps/world/flags/cv.svg'
    },
    'Costa Rica': {
      capital: { name: 'San José', lat: 9.9304, lon: -84.0788, info: '' },
      info: '',
      flag: 'maps/world/flags/cr.svg'
    },
    'Cuba': {
      capital: { name: 'Havana', lat: 23.1339, lon: -82.3661, info: '' },
      info: '',
      flag: 'maps/world/flags/cu.svg'
    },
    'Curaçao': {
      info: '',
      flag: 'maps/world/flags/cw.svg'
    },
    'Cayman Islands': {
      info: '',
      flag: 'maps/world/flags/ky.svg'
    },
    'Northern Cyprus': {
      capital: { name: 'North Nicosia', lat: 35.1856, lon: 33.3823, info: '', nudge: [35.3, 33.55] },
      info: '',
      flag: ''
    },
    'Cyprus': {
      capital: { name: 'Nicosia', lat: 35.1667, lon: 33.3666, info: '', nudge: [34.97, 33.37] },
      info: '',
      flag: 'maps/world/flags/cy.svg'
    },
    'Czechia': {
      capital: { name: 'Prague', lat: 50.087, lon: 14.4229, info: '' },
      info: '',
      flag: 'maps/world/flags/cz.svg'
    },
    'Germany': {
      capital: { name: 'Berlin', lat: 52.5238, lon: 13.3996, info: '' },
      info: '',
      flag: 'maps/world/flags/de.svg'
    },
    'Djibouti': {
      capital: { name: 'Djibouti', lat: 11.595, lon: 43.148, info: '' },
      info: '',
      flag: 'maps/world/flags/dj.svg'
    },
    'Dominica': {
      capital: { name: 'Roseau', lat: 15.301, lon: -61.387, info: '' },
      info: '',
      flag: 'maps/world/flags/dm.svg'
    },
    'Denmark': {
      capital: { name: 'København', lat: 55.6805, lon: 12.5615, info: '' },
      info: '',
      flag: 'maps/world/flags/dk.svg'
    },
    'Dominican Republic': {
      capital: { name: 'Santo Domingo', lat: 18.4707, lon: -69.9297, info: '' },
      info: '',
      flag: 'maps/world/flags/do.svg'
    },
    'Algeria': {
      capital: { name: 'Algiers', lat: 36.765, lon: 3.0486, info: '' },
      info: '',
      flag: 'maps/world/flags/dz.svg'
    },
    'Ecuador': {
      capital: { name: 'Quito', lat: -0.213, lon: -78.502, info: '' },
      info: '',
      flag: 'maps/world/flags/ec.svg'
    },
    'Egypt': {
      capital: { name: 'Cairo', lat: 30.0519, lon: 31.248, info: '' },
      info: '',
      flag: 'maps/world/flags/eg.svg'
    },
    'Eritrea': {
      capital: { name: 'Asmara', lat: 15.3333, lon: 38.9333, info: '' },
      info: '',
      flag: 'maps/world/flags/er.svg'
    },
    'Spain': {
      capital: { name: 'Madrid', lat: 40.402, lon: -3.6853, info: '' },
      info: '',
      flag: 'maps/world/flags/es.svg'
    },
    'Estonia': {
      capital: { name: 'Tallinn', lat: 59.4339, lon: 24.728, info: '' },
      info: '',
      flag: 'maps/world/flags/ee.svg'
    },
    'Ethiopia': {
      capital: { name: 'Addis Ababa', lat: 9.0353, lon: 38.6981, info: '' },
      info: '',
      flag: 'maps/world/flags/et.svg'
    },
    'Finland': {
      capital: { name: 'Helsinki', lat: 60.1638, lon: 24.9325, info: '' },
      info: '',
      flag: 'maps/world/flags/fi.svg'
    },
    'Fiji': {
      capital: { name: 'Suva', lat: -18.133, lon: 178.4417, info: '' },
      info: '',
      flag: 'maps/world/flags/fj.svg'
    },
    'Falkland Islands': {
      info: '',
      flag: 'maps/world/flags/fk.svg'
    },
    'France': {
      capital: { name: 'Paris', lat: 48.8581, lon: 2.353, info: '' },
      info: '',
      flag: 'maps/world/flags/fr.svg'
    },
    'Faroe Islands': {
      info: '',
      flag: 'maps/world/flags/fo.svg'
    },
    'Micronesia': {
      capital: { name: 'Palikir', lat: 6.9166, lon: 158.15, info: '' },
      info: '',
      flag: 'maps/world/flags/fm.svg'
    },
    'Gabon': {
      capital: { name: 'Libreville', lat: 0.3854, lon: 9.458, info: '' },
      info: '',
      flag: 'maps/world/flags/ga.svg'
    },
    'United Kingdom': {
      capital: { name: 'London', lat: 51.5019, lon: -0.1187, info: '' },
      info: '',
      flag: 'maps/world/flags/gb.svg'
    },
    'Georgia': {
      capital: { name: 'Tbilisi', lat: 41.727, lon: 44.7888, info: '' },
      info: '',
      flag: 'maps/world/flags/ge.svg'
    },
    'Guernsey': {
      info: '',
      flag: 'maps/world/flags/gg.svg'
    },
    'Ghana': {
      capital: { name: 'Accra', lat: 5.552, lon: -0.2187, info: '' },
      info: '',
      flag: 'maps/world/flags/gh.svg'
    },
    'Gibraltar': {
      info: '',
      flag: 'maps/world/flags/gi.svg'
    },
    'Guinea': {
      capital: { name: 'Conakry', lat: 9.5335, lon: -13.6822, info: '' },
      info: '',
      flag: 'maps/world/flags/gn.svg'
    },
    'The Gambia': {
      capital: { name: 'Banjul', lat: 13.4539, lon: -16.5917, info: '' },
      info: '',
      flag: 'maps/world/flags/gm.svg'
    },
    'Guinea-Bissau': {
      capital: { name: 'Bissau', lat: 11.865, lon: -15.5984, info: '' },
      info: '',
      flag: 'maps/world/flags/gw.svg'
    },
    'Equatorial Guinea': {
      capital: { name: 'Malabo', lat: 3.75, lon: 8.7833, info: '' },
      info: '',
      flag: 'maps/world/flags/gq.svg'
    },
    'Greece': {
      capital: { name: 'Athens', lat: 37.9853, lon: 23.7314, info: '' },
      info: '',
      flag: 'maps/world/flags/gr.svg'
    },
    'Grenada': {
      capital: { name: 'Saint George\'s', lat: 12.0526, lon: -61.7416, info: '' },
      info: '',
      flag: 'maps/world/flags/gd.svg'
    },
    'Greenland': {
      info: '',
      flag: 'maps/world/flags/gl.svg'
    },
    'Guatemala': {
      capital: { name: 'Guatemala City', lat: 14.6231, lon: -90.5289, info: '' },
      info: '',
      flag: 'maps/world/flags/gt.svg'
    },
    'Guam': {
      info: '',
      flag: 'maps/world/flags/gu.svg'
    },
    'Guyana': {
      capital: { name: 'Georgetown', lat: 6.802, lon: -58.167, info: '' },
      info: '',
      flag: 'maps/world/flags/gy.svg'
    },
    'Hong Kong': {
      info: '',
      flag: 'maps/world/flags/hk.svg'
    },
    'Honduras': {
      capital: { name: 'Tegucigalpa', lat: 14.104, lon: -87.2195, info: '' },
      info: '',
      flag: 'maps/world/flags/hn.svg'
    },
    'Croatia': {
      capital: { name: 'Zagreb', lat: 45.8, lon: 16.0, info: '' },
      info: '',
      flag: 'maps/world/flags/hr.svg'
    },
    'Haiti': {
      capital: { name: 'Port-au-Prince', lat: 18.543, lon: -72.338, info: '' },
      info: '',
      flag: 'maps/world/flags/ht.svg'
    },
    'Hungary': {
      capital: { name: 'Budapest', lat: 47.502, lon: 19.0814, info: '' },
      info: '',
      flag: 'maps/world/flags/hu.svg'
    },
    'Indonesia': {
      capital: { name: 'Jakarta', lat: -6.1725, lon: 106.8275, info: '' },
      info: '',
      flag: 'maps/world/flags/id.svg'
    },
    'Isle of Man': {
      info: '',
      flag: 'maps/world/flags/im.svg'
    },
    'India': {
      capital: { name: 'New Delhi', lat: 28.6, lon: 77.2, info: '' },
      info: '',
      flag: 'maps/world/flags/in.svg'
    },
    'Ireland': {
      capital: { name: 'Dublin', lat: 53.3467, lon: -6.257, info: '' },
      info: '',
      flag: 'maps/world/flags/ie.svg'
    },
    'Iran': {
      capital: { name: 'Tehran', lat: 35.6739, lon: 51.4224, info: '' },
      info: '',
      flag: 'maps/world/flags/ir.svg'
    },
    'Iraq': {
      capital: { name: 'Baghdad', lat: 33.3406, lon: 44.3919, info: '' },
      info: '',
      flag: 'maps/world/flags/iq.svg'
    },
    'Iceland': {
      capital: { name: 'Reykjavík', lat: 64.1435, lon: -21.9365, info: '' },
      info: '',
      flag: 'maps/world/flags/is.svg'
    },
    'Israel': {
      capital: { name: 'Tel Aviv', lat: 32.0819, lon: 34.7681, info: '' },
      info: '',
      flag: 'maps/world/flags/il.svg'
    },
    'Italy': {
      capital: { name: 'Rome', lat: 41.8979, lon: 12.4813, info: '', with: 'Vatican City' },
      info: '',
      flag: 'maps/world/flags/it.svg'
    },
    'Jamaica': {
      capital: { name: 'Kingston', lat: 17.9771, lon: -76.7674, info: '' },
      info: '',
      flag: 'maps/world/flags/jm.svg'
    },
    'Jersey': {
      info: '',
      flag: 'maps/world/flags/je.svg'
    },
    'Jordan': {
      capital: { name: 'Amman', lat: 31.952, lon: 35.9314, info: '' },
      info: '',
      flag: 'maps/world/flags/jo.svg'
    },
    'Japan': {
      capital: { name: 'Tokyo', lat: 35.687, lon: 139.7495, info: '' },
      info: '',
      flag: 'maps/world/flags/jp.svg'
    },
    'Kazakhstan': {
      capital: { name: 'Nur-Sultan', lat: 51.1811, lon: 71.4278, info: '' },
      info: '',
      flag: 'maps/world/flags/kz.svg'
    },
    'Kenya': {
      capital: { name: 'Nairobi', lat: -1.2814, lon: 36.8147, info: '' },
      info: '',
      flag: 'maps/world/flags/ke.svg'
    },
    'Kyrgyzstan': {
      capital: { name: 'Bishkek', lat: 42.875, lon: 74.5833, info: '' },
      info: '',
      flag: 'maps/world/flags/kg.svg'
    },
    'Cambodia': {
      capital: { name: 'Phnom Penh', lat: 11.552, lon: 104.9147, info: '' },
      info: '',
      flag: 'maps/world/flags/kh.svg'
    },
    'Kiribati': {
      capital: { name: 'Tarawa', lat: 1.3382, lon: 173.0176, info: '' },
      info: '',
      flag: 'maps/world/flags/ki.svg'
    },
    'Saint Kitts and Nevis': {
      capital: { name: 'Basseterre', lat: 17.302, lon: -62.717, info: '' },
      info: '',
      flag: 'maps/world/flags/kn.svg'
    },
    'South Korea': {
      capital: { name: 'Seoul', lat: 37.5683, lon: 126.9978, info: '' },
      info: '',
      flag: 'maps/world/flags/kr.svg'
    },
    'Kosovo': {
      capital: { name: 'Pristina', lat: 42.6667, lon: 21.166, info: '' },
      info: '',
      flag: 'maps/world/flags/xk.svg'
    },
    'Kuwait': {
      capital: { name: 'Kuwait City', lat: 29.3717, lon: 47.9764, info: '' },
      info: '',
      flag: 'maps/world/flags/kw.svg'
    },
    'Laos': {
      capital: { name: 'Vientiane', lat: 17.9667, lon: 102.6, info: '' },
      info: '',
      flag: 'maps/world/flags/la.svg'
    },
    'Lebanon': {
      capital: { name: 'Beirut', lat: 33.8739, lon: 35.5078, info: '' },
      info: '',
      flag: 'maps/world/flags/lb.svg'
    },
    'Liberia': {
      capital: { name: 'Monrovia', lat: 6.3146, lon: -10.7997, info: '' },
      info: '',
      flag: 'maps/world/flags/lr.svg'
    },
    'Libya': {
      capital: { name: 'Tripoli', lat: 32.8925, lon: 13.18, info: '' },
      info: '',
      flag: 'maps/world/flags/ly.svg'
    },
    'Saint Lucia': {
      capital: { name: 'Castries', lat: 14.0079, lon: -60.9929, info: '' },
      info: '',
      flag: 'maps/world/flags/lc.svg'
    },
    'Liechtenstein': {
      capital: { name: 'Vaduz', lat: 47.1337, lon: 9.5167, info: '' },
      info: '',
      flag: 'maps/world/flags/li.svg'
    },
    'Sri Lanka': {
      capital: { name: 'Colombo', lat: 6.932, lon: 79.8578, info: '' },
      info: '',
      flag: 'maps/world/flags/lk.svg'
    },
    'Lesotho': {
      capital: { name: 'Maseru', lat: -29.3167, lon: 27.4833, info: '' },
      info: '',
      flag: 'maps/world/flags/ls.svg'
    },
    'Lithuania': {
      capital: { name: 'Vilnius', lat: 54.6834, lon: 25.3166, info: '' },
      info: '',
      flag: 'maps/world/flags/lt.svg'
    },
    'Luxembourg': {
      capital: { name: 'Luxembourg', lat: 49.6117, lon: 6.13, info: '' },
      info: '',
      flag: 'maps/world/flags/lu.svg'
    },
    'Latvia': {
      capital: { name: 'Riga', lat: 56.95, lon: 24.1, info: '' },
      info: '',
      flag: 'maps/world/flags/lv.svg'
    },
    'Macau': {
      info: '',
      flag: 'maps/world/flags/mo.svg'
    },
    'Saint Martin': {
      capital: { name: 'Marigot', lat: 18.0675, lon: -63.0829, info: '' },
      info: 'The northern part of the island of Saint Martin, a French overseas collectivity. The island is shared with Sint Maarten (the Netherlands), so on this map the two are ONE region and ONE circle. In the games, click that circle to answer for either of them.',
      flag: 'maps/world/flags/mf.svg'
    },
    'Morocco': {
      capital: { name: 'Rabat', lat: 34.0253, lon: -6.8364, info: '' },
      info: '',
      flag: 'maps/world/flags/ma.svg'
    },
    'Monaco': {
      capital: { name: 'Monaco', lat: 43.7396, lon: 7.4069, info: '' },
      info: '',
      flag: 'maps/world/flags/mc.svg'
    },
    'Moldova': {
      capital: { name: 'Chișinău', lat: 47.005, lon: 28.8577, info: '' },
      info: '',
      flag: 'maps/world/flags/md.svg'
    },
    'Madagascar': {
      capital: { name: 'Antananarivo', lat: -18.9147, lon: 47.5147, info: '' },
      info: '',
      flag: 'maps/world/flags/mg.svg'
    },
    'Maldives': {
      capital: { name: 'Malé', lat: 4.172, lon: 73.5089, info: '' },
      info: '',
      flag: 'maps/world/flags/mv.svg'
    },
    'Mexico': {
      capital: { name: 'Mexico City', lat: 19.4444, lon: -99.1329, info: '' },
      info: '',
      flag: 'maps/world/flags/mx.svg'
    },
    'Marshall Islands': {
      capital: { name: 'Majuro', lat: 7.103, lon: 171.38, info: '' },
      info: '',
      flag: 'maps/world/flags/mh.svg'
    },
    'North Macedonia': {
      capital: { name: 'Skopje', lat: 42.0, lon: 21.4335, info: '' },
      info: '',
      flag: 'maps/world/flags/mk.svg'
    },
    'Mali': {
      capital: { name: 'Bamako', lat: 12.652, lon: -8.002, info: '' },
      info: '',
      flag: 'maps/world/flags/ml.svg'
    },
    'Malta': {
      capital: { name: 'Valletta', lat: 35.8997, lon: 14.5147, info: '' },
      info: '',
      flag: 'maps/world/flags/mt.svg'
    },
    'Myanmar': {
      capital: { name: 'Yangon', lat: 16.7853, lon: 96.1647, info: '' },
      info: '',
      flag: 'maps/world/flags/mm.svg'
    },
    'Montenegro': {
      capital: { name: 'Podgorica', lat: 42.466, lon: 19.2663, info: '' },
      info: '',
      flag: 'maps/world/flags/me.svg'
    },
    'Mongolia': {
      capital: { name: 'Ulaanbaatar', lat: 47.9186, lon: 106.9147, info: '' },
      info: '',
      flag: 'maps/world/flags/mn.svg'
    },
    'Northern Mariana Islands': {
      info: '',
      flag: 'maps/world/flags/mp.svg'
    },
    'Mozambique': {
      capital: { name: 'Maputo', lat: -25.9533, lon: 32.5872, info: '' },
      info: '',
      flag: 'maps/world/flags/mz.svg'
    },
    'Mauritania': {
      capital: { name: 'Nouakchott', lat: 18.0864, lon: -15.9753, info: '' },
      info: '',
      flag: 'maps/world/flags/mr.svg'
    },
    'Montserrat': {
      info: '',
      flag: 'maps/world/flags/ms.svg'
    },
    'Mauritius': {
      capital: { name: 'Port Louis', lat: -20.1666, lon: 57.5, info: '' },
      info: '',
      flag: 'maps/world/flags/mu.svg'
    },
    'Malawi': {
      capital: { name: 'Lilongwe', lat: -13.9833, lon: 33.7833, info: '' },
      info: '',
      flag: 'maps/world/flags/mw.svg'
    },
    'Malaysia': {
      capital: { name: 'Kuala Lumpur', lat: 3.1398, lon: 101.6887, info: '' },
      info: '',
      flag: 'maps/world/flags/my.svg'
    },
    'Namibia': {
      capital: { name: 'Windhoek', lat: -22.57, lon: 17.0835, info: '' },
      info: '',
      flag: 'maps/world/flags/na.svg'
    },
    'New Caledonia': {
      info: '',
      flag: 'maps/world/flags/nc.svg'
    },
    'Niger': {
      capital: { name: 'Niamey', lat: 13.5187, lon: 2.1147, info: '' },
      info: '',
      flag: 'maps/world/flags/ne.svg'
    },
    'Norfolk Island': {
      info: '',
      flag: 'maps/world/flags/nf.svg'
    },
    'Nigeria': {
      capital: { name: 'Lagos', lat: 6.4452, lon: 3.3896, info: '' },
      info: '',
      flag: 'maps/world/flags/ng.svg'
    },
    'Nicaragua': {
      capital: { name: 'Managua', lat: 12.155, lon: -86.2704, info: '' },
      info: '',
      flag: 'maps/world/flags/ni.svg'
    },
    'Niue': {
      info: '',
      flag: 'maps/world/flags/nu.svg'
    },
    'Netherlands': {
      capital: { name: 'The Hague', lat: 52.08, lon: 4.27, info: '' },
      info: '',
      flag: 'maps/world/flags/nl.svg'
    },
    'Norway': {
      capital: { name: 'Oslo', lat: 59.9186, lon: 10.748, info: '' },
      info: '',
      flag: 'maps/world/flags/no.svg'
    },
    'Nepal': {
      capital: { name: 'Kathmandu', lat: 27.7186, lon: 85.3147, info: '' },
      info: '',
      flag: 'maps/world/flags/np.svg'
    },
    'Nauru': {
      capital: { name: 'Yaren', lat: -0.5477, lon: 166.9209, info: '' },
      info: '',
      flag: 'maps/world/flags/nr.svg'
    },
    'New Zealand': {
      capital: { name: 'Wellington', lat: -41.2921, lon: 174.7772, info: '' },
      info: '',
      flag: 'maps/world/flags/nz.svg'
    },
    'Oman': {
      capital: { name: 'Muscat', lat: 23.5852, lon: 58.3783, info: '' },
      info: '',
      flag: 'maps/world/flags/om.svg'
    },
    'Pakistan': {
      capital: { name: 'Islamabad', lat: 33.6894, lon: 73.0806, info: '' },
      info: '',
      flag: 'maps/world/flags/pk.svg'
    },
    'Panama': {
      capital: { name: 'Panama City', lat: 8.97, lon: -79.535, info: '' },
      info: '',
      flag: 'maps/world/flags/pa.svg'
    },
    'Pitcairn Islands': {
      info: '',
      flag: 'maps/world/flags/pn.svg'
    },
    'Peru': {
      capital: { name: 'Lima', lat: -12.0461, lon: -77.052, info: '' },
      info: '',
      flag: 'maps/world/flags/pe.svg'
    },
    'Philippines': {
      capital: { name: 'Manila', lat: 14.6061, lon: 120.9803, info: '' },
      info: '',
      flag: 'maps/world/flags/ph.svg'
    },
    'Palau': {
      capital: { name: 'Melekeok', lat: 7.4874, lon: 134.6265, info: '' },
      info: '',
      flag: 'maps/world/flags/pw.svg'
    },
    'Papua New Guinea': {
      capital: { name: 'Port Moresby', lat: -9.4647, lon: 147.1925, info: '' },
      info: '',
      flag: 'maps/world/flags/pg.svg'
    },
    'Poland': {
      capital: { name: 'Warsaw', lat: 52.2309, lon: 21.0053, info: '' },
      info: '',
      flag: 'maps/world/flags/pl.svg'
    },
    'Puerto Rico': {
      info: '',
      flag: 'maps/world/flags/pr.svg'
    },
    'North Korea': {
      capital: { name: 'Pyongyang', lat: 39.0214, lon: 125.7527, info: '' },
      info: '',
      flag: 'maps/world/flags/kp.svg'
    },
    'Portugal': {
      capital: { name: 'Lisbon', lat: 38.7247, lon: -9.1468, info: '' },
      info: '',
      flag: 'maps/world/flags/pt.svg'
    },
    'Paraguay': {
      capital: { name: 'Asunción', lat: -25.2907, lon: -57.6258, info: '' },
      info: '',
      flag: 'maps/world/flags/py.svg'
    },
    'Palestine': {
      capital: { name: 'Gaza City', lat: 31.53, lon: 34.445, info: '' },
      info: '',
      flag: 'maps/world/flags/ps.svg'
    },
    'French Polynesia': {
      info: '',
      flag: 'maps/world/flags/pf.svg'
    },
    'Qatar': {
      capital: { name: 'Doha', lat: 25.2866, lon: 51.533, info: '', nudge: [24.387, 52.433] },
      info: '',
      flag: 'maps/world/flags/qa.svg'
    },
    'Romania': {
      capital: { name: 'Bucharest', lat: 44.4353, lon: 26.098, info: '' },
      info: '',
      flag: 'maps/world/flags/ro.svg'
    },
    'Russia': {
      capital: { name: 'Moscow', lat: 55.7541, lon: 37.6136, info: '' },
      info: '',
      flag: 'maps/world/flags/ru.svg'
    },
    'Rwanda': {
      capital: { name: 'Kigali', lat: -1.9516, lon: 30.0586, info: '' },
      info: '',
      flag: 'maps/world/flags/rw.svg'
    },
    'Western Sahara': {
      capital: { name: 'Bir Lehlou', lat: 26.1192, lon: -9.6525, info: '' },
      info: '',
      flag: 'maps/world/flags/eh.svg'
    },
    'Saudi Arabia': {
      capital: { name: 'Riyadh', lat: 24.6345, lon: 46.7205, info: '' },
      info: '',
      flag: 'maps/world/flags/sa.svg'
    },
    'Sudan': {
      capital: { name: 'Khartoum', lat: 15.59, lon: 32.5322, info: '' },
      info: '',
      flag: 'maps/world/flags/sd.svg'
    },
    'South Sudan': {
      capital: { name: 'Juba', lat: 4.83, lon: 31.58, info: '' },
      info: '',
      flag: 'maps/world/flags/ss.svg'
    },
    'Senegal': {
      capital: { name: 'Dakar', lat: 14.7178, lon: -17.4751, info: '' },
      info: '',
      flag: 'maps/world/flags/sn.svg'
    },
    'Singapore': {
      capital: { name: 'Singapore', lat: 1.295, lon: 103.8539, info: '' },
      info: '',
      flag: 'maps/world/flags/sg.svg'
    },
    'Solomon Islands': {
      capital: { name: 'Honiara', lat: -9.438, lon: 159.9498, info: '' },
      info: '',
      flag: 'maps/world/flags/sb.svg'
    },
    'Sierra Leone': {
      capital: { name: 'Freetown', lat: 8.472, lon: -13.2362, info: '' },
      info: '',
      flag: 'maps/world/flags/sl.svg'
    },
    'El Salvador': {
      capital: { name: 'San Salvador', lat: 13.7033, lon: -89.2156, info: '' },
      info: '',
      flag: 'maps/world/flags/sv.svg'
    },
    'San Marino': {
      capital: { name: 'San Marino', lat: 43.9361, lon: 12.4418, info: '' },
      info: '',
      flag: 'maps/world/flags/sm.svg'
    },
    'Somalia': {
      capital: { name: 'Mogadishu', lat: 2.0686, lon: 45.3647, info: '' },
      info: '',
      flag: 'maps/world/flags/so.svg'
    },
    'Saint Pierre and Miquelon': {
      info: '',
      flag: 'maps/world/flags/pm.svg'
    },
    'Serbia': {
      capital: { name: 'Belgrade', lat: 44.8206, lon: 20.466, info: '' },
      info: '',
      flag: 'maps/world/flags/rs.svg'
    },
    'São Tomé and Príncipe': {
      capital: { name: 'São Tomé', lat: 0.3375, lon: 6.7296, info: '' },
      info: '',
      flag: 'maps/world/flags/st.svg'
    },
    'Suriname': {
      capital: { name: 'Paramaribo', lat: 5.835, lon: -55.167, info: '' },
      info: '',
      flag: 'maps/world/flags/sr.svg'
    },
    'Slovakia': {
      capital: { name: 'Bratislava', lat: 48.15, lon: 17.117, info: '' },
      info: '',
      flag: 'maps/world/flags/sk.svg'
    },
    'Slovenia': {
      capital: { name: 'Ljubljana', lat: 46.0553, lon: 14.515, info: '' },
      info: '',
      flag: 'maps/world/flags/si.svg'
    },
    'Sweden': {
      capital: { name: 'Stockholm', lat: 59.3241, lon: 18.0663, info: '' },
      info: '',
      flag: 'maps/world/flags/se.svg'
    },
    'Eswatini': {
      capital: { name: 'Mbabane', lat: -26.3167, lon: 31.1333, info: '' },
      info: '',
      flag: 'maps/world/flags/sz.svg'
    },
    'Seychelles': {
      capital: { name: 'Victoria', lat: -4.6166, lon: 55.45, info: '' },
      info: '',
      flag: 'maps/world/flags/sc.svg'
    },
    'Syria': {
      capital: { name: 'Damascus', lat: 33.502, lon: 36.2981, info: '' },
      info: '',
      flag: 'maps/world/flags/sy.svg'
    },
    'Turks and Caicos Islands': {
      info: '',
      flag: 'maps/world/flags/tc.svg'
    },
    'Chad': {
      capital: { name: 'N\'Djamena', lat: 12.115, lon: 15.0472, info: '' },
      info: '',
      flag: 'maps/world/flags/td.svg'
    },
    'Togo': {
      capital: { name: 'Lomé', lat: 6.1339, lon: 1.2208, info: '' },
      info: '',
      flag: 'maps/world/flags/tg.svg'
    },
    'Thailand': {
      capital: { name: 'Bangkok', lat: 13.7519, lon: 100.5147, info: '' },
      info: '',
      flag: 'maps/world/flags/th.svg'
    },
    'Tajikistan': {
      capital: { name: 'Dushanbe', lat: 38.56, lon: 68.7739, info: '' },
      info: '',
      flag: 'maps/world/flags/tj.svg'
    },
    'Turkmenistan': {
      capital: { name: 'Ashgabat', lat: 37.95, lon: 58.3833, info: '' },
      info: '',
      flag: 'maps/world/flags/tm.svg'
    },
    'Timor-Leste': {
      capital: { name: 'Dili', lat: -8.5594, lon: 125.5795, info: '' },
      info: '',
      flag: 'maps/world/flags/tl.svg'
    },
    'Tonga': {
      capital: { name: 'Nuku\'alofa', lat: -21.1385, lon: -175.2206, info: '' },
      info: '',
      flag: 'maps/world/flags/to.svg'
    },
    'Trinidad and Tobago': {
      capital: { name: 'Port-of-Spain', lat: 10.652, lon: -61.517, info: '' },
      info: '',
      flag: 'maps/world/flags/tt.svg'
    },
    'Tunisia': {
      capital: { name: 'Tunis', lat: 36.8028, lon: 10.1797, info: '' },
      info: '',
      flag: 'maps/world/flags/tn.svg'
    },
    'Türkiye': {
      capital: { name: 'Ankara', lat: 39.9292, lon: 32.8624, info: '' },
      info: '',
      flag: 'maps/world/flags/tr.svg'
    },
    'Tuvalu': {
      capital: { name: 'Funafuti', lat: -8.5167, lon: 179.2166, info: '' },
      info: '',
      flag: 'maps/world/flags/tv.svg'
    },
    'Taiwan': {
      capital: { name: 'Taipei', lat: 25.0358, lon: 121.5683, info: '' },
      info: '',
      flag: 'maps/world/flags/tw.svg'
    },
    'Tanzania': {
      capital: { name: 'Dar es Salaam', lat: -6.7981, lon: 39.2664, info: '' },
      info: '',
      flag: 'maps/world/flags/tz.svg'
    },
    'Uganda': {
      capital: { name: 'Kampala', lat: 0.3186, lon: 32.5814, info: '' },
      info: '',
      flag: 'maps/world/flags/ug.svg'
    },
    'Ukraine': {
      capital: { name: 'Kyiv', lat: 50.4353, lon: 30.5147, info: '' },
      info: '',
      flag: 'maps/world/flags/ua.svg'
    },
    'Uruguay': {
      capital: { name: 'Montevideo', lat: -34.9054, lon: -56.1868, info: '' },
      info: '',
      flag: 'maps/world/flags/uy.svg'
    },
    'United States': {
      capital: { name: 'Washington,  D.C.', lat: 38.9015, lon: -77.0114, info: '' },
      info: '',
      flag: 'maps/world/flags/us.svg'
    },
    'Uzbekistan': {
      capital: { name: 'Tashkent', lat: 41.3038, lon: 69.2688, info: '' },
      info: '',
      flag: 'maps/world/flags/uz.svg'
    },
    'Vatican City': {
      info: '',
      flag: 'maps/world/flags/va.svg'
    },
    'Saint Vincent and the Grenadines': {
      capital: { name: 'Kingstown', lat: 13.1558, lon: -61.2202, info: '' },
      info: '',
      flag: 'maps/world/flags/vc.svg'
    },
    'Venezuela': {
      capital: { name: 'Caracas', lat: 10.5029, lon: -66.919, info: '' },
      info: '',
      flag: 'maps/world/flags/ve.svg'
    },
    'British Virgin Islands': {
      info: '',
      flag: 'maps/world/flags/vg.svg'
    },
    'U.S. Virgin Islands': {
      info: '',
      flag: 'maps/world/flags/vi.svg'
    },
    'Vietnam': {
      capital: { name: 'Hanoi', lat: 21.0353, lon: 105.8481, info: '' },
      info: '',
      flag: 'maps/world/flags/vn.svg'
    },
    'Vanuatu': {
      capital: { name: 'Port Vila', lat: -17.7334, lon: 168.3166, info: '' },
      info: '',
      flag: 'maps/world/flags/vu.svg'
    },
    'Wallis and Futuna': {
      info: '',
      flag: 'maps/world/flags/wf.svg'
    },
    'Samoa': {
      capital: { name: 'Apia', lat: -13.8357, lon: -171.7686, info: '', nudge: [-13.336, -173.069] },
      info: '',
      flag: 'maps/world/flags/ws.svg'
    },
    'Yemen': {
      capital: { name: 'Sanaa', lat: 15.3567, lon: 44.2046, info: '' },
      info: '',
      flag: 'maps/world/flags/ye.svg'
    },
    'South Africa': {
      capital: { name: 'Johannesburg', lat: -26.1681, lon: 28.0281, info: '' },
      info: '',
      flag: 'maps/world/flags/za.svg'
    },
    'Zambia': {
      capital: { name: 'Lusaka', lat: -15.4147, lon: 28.2814, info: '' },
      info: '',
      flag: 'maps/world/flags/zm.svg'
    },
    'Zimbabwe': {
      capital: { name: 'Harare', lat: -17.8158, lon: 31.0428, info: '' },
      info: '',
      flag: 'maps/world/flags/zw.svg'
    },
    'French Guiana': {
      info: '',
      flag: 'maps/world/flags/gf.svg'
    },
    'Guadeloupe': {
      info: '',
      flag: 'maps/world/flags/gp.svg'
    },
    'Martinique': {
      info: '',
      flag: 'maps/world/flags/mq.svg'
    },
    'Réunion': {
      info: '',
      flag: 'maps/world/flags/re.svg'
    },
    'Mayotte': {
      info: '',
      flag: 'maps/world/flags/yt.svg'
    },
    'Svalbard': {
      info: '',
      flag: 'maps/world/flags/sj.svg'
    },
    'Bonaire': {
      info: '',
      flag: 'maps/world/flags/bq.svg'
    },
    'Sint Eustatius': {
      capital: { name: 'Oranjestad', lat: 17.4838, lon: -62.984, info: '' },
      info: 'A Dutch special municipality in the Caribbean, right next to Saba. The two islands are close together and are administered the same way by the Netherlands, so on this map they are ONE region and ONE circle. In the games, click that circle to answer for either of them.',
      flag: ''
    },
    'Christmas Island': {
      info: '',
      flag: 'maps/world/flags/cx.svg'
    },
    'Cocos (Keeling) Islands': {
      info: '',
      flag: 'maps/world/flags/cc.svg'
    },
    'Tokelau': {
      info: '',
      flag: 'maps/world/flags/tk.svg'
    },
    'Saint Helena': {
      info: '',
      flag: 'maps/world/flags/sh.svg'
    },
    'Sint Maarten': {
      capital: { name: 'Philipsburg', lat: 18.0237, lon: -63.0458, info: '' },
      info: 'The southern part of the island of Saint Martin, a country within the Kingdom of the Netherlands. The island is shared with Saint Martin (France), so on this map the two are ONE region and ONE circle. In the games, click that circle to answer for either of them.',
      flag: 'maps/world/flags/sx.svg'
    },
    'Saba': {
      capital: { name: 'The Bottom', lat: 17.634, lon: -63.2467, info: '' },
      info: 'A Dutch special municipality in the Caribbean, right next to Sint Eustatius. The two islands are close together and are administered the same way by the Netherlands, so on this map they are ONE region and ONE circle. In the games, click that circle to answer for either of them.',
      flag: ''
    }
  }
});
