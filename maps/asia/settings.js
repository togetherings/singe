/* ==========================================================================
   MAP SETTINGS: Asia   (hand-edited - the map SHAPES are the World map's: maps/world/shapes.js)
   --------------------------------------------------------------------------
   Windows on the World map, like the Africa maps (see maps/africa/settings.js for how windows work: in_game, scope,
   insets, view_pad). Settings that are specific to these maps:
     view          [west, south, east, north] in degrees: the box the map shows, set by hand instead of the box around
                   the places in the game. North and Central Asia and the two whole-Asia maps use it to cut Russia off
                   at 62 deg N and 150 deg E (northern Siberia, Kamchatka and Chukotka would otherwise fill most of the
                   map: the World map's projection stretches land more the further north it is). The whole-Asia maps
                   reach 13.5 deg S for Christmas Island and the Cocos (Keeling) Islands, and 26 deg E for Russia's and
                   Türkiye's western borders (so most of Egypt shows too).
     variants      the seven maps of the Asia package (edugame.json lists each, with "scope": 'un' or 'all'). The
                   regional maps have UN countries only (and Palestine), as on the Africa maps:
                     North and Central Asia: the countries of ESCAP's North and Central Asia (the UN Economic and Social
                       Commission for Asia and the Pacific): Russia, the Caucasus and the five Central Asian countries,
                       which share their recent Soviet history.
                     East Asia: UN M49's Eastern Asia (China, Japan, Mongolia and the two Koreas).
                     Southeast Asia: ASEAN's 11 members (Timor-Leste joined in October 2025), the same as M49's.
                     South Asia: SAARC's 8 members (Afghanistan in, Iran not).
                     West Asia (the Middle East): M49's Western Asia without the Caucasus, plus Iran and Egypt.
                   (translations: maps/asia/lang/<code>.json)
   Places in two continents: Russia, Türkiye and Kazakhstan (Asia and Europe), Georgia, Azerbaijan and Armenia (between
   them: in Asia by the main ridge of the Caucasus, often counted in Europe), Cyprus and Northern Cyprus (in Asia, often
   counted in Europe), Egypt (Africa and Asia: Sinai) and Indonesia (Asia and Oceania: Western New Guinea). Each is on
   these maps and its note says so. They can be on the Europe, Africa or Oceania maps too. Christmas Island and the
   Cocos (Keeling) Islands (Australian, but on the Asian side of the Wallace Line) are on the Asia "all" map.
   Region settings: every place of any of the seven maps, with its capital, info and flag: the World map's
   (maps/world/settings.js), with the notes about continents added. The flags are the World map's (maps/world/flags/),
   so the package lists each one it uses.
   ========================================================================== */
