#!/usr/bin/env python3
"""
SINGE map generator
===================
Turns boundary data (a GeoJSON file or an ESRI Shapefile) into a map SHAPES file
for the game: maps/<id>.js. It is only needed when you ADD or CHANGE the shapes
of a map. Names, capitals, zoom, flags and so on live in a separate hand-edited
file in map-settings/ and never need this script.

Simple usage (one file, one region per feature):
  python3 map_generation.py boundaries.geojson --id my_country --out ../maps/my_country.js
  python3 map_generation.py boundaries.shp     --id my_country --out ../maps/my_country.js \\
          --name-property NAME_1

Usage with a map-specific script (for maps that need special handling,
such as merging pieces, moving borders or fixing names):
  python3 map_generation.py input1.geojson input2.geojson --id sierra_leone \\
          --out ../maps/sierra_leone.js --script sierra_leone.py

A map script is a small Python file that defines one function:
    get_features(inputs) -> list of {'name': 'Region name', 'geometry': <GeoJSON Polygon or MultiPolygon>}
It can import helpers from this file:  from map_generation import read_features, dissolve
Optional extras a map script can provide (see us.py):
    PROJECTION = {'lon0':.., 'lat0':.., 'p1':.., 'p2':..}   draw the map with an Albers projection
                 (default is plain longitude/latitude, fine for small areas such as one country)
    a feature may also contain 'inset': {...} to move and resize it (e.g. Alaska and Hawaii)
    and 'kind': 'territory' etc. (map settings can switch a kind off)
    FRAMES = [{'region': name, 'pts': [(x, y), ...]}]  outlines to draw around moved regions
See sierra_leone.py for an example.

Input must use longitude/latitude (WGS84). Shapefiles need their .dbf next to the .shp
(the .dbf holds the names). No extra Python libraries are needed.
"""
import argparse, collections, importlib.util, json, math, os, struct, sys

DEFAULT_SCALE = 500   # SVG units per degree: bigger = more detail, larger file


# ---------------------------------------------------------------------------
# 1. READING boundary files
# ---------------------------------------------------------------------------
def read_shp(path):
    """Minimal Shapefile reader (polygons only) -> GeoJSON-style features."""
    dbf = open(path[:-4] + '.dbf', 'rb').read()
    n, head, size = struct.unpack('<IHH', dbf[4:12])
    fields, p = [], 32
    while dbf[p] != 0x0D:                          # field descriptors in the .dbf
        fields.append((dbf[p:p + 11].split(b'\0')[0].decode(), dbf[p + 16]))
        p += 32
    shp = open(path, 'rb').read()
    pos, feats = 100, []
    for i in range(n):
        length = struct.unpack('>i', shp[pos + 4:pos + 8])[0]
        rec = shp[pos + 8:pos + 8 + length * 2]
        pos += 8 + length * 2
        shape_type = struct.unpack('<i', rec[:4])[0]
        row, o = {}, head + i * size + 1
        for name, width in fields:
            row[name] = dbf[o:o + width].decode('utf-8', 'replace').strip()
            o += width
        if shape_type == 1:                        # a point (for example cities): {'type': 'Point'}
            x, y = struct.unpack('<2d', rec[4:20])
            feats.append({'properties': row, 'geometry': {'type': 'Point', 'coordinates': [x, y]}})
            continue
        n_parts, n_pts = struct.unpack('<2i', rec[36:44])
        starts = list(struct.unpack('<%di' % n_parts, rec[44:44 + 4 * n_parts])) + [n_pts]
        o = 44 + 4 * n_parts
        v = struct.unpack('<%dd' % (2 * n_pts), rec[o:o + 16 * n_pts])
        xy = [list(a) for a in zip(v[0::2], v[1::2])]
        # all rings are drawn with the "even-odd" fill rule, so holes still work
        feats.append({'properties': row, 'geometry': {
            'type': 'Polygon',
            'coordinates': [xy[starts[k]:starts[k + 1]] for k in range(n_parts)]}})
    return feats


def read_features(path):
    """Read a .geojson or .shp file and return its list of features."""
    if path.lower().endswith('.shp'):
        return read_shp(path)
    return json.load(open(path, encoding='utf-8'))['features']


# ---------------------------------------------------------------------------
# 2. GEOMETRY helpers (also usable from map scripts)
# ---------------------------------------------------------------------------
def rings(geometry):
    """All rings (outer borders and holes) of a Polygon or MultiPolygon."""
    polys = geometry['coordinates'] if geometry['type'] == 'MultiPolygon' else [geometry['coordinates']]
    return [r for poly in polys for r in poly]


