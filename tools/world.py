#!/usr/bin/env python3
"""
World map: shapes generator (maps/world.js)
===========================================
Reads Natural Earth "Admin 0 - Countries" (10 m, public domain) and writes the SHAPES file of the
world map. Names, capitals and options live in map-settings/world.js (see world_settings.py,
which writes the first version of that file).

  python3 world.py ne_10m_admin_0_countries.json --out ../maps/world.js

What it does
  1. Drops Antarctica and the uninhabited / contested oddities (Spratly Is., Bajo Nuevo, Serranilla Bank,
     Scarborough Reef, Siachen Glacier). The leased areas (Baikonur, Guantanamo Bay) and the Cyprus buffer
     zone are not regions of their own: they are drawn as part of Kazakhstan, Cuba and Cyprus.
  2. Cleans up names (the source abbreviates many: "Dem. Rep. Congo", "St. Vin. and Gren.").
  3. SPLITS far-away or special parts out of their parent (French Guiana, Alaska, Hawaii, Kaliningrad,
     Svalbard...). Each part keeps "part_of" = its parent's name, so the game can put them back together
     when the map's scope is 'un' (see SPLITS below to add or remove a split).
  4. Draws everything with the Miller cylindrical projection. Unlike Albers, this projection repeats
     sideways, which is what lets the game scroll the map around the world without end.
  5. Simplifies the borders (every border shared by two countries is simplified once, so neighbours still
     fit together) and writes compact SVG paths.
  6. Builds the two INSETS shown in a fixed strip below the map: the Caribbean Islands and the Pacific Islands.
     The strip overlaps the bottom of the map, where the map is empty: the Pacific box sits under Africa and
     Australia and the Caribbean box under the south-east Pacific, both starting on the same line. Big land that reaches into a box (Venezuela, Colombia, New Guinea, Australia...) is drawn there too, and
     the islands of the Pacific box get straight-sided "chain boxes" around each group. With --lakes (Natural Earth
     ne_10m_lakes.geojson) the Great Lakes and every lake that crosses a border are drawn as water.
  7. For every region records the position and size of its biggest piece, so the game can put a small
     click-circle on tiny countries ("marker"), and tags it with its continent and sub-region
     (for future continent maps).
Needs numpy, scipy and OpenCV (cv2) for the chain boxes of the Pacific box (pip install numpy scipy opencv-python).
"""
import argparse, collections, json, math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from map_generation import read_features

# ---------------------------------------------------------------------------
# Projection and layout
# ---------------------------------------------------------------------------
K = 20                      # SVG units per degree (of longitude, and of Miller "degree-equivalents" of latitude)
LAT_TOP, LAT_BOTTOM = 84.0, -60.0       # the map shows these latitudes (Greenland reaches 83.6; Antarctica is left out)
TOLERANCE = 0.03            # border simplification, in degrees (about 3 km)


def miller(lat):
    """Miller cylindrical: y in degree-equivalents (same units as longitude)."""
    r = math.radians(max(-89.0, min(89.0, lat)))
    return math.degrees(1.25 * math.log(math.tan(math.pi / 4 + 0.4 * r)))


W = int(360 * K)
H = int(round((miller(LAT_TOP) - miller(LAT_BOTTOM)) * K))


def mx(lon): return (lon + 180.0) * K
def my(lat): return (miller(LAT_TOP) - miller(lat)) * K


# ---------------------------------------------------------------------------
# Which source features to drop, merge, rename
# ---------------------------------------------------------------------------
DROP = {'ATA',            # Antarctica
        'PGA', 'BJN', 'SER', 'SCR', 'KAS',      # Spratly Is., Bajo Nuevo, Serranilla Bank, Scarborough Reef, Siachen Glacier
        # uninhabited islands and territories are not on the map at all:
        'UMI',                                  # U.S. Minor Outlying Islands (Caribbean and Pacific)
        'HMD', 'CLP', 'SGS', 'ATF', 'CSI',      # Heard & McDonald, Clipperton, South Georgia & S. Sandwich, French Southern & Antarctic Lands, Coral Sea Is.
        'IOT', 'ATC'}                           # British Indian Ocean Territory, Ashmore and Cartier Is.
MERGE_INTO = {'CNM': 'CYP',      # Cyprus U.N. buffer zone -> Cyprus
              'WSB': 'CYP',      # Akrotiri (British base) -> Cyprus
              'ESB': 'CYP',      # Dhekelia (British base) -> Cyprus
              'KAB': 'KAZ',      # Baikonur (leased by Russia) -> Kazakhstan
              'USG': 'CUB'}      # Guantanamo Bay -> Cuba

RENAMES = {
    'Saint Helena': 'Saint Helena, Ascension and Tristan da Cunha',      # (becomes an empty container: its pieces are split off below)
    'Åland': 'Åland Islands', 'Antigua and Barb.': 'Antigua and Barbuda', 'Ashmore and Cartier Is.': 'Ashmore and Cartier Islands',
    'Bosnia and Herz.': 'Bosnia and Herzegovina', 'Br. Indian Ocean Ter.': 'British Indian Ocean Territory',
    'British Virgin Is.': 'British Virgin Islands', 'Cayman Is.': 'Cayman Islands', 'Central African Rep.': 'Central African Republic',
    'Clipperton I.': 'Clipperton Island', 'Congo': 'Republic of the Congo', 'Cook Is.': 'Cook Islands', 'Coral Sea Is.': 'Coral Sea Islands',
    'Dem. Rep. Congo': 'Democratic Republic of the Congo', 'Dominican Rep.': 'Dominican Republic', 'Eq. Guinea': 'Equatorial Guinea',
    'Faeroe Is.': 'Faroe Islands', 'Falkland Is.': 'Falkland Islands', 'Fr. Polynesia': 'French Polynesia',
    'Fr. S. Antarctic Lands': 'French Southern and Antarctic Lands', 'Heard I. and McDonald Is.': 'Heard Island and McDonald Islands',
    'Indian Ocean Ter.': 'Indian Ocean Territories', 'Macedonia': 'North Macedonia', 'Marshall Is.': 'Marshall Islands',
    'N. Cyprus': 'Northern Cyprus', 'N. Mariana Is.': 'Northern Mariana Islands', 'Pitcairn Is.': 'Pitcairn Islands',
    'S. Geo. and the Is.': 'South Georgia and the South Sandwich Islands', 'S. Sudan': 'South Sudan', 'Solomon Is.': 'Solomon Islands',
    'St-Barthélemy': 'Saint Barthélemy', 'St-Martin': 'Saint Martin', 'St. Kitts and Nevis': 'Saint Kitts and Nevis',
    'St. Pierre and Miquelon': 'Saint Pierre and Miquelon', 'St. Vin. and Gren.': 'Saint Vincent and the Grenadines',
    'Swaziland': 'Eswatini', 'Turkey': 'Türkiye', 'Turks and Caicos Is.': 'Turks and Caicos Islands', 'U.S. Minor Outlying Is.': 'U.S. Minor Outlying Islands',
    'U.S. Virgin Is.': 'U.S. Virgin Islands', 'United States of America': 'United States', 'W. Sahara': 'Western Sahara',
    'Wallis and Futuna Is.': 'Wallis and Futuna', 'São Tomé and Principe': 'São Tomé and Príncipe', 'Micronesia': 'Micronesia',
    'Bahamas': 'The Bahamas', 'Gambia': 'The Gambia', 'Vatican': 'Vatican City', 'Macao': 'Macau',
}

