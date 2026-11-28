/* ==========================================================================
   MAP SETTINGS: Europe   (hand-edited - the map SHAPES are the World map's: maps/world/shapes.js)
   --------------------------------------------------------------------------
   Windows on the World map, like the Africa and Asia maps (see maps/africa/settings.js for how windows work:
   in_game, scope, view_pad, and maps/asia/settings.js for "view"). Settings that are specific to these maps:
     view          [west, south, east, north] in degrees: the box the map shows. The two whole-Europe maps show
                   25 deg W to 59 deg E and 34 deg N to 71.5 deg N: Iceland, Cyprus, the Caucasus and western
                   Kazakhstan fit; Russia and Kazakhstan are cut off at 59 deg E (near the Ural Mountains), and the
                   far north (Novaya Zemlya, Franz Josef Land) is left out. The regional maps with places far off
                   their country's mainland (Norway's Svalbard, Portugal's Azores, Spain's Canary Islands, France's
                   overseas regions, all part of their country in UN scope) have a view too.
     cutouts       boxes over the sea that show a place far off the map's edge again: Svalbard (between Norway and
                   Iceland) and the Azores (west of Portugal, at about their real latitude), on the two whole-Europe
                   maps and on Northern and Southern Europe. { id, regions: [names whose shapes are copied in],
                   area: [west, south, east, north] (what the box shows), at: [lon, lat] (its top left corner),
                   scale, title }. In UN scope the box shows Norway's or Portugal's islands, as Norway or Portugal;
                   on the "all" map, Svalbard and the Azores. (Titles: maps/europe/lang/<code>.json "cutouts".)
     variants      the eight maps of the Europe package (edugame.json lists each, with "scope": 'un' or 'all'). The
                   regional maps have UN countries only (and Vatican City), as on the Africa and Asia maps. The
                   regions are SINGE's own (the owner's choice, 2026-11-28):
                     Northern Europe: the five Nordic and three Baltic countries.
                     Western Europe: the United Kingdom, Ireland, Belgium, the Netherlands, Luxembourg and France.
                     Central Europe: Germany, Switzerland, Liechtenstein, Austria, Hungary, Czechia, Slovakia, Poland.
                     Southern Europe: Portugal, Spain, Andorra, Monaco, Italy, San Marino, Vatican City, Malta, Greece,
                       Cyprus and Türkiye.
                     Southeast Europe: the rest of the Balkans (Slovenia, Croatia, Bosnia and Herzegovina, Serbia,
                       Montenegro, Albania, North Macedonia, Bulgaria; Kosovo is grey, as on every UN map).
                     Eastern Europe: Russia, Kazakhstan, Belarus, Ukraine, Moldova, Romania, Georgia, Azerbaijan,
                       Armenia.
                   The "all" map adds Kosovo, Northern Cyprus, Transnistria, Crimea, Abkhazia, South Ossetia,
                   Nakhchivan, Kaliningrad, the Faroe and Åland Islands, Svalbard, Gibraltar, the Isle of Man,
                   Jersey, Guernsey, the Hebrides, Orkney and Shetland, Corsica, Sardinia, Sicily, Crete, the Balearic
                   Islands and the Azores: the World "all" map's places in Europe, except those on the Africa maps
                   (the Canary Islands, Madeira, Ceuta and Melilla).
                   (translations: maps/europe/lang/<code>.json)
   Places in two continents (also on the Asia maps): Russia, Türkiye and Kazakhstan, Georgia, Azerbaijan and Armenia,
   Cyprus and Northern Cyprus, Abkhazia, South Ossetia and Nakhchivan; Spain and Portugal have places in Africa. Their
   notes say so.
   Region settings: every place of any of the eight maps, with its capital, info and flag: the World map's
   (maps/world/settings.js), with the notes about continents and boxes added. The flags are the World map's
   (maps/world/flags/), so the package lists each one it uses.
   ========================================================================== */
