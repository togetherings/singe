"""
Sierra Leone: map-specific code for map_generation.py
=====================================================
Run from the tools folder with the chiefdom (ADM3) and section (ADM4) files:

  python3 map_generation.py sle_admin3.geojson sle_admin4_em.geojson \\
          --id sierra_leone --out ../maps/sierra_leone.js --script sierra_leone.py

The 18 district outlines are built by merging chiefdom polygons, because the
published district data does not show the changes made since it was drawn.
UNOFFICIAL: these changes are a best effort from the best public information
available (see data/sierra_leone/README.md); they are not an official boundary.

Changes made to the source data (COD-AB SLE, HDX):
  - Bandajuma District (new, Southern Province) from chiefdoms of Bo, Pujehun and Kenema
  - Kpanguima District (new, Eastern Province) from chiefdoms of Kenema and Kailahun
  - Chiefdoms divided into new chiefdoms (see CHIEFDOM_SPLITS): Gbanti Kamarank (-> Gbanti in Karene and
    Kamaranka in Bombali), Nieni (-> Wollay Barawa in Falaba, Kalian, and Nieni), Mongo (-> Kamadugu Yiraia,
    Morifindugu, Delemandugu, Mongo), Neya (-> Kulor Saradu, Nyedu, Neya), Njaluahun (-> Jahn, Njaluahun)
  - Spelling fix in the source data: Fabala -> Falaba
Other chiefdom splits around the country are NOT covered.

The same rules are used by make_sierra_leone_package.py to write the GeoJSON files.
"""
import collections
from map_generation import dissolve

# Spelling mistakes in the source data -> correct names.
SPELLING_FIXES = {'Fabala': 'Falaba'}

# Chiefdoms that were divided. Key: the chiefdom's name in the source ADM3 file. Value: the chiefdoms it
# became, as (new name, district, sections, keeps the old P-code?).
#   district  None = stays in the same district as before
#   sections  names of ADM4 sections (text) or their NUMBER (position 1, 2, 3... when sorted by ADM4 pcode);
#             'rest' = every section not given to another piece
#   the old P-code is kept only by the piece that continues the old name; new chiefdoms have no P-code
CHIEFDOM_SPLITS = {
    'Gbanti Kamarank': [
        ('Gbanti', 'Karene', 'rest', False),
        ('Kamaranka', 'Bombali', [3, 11, 12, 13, 14, 15, 16, 17], False),
    ],
    'Nieni': [
        ('Wollay Barawa', 'Falaba', ['Barawa', 'Wollay'], False),
        ('Kalian', None, ['Kalian'], False),
        ('Nieni', None, 'rest', True),                       # Yiffin and Sumbaria
    ],
    'Mongo': [
        ('Kamadugu Yiraia', None, ['Upper Kamadugu', 'Lower Kamadugu', 'Yiraia'], False),
        ('Morifindugu', None, ['Morifindugu'], False),
        ('Delemandugu', None, ['Benadugu', 'Mankalia', 'Deldugu'], False),
        ('Mongo', None, 'rest', True),                       # Mongo I and Mongo II
    ],
    'Neya': [
        ('Kulor Saradu', None, ['Kulor', 'Saradu'], False),
        ('Nyedu', None, ['Nyedu'], False),
        ('Neya', None, 'rest', True),                        # Neya I and Neya II
    ],
    'Njaluahun': [
        ('Jahn', 'Kpanguima', ['Falley', 'Jonga'], False),
        ('Njaluahun', None, 'rest', True),
    ],
}

# Provinces. The two new districts are placed by hand; the others keep the source's province.
PROVINCE_FIXES = {}      # provinces keep the source's names (the game's settings file has its own)
NEW_DISTRICT_PROVINCE = {'Bandajuma': 'Southern', 'Kpanguima': 'Eastern'}

# New districts: chiefdoms (by ADM3 pcode, so Niawa in Kenema is not confused with Niawa Lenga in Bo)
# that moved into them.
NEW_DISTRICTS = {
    'Bandajuma': {
        'SL030115': 'Wonde',            # from Bo
        'SL030411': 'Sowa',             # from Pujehun
        'SL010207': 'Langrama',         # from Kenema
        'SL010210': 'Niawa',            # from Kenema
        'SL030409': 'Pejeh (Futa Peje)',  # from Pujehun
        'SL030401': 'Barri',            # from Pujehun
        'SL010215': 'Tunkia',           # from Kenema
        'SL030405': 'Makpele',          # from Pujehun
        'SL030410': 'Soro Gbema',       # from Pujehun
    },
    'Kpanguima': {
        'SL010208': 'Lower Bambara',    # from Kenema
        'SL010209': 'Malegohun',        # from Kenema
        'SL010114': 'Yawei',            # from Kailahun
        'SL010112': 'Penguia',          # from Kailahun
        'SL010107': 'Kpeje West',       # from Kailahun
        'SL010106': 'Kpeje Bongre',     # from Kailahun (now two chiefdoms, Kpeje and Bongre; the split is not yet known)
        # plus the new Jahn Chiefdom, see CHIEFDOM_SPLITS
    },
}