# Members of the United Nations (ISO codes as used in the source file) plus the two observer states.
UN_MEMBERS = set("""AFG ALB DZA AND AGO ATG ARG ARM AUS AUT AZE BHS BHR BGD BRB BLR BEL BLZ BEN BTN BOL BIH BWA BRA BRN BGR BFA BDI CPV KHM
CMR CAN CAF TCD CHL CHN COL COM COG COD CRI CIV HRV CUB CYP CZE DNK DJI DMA DOM ECU EGY SLV GNQ ERI EST SWZ ETH FJI FIN FRA GAB GMB GEO DEU
GHA GRC GRD GTM GIN GNB GUY HTI HND HUN ISL IND IDN IRN IRQ IRL ISR ITA JAM JPN JOR KAZ KEN KIR PRK KOR KWT KGZ LAO LVA LBN LSO LBR LBY LIE
LTU LUX MDG MWI MYS MDV MLI MLT MHL MRT MUS MEX FSM MDA MCO MNG MNE MAR MOZ MMR NAM NRU NPL NLD NZL NIC NER NGA MKD NOR OMN PAK PLW PAN PNG
PRY PER PHL POL PRT QAT ROU RUS RWA KNA LCA VCT WSM SMR STP SAU SEN SRB SYC SLE SGP SVK SVN SLB SOM ZAF SDS ESP LKA SDN SUR SWE CHE SYR TJK
TZA THA TLS TGO TON TTO TUN TUR TKM TUV UGA UKR ARE GBR USA URY UZB VUT VEN VNM YEM ZMB ZWE""".split())
UN_OBSERVERS = {'VAT', 'PSX'}                # Vatican City and Palestine
# Not UN members, but recognised as sovereign states by some other states (they get capitals, see world_settings.py)
PARTLY_RECOGNISED = {'TWN', 'KOS', 'SAH', 'CYN'}

# ---------------------------------------------------------------------------
# SPLITS: parts that become regions of their own when the map's scope is 'all'.
# (parent source code, new name, test(lon, lat, polygon_extent_degrees), continent, sub-region)
# The test receives the centre of each piece of the parent. To split another part out, add a line.
# ---------------------------------------------------------------------------
def box(lon0, lon1, lat0, lat1):
    return lambda lon, lat: lon0 <= lon <= lon1 and lat0 <= lat <= lat1

# PIECE_DROPS: single islands that are removed from their country (uninhabited): (parent source code, test, what it is).
# The test receives the centre of each piece of the parent, like SPLITS below.
PIECE_DROPS = [
    ('NOR', box(-10, -7, 70.5, 71.5),   'Jan Mayen'),
    ('NOR', box(3, 4, -54.8, -54.2),    'Bouvet Island'),
    ('ZAF', box(37, 39, -47.5, -46),    'Marion Island and Prince Edward Islands'),
    ('SHN', box(-15, -14, -8.5, -7.5),  'Ascension Island'),
]

# DECOR: pieces that are drawn but are NOT part of the game (no highlight, no click, no circle): (parent code, name, test).
DECOR = [
    ('GNQ', 'Annobón', box(5.4, 5.9, -1.7, -1.1)),      # Equatorial Guinea's far island: its highlight overlapped São Tomé
]

# BREAKAWAY: disputed pieces that become a region of their own (not a part of any country): (parent code, name, test,
# continent, sub-region). In UN mode they are grey (not in the game).
BREAKAWAY = [
    ('RUS', 'Crimea', box(32.4, 36.7, 44.3, 46.3), 'Europe', 'Eastern Europe'),
]

# COMBINE: two places drawn as ONE region on the map (the game keeps a separate entry for each, see map-settings):
# (host, twin). The host's shape holds both; the twin has no shape of its own ("twin" field in the shapes file).
COMBINE = [('Saint Martin', 'Sint Maarten'), ('Sint Eustatius', 'Saba')]

# ISO 2-letter codes (for the flag files) of countries that Natural Earth's ISO_A2 leaves empty
ISO2_FIX = {'FRA': 'FR', 'NOR': 'NO', 'SXM': 'SX', 'SHN': 'SH'}

# JOINED: regions made of pieces that were cut and glued back together: the cut edges are not drawn
JOINED = {'Western Sahara', 'Morocco', 'Bosnia and Herzegovina'}

# NUDGE_MARKER: circles of neighbours that are too close together are moved apart: name -> (degrees east, degrees north)
NUDGE_MARKER = {
    'Hong Kong': (1.5, -0.2), 'Macau': (-1.5, 0.3),
    'Qatar': (0.9, -0.9), 'Bahrain': (-0.6, 0.9),
    'Samoa': (-1.3, 0.5), 'American Samoa': (1.0, -0.6),
}