(window.GeoMapSettings = window.GeoMapSettings || []).push({
  id: 'asia',
  name: 'Asia',
  blurb: 'Find the countries of Asia',
  credit: 'Boundaries and capitals: Natural Earth (public domain, naturalearthdata.com), as on the World map. Borders follow Natural Earth\'s de facto lines. Regions: ESCAP\'s North and Central Asia, ASEAN, SAARC and the UN\'s M49. Small countries and islands are marked with circles.',
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
    asia_north_central: {
      name: 'North and Central Asia',
      blurb: 'Find the 9 countries of North and Central Asia',
      orientation: 'horizontal',
      credit: 'Boundaries and capitals: Natural Earth (public domain, naturalearthdata.com), as on the World map. Borders follow Natural Earth\'s de facto lines. Regions: ESCAP\'s North and Central Asia, ASEAN, SAARC and the UN\'s M49. Small countries and islands are marked with circles. Russia is cut off in the north and east.',
      view: [26, 30, 150, 62],
      in_game: [
        'Armenia', 'Azerbaijan', 'Georgia', 'Kazakhstan', 'Kyrgyzstan', 'Russia', 'Tajikistan', 'Turkmenistan',
        'Uzbekistan'
      ]
    },
    asia_east: {
      name: 'East Asia',
      blurb: 'Find the 5 countries of East Asia',
      orientation: 'horizontal',
      in_game: [
        'China', 'Japan', 'Mongolia', 'North Korea', 'South Korea'
      ]
    },
    asia_southeast: {
      name: 'Southeast Asia',
      blurb: 'Find the 11 countries of Southeast Asia',
      orientation: 'horizontal',
      in_game: [
        'Brunei', 'Cambodia', 'Indonesia', 'Laos', 'Malaysia', 'Myanmar', 'Philippines', 'Singapore', 'Thailand',
        'Timor-Leste', 'Vietnam'
      ]
    },
    asia_south: {
      name: 'South Asia',
      blurb: 'Find the 8 countries of South Asia',
      orientation: 'vertical',
      in_game: [
        'Afghanistan', 'Bangladesh', 'Bhutan', 'India', 'Maldives', 'Nepal', 'Pakistan', 'Sri Lanka'
      ]
    },
    asia_west: {
      name: 'West Asia',
      blurb: 'Find the 17 countries of West Asia (the Middle East)',
      orientation: 'horizontal',
      in_game: [
        'Bahrain', 'Cyprus', 'Egypt', 'Iran', 'Iraq', 'Israel', 'Jordan', 'Kuwait', 'Lebanon', 'Oman', 'Palestine',
        'Qatar', 'Saudi Arabia', 'Syria', 'Türkiye', 'United Arab Emirates', 'Yemen'
      ]
    },
    asia: {
      name: 'Asia: UN countries',
      blurb: 'Find the 50 countries of Asia (49 UN members and Palestine)',
      orientation: 'horizontal',
      credit: 'Boundaries and capitals: Natural Earth (public domain, naturalearthdata.com), as on the World map. Borders follow Natural Earth\'s de facto lines. Regions: ESCAP\'s North and Central Asia, ASEAN, SAARC and the UN\'s M49. Small countries and islands are marked with circles. Russia is cut off in the north and east.',
      view: [26, -13.5, 150, 62],
      in_game: [
        'Afghanistan', 'Armenia', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Bhutan', 'Brunei', 'Cambodia', 'China',
        'Cyprus', 'Egypt', 'Georgia', 'India', 'Indonesia', 'Iran', 'Iraq', 'Israel', 'Japan', 'Jordan',
        'Kazakhstan', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Lebanon', 'Malaysia', 'Maldives', 'Mongolia', 'Myanmar',
        'Nepal', 'North Korea', 'Oman', 'Pakistan', 'Palestine', 'Philippines', 'Qatar', 'Russia', 'Saudi Arabia',
        'Singapore', 'South Korea', 'Sri Lanka', 'Syria', 'Tajikistan', 'Thailand', 'Timor-Leste', 'Turkmenistan',
        'Türkiye', 'United Arab Emirates', 'Uzbekistan', 'Vietnam', 'Yemen'
      ]
    },
    asia_all: {
      name: 'Asia: all countries and territories',
      blurb: 'Find every country and territory of Asia',
      orientation: 'horizontal',
      credit: 'Boundaries and capitals: Natural Earth (public domain, naturalearthdata.com), as on the World map. Borders follow Natural Earth\'s de facto lines. Regions: ESCAP\'s North and Central Asia, ASEAN, SAARC and the UN\'s M49. Small countries and islands are marked with circles. Russia is cut off in the north and east.',
      view: [26, -13.5, 150, 62],
      in_game: [
        'Abkhazia', 'Afghanistan', 'Armenia', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Bhutan', 'Brunei', 'Cambodia',
        'China', 'Christmas Island', 'Cocos (Keeling) Islands', 'Cyprus', 'Egypt', 'Georgia', 'Hong Kong', 'India',
        'Indonesia', 'Iran', 'Iraq', 'Israel', 'Japan', 'Jordan', 'Kazakhstan', 'Kuwait', 'Kyrgyzstan', 'Laos',
        'Lebanon', 'Macau', 'Malaysia', 'Maldives', 'Mongolia', 'Myanmar', 'Nepal', 'North Korea', 'Northern Cyprus',
        'Okinawa Islands', 'Oman', 'Pakistan', 'Palestine', 'Philippines', 'Qatar', 'Russia', 'Sakhalin',
        'Saudi Arabia', 'Singapore', 'South Korea', 'South Ossetia', 'Sri Lanka', 'Syria', 'Taiwan', 'Tajikistan',
        'Thailand', 'Timor-Leste', 'Turkmenistan', 'Türkiye', 'United Arab Emirates', 'Uzbekistan', 'Vietnam', 'Yemen'
      ]
    }
  },

  regions: {
    'Abkhazia': {
      capital: { name: 'Sukhumi', lat: 43.02, lon: 41.02, info: '' },
      info: 'On the Black Sea coast, part of Georgia. It broke away after a war in 1992-1993 and governs itself with Russia\'s support. Russia and a few other countries have recognised it as independent since 2008; most countries count it as part of Georgia. Like Georgia, it is usually counted in Asia, and often in Europe too.',
      flag: 'maps/world/flags/abkhazia.svg'
    },
    'Afghanistan': {
      capital: { name: 'Kabul', lat: 34.5186, lon: 69.1813, info: '' },
      info: '',
      flag: 'maps/world/flags/af.svg'
    },
    'Armenia': {
      capital: { name: 'Yerevan', lat: 40.1831, lon: 44.5116, info: '' },
      info: 'All of Armenia lies south of the Caucasus mountains, so it is in Asia, but it is a member of the Council of Europe and is often counted in Europe too.',
      flag: 'maps/world/flags/am.svg'
    },
    'Azerbaijan': {
      capital: { name: 'Baku', lat: 40.3972, lon: 49.8603, info: '' },
      info: 'Azerbaijan is between Europe and Asia. Most of it lies south of the main ridge of the Caucasus mountains, which is often taken as the line between them, so it is usually counted in Asia; a little of the north lies beyond it. It is a member of the Council of Europe and is often counted in Europe too.',
      flag: 'maps/world/flags/az.svg'
    },
    'Bahrain': {
      capital: { name: 'Manama', lat: 26.2361, lon: 50.5831, info: '', nudge: [27.136, 49.983] },
      info: '',
      flag: 'maps/world/flags/bh.svg'
    },
    'Bangladesh': {
      capital: { name: 'Dhaka', lat: 23.725, lon: 90.4066, info: '' },
      info: 'Formerly East Pakistan (until 1971).',
      flag: 'maps/world/flags/bd.svg'
    },
    'Bhutan': {
      capital: { name: 'Thimphu', lat: 27.473, lon: 89.639, info: '' },
      info: '',
      flag: 'maps/world/flags/bt.svg'
    },
    'Brunei': {
      capital: { name: 'Bandar Seri Begawan', lat: 4.8833, lon: 114.9333, info: '' },
      info: '',
      flag: 'maps/world/flags/bn.svg'
    },
    'Cambodia': {
      capital: { name: 'Phnom Penh', lat: 11.552, lon: 104.9147, info: '' },
      info: 'Called Kampuchea from 1975 to 1989.',
      flag: 'maps/world/flags/kh.svg'
    },
    'China': {
      capital: { name: 'Beijing', lat: 39.9017, lon: 116.3942, info: '' },
      info: '',
      flag: 'maps/world/flags/cn.svg'
    },
    'Christmas Island': {
      info: 'An Australian territory in the Indian Ocean, south of Java. It is on the Asian side of the Wallace Line (between Bali and Lombok), so it is on the Asia maps, though it is often listed with Australia in Oceania.',
      flag: 'maps/world/flags/cx.svg'
    },
    'Cocos (Keeling) Islands': {
      info: 'An Australian territory in the Indian Ocean, south-west of Sumatra. It is on the Asian side of the Wallace Line (between Bali and Lombok), so it is on the Asia maps, though it is often listed with Australia in Oceania.',
      flag: 'maps/world/flags/cc.svg'
    },
    'Cyprus': {
      capital: { name: 'Nicosia', lat: 35.1667, lon: 33.3666, info: '', nudge: [34.97, 33.37] },
      info: 'The island of Cyprus is in Asia, south of Türkiye, but Cyprus is a member of the European Union and is usually counted in Europe too.',
      flag: 'maps/world/flags/cy.svg'
    },
    'Egypt': {
      capital: { name: 'Cairo', lat: 30.0519, lon: 31.248, info: '' },
      info: 'Cairo is the capital. A planned New Capital is being built to the east of Cairo, and much of the government has moved there. Egypt is in both Africa and Asia: most of it is in Africa, but the Sinai Peninsula, east of the Suez Canal, is in Asia.',
      flag: 'maps/world/flags/eg.svg'
    },
    'Georgia': {
      capital: { name: 'Tbilisi', lat: 41.727, lon: 44.7888, info: '' },
      info: 'Georgia is between Europe and Asia. Most of it lies south of the main ridge of the Caucasus mountains, which is often taken as the line between them, so it is usually counted in Asia; a little lies north of it. It is a member of the Council of Europe and is often counted in Europe too.',
      flag: 'maps/world/flags/ge.svg'
    },
    'Hong Kong': {
      info: '',
      flag: 'maps/world/flags/hk.svg'
    },
    'India': {
      capital: { name: 'New Delhi', lat: 28.6, lon: 77.2, info: '' },
      info: '',
      flag: 'maps/world/flags/in.svg'
    },
    'Indonesia': {
      capital: { name: 'Jakarta', lat: -6.1725, lon: 106.8275, info: '' },
      info: 'Jakarta is the capital. A new capital, Nusantara, is being built on Borneo; the move is planned but hasn\'t happened yet. Indonesia is in both Asia and Oceania: Western New Guinea (its Papua provinces), on the island of New Guinea, is usually counted as part of Oceania.',
      flag: 'maps/world/flags/id.svg'
    },
    'Iran': {
      capital: { name: 'Tehran', lat: 35.6739, lon: 51.4224, info: '' },
      info: 'Called Persia in English until 1935. Tehran is the capital; the government has proposed moving it to the Makran coast in the south, but no move has begun.',
      flag: 'maps/world/flags/ir.svg'
    },
    'Iraq': {
      capital: { name: 'Baghdad', lat: 33.3406, lon: 44.3919, info: '' },
      info: '',
      flag: 'maps/world/flags/iq.svg'
    },
    'Israel': {
      capital: { name: 'Tel Aviv', lat: 32.0819, lon: 34.7681, info: '' },
      info: 'Israel considers Jerusalem its capital, and its government and parliament sit there; its status is disputed, and most countries keep their embassies in Tel Aviv.',
      flag: 'maps/world/flags/il.svg'
    },
    'Japan': {
      capital: { name: 'Tokyo', lat: 35.687, lon: 139.7495, info: '' },
      info: '',
      flag: 'maps/world/flags/jp.svg'
    },
    'Jordan': {
      capital: { name: 'Amman', lat: 31.952, lon: 35.9314, info: '' },
      info: '',
      flag: 'maps/world/flags/jo.svg'
    },
    'Kazakhstan': {
      capital: { name: 'Astana', lat: 51.1694, lon: 71.4491, info: '' },
      info: 'Astana has been the capital since 1997 (before that it was Almaty); it was called Nur-Sultan from 2019 to 2022. Kazakhstan is in both Asia and Europe: a small part, west of the Ural River, is counted as Europe.',
      flag: 'maps/world/flags/kz.svg'
    },
    'Kuwait': {
      capital: { name: 'Kuwait City', lat: 29.3717, lon: 47.9764, info: '' },
      info: '',
      flag: 'maps/world/flags/kw.svg'
    },
    'Kyrgyzstan': {
      capital: { name: 'Bishkek', lat: 42.875, lon: 74.5833, info: '' },
      info: 'Formerly called Kirghizia (until 1991).',
      flag: 'maps/world/flags/kg.svg'
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
    'Macau': {
      info: '',
      flag: 'maps/world/flags/mo.svg'
    },
    'Malaysia': {
      capital: { name: 'Kuala Lumpur', lat: 3.1398, lon: 101.6887, info: '' },
      info: 'Kuala Lumpur is the capital; most of the government has moved to Putrajaya, nearby.',
      flag: 'maps/world/flags/my.svg'
    },
    'Maldives': {
      capital: { name: 'Malé', lat: 4.172, lon: 73.5089, info: '' },
      info: '',
      flag: 'maps/world/flags/mv.svg'
    },
    'Mongolia': {
      capital: { name: 'Ulaanbaatar', lat: 47.9186, lon: 106.9147, info: '' },
      info: '',
      flag: 'maps/world/flags/mn.svg'
    },
    'Myanmar': {
      capital: { name: 'Naypyidaw', lat: 19.745, lon: 96.1297, info: '' },
      info: 'Formerly called Burma (the name changed in 1989, and some countries still use it). Naypyidaw has been the capital since 2005; before that it was Yangon (Rangoon), the largest city.',
      flag: 'maps/world/flags/mm.svg'
    },
    'Nepal': {
      capital: { name: 'Kathmandu', lat: 27.7186, lon: 85.3147, info: '' },
      info: '',
      flag: 'maps/world/flags/np.svg'
    },
    'North Korea': {
      capital: { name: 'Pyongyang', lat: 39.0214, lon: 125.7527, info: '' },
      info: '',
      flag: 'maps/world/flags/kp.svg'
    },
    'Northern Cyprus': {
      capital: { name: 'North Nicosia', lat: 35.1856, lon: 33.3823, info: '', nudge: [35.3, 33.55] },
      info: 'The island of Cyprus is in Asia, south of Türkiye, but it is usually counted in Europe too.',
      flag: 'maps/world/flags/northern-cyprus.svg'
    },
    'Okinawa Islands': {
      info: '',
      flag: 'maps/world/flags/jp-47.svg'
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
    'Palestine': {
      capital: { name: 'Ramallah', lat: 31.9038, lon: 35.2034, info: '' },
      info: 'Palestine declares East Jerusalem its capital; the Palestinian Authority\'s government works in Ramallah.',
      flag: 'maps/world/flags/ps.svg'
    },
    'Philippines': {
      capital: { name: 'Manila', lat: 14.6061, lon: 120.9803, info: '' },
      info: '',
      flag: 'maps/world/flags/ph.svg'
    },
    'Qatar': {
      capital: { name: 'Doha', lat: 25.2866, lon: 51.533, info: '', nudge: [24.387, 52.433] },
      info: '',
      flag: 'maps/world/flags/qa.svg'
    },
    'Russia': {
      capital: { name: 'Moscow', lat: 55.7541, lon: 37.6136, info: '' },
      info: 'Russia is in both Europe and Asia. Its Asian part, Siberia, east of the Ural Mountains, is about three-quarters of its land, but most Russians live in its European part, west of the Urals, where Moscow is. This map is cut off in the north and east, so northern Siberia, Kamchatka and Chukotka don\'t show.',
      flag: 'maps/world/flags/ru.svg'
    },
    'Sakhalin': {
      info: '',
      flag: 'maps/world/flags/ru-sak.svg'
    },
    'Saudi Arabia': {
      capital: { name: 'Riyadh', lat: 24.6345, lon: 46.7205, info: '' },
      info: '',
      flag: 'maps/world/flags/sa.svg'
    },
    'Singapore': {
      capital: { name: 'Singapore', lat: 1.295, lon: 103.8539, info: '' },
      info: '',
      flag: 'maps/world/flags/sg.svg'
    },
    'South Korea': {
      capital: { name: 'Seoul', lat: 37.5683, lon: 126.9978, info: '' },
      info: 'Seoul is the capital. Many government ministries have moved to Sejong, a city built to be the administrative capital.',
      flag: 'maps/world/flags/kr.svg'
    },
    'South Ossetia': {
      capital: { name: 'Tskhinvali', lat: 42.2325, lon: 43.975, info: '' },
      info: 'In the Caucasus mountains, part of Georgia. It broke away in 1991-1992 and governs itself with Russia\'s support. Russia and a few other countries have recognised it as independent since 2008; most countries count it as part of Georgia. Like Georgia, it is usually counted in Asia, and often in Europe too.',
      flag: 'maps/world/flags/south-ossetia.svg'
    },
    'Sri Lanka': {
      capital: { name: 'Sri Jayawardenepura Kotte', lat: 6.9108, lon: 79.8878, info: '' },
      info: 'Formerly called Ceylon (until 1972). Sri Jayawardenepura Kotte is the official capital, where parliament meets; Colombo, next to it, is the largest city and where most of the government works.',
      flag: 'maps/world/flags/lk.svg'
    },
    'Syria': {
      capital: { name: 'Damascus', lat: 33.502, lon: 36.2981, info: '' },
      info: '',
      flag: 'maps/world/flags/sy.svg'
    },
    'Taiwan': {
      capital: { name: 'Taipei', lat: 25.0358, lon: 121.5683, info: '' },
      info: '',
      flag: 'maps/world/flags/tw.svg'
    },
    'Tajikistan': {
      capital: { name: 'Dushanbe', lat: 38.56, lon: 68.7739, info: '' },
      info: '',
      flag: 'maps/world/flags/tj.svg'
    },
    'Thailand': {
      capital: { name: 'Bangkok', lat: 13.7519, lon: 100.5147, info: '' },
      info: 'Formerly called Siam (until 1939).',
      flag: 'maps/world/flags/th.svg'
    },
    'Timor-Leste': {
      capital: { name: 'Dili', lat: -8.5594, lon: 125.5795, info: '' },
      info: 'Also known as East Timor.',
      flag: 'maps/world/flags/tl.svg'
    },
    'Turkmenistan': {
      capital: { name: 'Ashgabat', lat: 37.95, lon: 58.3833, info: '' },
      info: '',
      flag: 'maps/world/flags/tm.svg'
    },
    'Türkiye': {
      capital: { name: 'Ankara', lat: 39.9292, lon: 32.8624, info: '' },
      info: 'Formerly called Turkey in English: the country asked to be called Türkiye in 2022. Türkiye is in both Asia and Europe. Most of it is Anatolia, in Asia; the small part west of the Bosporus, with part of Istanbul, is in Europe.',
      flag: 'maps/world/flags/tr.svg'
    },
    'United Arab Emirates': {
      capital: { name: 'Abu Dhabi', lat: 24.4667, lon: 54.3666, info: '' },
      info: '',
      flag: 'maps/world/flags/ae.svg'
    },
    'Uzbekistan': {
      capital: { name: 'Tashkent', lat: 41.3038, lon: 69.2688, info: '' },
      info: '',
      flag: 'maps/world/flags/uz.svg'
    },
    'Vietnam': {
      capital: { name: 'Hanoi', lat: 21.0353, lon: 105.8481, info: '' },
      info: '',
      flag: 'maps/world/flags/vn.svg'
    },
    'Yemen': {
      capital: { name: 'Sanaa', lat: 15.3567, lon: 44.2046, info: '' },
      info: '',
      flag: 'maps/world/flags/ye.svg'
    }
  }
});