(window.GeoMapSettings = window.GeoMapSettings || []).push({
  id: 'europe',
  name: 'Europe',
  blurb: 'Find the countries of Europe',

  credit: 'Boundaries and capitals: Natural Earth (public domain, naturalearthdata.com), as on the World map. Borders follow Natural Earth\'s de facto lines. Small countries and islands are marked with circles.',
  insets: false,
  infinite_scroll: false,
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
    europe_north: {
      name: 'Northern Europe',
      blurb: 'Find the 8 countries of Northern Europe: the Nordic and Baltic countries',
      orientation: 'horizontal',
      view: [-25, 53.5, 32.5, 71.5],
      cutouts: [
        { id: 'svalbard', regions: ['Svalbard', 'Norway'], area: [9.5, 74.2, 34, 81], at: [-12, 69], scale: 0.5, title: 'Svalbard (Norway)' }
      ],
      in_game: [
        'Denmark', 'Estonia', 'Finland', 'Iceland', 'Latvia', 'Lithuania', 'Norway', 'Sweden'
      ]
    },
    europe_west: {
      name: 'Western Europe',
      blurb: 'Find the 6 countries of Western Europe',
      orientation: 'vertical',
      view: [-11, 41.2, 10, 61],
      in_game: [
        'Belgium', 'France', 'Ireland', 'Luxembourg', 'Netherlands', 'United Kingdom'
      ]
    },
    europe_central: {
      name: 'Central Europe',
      blurb: 'Find the 8 countries of Central Europe',
      orientation: 'horizontal',
      in_game: [
        'Austria', 'Czechia', 'Germany', 'Hungary', 'Liechtenstein', 'Poland', 'Slovakia', 'Switzerland'
      ]
    },
    europe_south: {
      name: 'Southern Europe',
      blurb: 'Find the 11 countries of Southern Europe',
      orientation: 'horizontal',
      view: [-20.5, 34, 45, 47.5],
      cutouts: [
        { id: 'azores', regions: ['Azores', 'Portugal'], area: [-31.6, 36.7, -24.9, 40.1], at: [-20, 42], scale: 1.25, title: 'Azores (Portugal)' }
      ],
      in_game: [
        'Andorra', 'Cyprus', 'Greece', 'Italy', 'Malta', 'Monaco', 'Portugal', 'San Marino', 'Spain', 'Türkiye',
        'Vatican City'
      ]
    },
    europe_southeast: {
      name: 'Southeast Europe',
      blurb: 'Find the 8 countries of Southeast Europe: the Balkans',
      orientation: 'horizontal',
      in_game: [
        'Albania', 'Bosnia and Herzegovina', 'Bulgaria', 'Croatia', 'Montenegro', 'North Macedonia', 'Serbia',
        'Slovenia'
      ]
    },
    europe_east: {
      name: 'Eastern Europe',
      blurb: 'Find the 9 countries of Eastern Europe',
      orientation: 'vertical',
      credit: 'Boundaries and capitals: Natural Earth (public domain, naturalearthdata.com), as on the World map. Borders follow Natural Earth\'s de facto lines. Small countries and islands are marked with circles. Russia and Kazakhstan are cut off at 59° E.',
      view: [19, 38, 59, 70.5],
      in_game: [
        'Armenia', 'Azerbaijan', 'Belarus', 'Georgia', 'Kazakhstan', 'Moldova', 'Romania', 'Russia', 'Ukraine'
      ]
    },
    europe: {
      name: 'Europe: UN countries',
      blurb: 'Find the 50 countries of Europe (49 UN members and Vatican City)',
      orientation: 'horizontal',
      credit: 'Boundaries and capitals: Natural Earth (public domain, naturalearthdata.com), as on the World map. Borders follow Natural Earth\'s de facto lines. Small countries and islands are marked with circles. Russia and Kazakhstan are cut off at 59° E. Svalbard and the Azores are shown in boxes.',
      view: [-25, 34, 59, 71.5],
      cutouts: [
        { id: 'svalbard', regions: ['Svalbard', 'Norway'], area: [9.5, 74.2, 34, 81], at: [-12, 69], scale: 0.5, title: 'Svalbard (Norway)' },
        { id: 'azores', regions: ['Azores', 'Portugal'], area: [-31.6, 36.7, -24.9, 40.1], at: [-23.5, 42], scale: 1.5, title: 'Azores (Portugal)' }
      ],
      in_game: [
        'Albania', 'Andorra', 'Armenia', 'Austria', 'Azerbaijan', 'Belarus', 'Belgium', 'Bosnia and Herzegovina',
        'Bulgaria', 'Croatia', 'Cyprus', 'Czechia', 'Denmark', 'Estonia', 'Finland', 'France', 'Georgia', 'Germany',
        'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy', 'Kazakhstan', 'Latvia', 'Liechtenstein', 'Lithuania',
        'Luxembourg', 'Malta', 'Moldova', 'Monaco', 'Montenegro', 'Netherlands', 'North Macedonia', 'Norway',
        'Poland', 'Portugal', 'Romania', 'Russia', 'San Marino', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden',
        'Switzerland', 'Türkiye', 'Ukraine', 'United Kingdom', 'Vatican City'
      ]
    },
    europe_all: {
      name: 'Europe: all countries and territories',
      blurb: 'Find every country and territory of Europe',
      orientation: 'horizontal',
      credit: 'Boundaries and capitals: Natural Earth (public domain, naturalearthdata.com), as on the World map. Borders follow Natural Earth\'s de facto lines. Small countries and islands are marked with circles. Russia and Kazakhstan are cut off at 59° E. Svalbard and the Azores are shown in boxes.',
      view: [-25, 34, 59, 71.5],
      cutouts: [
        { id: 'svalbard', regions: ['Svalbard', 'Norway'], area: [9.5, 74.2, 34, 81], at: [-12, 69], scale: 0.5, title: 'Svalbard (Norway)' },
        { id: 'azores', regions: ['Azores', 'Portugal'], area: [-31.6, 36.7, -24.9, 40.1], at: [-23.5, 42], scale: 1.5, title: 'Azores (Portugal)' }
      ],
      in_game: [
        'Abkhazia', 'Albania', 'Andorra', 'Armenia', 'Austria', 'Azerbaijan', 'Azores', 'Balearic Islands',
        'Belarus', 'Belgium', 'Bosnia and Herzegovina', 'Bulgaria', 'Corsica', 'Crete', 'Crimea', 'Croatia',
        'Cyprus', 'Czechia', 'Denmark', 'Estonia', 'Faroe Islands', 'Finland', 'France', 'Georgia', 'Germany',
        'Gibraltar', 'Greece', 'Guernsey', 'Hebrides', 'Hungary', 'Iceland', 'Ireland', 'Isle of Man', 'Italy',
        'Jersey', 'Kaliningrad', 'Kazakhstan', 'Kosovo', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg',
        'Malta', 'Moldova', 'Monaco', 'Montenegro', 'Nakhchivan', 'Netherlands', 'North Macedonia',
        'Northern Cyprus', 'Norway', 'Orkney Islands', 'Poland', 'Portugal', 'Romania', 'Russia', 'San Marino',
        'Sardinia', 'Serbia', 'Shetland Islands', 'Sicily', 'Slovakia', 'Slovenia', 'South Ossetia', 'Spain',
        'Svalbard', 'Sweden', 'Switzerland', 'Transnistria', 'Türkiye', 'Ukraine', 'United Kingdom', 'Vatican City',
        'Åland Islands'
      ]
    }
  },

  regions: {
    'Abkhazia': {
      capital: { name: 'Sukhumi', lat: 43.02, lon: 41.02, info: '' },
      info: 'On the Black Sea coast, part of Georgia. It broke away after a war in 1992-1993 and governs itself with Russia\'s support. Russia and a few other countries have recognised it as independent since 2008; most countries count it as part of Georgia. Like Georgia, it is usually counted in Asia, and often in Europe too.',
      flag: 'maps/world/flags/abkhazia.svg'
    },
    'Albania': {
      capital: { name: 'Tirana', lat: 41.3275, lon: 19.8189, info: '' },
      info: '',
      flag: 'maps/world/flags/al.svg'
    },
    'Andorra': {
      capital: { name: 'Andorra la Vella', lat: 42.5108, lon: 1.5266, info: '' },
      info: '',
      flag: 'maps/world/flags/ad.svg'
    },
    'Armenia': {
      capital: { name: 'Yerevan', lat: 40.1831, lon: 44.5116, info: '' },
      info: 'All of Armenia lies south of the Caucasus mountains, so it is in Asia, but it is a member of the Council of Europe and is often counted in Europe too.',
      flag: 'maps/world/flags/am.svg'
    },
    'Austria': {
      capital: { name: 'Vienna', lat: 48.202, lon: 16.3647, info: '' },
      info: '',
      flag: 'maps/world/flags/at.svg'
    },
    'Azerbaijan': {
      capital: { name: 'Baku', lat: 40.3972, lon: 49.8603, info: '' },
      info: 'Nakhchivan is a separate place on the maps of all countries and territories. Azerbaijan is between Europe and Asia. Most of it lies south of the main ridge of the Caucasus mountains, which is often taken as the line between them, so it is usually counted in Asia; a little of the north lies beyond it. It is a member of the Council of Europe and is often counted in Europe too.',
      flag: 'maps/world/flags/az.svg'
    },
    'Azores': {
      info: 'Islands far out in the Atlantic, an autonomous region of Portugal. They are shown in a box, moved east from their real place.',
      flag: 'maps/world/flags/pt-20.svg'
    },
    'Balearic Islands': {
      info: '',
      flag: 'maps/world/flags/es-ib.svg'
    },
    'Belarus': {
      capital: { name: 'Minsk', lat: 53.9019, lon: 27.5647, info: '' },
      info: 'Formerly called Byelorussia (until 1991).',
      flag: 'maps/world/flags/by.svg'
    },
    'Belgium': {
      capital: { name: 'Brussels', lat: 50.8353, lon: 4.3314, info: '' },
      info: '',
      flag: 'maps/world/flags/be.svg'
    },
    'Bosnia and Herzegovina': {
      capital: { name: 'Sarajevo', lat: 43.85, lon: 18.383, info: '' },
      info: 'The country is made of two parts (entities), each with its own government: the Federation of Bosnia and Herzegovina and Republika Srpska. The Brčko District belongs to both and governs itself.',
      flag: 'maps/world/flags/ba.svg'
    },
    'Bulgaria': {
      capital: { name: 'Sofia', lat: 42.6853, lon: 23.3147, info: '' },
      info: '',
      flag: 'maps/world/flags/bg.svg'
    },
    'Corsica': {
      info: '',
      flag: 'maps/world/flags/fr-20r.svg'
    },
    'Crete': {
      info: '',
      flag: ''
    },
    'Crimea': {
      info: 'A peninsula on the Black Sea, part of Ukraine; Russia has occupied it since 2014 and claims it. Its flag is used under both claims.',
      flag: 'maps/world/flags/ua-43.svg'
    },
    'Croatia': {
      capital: { name: 'Zagreb', lat: 45.8, lon: 16, info: '' },
      info: '',
      flag: 'maps/world/flags/hr.svg'
    },
    'Cyprus': {
      capital: { name: 'Nicosia', lat: 35.1667, lon: 33.3666, info: '', nudge: [34.97, 33.37] },
      info: 'The island of Cyprus is in Asia, south of Türkiye, but Cyprus is a member of the European Union and is usually counted in Europe too.',
      flag: 'maps/world/flags/cy.svg'
    },
    'Czechia': {
      capital: { name: 'Prague', lat: 50.087, lon: 14.4229, info: '' },
      info: 'Also called the Czech Republic.',
      flag: 'maps/world/flags/cz.svg'
    },
    'Denmark': {
      capital: { name: 'Copenhagen', lat: 55.6805, lon: 12.5615, info: '' },
      info: 'The Faroe Islands and Greenland are separate places on the maps of all countries and territories. Greenland, the largest island in the world, is part of the Kingdom of Denmark but governs itself; geographically it is part of North America. The Faroe Islands govern themselves too.',
      flag: 'maps/world/flags/dk.svg'
    },
    'Estonia': {
      capital: { name: 'Tallinn', lat: 59.4339, lon: 24.728, info: '' },
      info: '',
      flag: 'maps/world/flags/ee.svg'
    },
    'Faroe Islands': {
      info: '',
      flag: 'maps/world/flags/fo.svg'
    },
    'Finland': {
      capital: { name: 'Helsinki', lat: 60.1638, lon: 24.9325, info: '' },
      info: 'The Åland Islands are a separate place on the maps of all countries and territories.',
      flag: 'maps/world/flags/fi.svg'
    },
    'France': {
      capital: { name: 'Paris', lat: 48.8581, lon: 2.353, info: '' },
      info: 'Corsica, French Guiana, French Polynesia, Guadeloupe, Martinique, Mayotte, New Caledonia, Réunion, Saint Barthélemy, Saint Martin, Saint Pierre and Miquelon and Wallis and Futuna are separate places on the maps of all countries and territories.',
      flag: 'maps/world/flags/fr.svg'
    },
    'Georgia': {
      capital: { name: 'Tbilisi', lat: 41.727, lon: 44.7888, info: '' },
      info: 'Georgia is between Europe and Asia. Most of it lies south of the main ridge of the Caucasus mountains, which is often taken as the line between them, so it is usually counted in Asia; a little lies north of it. It is a member of the Council of Europe and is often counted in Europe too.',
      flag: 'maps/world/flags/ge.svg'
    },
    'Germany': {
      capital: { name: 'Berlin', lat: 52.5238, lon: 13.3996, info: '' },
      info: '',
      flag: 'maps/world/flags/de.svg'
    },
    'Gibraltar': {
      info: '',
      flag: 'maps/world/flags/gi.svg'
    },
    'Greece': {
      capital: { name: 'Athens', lat: 37.9853, lon: 23.7314, info: '' },
      info: 'Crete is a separate place on the maps of all countries and territories.',
      flag: 'maps/world/flags/gr.svg'
    },
    'Guernsey': {
      info: '',
      flag: 'maps/world/flags/gg.svg'
    },
    'Hebrides': {
      info: '',
      flag: 'maps/world/flags/gb-els.svg'
    },
    'Hungary': {
      capital: { name: 'Budapest', lat: 47.502, lon: 19.0814, info: '' },
      info: '',
      flag: 'maps/world/flags/hu.svg'
    },
    'Iceland': {
      capital: { name: 'Reykjavík', lat: 64.1435, lon: -21.9365, info: '' },
      info: '',
      flag: 'maps/world/flags/is.svg'
    },
    'Ireland': {
      capital: { name: 'Dublin', lat: 53.3467, lon: -6.257, info: '' },
      info: '',
      flag: 'maps/world/flags/ie.svg'
    },
    'Isle of Man': {
      info: '',
      flag: 'maps/world/flags/im.svg'
    },
    'Italy': {
      capital: { name: 'Rome', lat: 41.8979, lon: 12.4813, info: '' },
      info: 'Sardinia and Sicily are separate places on the maps of all countries and territories.',
      flag: 'maps/world/flags/it.svg'
    },
    'Jersey': {
      info: '',
      flag: 'maps/world/flags/je.svg'
    },
    'Kaliningrad': {
      info: 'Russia\'s exclave on the Baltic Sea, between Poland and Lithuania.',
      flag: 'maps/world/flags/ru-kgd.svg'
    },
    'Kazakhstan': {
      capital: { name: 'Astana', lat: 51.1694, lon: 71.4491, info: '' },
      info: 'Astana has been the capital since 1997 (before that it was Almaty); it was called Nur-Sultan from 2019 to 2022. Kazakhstan is in both Asia and Europe: a small part, west of the Ural River, is counted as Europe. This map is cut off at 59° E.',
      flag: 'maps/world/flags/kz.svg'
    },
    'Kosovo': {
      capital: { name: 'Pristina', lat: 42.6667, lon: 21.166, info: '' },
      info: '',
      flag: 'maps/world/flags/xk.svg'
    },
    'Latvia': {
      capital: { name: 'Riga', lat: 56.95, lon: 24.1, info: '' },
      info: '',
      flag: 'maps/world/flags/lv.svg'
    },
    'Liechtenstein': {
      capital: { name: 'Vaduz', lat: 47.1337, lon: 9.5167, info: '' },
      info: '',
      flag: 'maps/world/flags/li.svg'
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
    'Malta': {
      capital: { name: 'Valletta', lat: 35.8997, lon: 14.5147, info: '' },
      info: '',
      flag: 'maps/world/flags/mt.svg'
    },
    'Moldova': {
      capital: { name: 'Chișinău', lat: 47.005, lon: 28.8577, info: '' },
      info: 'Formerly called Moldavia (until 1991).',
      flag: 'maps/world/flags/md.svg'
    },
    'Monaco': {
      capital: { name: 'Monaco', lat: 43.7396, lon: 7.4069, info: '' },
      info: '',
      flag: 'maps/world/flags/mc.svg'
    },
    'Montenegro': {
      capital: { name: 'Podgorica', lat: 42.466, lon: 19.2663, info: '' },
      info: 'Podgorica is the capital; Cetinje, the old royal capital, still has the president\'s official residence.',
      flag: 'maps/world/flags/me.svg'
    },
    'Nakhchivan': {
      info: 'An exclave of Azerbaijan: an autonomous republic, cut off from the rest of the country by Armenia. It has no official flag of its own. Like Azerbaijan, it is usually counted in Asia, and often in Europe too.',
      flag: ''
    },
    'Netherlands': {
      capital: { name: 'Amsterdam', lat: 52.3676, lon: 4.9041, info: '' },
      info: 'Often called Holland, which is really the name of two of its provinces; since 2020 the government uses only "the Netherlands" for the whole country. Amsterdam is the capital; the government, the parliament and the king work in The Hague. Aruba, Bonaire, Curaçao, Saba, Sint Eustatius and Sint Maarten are separate places on the maps of all countries and territories.',
      flag: 'maps/world/flags/nl.svg'
    },
    'North Macedonia': {
      capital: { name: 'Skopje', lat: 42, lon: 21.4335, info: '' },
      info: 'Called Macedonia until 2019.',
      flag: 'maps/world/flags/mk.svg'
    },
    'Northern Cyprus': {
      capital: { name: 'North Nicosia', lat: 35.1856, lon: 33.3823, info: '', nudge: [35.3, 33.55] },
      info: 'The island of Cyprus is in Asia, south of Türkiye, but it is usually counted in Europe too.',
      flag: 'maps/world/flags/northern-cyprus.svg'
    },
    'Norway': {
      capital: { name: 'Oslo', lat: 59.9186, lon: 10.748, info: '' },
      info: 'Svalbard is a separate place on the maps of all countries and territories. Svalbard, far to the north, is shown in a box on these maps.',
      flag: 'maps/world/flags/no.svg'
    },
    'Orkney Islands': {
      info: '',
      flag: 'maps/world/flags/gb-ork.svg'
    },
    'Poland': {
      capital: { name: 'Warsaw', lat: 52.2309, lon: 21.0053, info: '' },
      info: '',
      flag: 'maps/world/flags/pl.svg'
    },
    'Portugal': {
      capital: { name: 'Lisbon', lat: 38.7247, lon: -9.1468, info: '' },
      info: 'The Azores and Madeira are separate places on the maps of all countries and territories. Madeira, off the coast of Africa, is usually counted in Africa (it is on the Africa maps). The Azores, far out in the Atlantic, are shown in a box on these maps.',
      flag: 'maps/world/flags/pt.svg'
    },
    'Romania': {
      capital: { name: 'Bucharest', lat: 44.4353, lon: 26.098, info: '' },
      info: '',
      flag: 'maps/world/flags/ro.svg'
    },
    'Russia': {
      capital: { name: 'Moscow', lat: 55.7541, lon: 37.6136, info: '' },
      info: 'Kaliningrad and Sakhalin are separate places on the maps of all countries and territories. Russia is in both Europe and Asia. Most Russians live in its European part, west of the Ural Mountains, where Moscow is; its Asian part, Siberia, is about three-quarters of its land. This map is cut off at 59° E, near the Urals.',
      flag: 'maps/world/flags/ru.svg'
    },
    'San Marino': {
      capital: { name: 'San Marino', lat: 43.9361, lon: 12.4418, info: '' },
      info: '',
      flag: 'maps/world/flags/sm.svg'
    },
    'Sardinia': {
      info: '',
      flag: 'maps/world/flags/it-88.svg'
    },
    'Serbia': {
      capital: { name: 'Belgrade', lat: 44.8206, lon: 20.466, info: '' },
      info: '',
      flag: 'maps/world/flags/rs.svg'
    },
    'Shetland Islands': {
      info: '',
      flag: 'maps/world/flags/gb-zet.svg'
    },
    'Sicily': {
      info: '',
      flag: 'maps/world/flags/it-82.svg'
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
    'South Ossetia': {
      capital: { name: 'Tskhinvali', lat: 42.2325, lon: 43.975, info: '' },
      info: 'In the Caucasus mountains, part of Georgia. It broke away in 1991-1992 and governs itself with Russia\'s support. Russia and a few other countries have recognised it as independent since 2008; most countries count it as part of Georgia. Like Georgia, it is usually counted in Asia, and often in Europe too.',
      flag: 'maps/world/flags/south-ossetia.svg'
    },
    'Spain': {
      capital: { name: 'Madrid', lat: 40.402, lon: -3.6853, info: '' },
      info: 'The Balearic Islands, the Canary Islands, Ceuta and Melilla are separate places on the maps of all countries and territories. Spain is mostly in Europe; the Canary Islands, Ceuta and Melilla are in Africa (they are on the Africa maps).',
      flag: 'maps/world/flags/es.svg'
    },
    'Svalbard': {
      info: 'Arctic islands, part of Norway. They are shown in a box, moved south from their real place far north of Norway.',
      flag: ''
    },
    'Sweden': {
      capital: { name: 'Stockholm', lat: 59.3241, lon: 18.0663, info: '' },
      info: '',
      flag: 'maps/world/flags/se.svg'
    },
    'Switzerland': {
      capital: { name: 'Bern', lat: 46.9167, lon: 7.467, info: '' },
      info: '',
      flag: 'maps/world/flags/ch.svg'
    },
    'Transnistria': {
      capital: { name: 'Tiraspol', lat: 46.8531, lon: 29.64, info: '' },
      info: 'A strip of land along the Dniester river, part of Moldova. It broke away in 1990-1992 and has governed itself since, with Russian troops based there. No UN member recognises it; most countries count it as part of Moldova.',
      flag: 'maps/world/flags/transnistria.svg'
    },
    'Türkiye': {
      capital: { name: 'Ankara', lat: 39.9292, lon: 32.8624, info: '' },
      info: 'Formerly called Turkey in English: the country asked to be called Türkiye in 2022. Türkiye is in both Asia and Europe. Most of it is Anatolia, in Asia; the small part west of the Bosporus, with part of Istanbul, is in Europe.',
      flag: 'maps/world/flags/tr.svg'
    },
    'Ukraine': {
      capital: { name: 'Kyiv', lat: 50.4353, lon: 30.5147, info: '' },
      info: '',
      flag: 'maps/world/flags/ua.svg'
    },
    'United Kingdom': {
      capital: { name: 'London', lat: 51.5019, lon: -0.1187, info: '' },
      info: 'Anguilla, Bermuda, the British Virgin Islands, the Cayman Islands, the Falkland Islands, Gibraltar, Guernsey, the Hebrides, the Isle of Man, Jersey, Montserrat, the Orkney Islands, the Pitcairn Islands, Saint Helena, the Shetland Islands, Tristan da Cunha and the Turks and Caicos Islands are separate places on the maps of all countries and territories.',
      flag: 'maps/world/flags/gb.svg'
    },
    'Vatican City': {
      info: '',
      flag: 'maps/world/flags/va.svg'
    },
    'Åland Islands': {
      info: '',
      flag: 'maps/world/flags/ax.svg'
    }
  }
});
