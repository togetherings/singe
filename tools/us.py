"""
United States: map-specific code for map_generation.py
======================================================
  python3 map_generation.py us-states.geojson --id us --out ../maps/us.js --script us.py

Data: U.S. Census Bureau state and territory boundaries (public domain). The map is drawn with
an Albers equal-area conic projection. Alaska, Hawaii and the territories are moved closer,
resized, and each is drawn inside its own box so it is clear they are separate:
  - Alaska at the top left, with the tall Mariana Islands box below it
  - Hawaii in the open ocean to the left of the mainland, above Guam and American Samoa
  - along the bottom: Guam and American Samoa (left), Puerto Rico and the Virgin Islands (right)
Small areas (territories and Washington D.C.) are drawn larger than life so they can be clicked.
Edit LAYOUT below to move or resize any of them. The script prints how far each box is from the
nearest state, so you can check that no box touches a state.
"""
import math
from map_generation import read_features, albers

# Main map projection (the standard one for the contiguous United States).
PROJECTION = {'lon0': -96, 'lat0': 37.5, 'p1': 29.5, 'p2': 45.5}

# Names in the source data that are too long for a game prompt.
RENAMES = {'Commonwealth of the Northern Mariana Islands': 'Northern Mariana Islands',
           'United States Virgin Islands': 'U.S. Virgin Islands'}

# Map settings can switch a "kind" off (include_territories: false hides every 'territory').
KINDS = {'Guam': 'territory', 'Northern Mariana Islands': 'territory', 'American Samoa': 'territory',
         'Puerto Rico': 'territory', 'U.S. Virgin Islands': 'territory', 'District of Columbia': 'district'}


def local(lon0, lat0):
    """A small projection centred on an island group (keeps its shape natural)."""
    return {'lon0': lon0, 'lat0': lat0, 'p1': lat0 - 2, 'p2': lat0 + 2}


# How each region outside the contiguous 48 states is placed. Each gets a box drawn around it.
# All positions are fractions of the width of the contiguous states, measured from their
# bottom-left corner ("up" is positive, so negative means below them).
#   proj        projection used to draw the region on its own
#   scale       size relative to the main map (1 = true size; 0.5 = half size; 4 = four times bigger)
#   min         optional smallest box size (width, height); the box otherwise fits the shape
# Horizontal position - one of:
#   x           left edge of the box           cx    centre of the box
#   right_of    (name, gap): to the right of another box
# Vertical position - one of:
#   top         top edge of the box            cy    centre of the box
#   top_offset  top edge, measured up from the top of the states
#   below       (name, gap): under another box top_same_as  same top edge as another box
# Boxes are placed in this order, so a box can only refer to ones listed before it.
LAYOUT = {
    'Alaska':                   {'proj': {'lon0': -154, 'lat0': 50, 'p1': 55, 'p2': 65}, 'scale': 0.5,
                                 'x': -0.440, 'top_offset': 0.012},
    'Northern Mariana Islands': {'proj': local(145.6, 16.0), 'scale': 3.3, 'min': (0.14, 0.0),
                                 'x': -0.440, 'below': ('Alaska', 0.030)},
    'Hawaii':                   {'proj': {'lon0': -157, 'lat0': 3, 'p1': 8, 'p2': 18}, 'scale': 1.2,
                                 'cx': -0.120, 'cy': 0.200},
    'Guam':                     {'proj': local(144.8, 13.4), 'scale': 5.0, 'min': (0.14, 0.10),
                                 'right_of': ('Northern Mariana Islands', 0.030), 'top': -0.002},
    'American Samoa':           {'proj': local(-170.2, -14.3), 'scale': 6.0, 'min': (0.20, 0.10),
                                 'right_of': ('Guam', 0.030), 'top_same_as': 'Guam'},
    'Puerto Rico':              {'proj': local(-66.4, 18.2), 'scale': 1.6, 'min': (0.14, 0.10),
                                 'x': 0.740, 'top': -0.035},
    'U.S. Virgin Islands':      {'proj': local(-64.8, 18.0), 'scale': 3.5, 'min': (0.09, 0.10),
                                 'right_of': ('Puerto Rico', 0.020), 'top_same_as': 'Puerto Rico'},
}
BOX_PAD = 0.012         # space between a shape and its box, as a fraction of the map width
MIN_GAP = 0.010         # boxes must stay at least this far from every state (fraction of map width)
DC_ENLARGE = 4          # Washington D.C. is tiny, so it is drawn this many times bigger

FRAMES = []             # boxes, filled in by get_features and read by map_generation.py


def _polys(geometry):
    return geometry['coordinates'] if geometry['type'] == 'MultiPolygon' else [geometry['coordinates']]