def dissolve(geometries):
    """Merge neighbouring polygons into one outline.
    Every edge shared by two pieces is deleted; the edges left over are the outer
    border of the merged shape. Returns a list of closed rings."""
    def key(p):                                     # snap points so neighbours match
        return (round(p[0], 6), round(p[1], 6))
    count = collections.Counter()
    for g in geometries:
        for r in rings(g):
            for a, b in zip(r, r[1:]):
                a, b = key(a), key(b)
                if a != b:
                    count[frozenset((a, b))] += 1
    adj = collections.defaultdict(list)             # keep edges that appear an odd number of times
    for e, n in count.items():
        if n % 2:
            a, b = tuple(e)
            adj[a].append(b)
            adj[b].append(a)
    out = []
    while adj:                                      # walk the edges into closed rings
        start = next(iter(adj))
        ring, cur = [start], start
        while True:
            nxt = adj[cur].pop()
            adj[nxt].remove(cur)
            if not adj[cur]:
                del adj[cur]
            if nxt in adj and not adj[nxt]:
                del adj[nxt]
            ring.append(nxt)
            cur = nxt
            if cur == start or cur not in adj:
                break
        out.append([list(p) for p in ring])
    return out


# ---------------------------------------------------------------------------
# 3. PROJECTION (Albers equal-area conic). game.js has the same maths for placing
#    capital cities, so keep the two in step.
# ---------------------------------------------------------------------------
def albers(lon, lat, p):
    """Longitude/latitude -> flat (x, y) on a unit sphere. p has lon0, lat0, p1, p2."""
    rad = math.pi / 180
    n = (math.sin(p['p1'] * rad) + math.sin(p['p2'] * rad)) / 2
    c = math.cos(p['p1'] * rad) ** 2 + 2 * n * math.sin(p['p1'] * rad)
    rho0 = math.sqrt(c - 2 * n * math.sin(p['lat0'] * rad)) / n
    dl = (lon - p['lon0'] + 540) % 360 - 180            # wraps across the 180th meridian
    theta = n * dl * rad
    rho = math.sqrt(c - 2 * n * math.sin(lat * rad)) / n
    return rho * math.sin(theta), rho0 - rho * math.cos(theta)


def project(lon, lat, projection, inset=None):
    """Flat position of a point, after the optional inset move/resize.
    inset = {proj, rot, ax, ay, s, qx, qy}: project with its own projection, turn by rot, then scale
    by s about (ax, ay) and put that point at (qx, qy) in the main map."""
    if inset:
        x, y = albers(lon, lat, inset['proj'])
        if inset.get('rot'):                                 # optional turn
            c, s = math.cos(inset['rot']), math.sin(inset['rot'])
            x, y = x * c - y * s, x * s + y * c
        return inset['qx'] + (x - inset['ax']) * inset['s'], inset['qy'] + (y - inset['ay']) * inset['s']
    return albers(lon, lat, projection)


# ---------------------------------------------------------------------------
# 4. WRITING the map shapes file
# ---------------------------------------------------------------------------
SMALL_REGION = 0.08   # regions whose biggest piece is under this fraction of the map width get a
                      # bigger invisible tap area ("halo") in the game


def ring_to_path(xy):
    """Ring of (x, y) pixel points -> 'M x y l dx dy dx dy ... z' using whole-number relative moves."""
    clean = [xy[0]]
    for p in xy[1:]:
        if p != clean[-1]:
            clean.append(p)                         # drop repeated points
    if len(clean) > 1 and clean[0] == clean[-1]:
        clean.pop()
    if len(clean) < 3:
        return ''                                   # too small to draw
    d = 'M%d %dl' % clean[0]
    d += ' '.join('%d %d' % (b[0] - a[0], b[1] - a[1]) for a, b in zip(clean, clean[1:]))
    return d + 'z'


HEADER = """/* Map SHAPES file, generated by tools/map_generation.py - do not edit by hand.
   Names, capitals, zoom, flags etc. belong in map-settings/%s.js instead.
   Fields: id, scale (SVG units per degree, or per unit of the flat projection),
           bounds [minLon, minLat, maxLon, maxLat]            (plain lon/lat maps), or
           projection, origin, size, frames                   (projected maps),
           regions: [{ name, d (SVG path), small (needs a bigger tap area), inset, kind }] */
"""


