/* ==========================================================================
   MAP TEXT: Sierra Leone in French
   --------------------------------------------------------------------------
   Translated text for ONE map in ONE language. Only text goes here - shapes,
   coordinates, flags and goals stay in map-settings/sierra_leone.js. Anything left out
   is shown the way the settings file has it (the default language).

   TO ADD A LANGUAGE FOR THIS MAP
     1. Copy this file to lang/maps/sierra_leone/<language>.js (the file name is the
        language's id, the same as in lang/<language>.js and the "languages"
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
  language: 'french',           // the language's id (file name in lang/)

  blurb: 'Trouvez les 16 districts',
  credit: 'Limites : Sierra Leone - Subnational Administrative Boundaries (COD-AB), Gouvernement de la Sierra Leone / OCHA / ITOS, via la Humanitarian Data Exchange (data.humdata.org/dataset/cod-ab-sle). Licence : CC BY-IGO. Modifié : les districts de Karene, Bombali, Falaba et Koinadugu ont été redessinés pour refléter la division des chefferies de Gbanti Kamarank et de Nieni.',

  regions: {
    // Most district names are the same in French, so only these two are listed.
    'Western Area Rural': { name: 'Zone rurale de l\'Ouest' },
    'Western Area Urban': { name: 'Zone urbaine de l\'Ouest' }
  }
});
