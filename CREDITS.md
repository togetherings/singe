# Credits and data sources

- **Boundaries, lakes and capitals (World map):** [Natural Earth](https://www.naturalearthdata.com/) 5.1.2, 1:10m Admin 0 – Countries, Lakes and Populated Places (in `data/natural_earth/`). Public domain. Borders follow Natural Earth's de facto lines, which not everyone agrees with.
- **Flags (`maps/world/flags/`):** downloaded from [Flagpedia](https://flagpedia.net/download), whose flag images are in turn based on Wikimedia Commons. Please check Flagpedia's and Wikimedia's current terms before redistributing. Many national flags are in the public domain, but a few images on Wikimedia carry their own licence conditions.
- **Flags of Somaliland, Ceuta, Melilla, Tristan da Cunha, the Canary Islands and Madeira** (`maps/world/flags/somaliland.svg`, `es-ce`, `es-ml`, `sh-ta`, `es-cn`, `pt-30`): from Wikipedia (Wikimedia Commons), public domain.
- **Flags of England, Scotland, Wales, Northern Ireland (the Ulster Banner), Cornwall (Saint Piran's flag), the Hebrides (the Western Isles Council's), Orkney and Shetland** (`maps/world/flags/gb-eng`, `gb-sct`, `gb-wls`, `gb-nir`, `gb-con`, `gb-els`, `gb-ork`, `gb-zet`): from Wikipedia (Wikimedia Commons), public domain.
- **British Isles map:** Natural Earth 5.1.2 (public domain): Admin 0 – Map Units, and Cornwall's border from Admin 1 – States, Provinces; lakes from Natural Earth's lakes.
- **France map:** Natural Earth 5.1.2 (public domain): Admin 1 – States, Provinces, France's departments merged into its regions, with its neighbours' provinces.
- **Flags of Northern Cyprus, Crimea, Kaliningrad, Newfoundland and Labrador, Okinawa, Rapa Nui, Sakhalin, Sardinia, Sicily, Tasmania, the Azores, the Balearic Islands, Saba and Sint Eustatius** (`maps/world/flags/`): from Wikipedia (Wikimedia Commons), public domain.
- **US state and territory flags** (`maps/us/flags/`): from Wikipedia (Wikimedia Commons), public domain.
- **British Isles menu card** (`maps/british_isles/flag.svg`): the UK's and Ireland's flags (from `maps/world/flags/`) split diagonally.
- Flags have had their metadata removed (`tools/clean_svg.py`); Tristan da Cunha's is optimised (see `data/flag_sources/README.md`).
- **Africa maps:** the World map's boundaries and capitals (above). Regions: the [African Union's](https://au.int/en/member_states/countryprofiles2).
- **Sierra Leone map and `data/sierra_leone/`:** based on *Sierra Leone - Subnational Administrative Boundaries* (COD-AB SLE), Government of Sierra Leone / OCHA / ITOS, via the Humanitarian Data Exchange (<https://data.humdata.org/dataset/cod-ab-sle#data-and-resources>), licence CC BY-IGO. **Modified and unofficial:** built on the best publicly available data at the time, with changes listed in `data/sierra_leone/README.md`. The original publishers do not endorse these changes.
- **United States map:** see the `credit` line in `maps/us/settings.js` and the header of `maps/us/shapes.js`.
- **Code:** MIT licence, see `LICENSE`.
