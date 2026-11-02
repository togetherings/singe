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
  - Gbanti Kamarank chiefdom (spelled Gbanti Kamaranka in the output) split: some sections joined Bombali, the rest Karene
  - Nieni chiefdom split: Barawa and Wollay joined Falaba, the rest stayed in Koinadugu
  - Bandajuma District (new, Southern Province) from chiefdoms of Bo, Pujehun and Kenema
  - Kpanguima District (new, Eastern Province) from chiefdoms of Kenema and Kailahun,
    including the new Jahn Chiefdom, made from the Falley and Jonga sections of Njaluahun
  - Spelling fix in the source data: Fabala -> Falaba

The same rules are used by make_sierra_leone_geojson.py to write the GeoJSON files.
"""
import collections
from map_generation import dissolve

# Spelling mistakes in the source data -> correct names.
SPELLING_FIXES = {'Fabala': 'Falaba'}

# Chiefdoms whose smaller parts (ADM4 "sections") belong to different districts.
# Each entry: old chiefdom name (as in the ADM3 file) -> where its sections go.
#   'default'   the district that keeps every section not listed
#   other keys  a district, with the sections moving there. A section is given
#               either by NAME (text) or by NUMBER (its position 1, 2, 3...
#               when the sections are sorted by ADM4 pcode).
SPLITS = {   # keys are the source's spellings
    'Gbanti Kamarank': {'default': 'Karene', 'Bombali': [3, 11, 12, 13, 14, 15, 16, 17]},
    'Nieni': {'default': 'Koinadugu', 'Falaba': ['Barawa', 'Wollay']},
}

# Chiefdom names corrected from the source spelling.
RENAMES = {'Gbanti Kamarank': 'Gbanti Kamaranka'}

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
        # plus the new Jahn Chiefdom, see NEW_CHIEFDOMS
    },
}

# New chiefdoms made from sections of an old one: new name -> (old chiefdom pcode, district, sections).
# The sections left over stay in the old chiefdom.
NEW_CHIEFDOMS = {
    'Jahn': ('SL010111', 'Kpanguima', ['Falley', 'Jonga']),      # from Njaluahun
}


def build_units(adm3, adm4):
    """Return the chiefdom pieces after all changes, as a list of dicts:
    chiefdom, district, province, geometry (a list of source geometries to merge), note.
    A chiefdom cut in two (Gbanti Kamarank, Nieni, Njaluahun) gives one piece per district."""
    code_to_new = {c: (d, n) for d, cs in NEW_DISTRICTS.items() for c, n in cs.items()}
    new_chiefdom_parents = {v[0] for v in NEW_CHIEFDOMS.values()}
    units = []

    def province(f_props, district):
        if district in NEW_DISTRICT_PROVINCE:
            return NEW_DISTRICT_PROVINCE[district]
        return PROVINCE_FIXES.get(f_props['adm1_name'], f_props['adm1_name'])

    for f in adm3:
        p = f['properties']
        name = p['adm3_name']
        old_district = SPELLING_FIXES.get(p['adm2_name'], p['adm2_name'])
        if name in SPLITS or p['adm3_pcode'] in new_chiefdom_parents:
            continue                                  # handled section by section below
        if p['adm3_pcode'] in code_to_new:
            district, name = code_to_new[p['adm3_pcode']]
            note = 'Moved from %s District to %s District.' % (old_district, district)
        else:
            district, note = old_district, ''
        units.append({'chiefdom': name, 'district': district, 'province': province(p, district),
                      'geometry': [f['geometry']], 'note': note, 'old_district': old_district,
                      'pcode': p['adm3_pcode'],
                      'whole': True})

    # chiefdoms divided between districts (Gbanti Kamarank, Nieni)
    for chiefdom, rule in SPLITS.items():
        src = [f for f in adm3 if f['properties']['adm3_name'] == chiefdom][0]['properties']
        shown = RENAMES.get(chiefdom, chiefdom)         # name used in the output
        sections = sorted([f for f in adm4 if f['properties']['adm3_name'] == chiefdom],
                          key=lambda f: f['properties']['adm4_pcode'])
        by_dest = collections.defaultdict(list)
        for number, f in enumerate(sections, 1):
            dest = rule['default']
            for district, picks in rule.items():
                if district != 'default' and (number in picks or f['properties']['adm4_name'] in picks):
                    dest = district
            by_dest[dest].append(f['geometry'])
        for dest, geoms in by_dest.items():
            units.append({'chiefdom': shown, 'district': dest, 'province': province(src, dest),
                          'geometry': geoms, 'old_district': SPELLING_FIXES.get(src['adm2_name'], src['adm2_name']),
                          'pcode': src['adm3_pcode'],
                          'note': 'Part of the original %s chiefdom (a new chiefdom boundary has not been published); '
                                  'its sections were divided between districts.' % shown})

    # new chiefdoms cut out of an old one (Jahn out of Njaluahun)
    for new_name, (parent_code, district, picks) in NEW_CHIEFDOMS.items():
        src = [f for f in adm3 if f['properties']['adm3_pcode'] == parent_code][0]['properties']
        sections = [f for f in adm4 if f['properties']['adm3_pcode'] == parent_code]
        found = {f['properties']['adm4_name'] for f in sections}
        assert set(picks) <= found, 'sections not found: %s' % (set(picks) - found)
        old_district = SPELLING_FIXES.get(src['adm2_name'], src['adm2_name'])
        moved = [f['geometry'] for f in sections if f['properties']['adm4_name'] in picks]
        kept = [f['geometry'] for f in sections if f['properties']['adm4_name'] not in picks]
        units.append({'chiefdom': new_name, 'district': district, 'province': province(src, district),
                      'geometry': moved, 'old_district': old_district, 'pcode': None,
                      'note': 'New chiefdom made from the %s sections of %s Chiefdom.'
                              % (' and '.join(picks), src['adm3_name'])})
        units.append({'chiefdom': src['adm3_name'], 'district': old_district, 'province': province(src, old_district),
                      'geometry': kept, 'old_district': old_district, 'pcode': parent_code,
                      'note': 'Reduced: the %s sections became Jahn Chiefdom.' % ' and '.join(picks)})
    # A district's province is the province of the whole chiefdoms that stayed in it (so sections of
    # Gbanti Kamarank that joined Bombali are Northern, those that joined Karene are North Western).
    prov = dict(NEW_DISTRICT_PROVINCE)
    for u in units:
        if len(u['geometry']) == 1 and u['district'] not in prov:
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
