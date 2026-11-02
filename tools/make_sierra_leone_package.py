"""
Make the UNOFFICIAL, updated Sierra Leone boundary package (same files as the HDX download)
=========================================================================================
Built on the best publicly available data at the time. NOT an official boundary.

  python3 make_sierra_leone_package.py <folder with the original sle_*.geojson files> \\
          --settings ../map-settings/sierra_leone.js --out <output folder>

The original is "Sierra Leone - Subnational Administrative Boundaries" (COD-AB SLE, version v02),
Humanitarian Data Exchange: https://data.humdata.org/dataset/cod-ab-sle   Licence CC BY-IGO.

Writes the same 14 files, with the same fields, as the original package, updated with the changes in
sierra_leone.py: sle_admin0..4 (+ _em edge-matched versions), sle_adminlines(_em), sle_adminpoints,
sle_admincapitals. Features that were changed carry an extra field "unofficial_change".

How the files are made:
  - admin4 (sections): geometry is unchanged; names / codes of the chiefdom, district and province
    above each section are updated.
  - admin3 (chiefdoms): untouched chiefdoms keep their original geometry; Jahn, Njaluahun, Gbanti Kamaranka
    and Nieni are merged from sections; moved chiefdoms get their new district.
  - admin2 / admin1: merged from the chiefdoms (the district / province outlines are re-drawn). Unchanged
    ones are copied. area_sqkm of re-drawn features is the sum of their sections' area_sqkm.
  - adminlines: re-drawn from the section edges (level 0 = outer edge; 1-4 = the highest level that
    differs across the edge). The original level 99 lines are copied unchanged.
  - adminpoints: one point per feature at its centre. admincapitals: the district capitals used in SINGE.
  - New districts and Jahn Chiefdom have no official P-codes, so their *_pcode fields are empty.
"""
import argparse, collections, json, os, re, sys, zipfile
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from map_generation import dissolve, rings
import sierra_leone as rules

SOURCE = 'https://data.humdata.org/dataset/cod-ab-sle'
NOTICE = ('UNOFFICIAL. Built on the best publicly available data at the time; not an official boundary. '
          'Original data: Sierra Leone - Subnational Administrative Boundaries (COD-AB), Government of Sierra Leone / '
          'OCHA / ITOS, via the Humanitarian Data Exchange (%s), licence CC BY-IGO. '
          'Modified by SINGE (github.com/togetherings/singe); see README.md for the list of changes.' % SOURCE)
CRS = {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}}
CHANGES = {
    'Bandajuma': 'New district. Made from the Wonde (Bo), Sowa, Pejeh (Futa Peje), Barri, Makpele and Soro Gbema (Pujehun), '
                 'and Langrama, Niawa and Tunkia (Kenema) chiefdoms.',
    'Kpanguima': 'New district (also spelled Kpanguma or Panguma). Made from the Lower Bambara, Malegohun (Kenema), Yawei, '
                 'Penguia, Kpeje West, Kpeje Bongre (Kailahun) chiefdoms and the new Jahn Chiefdom. Kpeje Bongre is now two '
                 'chiefdoms (Kpeje and Bongre); their boundary is not yet known, so they are one here.',
    'Kenema': 'Lost the Lower Bambara, Malegohun, Langrama, Niawa and Tunkia chiefdoms to the new districts.',
    'Kailahun': 'Lost the Yawei, Penguia, Kpeje West and Kpeje Bongre chiefdoms and the Falley and Jonga sections of '
                'Njaluahun (now Jahn Chiefdom) to Kpanguima District.',
    'Bo': 'Lost Wonde Chiefdom to Bandajuma District.',
    'Pujehun': 'Lost the Sowa, Pejeh (Futa Peje), Barri, Makpele and Soro Gbema chiefdoms to Bandajuma District.',
    'Falaba': 'Name spelling corrected from "Fabala". Includes the Barawa and Wollay sections of Nieni Chiefdom.',
    'Koinadugu': 'Lost the Barawa and Wollay sections of Nieni Chiefdom to Falaba District.',
    'Karene': 'Includes the sections of Gbanti Kamaranka Chiefdom that did not join Bombali.',
    'Bombali': 'Includes some sections of Gbanti Kamaranka Chiefdom.',
}


# ---- geometry helpers ---------------------------------------------------------------------------
def area(r):
    return sum(a[0] * b[1] - b[0] * a[1] for a, b in zip(r, r[1:])) / 2


def inside(pt, r):
    x, y, c = pt[0], pt[1], False
    for (x1, y1), (x2, y2) in zip(r, r[1:]):
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            c = not c
    return c


