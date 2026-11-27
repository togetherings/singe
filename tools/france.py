"""
France: map-specific code for map_generation.py
===============================================
  pip install shapely
  python3 map_generation.py ne_10m_admin_1_france_area.geojson --id france --out ../maps/france/shapes.js --script france.py

Data: Natural Earth 5.1.2 10m Admin 1 - States, Provinces (public domain), the departments of France and of its
neighbours (data/natural_earth/ne_10m_admin_1_france_area.geojson.zip). France's 101 departments are merged into its
18 regions with Natural Earth's "region" field: the twelve of the Hexagon, Corsica, and the five overseas regions.
The neighbouring countries (merged from their own provinces, so their borders match France's exactly) are cut to the
area around the Hexagon and drawn grey ("off").

The map is drawn with an Albers equal-area conic projection. The five overseas regions are moved and resized into
boxes, as on the usual maps of France: Guadeloupe, Martinique and French Guiana in the Atlantic to the west, Mayotte
and Réunion in the Mediterranean to the south. Edit LAYOUT to move or resize them; the script prints how far each box
is from the Hexagon and Corsica, so you can check none touches them (boxes may cover grey neighbours). The map's
size is set by France and the boxes only, so the neighbours are cut along its straight edges.
"""
import math
from map_generation import read_features
from world import Simplifier
from shapely.geometry import shape, mapping, box as sbox, Polygon
from shapely.ops import unary_union

PROJECTION = {'lon0': 2.5, 'lat0': 46.5, 'p1': 44.0, 'p2': 49.0}
AREA = (-13.0, 35.5, 19.0, 56.0)                # lon0, lat0, lon1, lat1: the neighbours are cut to this (the map's own
                                                # edges cut them again, straight)
TOLERANCE = 0.004                               # border simplification, in degrees (about 400 m)
NEIGHBOURS = {'ESP': 'Spain', 'ITA': 'Italy', 'CHE': 'Switzerland', 'DEU': 'Germany', 'BEL': 'Belgium',
              'LUX': 'Luxembourg', 'GBR': 'United Kingdom', 'AND': 'Andorra', 'MCO': 'Monaco', 'NLD': 'Netherlands',
              'JEY': 'Jersey', 'GGY': 'Guernsey', 'LIE': 'Liechtenstein', 'AUT': 'Austria', 'SMR': 'San Marino',
              'PRT': 'Portugal', 'IRL': 'Ireland', 'IMN': 'Isle of Man', 'DNK': 'Denmark', 'CZE': 'Czechia',
              'SVN': 'Slovenia', 'HRV': 'Croatia', 'VAT': 'Vatican City', 'DZA': 'Algeria', 'TUN': 'Tunisia',
              'MAR': 'Morocco', 'MLT': 'Malta'}
NAMES = {                                       # Natural Earth's region names -> the names in the game (English)
    'Auvergne-Rhône-Alpes': 'Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté': 'Bourgogne-Franche-Comté',
    'Bretagne': 'Brittany', 'Centre-Val de Loire': 'Centre-Val de Loire', 'Corse': 'Corsica', 'Grand Est': 'Grand Est',
    'Hauts-de-France': 'Hauts-de-France', 'Île-de-France': 'Île-de-France', 'Normandie': 'Normandy',
    'Nouvelle-Aquitaine': 'Nouvelle-Aquitaine', 'Occitanie': 'Occitania', 'Pays de la Loire': 'Pays de la Loire',
    "Provence-Alpes-Côte-d'Azur": "Provence-Alpes-Côte d'Azur", 'Guadeloupe': 'Guadeloupe',
    'Martinique': 'Martinique', 'Guyane française': 'French Guiana', 'Réunion': 'Réunion', 'Mayotte': 'Mayotte',
}


def local(lon0, lat0):
    """A small projection centred on an island or region (keeps its shape natural)."""
    return {'lon0': lon0, 'lat0': lat0, 'p1': lat0 - 2, 'p2': lat0 + 2}


