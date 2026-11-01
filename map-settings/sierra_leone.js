/* ==========================================================================
   MAP SETTINGS: Sierra Leone   (hand-edited - the map SHAPES are in maps/sierra_leone.js)
   --------------------------------------------------------------------------
   This file can be edited freely; nothing needs to be regenerated.
   Each map has one shapes file in maps/ and one settings file in map-settings/
   with the SAME NAME. To add a map, copy this file, change it, and add its
   name to the "maps" list in config.js. Game-wide settings are in config.js.

   LANGUAGE: the text in this file (name, blurb, credit, region and capital names, info) is in the
   DEFAULT language set in config.js. Translations go in lang/maps/<map id>/<language>.js
   (see lang/maps/sierra_leone/french.js), so this file never needs duplicating.

   MAP-LEVEL SETTINGS
     id            must match the id in the shapes file
     name, blurb   title and one-line description on the menu
     credit        data credit shown under the map (leave '' for none)
     image         optional picture shown at the right of this map's menu card (e.g. a flag),
                   as a path from index.html such as 'flags/sierra_leone.svg'. It is scaled down
                   automatically to fit, so any size works. Leave out for no picture.
     orientation   'vertical' (default) or 'horizontal' (gives the map a wider page)
     zoom_levels   number of + presses from Full view to maximum zoom (default: config.js)
     zoom_step     optional: how much each + press zooms in (default: config.js)
     pass_accuracy accuracy goal (%) per scored mode: { regions: 80, capitals: 0, flags: 0 }.
                   Leave a mode out to use the default in config.js. 0 = no goal: not required for
                   SCORM "passed" and not shown on the menu. "passed" is sent when every goal above 0
                   (in every map) has been reached.
     skip          true / false (default true), or per mode { regions: true, capitals: false }:
                   shows the arrow buttons that skip a prompt and go back to a skipped one.
                   config.js skip_enabled, if set to true or false, overrides this for all maps.
     modes         turn game modes on (true) or off (false); a mode left out uses the
                   default in config.js. practice, regions, capitals, flags.
                   (capitals needs capital data; flags needs a flag image on the regions.)

   REGION SETTINGS (inside "regions", keyed by the region's exact name)
     province      kept for future use
     capital       { name, lat, lon, info } - lat/lon as shown on Google Maps.
                   Optional hide_in_practice: true keeps it out of Practice mode.
     info          text shown in the Practice-mode information panel (optional)
     flag          path to a flag image, e.g. 'flags/bo.png' (optional)
   Anything left empty ('') is simply not shown. Region names must match the
   shapes file exactly; the game logs a warning in the browser console if not.
   ========================================================================== */
(window.GeoMapSettings = window.GeoMapSettings || []).push({
  id: 'sierra_leone',
  name: 'Sierra Leone',
  blurb: 'Find the 16 districts',
  image: 'flags/sierra_leone.svg',
  credit: 'Boundaries: Sierra Leone - Subnational Administrative Boundaries (COD-AB), Government of Sierra Leone / OCHA / ITOS, via the Humanitarian Data Exchange (data.humdata.org/dataset/cod-ab-sle). License: CC BY-IGO. Modified: Karene, Bombali, Falaba and Koinadugu districts redrawn to reflect the split of Gbanti Kamarank and Nieni chiefdoms.',
  orientation: 'vertical',
  zoom_levels: 4,
  pass_accuracy: { regions: 80, capitals: 0, flags: 0 },
  skip: true,
  modes: { practice: true, regions: true, capitals: true, flags: false },

  regions: {
    'Kailahun': {
      province: 'Eastern',
      capital: { name: 'Kailahun', lat: 8.2778, lon: -10.5722, info: '' },
      info: '',
      flag: ''
    },
    'Kenema': {
      province: 'Eastern',
      capital: { name: 'Kenema', lat: 7.8767, lon: -11.1875, info: '' },
      info: '',
      flag: ''
    },
    'Kono': {
      province: 'Eastern',
      capital: { name: 'Koidu', lat: 8.6439, lon: -10.9714, info: '' },
      info: '',
      flag: ''
    },
    'Bombali': {
      province: 'Northern',
      capital: { name: 'Makeni', lat: 8.8833, lon: -12.05, info: '' },
      info: '',
      flag: ''
    },
    'Falaba': {
      province: 'Northern',
      capital: { name: 'Bendugu', lat: 9.53, lon: -10.96, info: '' },
      info: '',
      flag: ''
    },
    'Koinadugu': {
      province: 'Northern',
      capital: { name: 'Kabala', lat: 9.5833, lon: -11.55, info: '' },
      info: '',
      flag: ''
    },
    'Tonkolili': {
      province: 'Northern',
      capital: { name: 'Magburaka', lat: 8.7167, lon: -11.95, info: '' },
      info: '',
      flag: ''
    },
    'Kambia': {
      province: 'North West',
      capital: { name: 'Kambia', lat: 9.126, lon: -12.9187, info: '' },
      info: '',
      flag: ''
    },
    'Karene': {
      province: 'North West',
      capital: { name: 'Kamakwie', lat: 9.5, lon: -12.25, info: '' },
      info: '',
      flag: ''
    },
    'Port Loko': {
      province: 'North West',
      capital: { name: 'Port Loko', lat: 8.7667, lon: -12.7833, info: '' },
      info: '',
      flag: ''
    },
    'Bo': {
      province: 'Southern',
      capital: { name: 'Bo', lat: 7.9647, lon: -11.7383, info: '' },
      info: '',
      flag: ''
    },
    'Bonthe': {
      province: 'Southern',
      capital: { name: 'Mattru Jong', lat: 7.5997, lon: -12.1667, info: '' },
      info: '',
      flag: ''
    },
    'Moyamba': {
      province: 'Southern',
      capital: { name: 'Moyamba', lat: 8.1597, lon: -12.4331, info: '' },
      info: '',
      flag: ''
    },
    'Pujehun': {
      province: 'Southern',
      capital: { name: 'Pujehun', lat: 7.35, lon: -11.7167, info: '' },
      info: '',
      flag: ''
    },
    'Western Area Rural': {
      province: 'Western Area',
      capital: { name: 'Waterloo', lat: 8.3361, lon: -13.0714, info: '' },
      info: '',
      flag: ''
    },
    'Western Area Urban': {
      province: 'Western Area',
      capital: { name: 'Freetown', lat: 8.484, lon: -13.2299, info: '' },
      info: '',
      flag: ''
    }
  }
});
