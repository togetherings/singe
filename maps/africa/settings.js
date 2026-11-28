/* ==========================================================================
   MAP SETTINGS: Africa   (hand-edited - the map SHAPES are the World map's: maps/world/shapes.js)
   --------------------------------------------------------------------------
   See maps/sierra_leone/settings.js for the settings every map has, and maps/world/settings.js for those of
   world-type maps (scope, circles, nudges...). The Africa maps are WINDOWS on the World map: they draw its shapes
   (borders, circles of small places, lakes, disputed areas) but show only part of the world, and only the regions
   named in "in_game" are asked about. Every other region is drawn grey.
   Settings that are specific to this map:
     insets        false: no boxes under the map (the World map's Caribbean and Pacific Islands)
     merge         in 'un' scope, more parts put into a country (Somaliland into Somalia), as Alaska is put into
                   the United States. In 'all' scope they are places of their own.
     view_pad      room around the regions in the game, as a share of their box's longer side (0.04 = 4%): the map
                   opens on that box and can't be zoomed out or dragged beyond it
     variants      the seven maps of the Africa package (edugame.json lists each with its id, and "scope": 'un' for
                   UN countries only, 'all' for every country and territory). Each has its name, blurb, orientation
                   and "in_game": the regions asked about, by their names in the shapes file. The regions are the
                   African Union's; North Africa leaves out Western Sahara (the Sahrawi Arab Democratic Republic),
                   which is not a UN member. (translations: maps/africa/lang/<code>.json)
   Region settings: every region of any of the seven maps, with its capital, info and flag. The capitals are the World
   map's (maps/world/settings.js), except Nigeria (Abuja, not Lagos), and the territories have theirs too (not Ceuta and
   Melilla: each is a city, so it has no capital of its own, like Vatican City on the World map). Where a
   place has several capitals, the most populated city is used, as on the World map. The flags are the World map's
   (maps/world/flags/), so the package lists each one it uses.
   The package's entries in edugame.json say which shapes to draw ("shapes": "world"), and the package lists
   maps/world/shapes.js and the flags it uses, since they are in the World map's folder.
   ========================================================================== */