# The overseas regions, in boxes. Positions are fractions of the width of the Hexagon and Corsica, from their
# bottom-left corner ("up" is positive).  scale = size relative to the main map (1 = true size).
#   x / right_of (name, gap)       left edge, or to the right of another box
#   top / below (name, gap)        top edge, or under another box
#   min (w, h)                     smallest box size
LAYOUT = {
    'Guadeloupe':    {'proj': local(-61.55, 16.2), 'scale': 1.6, 'min': (0.15, 0.13), 'x': -0.20, 'top': 0.80},
    'Martinique':    {'proj': local(-61.0, 14.65), 'scale': 2.0, 'min': (0.15, 0.13), 'x': -0.20, 'below': ('Guadeloupe', 0.02)},
    'French Guiana': {'proj': local(-53.1, 4.0), 'scale': 0.9, 'x': -0.20, 'below': ('Martinique', 0.02)},
    'Mayotte':       {'proj': local(45.15, -12.8), 'scale': 3.5, 'min': (0.11, 0.12), 'x': 0.55, 'top': 0.05},
    'Réunion':       {'proj': local(55.53, -21.12), 'scale': 2.0, 'min': (0.13, 0.13), 'right_of': ('Mayotte', 0.02),
                      'top': 0.05},
}
BOX_PAD = 0.012
MIN_GAP = 0.010

# Countries drawn grey INSIDE a box, around an overseas region, cut to the box: {region: {adm0 code: name}}
BOX_NEIGHBOURS = {'French Guiana': {'SUR': 'Suriname', 'BRA': 'Brazil'}}

FRAMES = []


def inv_albers(x, y, p):
    """flat (x, y) -> longitude/latitude: the inverse of map_generation.albers"""
    rad = math.pi / 180
    n = (math.sin(p['p1'] * rad) + math.sin(p['p2'] * rad)) / 2
    c = math.cos(p['p1'] * rad) ** 2 + 2 * n * math.sin(p['p1'] * rad)
    rho0 = math.sqrt(c - 2 * n * math.sin(p['lat0'] * rad)) / n
    rho = math.copysign(math.hypot(x, rho0 - y), n)
    theta = math.atan2(x, rho0 - y)
    return p['lon0'] + theta / n / rad, math.asin((c - (rho * n) ** 2) / (2 * n)) / rad


def _geo(geom):
    return mapping(geom)