def build_units(adm3, adm4):
    """Return the chiefdom pieces after all changes, as a list of dicts:
    chiefdom, district, province, geometry (a list of source geometries to merge), note, pcode,
    old_district, whole (True when it is a whole source chiefdom, not made from sections)."""
    code_to_new = {c: (d, n) for d, cs in NEW_DISTRICTS.items() for c, n in cs.items()}
    units = []

    def province(f_props, district):
        if district in NEW_DISTRICT_PROVINCE:
            return NEW_DISTRICT_PROVINCE[district]
        return PROVINCE_FIXES.get(f_props['adm1_name'], f_props['adm1_name'])

    for f in adm3:
        p = f['properties']
        name = p['adm3_name']
        old_district = SPELLING_FIXES.get(p['adm2_name'], p['adm2_name'])
        if name in CHIEFDOM_SPLITS:
            continue                                  # handled section by section below
        if p['adm3_pcode'] in code_to_new:
            district, name = code_to_new[p['adm3_pcode']]
            note = 'Moved from %s District to %s District.' % (old_district, district)
        else:
            district, note = old_district, ''
        units.append({'chiefdom': name, 'district': district, 'province': province(p, district),
                      'geometry': [f['geometry']], 'note': note, 'old_district': old_district,
                      'pcode': p['adm3_pcode'], 'whole': True})

    # chiefdoms divided into new chiefdoms, section by section
    for old_name, pieces in CHIEFDOM_SPLITS.items():
        src = [f for f in adm3 if f['properties']['adm3_name'] == old_name][0]['properties']
        old_district = SPELLING_FIXES.get(src['adm2_name'], src['adm2_name'])
        sections = sorted([f for f in adm4 if f['properties']['adm3_pcode'] == src['adm3_pcode']],
                          key=lambda f: f['properties']['adm4_pcode'])
        names = {f['properties']['adm4_name'] for f in sections}
        taken = set()
        for new_name, district, picks, keep_code in pieces:
            if picks == 'rest':
                continue
            for pick in picks:
                assert pick in names or isinstance(pick, int), 'section not found in %s: %s' % (old_name, pick)
            mine = [f for n, f in enumerate(sections, 1)
                    if n in picks or f['properties']['adm4_name'] in picks]
            assert mine and not (taken & {id(f) for f in mine}), 'sections overlap in %s' % old_name
            taken |= {id(f) for f in mine}
        for new_name, district, picks, keep_code in pieces:
            if picks == 'rest':
                mine = [f for f in sections if id(f) not in taken]
            else:
                mine = [f for n, f in enumerate(sections, 1) if n in picks or f['properties']['adm4_name'] in picks]
            district = district or old_district
            secs = ', '.join(f['properties']['adm4_name'] for f in mine)
            if keep_code:
                note = 'Reduced: the other sections of %s Chiefdom became new chiefdoms. Remaining sections: %s.' % (old_name, secs)
            else:
                note = 'New chiefdom (no P-code yet) made from sections of the former %s Chiefdom: %s.' % (old_name, secs)
            units.append({'chiefdom': new_name, 'district': district, 'province': province(src, district),
                          'geometry': [f['geometry'] for f in mine], 'old_district': old_district,
                          'pcode': src['adm3_pcode'] if keep_code else None, 'note': note, 'whole': False})
    # A district's province is the province of the whole chiefdoms that stayed in it.
    prov = dict(NEW_DISTRICT_PROVINCE)
    for u in units:
        if u['whole'] and u['district'] not in prov:
            prov[u['district']] = u['province']
    for u in units:
        u['province'] = prov[u['district']]
    return units


def get_features(inputs):
    from map_generation import read_features
    adm3, adm4 = read_features(inputs[0]), read_features(inputs[1])
    pieces = collections.defaultdict(list)          # district name -> polygons to merge
    for u in build_units(adm3, adm4):
        pieces[u['district']].extend(u['geometry'])
    features = []
    for name, geoms in sorted(pieces.items()):
        rs = dissolve(geoms)
        print(name, len(geoms), 'pieces ->', len(rs), 'ring(s)')
        features.append({'name': name, 'geometry': {'type': 'Polygon', 'coordinates': rs}})
    return features