def _points(geometry):
    return [p for poly in _polys(geometry) for r in poly for p in r]


def _map_points(geometry, fn):
    new = [[[fn(p) for p in r] for r in poly] for poly in _polys(geometry)]
    return {'type': geometry['type'], 'coordinates': new if geometry['type'] == 'MultiPolygon' else new[0]}


def get_features(inputs):
    del FRAMES[:]
    feats = [{'name': RENAMES.get(f['properties']['shapeName'], f['properties']['shapeName']),
              'geometry': f['geometry']} for f in read_features(inputs[0])]
    for f in feats:
        if f['name'] in KINDS:
            f['kind'] = KINDS[f['name']]

    # Washington D.C.: enlarge around its centre, and draw it last so it sits on top of Maryland and Virginia.
    for f in feats:
        if f['name'] == 'District of Columbia':
            pts = _points(f['geometry'])
            cx = sum(p[0] for p in pts) / len(pts)
            cy = sum(p[1] for p in pts) / len(pts)
            f['geometry'] = _map_points(f['geometry'], lambda p: [cx + (p[0] - cx) * DC_ENLARGE,
                                                                  cy + (p[1] - cy) * DC_ENLARGE])
    feats.sort(key=lambda f: f['name'] == 'District of Columbia')

    # Size of the contiguous states on the flat map (used to place the others relative to it).
    flat = [albers(lon, lat, PROJECTION) for f in feats if f['name'] not in LAYOUT
            for lon, lat in _points(f['geometry'])]
    x0, x1 = min(p[0] for p in flat), max(p[0] for p in flat)
    y0, ytop = min(p[1] for p in flat), max(p[1] for p in flat)
    width = x1 - x0
    boxes = {}                                      # name -> (left, top, right, bottom) in flat coordinates

    by_name = {f['name']: f for f in feats}
    for name, spec in LAYOUT.items():               # in LAYOUT order
        f = by_name[name]
        pts = [albers(lon, lat, spec['proj']) for lon, lat in _points(f['geometry'])]
        ax = (min(p[0] for p in pts) + max(p[0] for p in pts)) / 2       # middle of the shape
        ay = (min(p[1] for p in pts) + max(p[1] for p in pts)) / 2
        cw = (max(p[0] for p in pts) - min(p[0] for p in pts)) * spec['scale']   # size of the shape on the map
        ch = (max(p[1] for p in pts) - min(p[1] for p in pts)) * spec['scale']
        mw, mh = spec.get('min', (0, 0))
        bw = max(mw * width, cw + 2 * BOX_PAD * width)                    # box size
        bh = max(mh * width, ch + 2 * BOX_PAD * width)
        if 'x' in spec:
            left = x0 + spec['x'] * width
        elif 'cx' in spec:
            left = x0 + spec['cx'] * width - bw / 2
        else:
            ref, gap = spec['right_of']
            left = boxes[ref][2] + gap * width
        if 'top' in spec:
            top = y0 + spec['top'] * width
        elif 'top_offset' in spec:
            top = ytop + spec['top_offset'] * width
        elif 'cy' in spec:
            top = y0 + spec['cy'] * width + bh / 2
        elif 'below' in spec:
            ref, gap = spec['below']
            top = boxes[ref][3] - gap * width
        else:
            top = boxes[spec['top_same_as']][1]
        boxes[name] = (left, top, left + bw, top - bh)
        f['inset'] = {'proj': spec['proj'], 'ax': ax, 'ay': ay, 's': spec['scale'],
                      'qx': left + bw / 2, 'qy': top - bh / 2}
        FRAMES.append({'region': name,
                       'pts': [(left, top), (left + bw, top), (left + bw, top - bh), (left, top - bh)]})

    # Check that no box touches a state (distance from every state outline point to every box).
    for name, (l, t, r, b) in boxes.items():
        gap = min(math.hypot(max(l - px, 0, px - r), max(b - py, 0, py - t)) for px, py in flat) / width
        print('  box %-26s x %6.3f..%6.3f  y %6.3f..%6.3f  nearest state %.3f %s' % (
            name, (l - x0) / width, (r - x0) / width, (b - y0) / width, (t - y0) / width, gap,
            '' if gap >= MIN_GAP else '  <-- TOO CLOSE'))
    for a, (l1, t1, r1, b1) in boxes.items():       # and that boxes do not overlap each other
        for c, (l2, t2, r2, b2) in boxes.items():
            if a < c and l1 < r2 and l2 < r1 and b1 < t2 and b2 < t1:
                print('  <-- boxes overlap:', a, c)
    return feats
