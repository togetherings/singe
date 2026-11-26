# Natural Earth data (World and Africa maps)

The source data for the World map's tools: [Natural Earth](https://www.naturalearthdata.com/) 1:10m, **version 5.1.2**
(May 2022, the newest release; from github.com/nvkelso/natural-earth-vector, tag v5.1.2, except the populated places,
from naturalearthdata.com). Natural Earth is in the public domain: it can be shared and changed freely, and no credit is
required (SINGE credits it anyway, in CREDITS.md). These files are only for rebuilding the maps: they are never in the
game's zips (`data/*` is in `exclude` in edugame.json). Unzip them before use.

| File | Used by |
|---|---|
| `ne_10m_admin_0_countries.geojson.zip` | `tools/world.py`: every border and island of `maps/world/shapes.js` (the World and Africa maps) |
| `ne_10m_lakes.geojson.zip` | `tools/world.py --lakes`: the lakes that cross borders, and the Great Lakes |
| `ne_10m_populated_places_simple.zip` | `tools/world_settings.py`: the capitals in the first version of `maps/world/settings.js` (hand-edited since) |

Rebuild the World map's shapes (from the repository's top folder, after unzipping into `/tmp/ne`):

    python3 tools/world.py /tmp/ne/ne_10m_admin_0_countries.geojson --lakes /tmp/ne/ne_10m_lakes.geojson --out maps/world/shapes.js

Not kept here, because no tool reads them: *Admin 0 – Disputed Areas* (only consulted for the Western Sahara border:
see the comment in `tools/world.py`) and *Rivers and Lake Centerlines* (river lines, not drawn).

Before November 2026 the World map was built from Natural Earth 4.0.0 (2017).
