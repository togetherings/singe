# Natural Earth data (World and Africa maps)

The source data for the World map's tools, from [Natural Earth](https://www.naturalearthdata.com/) 1:10m. Natural Earth
is in the public domain: it can be shared and changed freely, and no credit is required (SINGE credits it anyway, in
CREDITS.md). These files are only for rebuilding the maps: they are never in the game's zips (`data/*` is in
`exclude` in edugame.json). Unzip them before use.

| File | Natural Earth version | Used by |
|---|---|---|
| `ne_10m_lakes.geojson.zip` | 5.1.x (the same file in 5.1.1 and 5.1.2, from github.com/nvkelso/natural-earth-vector) | `tools/world.py --lakes`: the lakes that cross borders, and the Great Lakes. Gives exactly the lakes in `maps/world/shapes.js`. |
| `ne_10m_populated_places_simple.zip` | 5.1.2 (shapefile, from naturalearthdata.com) | `tools/world_settings.py`: the capitals in the first version of `maps/world/settings.js` (hand-edited since). |

## Still missing: the countries file

`tools/world.py` builds `maps/world/shapes.js` from Natural Earth's *Admin 0 – Countries* (`ne_10m_admin_0_countries`).
The copy it was first built from (a GeoJSON file, November 2026) isn't here, and no public release rebuilds the map
exactly: versions 4.1.0 to 5.1.2 differ in places (5.1.x adds Bir Tawil, Brazilian Island and the Southern Patagonian
Ice Field and spells eSwatini, and its outlines run the other way round, which stops the Western Sahara border fix).
Add that file here (zipped) if it turns up. Until then the shapes file is edited by hand for small changes (Ceuta and
Melilla were split off Spain that way, with the same split in `tools/world.py` for the next rebuild), and a rebuild from
a newer release will move borders slightly everywhere.

Not kept here, because no tool reads them: *Admin 0 – Disputed Areas* (only consulted for the Western Sahara border:
see the comment in `tools/world.py`) and *Rivers and Lake Centerlines* (river lines, not drawn).