def get_features(inputs):
    from map_generation import albers
    del FRAMES[:]
    feats = read_features(inputs[0])
    regions, neighbours, boxed = {}, {}, {}
    box_codes = {code: (region, name) for region, nb in BOX_NEIGHBOURS.items() for code, name in nb.items()}
    for f in feats:
        p = f['properties']
        g = shape(f['geometry'])
        if p.get('adm0_a3') in box_codes:
            boxed.setdefault(box_codes[p['adm0_a3']], []).append(g)
        elif p.get('adm0_a3') == 'FRA':
            regions.setdefault(NAMES[p['region']], []).append(g)
        elif p.get('adm0_a3') in NEIGHBOURS:
            neighbours.setdefault(NEIGHBOURS[p['adm0_a3']], []).append(g)
    if len(regions) != 18:
        raise SystemExit('expected 18 regions, found %d' % len(regions))
    area = sbox(*AREA)
    merged = [(n, unary_union(gs), False) for n, gs in regions.items()]
    merged += [(n, unary_union(gs).intersection(area), True) for n, gs in neighbours.items()]
    merged = [(n, g, off) for n, g, off in merged if not g.is_empty]

    # simplify once for both sides of every border
    simp = Simplifier(TOLERANCE)

    def polys(g):
        gs = g.geoms if g.geom_type in ('MultiPolygon', 'GeometryCollection') else [g]
        return [[list(p.exterior.coords)] + [list(h.coords) for h in p.interiors] for p in gs if p.geom_type == 'Polygon' and p.area > 0]
    out = []
    for n, g, off in merged:
        pl = polys(g)
        for poly in pl:
            for ring in poly:
                simp.register(ring, n)
        out.append([n, pl, off])
    features = []
    for n, pl, off in out:
        coords = []
        for poly in pl:
            rings = []
            for ring in poly:
                s = simp.simplify(ring)
                if len(s) >= 3:
                    rings.append([list(q) for q in s] + [list(s[0])])
            if rings:
                coords.append(rings)
        f = {'name': n, 'geometry': {'type': 'MultiPolygon', 'coordinates': coords}}
        if off:
            f['off'] = 1
        features.append(f)

    # the boxes
    main = [albers(lon, lat, PROJECTION) for f in features if not f.get('off') and f['name'] not in LAYOUT
            for poly in f['geometry']['coordinates'] for r in poly for lon, lat in r]
    x0, x1 = min(p[0] for p in main), max(p[0] for p in main)
    y0 = min(p[1] for p in main)
    width = x1 - x0
    boxes = {}
    by_name = {f['name']: f for f in features}
    for name, spec in LAYOUT.items():
        f = by_name[name]
        pts = [albers(lon, lat, spec['proj']) for poly in f['geometry']['coordinates'] for r in poly for lon, lat in r]
        ax = (min(p[0] for p in pts) + max(p[0] for p in pts)) / 2
        ay = (min(p[1] for p in pts) + max(p[1] for p in pts)) / 2
        cw = (max(p[0] for p in pts) - min(p[0] for p in pts)) * spec['scale']
        ch = (max(p[1] for p in pts) - min(p[1] for p in pts)) * spec['scale']
        mw, mh = spec.get('min', (0, 0))
        bw = max(mw * width, cw + 2 * BOX_PAD * width)
        bh = max(mh * width, ch + 2 * BOX_PAD * width)
        if 'x' in spec:
            left = x0 + spec['x'] * width
        else:
            ref, gap = spec['right_of']
            left = boxes[ref][2] + gap * width
        if 'top' in spec:
            top = y0 + spec['top'] * width
        else:
            ref, gap = spec['below']
            top = boxes[ref][3] - gap * width
        boxes[name] = (left, top, left + bw, top - bh)
        f['inset'] = {'proj': spec['proj'], 'ax': ax, 'ay': ay, 's': spec['scale'], 'qx': left + bw / 2, 'qy': top - bh / 2}
        FRAMES.append({'region': name, 'pts': [(left, top), (left + bw, top), (left + bw, top - bh), (left, top - bh)]})
    for name, (l, t, r, b) in boxes.items():
        gap = min(math.hypot(max(l - px, 0, px - r), max(b - py, 0, py - t)) for px, py in main) / width
        print('  box %-14s x %6.3f..%6.3f  y %6.3f..%6.3f  nearest region %.3f %s' % (
            name, (l - x0) / width, (r - x0) / width, (b - y0) / width, (t - y0) / width, gap,
            '' if gap >= MIN_GAP else '  <-- TOO CLOSE'))
    for a, (l1, t1, r1, b1) in boxes.items():
        for c, (l2, t2, r2, b2) in boxes.items():
            if a < c and l1 < r2 and l2 < r1 and b1 < t2 and b2 < t1:
                print('  <-- boxes overlap:', a, c)
    # the countries beside a region in its box, cut to the box (the box drawn back in longitude/latitude)
    for (region, name), gs in boxed.items():
        ins = by_name[region]['inset']
        l, t, r, b = boxes[region]
        edge = []
        for k in range(41):                        # the box's outline, with many points (it is curved in lon/lat)
            u = k / 40.0
            edge += [(l + (r - l) * u, t)]
        for k in range(41):
            edge += [(r, t + (b - t) * k / 40.0)]
        for k in range(41):
            edge += [(r - (r - l) * k / 40.0, b)]
        for k in range(41):
            edge += [(l, b - (b - t) * k / 40.0)]
        # main map -> the region's own flat projection -> longitude/latitude
        ll = [inv_albers((x - ins['qx']) / ins['s'] + ins['ax'], (y - ins['qy']) / ins['s'] + ins['ay'], ins['proj'])
              for x, y in edge]
        cut = unary_union(gs).intersection(Polygon(ll).buffer(0))
        if cut.is_empty:
            continue
        coords = [[[list(q) for q in simp_ring(ring)] for ring in poly] for poly in polys(cut)]
        features.append({'name': name, 'geometry': {'type': 'MultiPolygon', 'coordinates': coords}, 'off': 1,
                         'inset': dict(ins)})
        print('  %s: drawn in the %s box' % (name, region))
    # grey neighbours first, so the boxes (drawn before the regions in colour) sit on top of them
    features.sort(key=lambda f: not f.get('off'))
    return features


def simp_ring(ring):
    from world import dp
    s = dp([tuple(q[:2]) for q in ring], TOLERANCE)
    return s + [s[0]] if s[0] != s[-1] else s