def build_map(features, map_id, scale, projection=None, frames=None):
    out = {'id': map_id}
    if projection:                                  # ---- projected map ----
        def flat(f, lon, lat):
            return project(lon, lat, projection, f.get('inset'))
        pts = [flat(f, *p) for f in features for r in rings(f['geometry']) for p in r]
        pts += [c for fr in (frames or []) for c in fr['pts']]     # boxes count too
        pad = 0.01
        x0, x1 = min(p[0] for p in pts) - pad, max(p[0] for p in pts) + pad
        y0, y1 = min(p[1] for p in pts) - pad, max(p[1] for p in pts) + pad
        out.update(projection=projection, origin=[round(x0, 5), round(y1, 5)], scale=scale,
                   size=[round((x1 - x0) * scale), round((y1 - y0) * scale)])
        px = lambda f, lon, lat: ((flat(f, lon, lat)[0] - x0) * scale, (y1 - flat(f, lon, lat)[1]) * scale)
        width = out['size'][0]
        if frames:        # outlines drawn around moved regions: polygons in SVG units, tagged with their region
            out['frames'] = [{'region': fr['region'],
                              'pts': [[round((x - x0) * scale), round((y1 - y) * scale)] for x, y in fr['pts']]}
                             for fr in frames]
    else:                                           # ---- plain longitude/latitude map ----
        pts = [p for f in features for r in rings(f['geometry']) for p in r]
        pad = 0.05
        b = [round(min(p[0] for p in pts) - pad, 3), round(min(p[1] for p in pts) - pad, 3),
             round(max(p[0] for p in pts) + pad, 3), round(max(p[1] for p in pts) + pad, 3)]
        out.update(bounds=b, scale=scale)
        px = lambda f, lon, lat: ((lon - b[0]) * scale, (b[3] - lat) * scale)
        width = (b[2] - b[0]) * scale
    regions = []
    for f in features:
        paths, biggest = [], 0
        for r in rings(f['geometry']):
            xy = [tuple(round(v) for v in px(f, lon, lat)) for lon, lat in r]
            paths.append(ring_to_path(xy))
            xs, ys = [p[0] for p in xy], [p[1] for p in xy]
            biggest = max(biggest, max(xs) - min(xs), max(ys) - min(ys))
        reg = {'name': f['name'], 'd': ''.join(paths)}
        if f.get('kind'):
            reg['kind'] = f['kind']                 # e.g. 'territory' - lets map settings switch groups off
        if biggest < SMALL_REGION * width:
            reg['small'] = 1
        if f.get('inset'):
            reg['inset'] = {k: (round(v, 5) if isinstance(v, float) else v) for k, v in f['inset'].items()}
        regions.append(reg)
    out['regions'] = regions
    return out


def main():
    ap = argparse.ArgumentParser(description='Make a SINGE map shapes file from boundary data.')
    ap.add_argument('inputs', nargs='+', help='.geojson or .shp file(s)')
    ap.add_argument('--id', required=True, help='map id, e.g. sierra_leone (also the file name)')
    ap.add_argument('--out', required=True, help='output file, e.g. ../maps/sierra_leone.js')
    ap.add_argument('--name-property', default='shapeName',
                    help='property holding each region name (default shapeName, used by geoBoundaries)')
    ap.add_argument('--script', help='map-specific Python script (see the top of this file)')
    ap.add_argument('--scale', type=int, default=None,
                    help='SVG units per degree (default 500), or per flat-projection unit (default 2200)')
    a = ap.parse_args()

    projection = None
    if a.script:                                    # map-specific handling
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        spec = importlib.util.spec_from_file_location('map_script', a.script)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        features = mod.get_features(a.inputs)
        projection = getattr(mod, 'PROJECTION', None)
    else:                                           # one file, one region per feature
        features = [{'name': f['properties'][a.name_property], 'geometry': f['geometry']}
                    for f in read_features(a.inputs[0])]

    scale = a.scale or (2200 if projection else DEFAULT_SCALE)
    m = build_map(features, a.id, scale, projection, list(getattr(mod, 'FRAMES', [])) if a.script else None)
    js = HEADER % a.id + '(window.GeoMapShapes = window.GeoMapShapes || []).push(%s);\n' % \
        json.dumps(m, separators=(',', ':'), ensure_ascii=False)
    open(a.out, 'w', encoding='utf-8').write(js)
    print('wrote', a.out, len(js) // 1024, 'KB,', len(m['regions']), 'regions')


if __name__ == '__main__':
    main()