def to_geometry(ring_list):
    """Closed rings (outer borders and holes, any order) -> GeoJSON Polygon / MultiPolygon.
    A ring inside an even number of other rings is an outer border, otherwise a hole."""
    ring_list = [r for r in ring_list if len(r) >= 4 and abs(area(r)) > 0]
    ring_list.sort(key=lambda r: -abs(area(r)))
    depth = [sum(1 for o in ring_list[:i] if inside(r[0], o)) for i, r in enumerate(ring_list)]
    polys, poly_of = [], {}
    for i, r in enumerate(ring_list):
        rr = [[round(x, 6), round(y, 6)] for x, y in r]
        if depth[i] % 2 == 0:                  # outer border, anticlockwise (RFC 7946)
            poly_of[i] = len(polys)
            polys.append([rr if area(rr) > 0 else rr[::-1]])
        else:                                  # hole, clockwise
            owner = max(j for j in range(i) if depth[j] == depth[i] - 1 and inside(r[0], ring_list[j]))
            polys[poly_of[owner]].append(rr if area(rr) < 0 else rr[::-1])
    return {'type': 'Polygon', 'coordinates': polys[0]} if len(polys) == 1 else \
           {'type': 'MultiPolygon', 'coordinates': polys}


def polys_of(g):
    return g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]


def centre(g):
    """A point inside the biggest part of the shape, near its centre: (lon, lat)."""
    big = max(polys_of(g), key=lambda p: abs(area(p[0])))
    outer, holes = big[0], big[1:]
    A = area(outer)
    cx = sum((a[0] + b[0]) * (a[0] * b[1] - b[0] * a[1]) for a, b in zip(outer, outer[1:])) / (6 * A)
    cy = sum((a[1] + b[1]) * (a[0] * b[1] - b[0] * a[1]) for a, b in zip(outer, outer[1:])) / (6 * A)
    ok = lambda p: inside(p, outer) and not any(inside(p, h) for h in holes)
    if ok((cx, cy)):
        return round(cx, 8), round(cy, 8)
    xs = []                                    # centroid not inside: use the widest stretch along its latitude
    for r in [outer] + holes:
        for (x1, y1), (x2, y2) in zip(r, r[1:]):
            if (y1 > cy) != (y2 > cy):
                xs.append((x2 - x1) * (cy - y1) / (y2 - y1) + x1)
    xs.sort()
    best = max(zip(xs[0::2], xs[1::2]), key=lambda s: s[1] - s[0])
    return round((best[0] + best[1]) / 2, 8), round(cy, 8)


# ---- file helpers -------------------------------------------------------------------------------
def load(folder, name):
    return json.load(open(os.path.join(folder, 'sle_%s.geojson' % name), encoding='utf-8'))


def save(folder, name, features):
    """Write like the original files: a few header lines, then one feature per line."""
    with open(os.path.join(folder, 'sle_%s.geojson' % name), 'w', encoding='utf-8') as fh:
        fh.write('{\n"type": "FeatureCollection",\n"name": "sle_%s",\n"crs": %s,\n"unofficial": %s,\n"features": [\n'
                 % (name, json.dumps(CRS), json.dumps(NOTICE)))
        fh.write(',\n'.join(json.dumps(f, ensure_ascii=False) for f in features))
        fh.write('\n]\n}\n')


def feat(props, geometry):
    return {'type': 'Feature', 'properties': props, 'geometry': geometry}


def fix_spelling(props):
    for k in ('adm2_name', 'name'):
        if props.get(k) in rules.SPELLING_FIXES:
            props[k] = rules.SPELLING_FIXES[props[k]]
    return props


def level_props(level, name, pcode, parents, area_sqkm, centre_ll, source_props, change):
    """Properties in the same order as the original file for this admin level."""
    p = collections.OrderedDict()
    for lv in range(level, 0, -1):
        if lv == level:
            p['adm%d_name' % lv] = name
            for i in (1, 2, 3):
                p['adm%d_name%d' % (lv, i)] = None
            p['adm%d_pcode' % lv] = pcode
        else:
            nm, pc = parents[lv]
            p['adm%d_name' % lv] = nm
            for i in (1, 2, 3):
                p['adm%d_name%d' % (lv, i)] = None
            p['adm%d_pcode' % lv] = pc
    for k in ('adm0_name', 'adm0_name1', 'adm0_name2', 'adm0_name3', 'adm0_pcode', 'valid_on', 'valid_to', 'version'):
        p[k] = source_props[k]
    p['area_sqkm'] = round(area_sqkm, 8)
    for k in ('lang', 'lang1', 'lang2', 'lang3'):
        p[k] = source_props[k]
    if level == 4:
        p['adm4_ref'] = source_props.get('adm4_ref', 'None')
    p['center_lat'], p['center_lon'] = centre_ll[1], centre_ll[0]
    p['unofficial_change'] = change
    return p