SPLITS = [
    ('USA', 'Alaska',                  lambda lon, lat: lat > 50 and (lon < -129 or lon > 165), 'North America', 'Northern America'),
    ('USA', 'Hawaii',                  lambda lon, lat: 15 < lat < 30 and -180 <= lon <= -150, 'Oceania', 'Polynesia'),
    ('FRA', 'French Guiana',           box(-55, -51, 2, 6),            'South America', 'South America'),
    ('FRA', 'Guadeloupe',              box(-62, -60.9, 15.7, 16.6),    'North America', 'Caribbean'),
    ('FRA', 'Martinique',              box(-61.4, -60.7, 14.2, 15.0),  'North America', 'Caribbean'),
    ('FRA', 'Réunion',                 box(54.8, 56.2, -21.6, -20.7),  'Africa', 'Eastern Africa'),
    ('FRA', 'Mayotte',                 box(44.8, 45.5, -13.2, -12.5),  'Africa', 'Eastern Africa'),
    ('NOR', 'Svalbard',                box(5, 40, 73, 82),             'Europe', 'Northern Europe'),
    ('NLD', 'Bonaire',                 box(-68.6, -68.0, 11.9, 12.5),  'North America', 'Caribbean'),
    ('NLD', 'Saba',                    box(-63.4, -63.1, 17.5, 17.8),  'North America', 'Caribbean'),
    ('NLD', 'Sint Eustatius',          box(-63.1, -62.9, 17.4, 17.6),  'North America', 'Caribbean'),
    ('IOA', 'Christmas Island',        box(105.4, 105.9, -10.7, -10.3), 'Oceania', 'Australia and New Zealand'),
    ('IOA', 'Cocos (Keeling) Islands', box(96.6, 97.1, -12.4, -11.9),  'Oceania', 'Australia and New Zealand'),
    ('NZL', 'Tokelau',                 box(-173.2, -170.5, -10, -8),   'Oceania', 'Polynesia'),
    ('CHL', 'Easter Island (Rapa Nui)', box(-110, -105, -28, -26),     'Oceania', 'Polynesia'),
    ('ECU', 'Galápagos Islands',       box(-92.2, -89, -1.6, 1.8),     'South America', 'South America'),
    ('AUS', 'Tasmania',                box(143.4, 149, -44, -39.2),    'Oceania', 'Australia and New Zealand'),
    ('CAN', 'Newfoundland',            box(-59.6, -52.5, 46.5, 51.8),  'North America', 'Northern America'),
    ('CAN', 'Baffin Island',           box(-82, -60, 62.5, 74),        'North America', 'Northern America'),
    ('JPN', 'Okinawa Islands',         box(122.8, 131.6, 24, 27.9),    'Asia', 'Eastern Asia'),
    ('GBR', 'Orkney Islands',          box(-3.5, -2.2, 58.7, 59.5),    'Europe', 'Northern Europe'),
    ('GBR', 'Shetland Islands',        box(-2.1, -0.6, 59.8, 61.0),    'Europe', 'Northern Europe'),
    ('GBR', 'Hebrides',                box(-8.9, -5.7, 55.3, 58.6),    'Europe', 'Northern Europe'),
    ('FRA', 'Corsica',                 box(8.4, 9.7, 41.3, 43.2),      'Europe', 'Western Europe'),
    ('GRC', 'Crete',                   box(23.4, 26.5, 34.8, 35.8),    'Europe', 'Southern Europe'),
    ('ITA', 'Sardinia',                box(8.0, 9.9, 38.8, 41.35),     'Europe', 'Southern Europe'),
    ('ITA', 'Sicily',                  box(12.3, 15.7, 36.5, 38.5),    'Europe', 'Southern Europe'),
    ('ESP', 'Canary Islands',          box(-18.4, -13.3, 27.5, 29.6),  'Africa', 'Northern Africa'),
    ('ESP', 'Balearic Islands',        box(1.0, 4.5, 38.5, 40.3),      'Europe', 'Southern Europe'),
    ('PRT', 'Azores',                  box(-31.5, -24.8, 36.8, 39.9),  'Europe', 'Southern Europe'),
    ('PRT', 'Madeira',                 box(-17.4, -15.8, 29.9, 33.3),  'Africa', 'Northern Africa'),
    ('RUS', 'Sakhalin',                box(141.5, 144.9, 45.8, 54.6),  'Asia', 'Eastern Asia'),
    ('SHN', 'Saint Helena',            box(-6.3, -5.4, -16.3, -15.7),  'Africa', 'Western Africa'),
    ('SHN', 'Tristan da Cunha',       box(-13, -9, -41, -36),         'Africa', 'Western Africa'),
    ('RUS', 'Kaliningrad',             box(19, 23, 54, 55.8),          'Europe', 'Eastern Europe'),
]

# ---------------------------------------------------------------------------
# INSETS: fixed boxes under the map. Each lists the regions (source names after renaming, or split names)
# whose islands are copied into the box, and the window of the world it shows.
# ---------------------------------------------------------------------------
INSETS = [
    {'id': 'caribbean', 'title': 'Caribbean Islands', 'lonc': -72.5, 'lon_span': (-86.0, -58.5), 'lat_span': (9.5, 27.6),
     'regions': ['The Bahamas', 'Cuba', 'Jamaica', 'Haiti', 'Dominican Republic', 'Puerto Rico', 'U.S. Virgin Islands',
                 'British Virgin Islands', 'Anguilla', 'Saint Martin', 'Sint Maarten', 'Saint Barthélemy', 'Antigua and Barbuda',
                 'Saint Kitts and Nevis', 'Montserrat', 'Guadeloupe', 'Dominica', 'Martinique', 'Saint Lucia',
                 'Saint Vincent and the Grenadines', 'Barbados', 'Grenada', 'Trinidad and Tobago', 'Aruba', 'Curaçao', 'Bonaire',
                 'Saba', 'Sint Eustatius', 'Cayman Islands', 'Turks and Caicos Islands']},
    {'id': 'pacific', 'title': 'Pacific Islands', 'chains': True, 'lonc': 183.0, 'lon_span': (130.5, 237.0), 'lat_span': (-28.0, 22.6),
     'regions': ['Palau', 'Micronesia', 'Marshall Islands', 'Northern Mariana Islands', 'Guam', 'Nauru', 'Kiribati', 'Tuvalu',
                 'Solomon Islands', 'Vanuatu', 'Fiji', 'New Caledonia', 'Wallis and Futuna', 'Samoa', 'American Samoa', 'Tonga',
                 'Niue', 'Cook Islands', 'Tokelau', 'French Polynesia', 'Pitcairn Islands', 'Hawaii']},
]
# The boxes sit in a strip under the map and OVERLAP the bottom of the map, wherever the map is empty there: each
# box starts just under the lowest land above the Pacific box (South Africa and western Australia); the Caribbean box
# is on the same line, over the south-east Pacific (a few small islands off Chile / Argentina may be under it).
CARIBBEAN_HEIGHT = 1250     # height of both boxes in map units
KEEP_CLEAR = 14             # space kept between a box and the land above / beside it (units)
PACIFIC_RIGHT_LON = 129.0   # the Pacific box ends here (western Australia) and sits under South Africa and western Australia
CARIBBEAN_RIGHT_LON = -80.0 # the Caribbean box ends here (a little left of South America's west coast), on the same line
LAKE_MIN_EXTENT = 0.5       # lakes smaller than this (degrees) are not drawn
LAKE_FORCE = {'Lake Superior', 'Lake Michigan', 'Lake Huron', 'Lake Erie', 'Lake Ontario', 'Georgian Bay', 'North Channel'}   # the Great Lakes, even those inside one country
LAKE_SKIP = {'Syvash', 'South Aral Sea', 'North Aral Sea', 'Lake Champlain', 'Lake Nasser'}   # (Syvash: disputed Crimea; the Aral Sea is already water in the borders file)
CHAIN_PAD = 22              # Pacific chain boxes: space around the islands (units)
CHAIN_RES = 4               # Pacific chain boxes: grid size used to work them out (units)


# ---------------------------------------------------------------------------
# Geometry helpers
# ---------------------------------------------------------------------------
def polys(geometry):
    return geometry['coordinates'] if geometry['type'] == 'MultiPolygon' else [geometry['coordinates']]


def ring_area(ring):
    a = 0.0
    for i in range(len(ring)):
        x1, y1 = ring[i]
        x2, y2 = ring[(i + 1) % len(ring)]
        a += x1 * y2 - x2 * y1
    return a / 2


def point_in_ring(x, y, ring):
    """Is the point inside the ring? (ray casting)"""
    inside = False
    for i in range(len(ring) - 1):
        x1, y1 = ring[i][:2]
        x2, y2 = ring[i + 1][:2]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            inside = not inside
    return inside


def ring_centroid(ring):
    a = ring_area(ring)
    if abs(a) < 1e-12:
        return sum(p[0] for p in ring) / len(ring), sum(p[1] for p in ring) / len(ring)
    cx = cy = 0.0
    for i in range(len(ring)):
        x1, y1 = ring[i]
        x2, y2 = ring[(i + 1) % len(ring)]
        f = x1 * y2 - x2 * y1
        cx += (x1 + x2) * f
        cy += (y1 + y2) * f
    return cx / (6 * a), cy / (6 * a)


