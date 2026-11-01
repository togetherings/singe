"""
Sierra Leone: map-specific code for map_generation.py
=====================================================
Run from the tools folder with the chiefdom (ADM3) and section (ADM4) files:

  python3 map_generation.py sle_admin3.geojson sle_admin4_em.geojson \\
          --id sierra_leone --out ../maps/sierra_leone.js --script sierra_leone.py

The 16 district outlines are built by merging chiefdom polygons, because the
district data does not show some changes made to chiefdoms:
  - Gbanti Kamarank chiefdom split: some sections joined Bombali, the rest Karene
  - Nieni chiefdom split: Barawa and Wollay joined Falaba, the rest stayed in Koinadugu
It also fixes a spelling mistake in the source data (Fabala -> Falaba).
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
SPLITS = {
    'Gbanti Kamarank': {'default': 'Karene', 'Bombali': [3, 11, 12, 13, 14, 15, 16, 17]},
    'Nieni': {'default': 'Koinadugu', 'Falaba': ['Barawa', 'Wollay']},
}


def get_features(inputs):
    from map_generation import read_features
    adm3, adm4 = read_features(inputs[0]), read_features(inputs[1])
    pieces = collections.defaultdict(list)          # district name -> polygons to merge
    for f in adm3:                                  # every chiefdom goes to its own district...
        p = f['properties']
        if p['adm3_name'] not in SPLITS:
            pieces[SPELLING_FIXES.get(p['adm2_name'], p['adm2_name'])].append(f['geometry'])
    for chiefdom, rule in SPLITS.items():           # ...except split chiefdoms, handled section by section
        sections = sorted([f for f in adm4 if f['properties']['adm3_name'] == chiefdom],
                          key=lambda f: f['properties']['adm4_pcode'])
        for number, f in enumerate(sections, 1):
            dest = rule['default']
            for district, picks in rule.items():
                if district != 'default' and (number in picks or f['properties']['adm4_name'] in picks):
                    dest = district
            pieces[dest].append(f['geometry'])
    features = []
    for name, geoms in sorted(pieces.items()):
        rs = dissolve(geoms)
        print(name, len(geoms), 'pieces ->', len(rs), 'ring(s)')
        features.append({'name': name, 'geometry': {'type': 'Polygon', 'coordinates': rs}})
    return features
