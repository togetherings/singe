/* ==========================================================================
   MAP TEXT: United States in French
   --------------------------------------------------------------------------
   Translated text for ONE map in ONE language. Only text goes here - shapes,
   coordinates, flags and goals stay in map-settings/us.js. Anything left out
   is shown the way the settings file has it (the default language).

   TO ADD A LANGUAGE FOR THIS MAP
     1. Copy this file to lang/maps/us/<language>.js (the file name is the
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
  map: 'us',
  language: 'french',

  name: 'États-Unis',
  blurb: 'Trouvez les 50 états, D.C. et 5 territoires',
  credit: 'Limites : U.S. Census Bureau (domaine public). L\'Alaska, Hawaï et les territoires sont rapprochés et redimensionnés, et Washington D.C. est agrandi.',

  regions: {
    // Only names that differ in French are listed. The capitals are not listed here, so they keep
    // their default-language names (an example of a partial translation).
    'American Samoa': { name: 'Samoa américaines' },
    'California': { name: 'Californie' },
    'District of Columbia': { name: 'District de Columbia' },
    'Florida': { name: 'Floride' },
    'Georgia': { name: 'Géorgie' },
    'Hawaii': { name: 'Hawaï' },
    'Louisiana': { name: 'Louisiane' },
    'New Mexico': { name: 'Nouveau-Mexique' },
    'North Carolina': { name: 'Caroline du Nord' },
    'North Dakota': { name: 'Dakota du Nord' },
    'Northern Mariana Islands': { name: 'Îles Mariannes du Nord' },
    'Pennsylvania': { name: 'Pennsylvanie' },
    'Puerto Rico': { name: 'Porto Rico' },
    'South Carolina': { name: 'Caroline du Sud' },
    'South Dakota': { name: 'Dakota du Sud' },
    'U.S. Virgin Islands': { name: 'Îles Vierges des États-Unis' },
    'Virginia': { name: 'Virginie' },
    'West Virginia': { name: 'Virginie-Occidentale' }
  }
});