def bbox(ring):
    xs = [p[0] for p in ring]
    ys = [p[1] for p in ring]
    return min(xs), min(ys), max(xs), max(ys)


def dp(points, tol):
    """Douglas-Peucker on an open polyline (end points are kept). Returns the kept points."""
    n = len(points)
    if n <= 2:
        return list(points)
    keep = [False] * n
    keep[0] = keep[-1] = True
    stack = [(0, n - 1)]
    t2 = tol * tol
    while stack:
        i, j = stack.pop()
        x1, y1 = points[i]
        x2, y2 = points[j]
        dx, dy = x2 - x1, y2 - y1
        L2 = dx * dx + dy * dy
        best, k = -1.0, -1
        for m in range(i + 1, j):
            px, py = points[m]
            if L2 == 0:
                d2 = (px - x1) ** 2 + (py - y1) ** 2
            else:
                t = ((px - x1) * dx + (py - y1) * dy) / L2
                t = 0 if t < 0 else 1 if t > 1 else t
                d2 = (px - x1 - t * dx) ** 2 + (py - y1 - t * dy) ** 2
            if d2 > best:
                best, k = d2, m
        if best > t2:
            keep[k] = True
            stack.append((i, k))
            stack.append((k, j))
    return [p for p, kp in zip(points, keep) if kp]


