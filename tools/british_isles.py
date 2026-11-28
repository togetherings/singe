#!/usr/bin/env python3
"""Build maps/british_isles/shapes.js: the British Isles map, from Natural Earth 5.1.2 (public domain).

    pip install shapely
    python3 tools/british_isles.py NE/ne_10m_admin_0_map_units.geojson NE/ne_10m_admin_1_states_provinces.geojson \
        --lakes NE/ne_10m_lakes.geojson --out maps/british_isles/shapes.js

(The repository keeps the parts of those files this tool reads in data/natural_earth/: see its README.)

The map is a world-type map (the game draws it like the Africa maps: a window, with the regions in settings.js
"in_game" asked about and everything else grey), but at ten times the World map's detail, and squeezed sideways
(projection "x_scale") so that Great Britain keeps its true shape at this latitude.

  1. The UK's four nations come from Natural Earth's map units (England, Scotland, Wales, N. Ireland), with Ireland,
     the Isle of Man, Jersey and Guernsey (with Alderney and Sark) and the neighbouring countries, cut to the area.
  2. Cornwall (with the Isles of Scilly) is cut out of England along its border in the admin-1 file
     (the River Tamar); its coast is England's own, so the two fit exactly. The Isle of Wight is taken out of
     England: every island whose middle lies in its box (only on this map; the World and Europe maps keep it in
     the United Kingdom).
  3. Rockall (uninhabited) is left out. The Hebrides (Inner and Outer), the Orkney Islands and the Shetland Islands are taken out of Scotland: every
     island whose middle lies in their box, as on the World map (tools/world.py SPLITS).
  4. Borders are simplified once for both sides (tools/world.py's Simplifier), and the lakes of the area are drawn.
"""
import argparse
import json
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from world import Simplifier, read_features, polys, bbox, ring_area, ring_centroid, miller  # noqa: E402

from shapely.geometry import shape, box as sbox, MultiPolygon, Polygon   # noqa: E402

K = 200                        # SVG units per degree (the World map has 20)
X_SCALE = 0.8                  # Miller stretches east-west by 1.39 at 55 degrees north; this brings it back to the truth
LAT_TOP = 84.0                 # (the World map's, so the projection is the same one)
TOLERANCE = 0.004              # border simplification, in degrees (about 400 m)
AREA = (-14.0, 47.0, 6.0, 63.0)                 # lon0, lat0, lon1, lat1: everything is cut to this
UK_UNITS = {'ENG': 'England', 'SCT': 'Scotland', 'WLS': 'Wales', 'NIR': 'Northern Ireland'}
OTHERS = {'IRL': 'Ireland', 'IMN': 'Isle of Man', 'JEY': 'Jersey', 'GGY': 'Guernsey'}
ISLANDS = [                                      # (name, lon0, lon1, lat0, lat1): Scotland's islands, as on the World map
    ('Orkney Islands', -3.5, -2.2, 58.7, 59.5),
    ('Shetland Islands', -2.1, -0.6, 59.8, 61.0),
    ('Hebrides', -8.9, -5.7, 55.3, 58.6),
]
SCILLY = (-6.5, -6.2, 49.8, 50.05)               # the Isles of Scilly, in England's map unit: they go with Cornwall
WIGHT = (-1.65, -1.05, 50.55, 50.8)              # lon0, lon1, lat0, lat1: the Isle of Wight, taken out of England
LAKE_MIN = 0.08
DROP_WEST_OF = -12.0                             # Rockall (an uninhabited rock in Scotland's map unit) is left out                                  # lakes smaller than this (degrees across) are not drawn


def mx(lon):
    return (lon + 180.0) * K * X_SCALE


def my(lat):
    return (miller(LAT_TOP) - miller(lat)) * K