def read_capitals(settings_path):
    text = open(settings_path, encoding='utf-8').read()
    out = {}
    for m in re.finditer(r"'([^']+)': \{\s*province: '([^']*)',\s*capital: \{ name: '([^']*)', lat: ([-\d.]+), "
                         r"lon: ([-\d.]+), info: '([^']*)'", text):
        out[m.group(1)] = (m.group(3), float(m.group(4)), float(m.group(5)), m.group(6))
    return out


# ---- one variant (plain or edge-matched) ----------------------------------------------------------
def build_variant(src, out, em, caps_unused=None):
    sfx = '_em' if em else ''
    adm0, adm1, adm2 = load(src, 'admin0' + sfx), load(src, 'admin1' + sfx), load(src, 'admin2' + sfx)
    adm3, adm4 = load(src, 'admin3' + sfx), load(src, 'admin4' + sfx)
    a3, a4 = adm3['features'], adm4['features']
    tmpl = a4[0]['properties']
    prov_pcode = {f['properties']['adm1_name']: f['properties']['adm1_pcode'] for f in adm1['features']}
    dist_pcode = {rules.SPELLING_FIXES.get(f['properties']['adm2_name'], f['properties']['adm2_name']):
                  f['properties']['adm2_pcode'] for f in adm2['features']}
    for f in a3 + a4:
        fix_spelling(f['properties'])
    units = rules.build_units(a3, a4)

    # which unit owns each section
    owner, by_pcode = {}, {}
    for i, u in enumerate(units):
        if u.get('whole'):
            by_pcode[u['pcode']] = i
        else:
            for g in u['geometry']:
                owner[id(g)] = i
    sec_unit = []
    for f in a4:
        i = owner.get(id(f['geometry']), by_pcode.get(f['properties']['adm3_pcode']))
        assert i is not None, f['properties']
        sec_unit.append(i)
    sec_area = collections.defaultdict(float)
    for f, i in zip(a4, sec_unit):
        sec_area[i] += f['properties']['area_sqkm']
    src3 = {f['properties']['adm3_pcode']: f for f in a3}

    def parents(u):
        return {2: (u['district'], dist_pcode.get(u['district'])), 1: (u['province'], prov_pcode[u['province']])}

    # ---- admin3 (chiefdoms) ----
    feats3, unit_geom = [], {}
    order = sorted(range(len(units)), key=lambda i: (units[i]['district'], units[i]['pcode'] or 'ZZ', units[i]['chiefdom']))
    for i in order:
        u = units[i]
        if u.get('whole') and not u['note']:                    # untouched: keep the original feature as it is
            f = json.loads(json.dumps(src3[u['pcode']]))
            sp, g = f['properties'], f['geometry']
            p = level_props(3, sp['adm3_name'], sp['adm3_pcode'], parents(u), sp['area_sqkm'],
                            (sp['center_lon'], sp['center_lat']), sp, None)
        elif u.get('whole'):                                    # moved to another district: same shape
            f = src3[u['pcode']]
            sp, g = f['properties'], f['geometry']
            p = level_props(3, u['chiefdom'], u['pcode'], parents(u), sp['area_sqkm'],
                            (sp['center_lon'], sp['center_lat']), sp, u['note'])
        else:                                                   # merged from sections
            g = to_geometry(dissolve(u['geometry']))
            sp = src3[u['pcode']]['properties'] if u['pcode'] else a3[0]['properties']
            p = level_props(3, u['chiefdom'], u['pcode'], parents(u), sec_area[i], centre(g), sp, u['note'])
        unit_geom[i] = g
        feats3.append(feat(p, g))
    # ---- admin4 (sections): same shapes, new parents ----
    feats4 = []
    for f, i in zip(a4, sec_unit):
        u, sp = units[i], f['properties']
        p = level_props(4, sp['adm4_name'], sp['adm4_pcode'], {**parents(u), 3: (u['chiefdom'], u['pcode'])},
                        sp['area_sqkm'], (sp['center_lon'], sp['center_lat']), sp, None)
        changed = (u['district'] != rules.SPELLING_FIXES.get(sp['adm2_name'], sp['adm2_name'])) or u['chiefdom'] != sp['adm3_name']
        if changed:
            p['unofficial_change'] = 'Now in %s Chiefdom, %s District, %s Province.' % (u['chiefdom'], u['district'], u['province'])
        feats4.append(feat(p, f['geometry']))

    # ---- admin2 (districts) ----
    changed_d = {u['district'] for u in units if u['note']} | {u['old_district'] for u in units if u['note']} | {'Falaba'}
    feats2 = []
    for name in sorted({u['district'] for u in units}, key=lambda n: (dist_pcode.get(n) or 'ZZ', n)):
        mine = [i for i, u in enumerate(units) if u['district'] == name]
        province = units[mine[0]]['province']
        src_f = [f for f in adm2['features'] if rules.SPELLING_FIXES.get(f['properties']['adm2_name'], f['properties']['adm2_name']) == name]
        if name not in changed_d and src_f:
            f = json.loads(json.dumps(src_f[0])); sp = f['properties']
            p = level_props(2, name, sp['adm2_pcode'], {1: (province, prov_pcode[province])}, sp['area_sqkm'],
                            (sp['center_lon'], sp['center_lat']), sp, None)
            feats2.append(feat(p, f['geometry']))
            continue
        g = to_geometry(dissolve([x for i in mine for x in units[i]['geometry']]))
        sp = src_f[0]['properties'] if src_f else adm2['features'][0]['properties']
        p = level_props(2, name, dist_pcode.get(name), {1: (province, prov_pcode[province])},
                        sum(sec_area[i] for i in mine), centre(g), sp, CHANGES.get(name))
        feats2.append(feat(p, g))
    feats2.sort(key=lambda f: (f['properties']['adm1_pcode'], f['properties']['adm2_pcode'] or 'ZZ'))

    # ---- admin1 (provinces) ----
    changed_p = {u['province'] for u in units if u['note']}
    feats1 = []
    for f in adm1['features']:
        sp = f['properties']; name = sp['adm1_name']
        mine = [i for i, u in enumerate(units) if u['province'] == name]
        if name in changed_p:
            g = to_geometry(dissolve([x for i in mine for x in units[i]['geometry']]))
            p = level_props(1, name, sp['adm1_pcode'], {}, sum(sec_area[i] for i in mine), centre(g), sp,
                            'Re-drawn: districts moved between provinces; includes the new districts.')
            feats1.append(feat(p, g))
        else:
            p = level_props(1, name, sp['adm1_pcode'], {}, sp['area_sqkm'], (sp['center_lon'], sp['center_lat']), sp, None)
            feats1.append(feat(p, f['geometry']))
    # admin0: copied (the country outline does not change)
    feats0 = adm0['features']

    save(out, 'admin0' + sfx, feats0); save(out, 'admin1' + sfx, feats1); save(out, 'admin2' + sfx, feats2)
    save(out, 'admin3' + sfx, feats3); save(out, 'admin4' + sfx, feats4)

    # ---- boundary lines, from the section edges ----
    key = lambda p: (round(p[0], 6), round(p[1], 6))
    edges = collections.defaultdict(set)               # edge -> section numbers
    for n, f in enumerate(a4):
        for poly in polys_of(f['geometry']):
            for r in poly:
                for a, b in zip(r, r[1:]):
                    a, b = key(a), key(b)
                    if a != b:
                        edges[(a, b) if a < b else (b, a)].add(n)
    ident = [(units[i]['province'], units[i]['district'], i) for i in sec_unit]
    ident = [(p, d, i, f['properties']['adm4_pcode']) for (p, d, i), f in zip(ident, a4)]
    level_edges = collections.defaultdict(list)
    for e, ns in edges.items():
        ns = sorted(ns)
        if len(ns) == 1:
            lv = 0
        else:
            x, y = ident[ns[0]], ident[ns[1]]
            lv = 1 if x[0] != y[0] else 2 if x[1] != y[1] else 3 if x[2] != y[2] else 4
        level_edges[lv].append(e)
    # The original keeps the coastline as level 99 (copied below), so level 0 is the land border only.
    orig_lines = load(src, 'adminlines' + sfx)['features']
    coast = set()
    for f in orig_lines:
        if f['properties']['adm_level'] == 99:
            co = [key(p) for p in f['geometry']['coordinates']]
            coast.update((a, b) if a < b else (b, a) for a, b in zip(co, co[1:]))
    level_edges[0] = [e for e in level_edges[0] if e not in coast]
    lines = []
    for lv in range(5):
        adj = collections.defaultdict(list)
        for a, b in level_edges[lv]:
            adj[a].append(b); adj[b].append(a)
        used = set()

        def walk(start, nxt):
            path = [start, nxt]; used.add(frozenset((start, nxt)))
            while len(adj[path[-1]]) == 2:
                cur = path[-1]
                n = [x for x in adj[cur] if frozenset((cur, x)) not in used]
                if not n:
                    break
                used.add(frozenset((cur, n[0]))); path.append(n[0])
            return path
        for node in [n for n in adj if len(adj[n]) != 2]:
            for nb in adj[node]:
                if frozenset((node, nb)) not in used:
                    lines.append((lv, walk(node, nb)))
        for node in list(adj):                              # closed loops
            for nb in adj[node]:
                if frozenset((node, nb)) not in used:
                    lines.append((lv, walk(node, nb)))
    meta = orig_lines[0]['properties']
    out_lines = [feat({'adm_level': lv, 'name': None, 'valid_on': meta['valid_on'], 'valid_to': meta['valid_to'],
                       'version': meta['version'], 'right_pcod': None, 'left_pcod': None},
                      {'type': 'LineString', 'coordinates': [list(p) for p in path]}) for lv, path in lines]
    out_lines += [f for f in orig_lines if f['properties']['adm_level'] == 99]
    save(out, 'adminlines' + sfx, out_lines)
    return feats0, feats1, feats2, feats3, feats4, dist_pcode, prov_pcode


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('source'); ap.add_argument('--settings', required=True); ap.add_argument('--out', required=True)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    res = {}
    for em in (False, True):
        res[em] = build_variant(a.source, a.out, em)
        print('variant', 'edge-matched' if em else 'plain', [len(x) for x in res[em][:5]])
    f0, f1, f2, f3, f4, dist_pcode, prov_pcode = res[False]

    # ---- points: one per feature (centre) ----
    pt_meta = load(a.source, 'adminpoints')['features'][0]['properties']
    pts = []
    for lv, feats in ((0, f0), (1, f1), (2, f2), (3, f3), (4, f4)):
        for f in feats:
            sp = f['properties']
            p = collections.OrderedDict()
            p['admin_level'] = lv
            p['name'] = sp['adm%d_name' % lv] if lv else sp['adm0_name']
            p['name1'] = p['name2'] = p['name3'] = None
            p['x_coord'], p['y_coord'] = sp['center_lon'], sp['center_lat']
            for k in (4, 3, 2, 1):
                p['adm%d_name' % k] = sp['adm%d_name' % k] if k <= lv else None
                for i in (1, 2, 3):
                    p['adm%d_name%d' % (k, i)] = None
                p['adm%d_pcode' % k] = sp['adm%d_pcode' % k] if k <= lv else None
            for k in ('adm0_name', 'adm0_name1', 'adm0_name2', 'adm0_name3', 'adm0_pcode', 'valid_on', 'valid_to', 'version',
                      'lang', 'lang1', 'lang2', 'lang3'):
                p[k] = pt_meta[k]
            pts.append(feat(p, {'type': 'Point', 'coordinates': [p['x_coord'], p['y_coord']]}))
    save(a.out, 'adminpoints', pts)

    # ---- capitals: the original national and provincial capitals + a capital for every district ----
    orig = load(a.source, 'admincapitals')['features']
    caps = read_capitals(a.settings)
    out = []
    for f in orig:
        p = f['properties']
        if p['adm_p_lvl'] in (0, 1):
            if p['adm1_name'] == 'Northen':
                p['adm1_name'] = 'Northern'
            out.append(f)
    tmpl = [f for f in orig if f['properties']['adm_p_lvl'] == 2][0]['properties']
    prov_of = {f['properties']['adm2_name']: f['properties']['adm1_name'] for f in f2}
    for f in f2:
        n = f['properties']['adm2_name']
        cname, lat, lon, info = caps[n]
        p = collections.OrderedDict(tmpl)
        p.update(adm_p_lvl=2, name=cname, x_coord=lon, y_coord=lat, adm2_name=n, adm2_pcode=f['properties']['adm2_pcode'],
                 adm1_name=f['properties']['adm1_name'], adm1_pcode=f['properties']['adm1_pcode'])
        p['unofficial_change'] = ('Capital of the new %s District.' % n) if n in rules.NEW_DISTRICTS else None
        out.append(feat(p, {'type': 'Point', 'coordinates': [lon, lat]}))
    for f in out:
        f['properties'].setdefault('unofficial_change', None)
    save(a.out, 'admincapitals', out)
    print('capitals', len(out), 'points', len(pts))


if __name__ == '__main__':
    main()
