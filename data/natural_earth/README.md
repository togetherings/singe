# Natural Earth data (World and Africa maps)

The source data for the World map's tools: [Natural Earth](https://www.naturalearthdata.com/) 1:10m, **version 5.1.2**
(May 2022, the newest release; from github.com/nvkelso/natural-earth-vector, tag v5.1.2, except the populated places,
from naturalearthdata.com). Natural Earth is in the public domain: it can be shared and changed freely, and no credit is
required (SINGE credits it anyway, in CREDITS.md). These files are only for rebuilding the maps: they are never in the
game's zips (`data/*` is in `exclude` in edugame.json). Unzip them before use.

| File | Used by |
|---|---|
| `ne_10m_admin_0_countries.geojson.zip` | `tools/world.py`: every border and island of `maps/world/shapes.js` (the World and Africa maps) |
| `ne_10m_admin_0_disputed_areas.geojson.zip` | `tools/world.py --disputed`: *Admin 0 – Disputed Areas* (the whole file): the lines inside Moldova and Georgia along which Transnistria, Abkhazia and South Ossetia are cut out (`BREAKAWAY_CUT`), the line along which Western Sahara is cut off Morocco, and the outlines that pick Crimea, Ceuta, Melilla and Isla del Perejil out of Russia and Spain |
| `ne_10m_lakes.geojson.zip` | `tools/world.py --lakes`: the lakes that cross borders, and the Great Lakes |
| `ne_10m_admin_0_map_units_british_isles.geojson.zip` | `tools/british_isles.py`: Natural Earth's *Admin 0 – Map Units* (the UK as England, Scotland, Wales and N. Ireland), only the 17 units that reach the British Isles map's area |
| `ne_10m_admin_1_cornwall.geojson.zip` | `tools/british_isles.py`: Cornwall alone, from *Admin 1 – States, Provinces* |
| `ne_10m_admin_1_france_area.geojson.zip` | `tools/france.py`: *Admin 1 – States, Provinces* for France (all 101 departments, overseas included) and its neighbours' provinces near the map (and Suriname's and Brazil's near French Guiana) |
| `ne_10m_populated_places_simple.zip` | `tools/world_settings.py`: the capitals in the first version of `maps/world/settings.js` (hand-edited since) |

Rebuild the World map's shapes (from the repository's top folder, after unzipping into `/tmp/ne`):

    python3 tools/world.py /tmp/ne/ne_10m_admin_0_countries.geojson --lakes /tmp/ne/ne_10m_lakes.geojson \
        --disputed /tmp/ne/ne_10m_admin_0_disputed_areas.geojson --out maps/world/shapes.js

Rebuild the British Isles map's shapes (needs `pip install shapely`):

    python3 tools/british_isles.py /tmp/ne/ne_10m_admin_0_map_units_british_isles.geojson /tmp/ne/ne_10m_admin_1_cornwall.geojson \
        --lakes /tmp/ne/ne_10m_lakes.geojson --out maps/british_isles/shapes.js

Rebuild the France map's shapes (needs `pip install shapely`; from `tools/`):

    python3 map_generation.py /tmp/ne/ne_10m_admin_1_france_area.geojson --id france --out ../maps/france/shapes.js \
        --script france.py --scale 9000

The extracts are cut from the full 5.1.2 files (github.com/nvkelso/natural-earth-vector, tag v5.1.2,
`geojson/`) with nothing else changed: the map units that touch longitude -14 to 6, latitude 47 to 63, the
admin-1 feature named Cornwall, and for France every admin-1 feature of France plus those of its neighbours that touch
longitude -13 to 19, latitude 35.5 to 56 (Suriname and Brazil: -58.5 to -49, 0 to 7.5). The full files give the same
maps.

Not kept here, because no tool reads it: *Rivers and Lake Centerlines* (river lines, not drawn).

Before November 2026 the World map was built from Natural Earth 4.0.0 (2017).