def to_polys(geom):
    """shapely geometry -> [[outer ring, hole, ...], ...] as lists of (lon, lat)"""
    if geom.is_empty:
        return []
    parts = geom.geoms if isinstance(geom, MultiPolygon) else [geom] if isinstance(geom, Polygon) else \
        [g for g in getattr(geom, 'geoms', []) if isinstance(g, Polygon)]
    return [[list(p.exterior.coords)] + [list(h.coords) for h in p.interiors] for p in parts if p.area > 0]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('map_units', help='Natural Earth ne_10m_admin_0_map_units.geojson')
    ap.add_argument('admin1', help='Natural Earth ne_10m_admin_1_states_provinces.geojson (only Cornwall is read)')
    ap.add_argument('--lakes', help='Natural Earth ne_10m_lakes.geojson')
    ap.add_argument('--out', default='maps/british_isles/shapes.js')
    args = ap.parse_args()

    area = sbox(*AREA)
    regions = {}                                 # name -> {'kind', 'geom' (shapely), 'polys'}
    order = []

    def add(name, geom, kind):
        regions[name] = {'name': name, 'kind': kind, 'geom': geom}
        order.append(name)

    # ---- 1. the nations, the islands' own governments, and the neighbours ----
    for f in read_features(args.map_units):
        p = f['properties']
        g = shape(f['geometry'])
        if not g.intersects(area):
            continue
        g = g.intersection(area)
        if p.get('GU_A3') in UK_UNITS:
            add(UK_UNITS[p['GU_A3']], g, 'nation')
        elif p.get('ADM0_A3') in OTHERS:
            add(OTHERS[p['ADM0_A3']], g, 'nation')
        else:
            add(p['NAME'], g, 'neighbour')       # France, Belgium, the Netherlands, Norway, the Faroe Islands...
    missing = [n for n in list(UK_UNITS.values()) + list(OTHERS.values()) if n not in regions]
    if missing:
        sys.exit('not found in the map units file: %s' % ', '.join(missing))

    # ---- 2. Cornwall, cut out of England along its admin-1 border ----
    corn = [shape(f['geometry']) for f in read_features(args.admin1)
            if f['properties'].get('adm0_a3') == 'GBR' and f['properties'].get('name') == 'Cornwall']
    if not corn:
        sys.exit('Cornwall not found in the admin-1 file')
    eng = regions['England']['geom']
    scilly = eng.intersection(sbox(SCILLY[0], SCILLY[2], SCILLY[1], SCILLY[3]))
    cornwall = eng.intersection(corn[0]).union(scilly)
    regions['England']['geom'] = eng.difference(corn[0]).difference(scilly)
    add('Cornwall', cornwall, 'nation')
    print('Cornwall: %.3f sq. degrees (with the Isles of Scilly: %.4f)' % (cornwall.area, scilly.area))
    eng, wight = [], []
    for poly in to_polys(regions['England']['geom']):
        cx, cy = ring_centroid(poly[0])
        (wight if WIGHT[0] <= cx <= WIGHT[1] and WIGHT[2] <= cy <= WIGHT[3] else eng).append(poly)
    if not wight:
        sys.exit('no island for the Isle of Wight')
    regions['England']['geom'] = MultiPolygon([Polygon(pl[0], pl[1:]) for pl in eng])
    add('Isle of Wight', MultiPolygon([Polygon(pl[0], pl[1:]) for pl in wight]), 'nation')
    print('Isle of Wight: %d island(s)' % len(wight))

    # ---- 3. Scotland's islands ----
    sco = [pl for pl in to_polys(regions['Scotland']['geom']) if ring_centroid(pl[0])[0] > DROP_WEST_OF]   # (not Rockall)
    for name, lon0, lon1, lat0, lat1 in ISLANDS:
        mine, rest = [], []
        for poly in sco:
            cx, cy = ring_centroid(poly[0])
            (mine if lon0 <= cx <= lon1 and lat0 <= cy <= lat1 else rest).append(poly)
        if not mine:
            sys.exit('no islands for %s' % name)
        sco = rest
        add(name, MultiPolygon([Polygon(pl[0], pl[1:]) for pl in mine]), 'nation')
        print('%-17s %3d island(s)' % (name, len(mine)))
    regions['Scotland']['geom'] = MultiPolygon([Polygon(pl[0], pl[1:]) for pl in sco])

    # ---- 4. simplify, then the paths ----
    simp = Simplifier(TOLERANCE)
    for r in regions.values():
        r['polys'] = to_polys(r['geom'])
        for poly in r['polys']:
            for ring in poly:
                simp.register(ring, r['name'])
    for r in regions.values():
        out = []
        for poly in r['polys']:
            rings = []
            for k, ring in enumerate(poly):
                bx = bbox(ring)
                if k > 0 and max(bx[2] - bx[0], bx[3] - bx[1]) < 0.05:    # tiny holes are dropped
                    continue
                s = simp.simplify(ring)
                if len(s) < 3:
                    s = [tuple(q) for q in ring][:-1]
                rings.append(s)
            if rings:
                out.append(rings)
        r['polys'] = out

    def path(polys_):
        d = []
        for poly in polys_:
            for ring in poly:
                pts, last = [], None
                for lon, lat in ring:
                    q = (int(round(mx(lon))), int(round(my(lat))))
                    if q != last:
                        pts.append(q)
                        last = q
                if len(pts) > 1 and pts[0] == pts[-1]:
                    pts.pop()
                if len(pts) >= 3:
                    d.append('M%d,%d' % pts[0] + 'l' + ' '.join('%d,%d' % (pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
                                                               for i in range(1, len(pts))) + 'z')
        return ''.join(d)

    out_regions = []
    for name in order:
        r = regions[name]
        if not r['polys']:
            continue
        best = max(r['polys'], key=lambda poly: abs(ring_area(poly[0])))
        bx = bbox(best[0])
        cx, cy = ring_centroid(best[0])
        size = max((bx[2] - bx[0]) * K * X_SCALE, (miller(bx[3]) - miller(bx[1])) * K)
        rec = {'name': name, 'code': name[:3].upper(), 'kind': 'un' if r['kind'] == 'nation' else 'territory',
               'cont': 'Europe', 'sub': 'Northern Europe', 'd': path(r['polys']),
               'sz': int(round(size)), 'mk': [int(round(mx(cx))), int(round(my(cy)))]}
        if r['kind'] == 'nation':
            rec['un'] = 1                               # (in the game's default 'un' scope only these are in colour)
        if size < 150:                                  # (Jersey, Guernsey: a wide invisible click area)
            rec['small'] = 1
        out_regions.append(rec)

    # ---- 5. lakes ----
    lakes = []
    if args.lakes:
        for f in read_features(args.lakes):
            for poly in polys(f['geometry']):
                bx = bbox(poly[0])
                if not (AREA[0] <= bx[0] and bx[2] <= AREA[2] and AREA[1] <= bx[1] and bx[3] <= AREA[3]):
                    continue
                if max(bx[2] - bx[0], bx[3] - bx[1]) < LAKE_MIN:
                    continue
                from world import dp
                ring = dp([tuple(q[:2]) for q in poly[0]], TOLERANCE)
                d = path([[ring]])
                if d:
                    lakes.append({'name': f['properties'].get('name') or '', 'd': d})
        print('lakes: %s' % ', '.join(sorted(l['name'] for l in lakes if l['name'])))

    W = int(round(360 * K * X_SCALE))
    H = int(round((miller(LAT_TOP) - miller(-60.0)) * K))
    data = {'id': 'british_isles',
            'projection': {'type': 'miller', 'k': K, 'lat_top': LAT_TOP, 'lat_bottom': -60.0, 'x_scale': X_SCALE},
            'scale': K, 'size': [W, H], 'wrap': True, 'insets': [], 'lakes': lakes, 'regions': out_regions}
    head = ('/* British Isles map shapes, generated by tools/british_isles.py - do not edit by hand.\n'
            '   Source: Natural Earth 5.1.2 10m Admin 0 - Map Units and Admin 1 (Cornwall), public domain\n'
            '   (naturalearthdata.com). Miller projection like the World map, at %d units per degree, squeezed\n'
            '   sideways by %.2f. Settings: maps/british_isles/settings.js. */\n' % (K, X_SCALE))
    text = head + '(window.GeoMapShapes = window.GeoMapShapes || []).push(' + \
        json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ');\n'
    os.makedirs(os.path.dirname(args.out) or '.', exist_ok=True)
    with open(args.out, 'w', encoding='utf-8') as fh:
        fh.write(text)
    print('wrote %s (%d KB), %d regions' % (args.out, len(text) // 1024, len(out_regions)))


if __name__ == '__main__':
    main()