(window.GeoMapSettings = window.GeoMapSettings || []).push({
  id: 'africa',
  name: 'Africa',
  blurb: 'Find the countries of Africa',
  credit: 'Boundaries and capitals: Natural Earth (public domain, naturalearthdata.com), as on the World map. Borders follow Natural Earth\'s de facto lines. Regions: the African Union\'s. Small countries and islands are marked with circles.',
  insets: false,
  infinite_scroll: false,
  merge: { 'Somaliland': 'Somalia' },
  view_pad: 0.04,
  page_width: 1600,
  fit_all_min_height: 600,
  circle_ratio: 0.007,
  marker_px: 16,
  zoom_levels: 4,
  pass_accuracy: { regions: 80, capitals: 0, flags: 0 },
  skip: true,
  nudge_zoom_levels: 2,
  modes: { practice: true, regions: true, capitals: true, flags: true },
  variants: {
    africa_north: {
      name: 'North Africa',
      blurb: 'Find the 6 countries of North Africa',
      orientation: 'horizontal',
      in_game: [
        'Algeria', 'Egypt', 'Libya', 'Mauritania', 'Morocco', 'Tunisia'
      ]
    },
    africa_west: {
      name: 'West Africa',
      blurb: 'Find the 15 countries of West Africa',
      orientation: 'horizontal',
      in_game: [
        'Benin', 'Burkina Faso', 'Cabo Verde', 'Côte d\'Ivoire', 'Ghana', 'Guinea', 'Guinea-Bissau', 'Liberia', 'Mali',
        'Niger', 'Nigeria', 'Senegal', 'Sierra Leone', 'The Gambia', 'Togo'
      ]
    },
    africa_central: {
      name: 'Central Africa',
      blurb: 'Find the 9 countries of Central Africa',
      orientation: 'vertical',
      in_game: [
        'Burundi', 'Cameroon', 'Central African Republic', 'Chad', 'Democratic Republic of the Congo',
        'Equatorial Guinea', 'Gabon', 'Republic of the Congo', 'São Tomé and Príncipe'
      ]
    },
    africa_east: {
      name: 'East Africa',
      blurb: 'Find the 14 countries of East Africa',
      orientation: 'vertical',
      in_game: [
        'Comoros', 'Djibouti', 'Eritrea', 'Ethiopia', 'Kenya', 'Madagascar', 'Mauritius', 'Rwanda', 'Seychelles',
        'Somalia', 'South Sudan', 'Sudan', 'Tanzania', 'Uganda'
      ]
    },
    africa_southern: {
      name: 'Southern Africa',
      blurb: 'Find the 10 countries of Southern Africa',
      orientation: 'vertical',
      in_game: [
        'Angola', 'Botswana', 'Eswatini', 'Lesotho', 'Malawi', 'Mozambique', 'Namibia', 'South Africa', 'Zambia',
        'Zimbabwe'
      ]
    },
    africa: {
      name: 'Africa: UN countries',
      blurb: 'Find the 54 countries of Africa',
      orientation: 'vertical',
      in_game: [
        'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cameroon',
        'Central African Republic', 'Chad', 'Comoros', 'Côte d\'Ivoire', 'Democratic Republic of the Congo',
        'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Eswatini', 'Ethiopia', 'Gabon', 'Ghana', 'Guinea',
        'Guinea-Bissau', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania',
        'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Republic of the Congo', 'Rwanda',
        'São Tomé and Príncipe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa', 'South Sudan',
        'Sudan', 'Tanzania', 'The Gambia', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe'
      ]
    },
    africa_all: {
      name: 'Africa: all countries and territories',
      blurb: 'Find every country and territory of Africa',
      orientation: 'vertical',
      in_game: [
        'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cameroon',
        'Canary Islands', 'Central African Republic', 'Ceuta', 'Chad', 'Comoros', 'Côte d\'Ivoire',
        'Democratic Republic of the Congo', 'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Eswatini',
        'Ethiopia', 'Gabon', 'Ghana', 'Guinea', 'Guinea-Bissau', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar',
        'Madeira', 'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Mayotte', 'Melilla', 'Morocco', 'Mozambique',
        'Namibia', 'Niger', 'Nigeria', 'Republic of the Congo', 'Rwanda', 'Réunion', 'Saint Helena', 'Senegal',
        'Seychelles', 'Sierra Leone', 'Somalia', 'Somaliland', 'South Africa', 'South Sudan', 'Sudan',
        'São Tomé and Príncipe', 'Tanzania', 'The Gambia', 'Togo', 'Tristan da Cunha', 'Tunisia', 'Uganda',
        'Western Sahara', 'Zambia', 'Zimbabwe'
      ]
    }
  },

  regions: {
    'Algeria': {
      capital: { name: 'Algiers', lat: 36.765, lon: 3.0486, info: '' },
      info: '',
      flag: 'maps/world/flags/dz.svg'
    },
    'Angola': {
      capital: { name: 'Luanda', lat: -8.8363, lon: 13.2325, info: '' },
      info: '',
      flag: 'maps/world/flags/ao.svg'
    },
    'Benin': {
      capital: { name: 'Porto-Novo', lat: 6.4969, lon: 2.6289, info: '' },
      info: 'Formerly called Dahomey (until 1975). Porto-Novo is the official capital; Cotonou, the largest city, is the seat of government.',
      flag: 'maps/world/flags/bj.svg'
    },
    'Botswana': {
      capital: { name: 'Gaborone', lat: -24.6463, lon: 25.9119, info: '' },
      info: 'Formerly called Bechuanaland (until 1966).',
      flag: 'maps/world/flags/bw.svg'
    },
    'Burkina Faso': {
      capital: { name: 'Ouagadougou', lat: 12.3723, lon: -1.5267, info: '' },
      info: 'Formerly called Upper Volta (until 1984).',
      flag: 'maps/world/flags/bf.svg'
    },
    'Burundi': {
      capital: { name: 'Gitega', lat: -3.4271, lon: 29.9246, info: '' },
      info: 'Gitega has been the capital since 2019; Bujumbura, the former capital, is the largest city.',
      flag: 'maps/world/flags/bi.svg'
    },
    'Cabo Verde': {
      capital: { name: 'Praia', lat: 14.9167, lon: -23.5167, info: '' },
      info: 'Also called Cape Verde in English.',
      flag: 'maps/world/flags/cv.svg'
    },
    'Cameroon': {
      capital: { name: 'Yaoundé', lat: 3.8686, lon: 11.5147, info: '' },
      info: '',
      flag: 'maps/world/flags/cm.svg'
    },
    'Canary Islands': {
      capital: { name: 'Las Palmas de Gran Canaria', lat: 28.1, lon: -15.4167, info: 'The Canary Islands have two capitals, Las Palmas de Gran Canaria and Santa Cruz de Tenerife; the bigger one is used here.' },
      info: 'An autonomous community of Spain.',
      flag: 'maps/world/flags/es-cn.svg'
    },
    'Central African Republic': {
      capital: { name: 'Bangui', lat: 4.3666, lon: 18.5583, info: '' },
      info: 'Formerly called Ubangi-Shari (until 1958).',
      flag: 'maps/world/flags/cf.svg'
    },
    'Chad': {
      capital: { name: 'N\'Djamena', lat: 12.115, lon: 15.0472, info: '' },
      info: '',
      flag: 'maps/world/flags/td.svg'
    },
    'Ceuta': {
      info: 'An autonomous city of Spain on the north coast of Africa. Morocco claims it.',
      flag: 'maps/world/flags/es-ce.svg'
    },
    'Comoros': {
      capital: { name: 'Moroni', lat: -11.7042, lon: 43.2402, info: '' },
      info: '',
      flag: 'maps/world/flags/km.svg'
    },
    'Côte d\'Ivoire': {
      capital: { name: 'Yamoussoukro', lat: 6.8276, lon: -5.2893, info: '' },
      info: 'Also known in English as Ivory Coast. Yamoussoukro has been the official capital since 1983; Abidjan, the largest city, is still where most of the government works.',
      flag: 'maps/world/flags/ci.svg'
    },
    'Democratic Republic of the Congo': {
      capital: { name: 'Kinshasa', lat: -4.3278, lon: 15.313, info: '', nudge: [-4.571, 15.49] },
      info: 'Called Zaire from 1971 to 1997.',
      flag: 'maps/world/flags/cd.svg'
    },
    'Djibouti': {
      capital: { name: 'Djibouti', lat: 11.595, lon: 43.148, info: '' },
      info: 'Formerly called French Somaliland, then the French Territory of the Afars and the Issas (until 1977).',
      flag: 'maps/world/flags/dj.svg'
    },
    'Egypt': {
      capital: { name: 'Cairo', lat: 30.0519, lon: 31.248, info: '' },
      info: 'Cairo is the capital. A planned New Capital is being built to the east of Cairo, and much of the government has moved there.',
      flag: 'maps/world/flags/eg.svg'
    },
    'Equatorial Guinea': {
      capital: { name: 'Ciudad de la Paz', lat: 1.5889, lon: 10.8225, info: '' },
      info: 'Formerly called Spanish Guinea (until 1968). Ciudad de la Paz, also known as Djibloho or Oyala, became the capital in January 2026 and is still being built; the previous capital was Malabo.',
      flag: 'maps/world/flags/gq.svg'
    },
    'Eritrea': {
      capital: { name: 'Asmara', lat: 15.3333, lon: 38.9333, info: '' },
      info: '',
      flag: 'maps/world/flags/er.svg'
    },
    'Eswatini': {
      capital: { name: 'Mbabane', lat: -26.3167, lon: 31.1333, info: '' },
      info: 'Formerly called Swaziland (until 2018). Mbabane is the seat of government; Lobamba is the royal and legislative capital.',
      flag: 'maps/world/flags/sz.svg'
    },
    'Ethiopia': {
      capital: { name: 'Addis Ababa', lat: 9.0353, lon: 38.6981, info: '' },
      info: '',
      flag: 'maps/world/flags/et.svg'
    },
    'Gabon': {
      capital: { name: 'Libreville', lat: 0.3854, lon: 9.458, info: '' },
      info: '',
      flag: 'maps/world/flags/ga.svg'
    },
    'Ghana': {
      capital: { name: 'Accra', lat: 5.552, lon: -0.2187, info: '' },
      info: 'Formerly called the Gold Coast (until 1957).',
      flag: 'maps/world/flags/gh.svg'
    },
    'Guinea': {
      capital: { name: 'Conakry', lat: 9.5335, lon: -13.6822, info: '' },
      info: '',
      flag: 'maps/world/flags/gn.svg'
    },
    'Guinea-Bissau': {
      capital: { name: 'Bissau', lat: 11.865, lon: -15.5984, info: '' },
      info: '',
      flag: 'maps/world/flags/gw.svg'
    },
    'Kenya': {
      capital: { name: 'Nairobi', lat: -1.2814, lon: 36.8147, info: '' },
      info: '',
      flag: 'maps/world/flags/ke.svg'
    },
    'Lesotho': {
      capital: { name: 'Maseru', lat: -29.3167, lon: 27.4833, info: '' },
      info: 'Formerly called Basutoland (until 1966).',
      flag: 'maps/world/flags/ls.svg'
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
    'Madagascar': {
      capital: { name: 'Antananarivo', lat: -18.9147, lon: 47.5147, info: '' },
      info: 'Called the Malagasy Republic from 1958 to 1975.',
      flag: 'maps/world/flags/mg.svg'
    },
    'Madeira': {
      capital: { name: 'Funchal', lat: 32.65, lon: -16.9083, info: '' },
      info: 'An autonomous region of Portugal.',
      flag: 'maps/world/flags/pt-30.svg'
    },
    'Malawi': {
      capital: { name: 'Lilongwe', lat: -13.9833, lon: 33.7833, info: '' },
      info: 'Formerly called Nyasaland (until 1964).',
      flag: 'maps/world/flags/mw.svg'
    },
    'Mali': {
      capital: { name: 'Bamako', lat: 12.652, lon: -8.002, info: '' },
      info: 'Formerly called French Sudan (until 1960).',
      flag: 'maps/world/flags/ml.svg'
    },
    'Mauritania': {
      capital: { name: 'Nouakchott', lat: 18.0864, lon: -15.9753, info: '' },
      info: '',
      flag: 'maps/world/flags/mr.svg'
    },
    'Mauritius': {
      capital: { name: 'Port Louis', lat: -20.1666, lon: 57.5, info: '' },
      info: '',
      flag: 'maps/world/flags/mu.svg'
    },
    'Melilla': {
      info: 'An autonomous city of Spain on the north coast of Africa. Morocco claims it.',
      flag: 'maps/world/flags/es-ml.svg'
    },
    'Mayotte': {
      capital: { name: 'Mamoudzou', lat: -12.7806, lon: 45.2278, info: '' },
      info: 'An overseas department and region of France.',
      flag: 'maps/world/flags/yt.svg'
    },
    'Morocco': {
      capital: { name: 'Rabat', lat: 34.0253, lon: -6.8364, info: '' },
      info: '',
      flag: 'maps/world/flags/ma.svg'
    },
    'Mozambique': {
      capital: { name: 'Maputo', lat: -25.9533, lon: 32.5872, info: '' },
      info: '',
      flag: 'maps/world/flags/mz.svg'
    },
    'Namibia': {
      capital: { name: 'Windhoek', lat: -22.57, lon: 17.0835, info: '' },
      info: 'Formerly called South West Africa (until 1990).',
      flag: 'maps/world/flags/na.svg'
    },
    'Niger': {
      capital: { name: 'Niamey', lat: 13.5187, lon: 2.1147, info: '' },
      info: '',
      flag: 'maps/world/flags/ne.svg'
    },
    'Nigeria': {
      capital: { name: 'Abuja', lat: 9.0833, lon: 7.5333, info: '' },
      info: '',
      flag: 'maps/world/flags/ng.svg'
    },
    'Republic of the Congo': {
      capital: { name: 'Brazzaville', lat: -4.2572, lon: 15.2827, info: '', nudge: [-4.014, 15.115] },
      info: '',
      flag: 'maps/world/flags/cg.svg'
    },
    'Réunion': {
      capital: { name: 'Saint-Denis', lat: -20.8789, lon: 55.4481, info: '' },
      info: 'An overseas department and region of France.',
      flag: 'maps/world/flags/re.svg'
    },
    'Rwanda': {
      capital: { name: 'Kigali', lat: -1.9516, lon: 30.0586, info: '' },
      info: '',
      flag: 'maps/world/flags/rw.svg'
    },
    'Saint Helena': {
      capital: { name: 'Jamestown', lat: -15.9244, lon: -5.7181, info: '' },
      info: 'Part of the British overseas territory of Saint Helena, Ascension and Tristan da Cunha.',
      flag: 'maps/world/flags/sh.svg'
    },
    'São Tomé and Príncipe': {
      capital: { name: 'São Tomé', lat: 0.3375, lon: 6.7296, info: '' },
      info: '',
      flag: 'maps/world/flags/st.svg'
    },
    'Senegal': {
      capital: { name: 'Dakar', lat: 14.7178, lon: -17.4751, info: '' },
      info: '',
      flag: 'maps/world/flags/sn.svg'
    },
    'Seychelles': {
      capital: { name: 'Victoria', lat: -4.6166, lon: 55.45, info: '' },
      info: '',
      flag: 'maps/world/flags/sc.svg'
    },
    'Sierra Leone': {
      capital: { name: 'Freetown', lat: 8.472, lon: -13.2362, info: '' },
      info: '',
      flag: 'maps/world/flags/sl.svg'
    },
    'Somalia': {
      capital: { name: 'Mogadishu', lat: 2.0686, lon: 45.3647, info: '' },
      info: '',
      flag: 'maps/world/flags/so.svg'
    },
    'Somaliland': {
      capital: { name: 'Hargeisa', lat: 9.56, lon: 44.065, info: '' },
      info: 'Declared itself independent of Somalia in 1991 and governs itself. Israel recognised it in December 2025, the first country to do so; most countries count it as part of Somalia. On the maps of UN countries it is part of Somalia.',
      flag: 'maps/world/flags/somaliland.svg'
    },
    'South Africa': {
      capital: { name: 'Pretoria', lat: -25.7461, lon: 28.1881, info: '' },
      info: 'South Africa has three capitals: Pretoria (the government), Cape Town (parliament) and Bloemfontein (the judicial capital). Johannesburg, the largest city, is not one of them.',
      flag: 'maps/world/flags/za.svg'
    },
    'South Sudan': {
      capital: { name: 'Juba', lat: 4.83, lon: 31.58, info: '' },
      info: '',
      flag: 'maps/world/flags/ss.svg'
    },
    'Sudan': {
      capital: { name: 'Khartoum', lat: 15.59, lon: 32.5322, info: '' },
      info: '',
      flag: 'maps/world/flags/sd.svg'
    },
    'Tanzania': {
      capital: { name: 'Dodoma', lat: -6.1630, lon: 35.7516, info: '' },
      info: 'Formed in 1964, when Tanganyika and Zanzibar united. Dodoma is the capital; Dar es Salaam, the former capital, is the largest city.',
      flag: 'maps/world/flags/tz.svg'
    },
    'The Gambia': {
      capital: { name: 'Banjul', lat: 13.4539, lon: -16.5917, info: '' },
      info: '',
      flag: 'maps/world/flags/gm.svg'
    },
    'Togo': {
      capital: { name: 'Lomé', lat: 6.1339, lon: 1.2208, info: '' },
      info: '',
      flag: 'maps/world/flags/tg.svg'
    },
    'Tristan da Cunha': {
      capital: { name: 'Edinburgh of the Seven Seas', lat: -37.0675, lon: -12.3105, info: '' },
      info: 'Part of the British overseas territory of Saint Helena, Ascension and Tristan da Cunha: the most remote inhabited island in the world.',
      flag: 'maps/world/flags/sh-ta.svg'
    },
    'Tunisia': {
      capital: { name: 'Tunis', lat: 36.8028, lon: 10.1797, info: '' },
      info: '',
      flag: 'maps/world/flags/tn.svg'
    },
    'Uganda': {
      capital: { name: 'Kampala', lat: 0.3186, lon: 32.5814, info: '' },
      info: '',
      flag: 'maps/world/flags/ug.svg'
    },
    'Western Sahara': {
      capital: { name: 'Tifariti', lat: 26.1581, lon: -10.5669, info: '' },
      info: 'A disputed territory. Morocco controls most of it. The Sahrawi Arab Democratic Republic, a member of the African Union, claims all of it and controls a strip in the east. On the maps of UN countries it is grey. The Sahrawi Republic claims Laayoune (El Aaiún), which Morocco controls, as its capital; its temporary capital is Tifariti (Bir Lehlou until 2008).',
      flag: 'maps/world/flags/eh.svg'
    },
    'Zambia': {
      capital: { name: 'Lusaka', lat: -15.4147, lon: 28.2814, info: '' },
      info: 'Formerly called Northern Rhodesia (until 1964).',
      flag: 'maps/world/flags/zm.svg'
    },
    'Zimbabwe': {
      capital: { name: 'Harare', lat: -17.8158, lon: 31.0428, info: '' },
      info: 'Formerly called Rhodesia (until 1980).',
      flag: 'maps/world/flags/zw.svg'
    }
  }
});