class Simplifier:
    """Simplifies rings so that a border shared by two countries is simplified only once (identical in both)."""

    def __init__(self, tol):
        self.tol = tol
        self.owners = collections.defaultdict(set)      # vertex -> set of source features that use it
        self.cache = {}

    @staticmethod
    def key(p):
        return (round(p[0], 6), round(p[1], 6))

    def register(self, ring, owner):
        for p in ring:
            self.owners[self.key(p)].add(owner)

    def simplify(self, ring):
        pts = [tuple(p) for p in ring]
        if pts[0] == pts[-1]:
            pts = pts[:-1]
        n = len(pts)
        if n <= 4:
            return pts
        own = [self.owners[self.key(p)] for p in pts]
        edge = [own[i] & own[(i + 1) % n] for i in range(n)]            # who shares the edge i -> i+1
        cuts = [i for i in range(n) if edge[i - 1] != edge[i]]
        if len(cuts) < 2:                                              # a ring on its own: cut it in two
            far = max(range(n), key=lambda i: (pts[i][0] - pts[0][0]) ** 2 + (pts[i][1] - pts[0][1]) ** 2)
            cuts = sorted({0, far})
        out = []
        for a in range(len(cuts)):
            s, e = cuts[a], cuts[(a + 1) % len(cuts)]       # one arc runs from cut s to the next cut e
            arc, i = [pts[s]], s
            while i != e:
                i = (i + 1) % n
                arc.append(pts[i])
            fwd = tuple(arc)
            rev = tuple(reversed(arc))
            canon = fwd if fwd <= rev else rev
            simp = self.cache.get(canon)
            if simp is None:
                simp = dp(list(canon), self.tol)
                self.cache[canon] = simp
            res = simp if canon == fwd else list(reversed(simp))
            out.extend(res[:-1])
        return out


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('input')
    ap.add_argument('--out', required=True)
    ap.add_argument('--tolerance', type=float, default=TOLERANCE)
    ap.add_argument('--lakes', help='Natural Earth ne_10m_lakes.geojson (optional): draws the lakes that cross borders and the Great Lakes')
    args = ap.parse_args()

    feats = read_features(args.input)
    by_code = {f['properties']['ADM0_A3']: f for f in feats}

    # ---- 1. regions and their pieces (a piece = one polygon with its holes) ----
    regions = collections.OrderedDict()           # name -> dict
    parent_of_code = {}

    def new_region(name, code, props, kind, part_of=None, cont=None, sub=None):
        regions[name] = {'name': name, 'code': code, 'kind': kind, 'part_of': part_of, 'pieces': [],
                         'iso2': ((props.get('ISO_A2') if props.get('ISO_A2') not in (None, '-99') else ISO2_FIX.get(code)) if props else None),
                         'cont': cont or props.get('CONTINENT'), 'sub': sub or props.get('SUBREGION'),
                         'un': (code in UN_MEMBERS or code in UN_OBSERVERS)}

    for f in feats:
        p = f['properties']
        code = p['ADM0_A3']
        if code in DROP or code in MERGE_INTO:
            continue
        name = RENAMES.get(p['NAME'], p['NAME'])
        if code in UN_MEMBERS:
            kind = 'un'
        elif code in UN_OBSERVERS:
            kind = 'observer'
        elif code in PARTLY_RECOGNISED or p['TYPE'] == 'Indeterminate':
            kind = 'partial'
        else:
            kind = 'territory'
        new_region(name, code, p, kind)
        parent_of_code[code] = name
        for poly in polys(f['geometry']):
            regions[name]['pieces'].append({'poly': poly, 'src': code})
    for f in feats:                                # merge leased areas and the buffer zone into their parents
        code = f['properties']['ADM0_A3']
        if code in MERGE_INTO:
            target = regions[parent_of_code[MERGE_INTO[code]]]
            for poly in polys(f['geometry']):
                # A leased area that sits like an island inside its country (Baikonur, Guantanamo Bay) is a HOLE in the
                # country's shape. Closing the hole dissolves it into the country (no circle outline is left behind).
                cx, cy = ring_centroid(poly[0])
                closed = False
                for pc in target['pieces']:
                    for hk in range(1, len(pc['poly'])):
                        if point_in_ring(cx, cy, pc['poly'][hk]):
                            del pc['poly'][hk]
                            closed = True
                            break
                    if closed:
                        break
                if not closed:
                    target['pieces'].append({'poly': poly, 'src': code})

    # ---- 1b. uninhabited islands removed from their country ----
    for parent_code, test, what in PIECE_DROPS:
        parent = regions[parent_of_code[parent_code]]
        keep = [pc for pc in parent['pieces'] if not test(*ring_centroid(pc['poly'][0]))]
        if len(keep) == len(parent['pieces']):
            sys.exit('piece drop %s found no polygons in %s' % (what, parent['name']))
        print('  removed %-40s %3d polygon(s) from %s' % (what, len(parent['pieces']) - len(keep), parent['name']))
        parent['pieces'] = keep

    # ---- 1c. borders that Natural Earth draws differently from what the game wants ----
    def closed(ring):
        ring = [tuple(p[:2]) for p in ring]
        return ring if ring[0] == ring[-1] else ring + [ring[0]]

    def nearest_index(ring, pt):
        k = min(range(len(ring)), key=lambda i: math.hypot(ring[i][0] - pt[0], ring[i][1] - pt[1]))
        if math.hypot(ring[k][0] - pt[0], ring[k][1] - pt[1]) > 1e-4:
            sys.exit('border fix: no vertex near %s' % (pt,))
        return k

    # WESTERN SAHARA: the part that Morocco controls (Natural Earth draws it as Morocco, see "Morocco - Admin. by Morocco;
    # claimed by W. Sahara" in the disputed-areas file) is cut off Morocco along the border at 27 deg 40' N and added to
    # Western Sahara. In UN mode all of it is grey (Western Sahara is not a member state).
    mar, sah = regions['Morocco'], regions['Western Sahara']
    mpc = max(mar['pieces'], key=lambda pc: len(pc['poly'][0]))
    mring = closed(mpc['poly'][0])[:-1]
    i_e, i_w = nearest_index(mring, (-8.682385, 27.661439)), nearest_index(mring, (-13.178254, 27.662491))
    if not i_e < i_w:
        sys.exit('border fix: Morocco ring is not in the expected order')
    north = mring[i_w:] + mring[:i_e] + [mring[i_e]]                  # Morocco without the south
    south = mring[i_e:i_w] + [mring[i_w]]                              # the part Morocco administers in Western Sahara
    mar['pieces'].remove(mpc)
    mar['pieces'].append({'poly': [closed(north)] + mpc['poly'][1:], 'src': 'MAR'})
    sah['pieces'].append({'poly': [closed(south)], 'src': 'MAR'})
    print('  Western Sahara: %d vertices taken over from Morocco' % len(south))

    # BOSNIA AND HERZEGOVINA: Natural Earth's outline leaves out a big part of Republika Srpska (an enclosed gap of about
    # 11,500 km2 between Bosnia, Serbia and Montenegro). The gap is found from a picture of all the countries and the
    # east border of Bosnia is moved out to its edge.
    def fill_bosnia():
        import numpy as np, cv2
        bb, res = (17.8, 42.3, 20.0, 45.4), 0.004
        Wp, Hp = int((bb[2] - bb[0]) / res), int((bb[3] - bb[1]) / res)
        img = np.zeros((Hp, Wp), np.uint8)
        others = set()
        for f in feats:
            for pl in polys(f['geometry']):
                b = bbox(pl[0])
                if b[2] < bb[0] or b[0] > bb[2] or b[3] < bb[1] or b[1] > bb[3]:
                    continue
                if f['properties']['ADM0_A3'] != 'BIH':
                    others.update((round(p[0], 6), round(p[1], 6)) for p in pl[0])
                cv2.fillPoly(img, [np.array([[(p[0] - bb[0]) / res, (bb[3] - p[1]) / res] for p in pl[0]], np.int32)], 1)
                for h in pl[1:]:
                    cv2.fillPoly(img, [np.array([[(p[0] - bb[0]) / res, (bb[3] - p[1]) / res] for p in h], np.int32)], 0)
        n, lab, st, _ = cv2.connectedComponentsWithStats((img == 0).astype(np.uint8), connectivity=4)
        gap = None
        for i in range(1, n):
            x, y, w, h, a = st[i]
            if a > 3000 and x > 0 and y > 0 and x + w < Wp and y + h < Hp and 17.9 < bb[0] + x * res < 18.3:
                gap = i                                           # enclosed: not the sea
        if gap is None:
            print('  (no gap found in Bosnia: nothing changed)')
            return
        mask = cv2.dilate((lab == gap).astype(np.uint8), np.ones((3, 3), np.uint8))
        cs, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        c = cv2.approxPolyDP(max(cs, key=cv2.contourArea), 1.2, True).reshape(-1, 2)
        C = [(bb[0] + (x + 0.5) * res, bb[3] - (y + 0.5) * res) for x, y in c]
        bih = regions['Bosnia and Herzegovina']
        bpc = bih['pieces'][0]
        ring = closed(bpc['poly'][0])[:-1]
        free, run, runs = [(round(p[0], 6), round(p[1], 6)) not in others for p in ring], [], []
        for i, fr in enumerate(free + [False]):
            if fr:
                run.append(i)
            elif run:
                runs.append((run[0], run[-1]))
                run = []
        i0, i1 = max(runs, key=lambda r: r[1] - r[0])             # Bosnia's east border: the long stretch shared with nobody
        ia, ib = nearest_index_loose(C, ring[i0]), nearest_index_loose(C, ring[i1])
        fwd, bwd, k = [], [], ia
        while True:
            fwd.append(C[k])
            if k == ib:
                break
            k = (k + 1) % len(C)
        k = ia
        while True:
            bwd.append(C[k])
            if k == ib:
                break
            k = (k - 1) % len(C)
        old = ring[i0:i1 + 1]

        def far(arc):                                              # the arc that is NOT along Bosnia's old east border
            return sum(min(math.hypot(a[0] - o[0], a[1] - o[1]) for o in old[::4]) for a in arc) / len(arc)
        arc = max((fwd, bwd), key=far)
        bpc['poly'][0] = closed(ring[:i0] + arc + ring[i1 + 1:])
        print('  Bosnia: east border moved out over a gap of %d vertices' % len(arc))

    def nearest_index_loose(ring, pt):
        return min(range(len(ring)), key=lambda i: math.hypot(ring[i][0] - pt[0], ring[i][1] - pt[1]))
    fill_bosnia()

    # ---- 2. splits ----
    for parent_code, new_name, test, cont, sub in SPLITS:
        parent = regions[parent_of_code[parent_code]]
        moved = []
        for pc in parent['pieces']:
            lon, lat = ring_centroid(pc['poly'][0])
            if test(lon, lat):
                moved.append(pc)
        if not moved:
            sys.exit('split %s found no polygons in %s' % (new_name, parent['name']))
        parent['pieces'] = [pc for pc in parent['pieces'] if pc not in moved]
        new_region(new_name, parent['code'], {}, 'part', part_of=parent['name'], cont=cont or parent['cont'], sub=sub or parent['sub'])
        regions[new_name]['un'] = False
        regions[new_name]['pieces'] = moved
        print('  split %-26s %3d polygon(s) from %s' % (new_name, len(moved), parent['name']))

    # ---- 2a. breakaway: disputed pieces that become regions of their own ----
    for parent_code, new_name, test, cont, sub in BREAKAWAY:
        parent = regions[parent_of_code[parent_code]]
        moved = [pc for pc in parent['pieces'] if test(*ring_centroid(pc['poly'][0]))]
        if not moved:
            sys.exit('breakaway %s found no polygons in %s' % (new_name, parent['name']))
        parent['pieces'] = [pc for pc in parent['pieces'] if pc not in moved]
        new_region(new_name, 'X' + new_name[:2].upper(), {}, 'partial', cont=cont, sub=sub)
        regions[new_name]['un'] = False
        regions[new_name]['pieces'] = moved
        print('  breakaway %-22s %3d polygon(s) from %s' % (new_name, len(moved), parent['name']))

    # ---- 2b. decor: pieces drawn without being part of the game ----
    for parent_code, new_name, test in DECOR:
        parent = regions[parent_of_code[parent_code]]
        moved = [pc for pc in parent['pieces'] if test(*ring_centroid(pc['poly'][0]))]
        if not moved:
            sys.exit('decor %s found no polygons in %s' % (new_name, parent['name']))
        parent['pieces'] = [pc for pc in parent['pieces'] if pc not in moved]
        new_region(new_name, 'X' + parent_code[:2], {}, 'decor', cont=parent['cont'], sub=parent['sub'])
        regions[new_name]['un'] = False
        regions[new_name]['pieces'] = moved
        print('  decor %-27s %3d polygon(s) from %s' % (new_name, len(moved), parent['name']))

    # ---- 2c. combined places: the twin's pieces go into the host's shape ----
    hosts = {}
    for host, twin in COMBINE:
        regions[host]['pieces'] += regions[twin]['pieces']
        regions[twin]['pieces'] = []
        regions[twin]['twin'] = host
        hosts[host] = twin
        print('  combined %s with %s' % (twin, host))

    # ---- 3. simplify (topology-aware) ----
    simp = Simplifier(args.tolerance)
    for r in regions.values():
        for pc in r['pieces']:
            for ring in pc['poly']:
                simp.register(ring, pc['src'])
    n_before = sum(len(ring) for r in regions.values() for pc in r['pieces'] for ring in pc['poly'])
    for r in regions.values():
        new = []
        for pc in r['pieces']:
            rings = []
            for k, ring in enumerate(pc['poly']):
                bx = bbox(ring)
                ext = max(bx[2] - bx[0], bx[3] - bx[1])
                if k > 0 and ext < 0.15:                  # tiny lakes are dropped
                    continue
                s = simp.simplify(ring)
                if len(s) < 3:
                    s = [tuple(p) for p in ring][:-1] if len(ring) > 3 else [tuple(p) for p in ring]
                rings.append(s)
            if rings:
                new.append(rings)
        r['polys'] = new
    n_after = sum(len(ring) for r in regions.values() for poly in r['polys'] for ring in poly)
    print('points: %d -> %d' % (n_before, n_after))

    # ---- 4. paths, markers, sizes ----
    def region_paths(polys_, tf, seam=False, shared=False):
        """SVG paths of some polygons: (d, s).
        d  = the fill (all rings). On the main map, vertices on the 180th meridian are pushed 2 units outwards
             so the two copies of the world overlap slightly and no hairline shows between them.
        s  = the outline, only when some edges must NOT be drawn (otherwise ''): edges shared by two pieces of the
             same region (a leased area or buffer zone merged into its country, like Baikonur in Kazakhstan)
             and, on the main map, edges lying on the 180th meridian (the seam between the two copies)."""
        rings = []
        for poly in polys_:
            for ring in poly:
                pts, last = [], None
                for lon, lat in ring:
                    q = tf(lon, lat)
                    q = (int(round(q[0])), int(round(q[1])))
                    if q != last:
                        pts.append(q)
                        last = q
                if len(pts) > 1 and pts[0] == pts[-1]:
                    pts.pop()
                if len(pts) >= 3:
                    rings.append(pts)
        owners = collections.defaultdict(set)           # edge -> the rings it belongs to
        for k, pts in enumerate(rings):
            for i in range(len(pts)):
                a_, b_ = pts[i], pts[(i + 1) % len(pts)]
                owners[(a_, b_) if a_ < b_ else (b_, a_)].add(k)

        def hidden(a_, b_):
            if shared and len(owners[(a_, b_) if a_ < b_ else (b_, a_)]) > 1:      # shared by two rings of this region
                return True
            return seam and ((a_[0] == 0 and b_[0] == 0) or (a_[0] == W and b_[0] == W))

        def emit(pts, closed=True):
            seg = 'M%d,%d' % pts[0]
            seg += 'l' + ' '.join('%d,%d' % (pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]) for i in range(1, len(pts)))
            return seg + ('z' if closed else '')

        d, s_, any_hidden = [], [], False
        for pts in rings:
            fill = [((-2 if x == 0 else W + 2 if x == W else x), y) for x, y in pts] if seam else pts
            d.append(emit(fill))
            n = len(pts)
            keep = [not hidden(pts[i], pts[(i + 1) % n]) for i in range(n)]
            if all(keep):
                s_.append(emit(pts))
                continue
            any_hidden = True
            if not any(keep):
                continue
            i0 = keep.index(False)                      # start just after a hidden edge, so runs are not cut in two
            j = 1
            while j <= n:
                idx = (i0 + j) % n
                if keep[idx]:
                    run = [pts[idx]]
                    while keep[idx] and j <= n:
                        run.append(pts[(idx + 1) % n])
                        j += 1
                        idx = (i0 + j) % n
                    s_.append(emit(run, closed=False))
                else:
                    j += 1
        return ''.join(d), (''.join(s_) if any_hidden else '')

    def main_tf(lon, lat):
        return mx(lon), my(lat)

    # ---- 5. insets: size, and place them under the map (overlapping its empty bottom) ----
    def ring_pts_main(region):
        for poly in region['polys']:
            for lon, lat in poly[0]:
                yield main_tf(lon, lat)

    land = [p for rr in regions.values() for p in ring_pts_main(rr)]       # every vertex of all land on the main map

    def lowest_land(x0, x1):
        """the lowest land (largest y) of the main map between x0 and x1"""
        return max([y for x, y in land if x0 <= x <= x1] or [0])

    caribbean, pacific = INSETS[0], INSETS[1]
    car_range = miller(caribbean['lat_span'][1]) - miller(caribbean['lat_span'][0])
    pac_range = miller(pacific['lat_span'][1]) - miller(pacific['lat_span'][0])
    # both boxes are CARIBBEAN_HEIGHT tall and start on the same line, just under the lowest land above the Pacific box
    # (Africa and Australia); the Caribbean box is then slid left over the empty south-east Pacific until it touches no land
    caribbean['scale'] = CARIBBEAN_HEIGHT / car_range
    caribbean['w'] = (caribbean['lon_span'][1] - caribbean['lon_span'][0]) * caribbean['scale']
    pacific['scale'] = CARIBBEAN_HEIGHT / pac_range
    pacific['w'] = (pacific['lon_span'][1] - pacific['lon_span'][0]) * pacific['scale']
    pacific['x'] = mx(PACIFIC_RIGHT_LON) - pacific['w']
    top = lowest_land(pacific['x'] - 5, pacific['x'] + pacific['w'] + 5) + KEEP_CLEAR
    bottom = top + CARIBBEAN_HEIGHT
    caribbean['x'] = mx(CARIBBEAN_RIGHT_LON) - caribbean['w']
    for spec in INSETS:
        spec['top'] = top
        spec['h'] = CARIBBEAN_HEIGHT
    if pacific['x'] + pacific['w'] > W - 10 or caribbean['x'] < 0:
        sys.exit('the boxes do not fit under the map')
    strip_y = top                                                       # the strip starts where the boxes start
    strip_h = bottom - strip_y + 4                                       # (a little extra so the bottom line of the boxes shows)
    for spec in INSETS:
        spec['y'] = 0                                                   # (inside the strip)
        lon0 = spec['lon_span'][0]
        lat0, lat1 = spec['lat_span']

        def tf(lon, lat, spec=spec, lon0=lon0, lat1=lat1):
            dl = lon - lon0
            while dl < -90:
                dl += 360
            while dl > 270:
                dl -= 360
            return spec['x'] + dl * spec['scale'], spec['y'] + (miller(lat1) - miller(lat)) * spec['scale']
        spec['tf'] = tf
        print('  inset %-10s scale %.1f units/deg (main %d)  box %dx%d at x=%d, map y=%d' % (
            spec['id'], spec['scale'], K, spec['w'], spec['h'], spec['x'], spec['top']))
    print('  strip starts at y=%d (map is %d high: overlap %d units); everything ends at y=%d (%.0f%% of the old 5155)' % (
        strip_y, H, H - strip_y, bottom, 100.0 * bottom / 5155))

    # ---- 6. the shapes of every region, and the pieces of it that show in the boxes ----
    def lon_window(minx, maxx, lon0):
        while minx < lon0 - 90:
            minx += 360
            maxx += 360
        while minx > lon0 + 270:
            minx -= 360
            maxx -= 360
        return minx, maxx

    out_regions = []
    twins = []                                          # twins of combined places: filled in after the loop
    sites = {spec['id']: [] for spec in INSETS}                        # (x, y, region name) points, for the chain boxes
    for r in regions.values():
        if r.get('twin'):
            twins.append(r)
            continue
        if not r['polys']:                              # a parent whose every piece was split off (kept as an empty container)
            out_regions.append({'name': r['name'], 'code': r['code'], 'kind': r['kind'], 'un': r['un'], 'cont': r['cont'], 'sub': r['sub'], 'd': ''})
            continue
        is_host = r['name'] in hosts
        shared = r['code'] in MERGE_INTO.values() or is_host or r['name'] in JOINED   # edges between its pieces are not drawn
        d, stroke = region_paths(r['polys'], main_tf, seam=True, shared=shared)
        # biggest piece -> marker position and size (a combined place: all its pieces together)
        if is_host:
            boxes = [bbox(poly[0]) for poly in r['polys']]
            bx = (min(b[0] for b in boxes), min(b[1] for b in boxes), max(b[2] for b in boxes), max(b[3] for b in boxes))
            cx, cy = (bx[0] + bx[2]) / 2, (bx[1] + bx[3]) / 2
        else:
            best = max(r['polys'], key=lambda poly: abs(ring_area(poly[0])))
            bx = bbox(best[0])
            cx, cy = ring_centroid(best[0])
        size = max((bx[2] - bx[0]) * K, (bx[3] - bx[1]) * K * 1.0)
        nlon, nlat = NUDGE_MARKER.get(r['name'], (0, 0))
        rec = {'name': r['name'], 'code': r['code'], 'kind': r['kind'], 'cont': r['cont'], 'sub': r['sub'], 'd': d,
               'sz': int(round(size)), 'mk': [int(round(mx(cx))), int(round(my(cy)))]}
        if nlon or nlat:                                    # the circle sits here while the map is zoomed out (see NUDGE_MARKER)
            rec['mkn'] = [int(round(mx(cx + nlon))), int(round(my(cy + nlat)))]
        if r['code'] and r.get('iso2'):
            rec['iso2'] = r['iso2']                         # for the flag files
        if is_host:
            rec['twin_of'] = hosts[r['name']]               # (the other place that shares this shape)
        if stroke:
            rec['s'] = stroke                           # outline without the hidden edges (see region_paths)
        if r['un']:
            rec['un'] = 1
        if r['part_of']:
            rec['part_of'] = r['part_of']
        if r['kind'] == 'decor':
            rec['decor'] = 1                            # drawn only: no highlight, no click
        if size < 80:
            rec['small'] = 1                            # needs a wide invisible click area
        ins = {}
        for spec in INSETS:
            lon0, lon1 = spec['lon_span']
            lat0, lat1 = spec['lat_span']
            sel = []
            for poly in r['polys']:                     # every piece that touches the box (islands AND big land, like New Guinea)
                bx = bbox(poly[0])
                x0, x1 = lon_window(bx[0], bx[2], lon0)
                if x1 >= lon0 and x0 <= lon1 and bx[3] >= lat0 and bx[1] <= lat1:
                    sel.append(poly)
            if not sel:
                continue
            # size and marker position of the piece as far as it shows in the box (a combined place: all pieces together)
            best_sz, best_mk = -1, None
            all_x, all_y = [], []
            for poly in sel:
                pts = [spec['tf'](lon, lat) for lon, lat in poly[0]]
                xs = [min(max(q[0], spec['x']), spec['x'] + spec['w']) for q in pts]
                ys = [min(max(q[1], spec['y']), spec['y'] + spec['h']) for q in pts]
                all_x += xs
                all_y += ys
                sz = max(max(xs) - min(xs), max(ys) - min(ys))
                if sz > best_sz:
                    best_sz, best_mk = sz, [int(round((max(xs) + min(xs)) / 2)), int(round((max(ys) + min(ys)) / 2))]
                for q in pts:                           # the points of this piece that lie inside the box
                    if spec['x'] <= q[0] <= spec['x'] + spec['w'] and spec['y'] <= q[1] <= spec['y'] + spec['h']:
                        sites[spec['id']].append((q[0], q[1], r['name']))
            if is_host:
                best_sz = max(max(all_x) - min(all_x), max(all_y) - min(all_y))
                best_mk = [int(round((max(all_x) + min(all_x)) / 2)), int(round((max(all_y) + min(all_y)) / 2))]
            if (nlon or nlat) and best_mk:                    # nudge the circle in the box by the same number of degrees
                q0, q1 = spec['tf'](cx, cy), spec['tf'](cx + nlon, cy + nlat)
                best_mk = [best_mk[0] + int(round(q1[0] - q0[0])), best_mk[1] + int(round(q1[1] - q0[1]))]
            idp, ids = region_paths(sel, spec['tf'], shared=shared)
            ins[spec['id']] = {'d': idp, 'mk': best_mk, 'sz': int(round(best_sz))}
            if ids:
                ins[spec['id']]['s'] = ids
        if ins:
            rec['ins'] = ins
        out_regions.append(rec)

    for r in twins:                                     # twins: no shape of their own, they share their host's
        host = [o for o in out_regions if o['name'] == r['twin']][0]
        rec = {'name': r['name'], 'code': r['code'], 'kind': r['kind'], 'cont': r['cont'], 'sub': r['sub'], 'd': '',
               'sz': 0, 'mk': host['mk'], 'twin': r['twin']}
        if r.get('iso2'):
            rec['iso2'] = r['iso2']
        if r['un']:
            rec['un'] = 1
        if r['part_of']:
            rec['part_of'] = r['part_of']
        out_regions.append(rec)

    # ---- 7. chain boxes around the island groups of the Pacific box ----
    def chain_boxes(spec):
        """Straight-sided outlines around each island group / territory: for every region, the part of the
        padded convex hull of its islands that is nearer to its own islands than to any other region's land."""
        import numpy as np, cv2
        from scipy.spatial import cKDTree
        pts = np.array([(x - spec['x'], y - spec['y']) for x, y, _ in sites[spec['id']]], dtype=float)
        names = [n for _, _, n in sites[spec['id']]]
        keep, seen = [], set()
        for i, (x, y) in enumerate(pts):                  # thin the points out (one per 6 x 6 units)
            c = (int(x // 6), int(y // 6), names[i])
            if c not in seen:
                seen.add(c)
                keep.append(i)
        pts = pts[keep]
        names = [names[i] for i in keep]
        gw, gh = int(spec['w'] / CHAIN_RES) + 1, int(spec['h'] / CHAIN_RES) + 1
        gx, gy = np.meshgrid((np.arange(gw) + 0.5) * CHAIN_RES, (np.arange(gh) + 0.5) * CHAIN_RES)
        _, nearest = cKDTree(pts).query(np.c_[gx.ravel(), gy.ravel()])
        labels = np.array(names, dtype=object)[nearest].reshape(gh, gw)
        paths = []
        for rname in spec['regions']:
            mine = pts[[i for i, n in enumerate(names) if n == rname]]
            if len(mine) < 1:
                continue
            hull = np.zeros((gh, gw), np.uint8)
            hp = (mine / CHAIN_RES).astype(np.int32).reshape(-1, 1, 2)
            cv2.fillConvexPoly(hull, cv2.convexHull(hp), 1) if len(mine) >= 3 else cv2.polylines(hull, [hp], False, 1)
            k = int(CHAIN_PAD / CHAIN_RES) * 2 + 1
            hull = cv2.dilate(hull, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k)))
            mask = ((labels == rname) & (hull > 0)).astype(np.uint8)
            contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            for c in contours:
                if cv2.contourArea(c) < 4:
                    continue
                c = cv2.approxPolyDP(c, 1.6, True).reshape(-1, 2)      # straight lines (1.6 grid cells = 6 units of slack)
                if len(c) < 3:
                    continue
                q = [(int(round(x * CHAIN_RES + spec['x'])), int(round(y * CHAIN_RES + spec['y']))) for x, y in c]
                paths.append('M%d,%d' % q[0] + 'l' + ' '.join('%d,%d' % (q[i][0] - q[i - 1][0], q[i][1] - q[i - 1][1]) for i in range(1, len(q))) + 'z')
        return ''.join(paths)

    # ---- 8. lakes that cross borders (and the Great Lakes) ----
    lakes_out = []
    if args.lakes:
        import numpy as np
        from matplotlib.path import Path
        feats_c = []                                      # (country code, polygon, bbox, outer-ring Path, hole Paths)
        for f in feats:
            for pl in polys(f['geometry']):
                feats_c.append((f['properties']['ADM0_A3'], pl, bbox(pl[0]), Path(np.array([p[:2] for p in pl[0]])),
                                [Path(np.array([p[:2] for p in h])) for h in pl[1:]]))

        def countries_in(b, pl):
            """the countries that the lake polygon lies in (sampled on a grid of points inside it)"""
            gx, gy = np.meshgrid(b[0] + (np.arange(14) + 0.5) * (b[2] - b[0]) / 14, b[1] + (np.arange(14) + 0.5) * (b[3] - b[1]) / 14)
            pts = np.c_[gx.ravel(), gy.ravel()]
            lake = Path(np.array([p[:2] for p in pl[0]]))
            pts = pts[lake.contains_points(pts)]
            for h in pl[1:]:
                if len(pts):
                    pts = pts[~Path(np.array([p[:2] for p in h])).contains_points(pts)]
            found = set()
            for code, cpl, cb, cpath, choles in feats_c:
                if cb[0] > b[2] or cb[2] < b[0] or cb[1] > b[3] or cb[3] < b[1] or not len(pts):
                    continue
                ins_ = cpath.contains_points(pts)
                for h in choles:
                    ins_ &= ~h.contains_points(pts)
                if ins_.any():
                    found.add(code)
            return found
        for lf in read_features(args.lakes):
            nm = lf['properties'].get('name_en') or lf['properties'].get('name') or ''
            full = lf['properties'].get('name') or ''
            for pl in polys(lf['geometry']):
                b = bbox(pl[0])
                ext = max(b[2] - b[0], b[3] - b[1])
                if ext < LAKE_MIN_EXTENT or b[3] > LAT_TOP or b[1] < LAT_BOTTOM:
                    continue
                if full in LAKE_SKIP:
                    continue
                forced = full in LAKE_FORCE
                crossing = False
                if not forced:
                    crossing = len(countries_in(b, pl)) >= 2
                if forced or crossing:
                    rings_l = []
                    for ring in pl:
                        sm = dp([tuple(p[:2]) for p in ring], args.tolerance)
                        if len(sm) >= 3:
                            rings_l.append(sm)
                    if rings_l:
                        ld, _ = region_paths([rings_l], main_tf)
                        lakes_out.append({'name': full or nm, 'd': ld})
                        print('  lake %-28s %s' % (full or nm, 'Great Lakes' if forced else 'crosses a border'))

    insets_out = []
    for spec in INSETS:
        lat0, lat1 = spec['lat_span']
        lon0, lon1 = spec['lon_span']
        rec = {'id': spec['id'], 'title': spec['title'], 'x': round(spec['x'], 1), 'y': round(spec['y'], 1),
               'w': round(spec['w'], 1), 'h': round(spec['h'], 1), 'lon0': lon0, 'lon1': lon1, 'lat0': lat0, 'lat1': lat1,
               's': round(spec['scale'], 4)}
        if spec.get('chains'):
            rec['chains'] = chain_boxes(spec)
        insets_out.append(rec)
    data = {'id': 'world',
            'projection': {'type': 'miller', 'k': K, 'lat_top': LAT_TOP, 'lat_bottom': LAT_BOTTOM},
            'scale': K, 'size': [W, H], 'wrap': True, 'strip': [W, int(round(strip_h))], 'strip_y': int(round(strip_y)),
            'total': int(round(bottom)), 'insets': insets_out, 'lakes': lakes_out,
            'regions': out_regions}
    text = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
    header = ('/* Map SHAPES file for the world map, generated by tools/world.py - do not edit by hand.\n'
              '   Source: Natural Earth 10m Admin 0 - Countries (public domain, naturalearthdata.com).\n'
              '   Drawn with the Miller projection (%d units per degree; one world = %d units wide).\n'
              '   Region fields: name, code (source ISO code), kind (un / observer / partial / territory / part),\n'
              '     un (1 = UN member or observer), part_of (parent name, for parts split out of a country),\n'
              '     cont / sub (continent and sub-region, for future continent maps), d (SVG path), sz (size of the\n'
              '     biggest piece in units), mk ([x, y] of that piece), small (1 = needs a wide click area),\n'
              '     ins ({inset id: {d: path, mk: [x, y], sz: size} in the fixed strip under the map}).\n'
              '   Names, capitals and options are in map-settings/world.js. */\n') % (K, W)
    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    open(args.out, 'w', encoding='utf-8').write(header + '(window.GeoMapShapes = window.GeoMapShapes || []).push(' + text + ');\n')
    print('wrote %s (%d KB), %d regions, map %dx%d units' % (args.out, len(text) // 1024, len(out_regions), W, H))


if __name__ == '__main__':
    main()
