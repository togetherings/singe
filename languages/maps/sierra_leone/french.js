/* ==========================================================================
   MAP TEXT: Sierra Leone in French
   --------------------------------------------------------------------------
   Translated text for ONE map in ONE language. Only text goes here - shapes,
   coordinates, flags and goals stay in map-settings/sierra_leone.js. Anything left out
   is shown the way the settings file has it (the default language).

   TO ADD A LANGUAGE FOR THIS MAP
     1. Copy this file to languages/maps/sierra_leone/<language>.js (the file name is the
        language's id, the same as in languages/<language>.js and the "languages"
        list in config.js).
     2. Change "language" below and translate the text.

   MAP-LEVEL TEXT    name, blurb, credit
   REGION TEXT       keyed by the region's exact (default language) name, with any of:
                       name          the region's name
                       capital       its capital city's name
                       info          text of the Practice-mode information panel
                       capital_info  information panel text of the capital city
   ========================================================================== */
(window.GeoMapText = window.GeoMapText || []).push({
  map: 'sierra_leone',          // the map's id
  language: 'french',           // the language's id (file name in languages/)

  blurb: 'Trouvez les 18 districts',
  credit: 'Limites : Sierra Leone - Subnational Administrative Boundaries (COD-AB), Gouvernement de la Sierra Leone / OCHA / ITOS, via la Humanitarian Data Exchange (data.humdata.org/dataset/cod-ab-sle). Licence : CC BY-IGO. NON OFFICIEL, modifié par SINGE à partir des meilleures données publiques disponibles : les districts de Karene, Bombali, Falaba et Koinadugu ont été redessinés pour refléter la division des chefferies de Gbanti Kamaranka et de Nieni ; les nouveaux districts de Bandajuma et de Kpanguima (avec la nouvelle chefferie de Jahn) ont été ajoutés.',

  regions: {
    // Most district names are the same in French, so only these are listed.
    'Kpanguima': { info: 'Nouveau district, aussi orthographié Kpanguma ou Panguma. Il est formé des chefferies de Lower Bambara, Malegohun (Kenema), Yawei, Penguia, Kpeje West, Kpeje Bongre (Kailahun) et de la nouvelle chefferie de Jahn, détachée de la chefferie de Njaluahun. Kpeje Bongre forme désormais deux chefferies (Kpeje et Bongre), montrées ici comme une seule. Ses limites ici sont non officielles et tirées des meilleures données publiques disponibles.' },
    'Bandajuma': { info: 'Nouveau district, formé des chefferies de Wonde (Bo), Sowa, Pejeh (Futa Peje), Barri, Makpele et Soro Gbema (Pujehun), et de Langrama, Niawa et Tunkia (Kenema). Ses limites ici sont non officielles et tirées des meilleures données publiques disponibles.' },
    'Western Area Rural': { name: 'Zone rurale de l\'Ouest' },
    'Western Area Urban': { name: 'Zone urbaine de l\'Ouest' }
  }
});
