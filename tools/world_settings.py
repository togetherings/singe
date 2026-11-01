#!/usr/bin/env python3
"""
World map: first version of map-settings/world.js
=================================================
Writes the hand-editable settings file of the world map, with a capital for every region that is a
sovereign state in someone's view. Run it ONCE to create the file (running it again overwrites your edits):

  python3 world_settings.py ../maps/world.js ne_10m_populated_places_simple.shp --out ../map-settings/world.js

Capitals come from Natural Earth's populated places (public domain). Rules:
  - Only UN members, the two UN observers (Vatican City, Palestine) and the places other states recognise as
    sovereign (Taiwan, Kosovo, Western Sahara, Northern Cyprus) get a capital. Territories and parts do not.
  - When Natural Earth lists more than one capital for a country (South Africa, Benin, Bolivia, Netherlands...),
    the MOST POPULATED city is used. (Edit the file to change one; see the table printed by this script.)
  - Palestine has no capital in the data, so its most populated "region capital" is used (Gaza City).
"""
import argparse, collections, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from map_generation import read_features
from world import UN_MEMBERS, UN_OBSERVERS, PARTLY_RECOGNISED

ALIAS = {'SDS': 'SSD'}                     # the countries file and the cities file spell South Sudan differently
MANUAL = {                                 # capitals missing from the cities file: code -> (name, lat, lon)
    'NRU': ('Yaren', -0.5477, 166.9209),
    'CYN': ('North Nicosia', 35.1856, 33.3823),
}


NO_CAPITAL = {'VAT'}                        # Vatican City is a region only: no capital circle in the Capitals mode
NUDGE = {                                   # capitals that are too close to a neighbour for their circles to show
    'COG': (-4.014, 15.115),                #   Brazzaville and Kinshasa are 4 km apart: each moved 0.3 degrees
    'COD': (-4.571, 15.490),
    'CYP': (34.970, 33.370),                #   Nicosia and North Nicosia are 2 km apart: moved to 0.4 degrees apart
    'CYN': (35.300, 33.550),                #   away from the other (along the river), so zoomed-in circles are full size
}
NUDGE.update({'QAT': (24.387, 52.433), 'BHR': (27.136, 49.983), 'WSM': (-13.336, -173.069)})   # Doha, Manama, Apia: moved about 1.3 degrees
# Places that are not countries but get a capital because the game combines them in pairs (see COMBINE in world.py):
# region name -> (capital, lat, lon). They only exist in the 'all' scope.
CAPITAL_EXTRA = {
    'Saint Martin': ('Marigot', 18.0675, -63.0829),
    'Sint Maarten': ('Philipsburg', 18.0237, -63.0458),
    'Sint Eustatius': ('Oranjestad', 17.4838, -62.9840),
    'Saba': ('The Bottom', 17.6340, -63.2467),
}
INFO = {                                    # the note shown for the combined places (Practice mode: click the circle)
    'Saint Martin': 'The northern part of the island of Saint Martin, a French overseas collectivity. The island is shared with Sint Maarten (the Netherlands), so on this map the two are ONE region and ONE circle. In the games, click that circle to answer for either of them.',
    'Sint Maarten': 'The southern part of the island of Saint Martin, a country within the Kingdom of the Netherlands. The island is shared with Saint Martin (France), so on this map the two are ONE region and ONE circle. In the games, click that circle to answer for either of them.',
    'Sint Eustatius': 'A Dutch special municipality in the Caribbean, right next to Saba. The two islands are close together and are administered the same way by the Netherlands, so on this map they are ONE region and ONE circle. In the games, click that circle to answer for either of them.',
    'Saba': 'A Dutch special municipality in the Caribbean, right next to Sint Eustatius. The two islands are close together and are administered the same way by the Netherlands, so on this map they are ONE region and ONE circle. In the games, click that circle to answer for either of them.',
}
# places whose flag file is not named after their own ISO code (parts of countries that have a flag of their own)
FLAG_FILE = {'Svalbard': 'sj', 'Bonaire': 'bq', 'Christmas Island': 'cx', 'Cocos (Keeling) Islands': 'cc', 'Tokelau': 'tk',
             'French Guiana': 'gf', 'Guadeloupe': 'gp', 'Martinique': 'mq', 'Réunion': 're', 'Mayotte': 'yt', 'Saint Helena': 'sh'}
WITH_REGION = {'ITA': 'Vatican City'}       # Rome's circle also stands for Vatican City in Practice mode


def js(s):
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'") + "'"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('shapes')
    ap.add_argument('places')
    ap.add_argument('--out', required=True)
    ap.add_argument('--flags', help='folder with the flag files (<2-letter code>.svg): they are copied to flags/world/ next to the maps')
    args = ap.parse_args()

    text = open(args.shapes, encoding='utf-8').read()
    shapes = json.loads(text[text.index('.push(') + 6:text.rindex(');')])
    cities = read_features(args.places)
    cands = collections.defaultdict(list)
    for f in cities:
        p = f['properties']
        fc = p['featurecla']
        if fc in ('Admin-0 capital', 'Admin-0 capital alt', 'Admin-0 region capital'):
            lon, lat = f['geometry']['coordinates']
            cands[p['adm0_a3']].append((fc, p['name'], int(float(p['pop_max'])), lat, lon))

    eligible = UN_MEMBERS | UN_OBSERVERS | PARTLY_RECOGNISED
    caps, report = {}, []                      # region name -> (capital, region it shares a circle with, moved position)
    for r in shapes['regions']:
        code = r['code']
        if r['name'] in CAPITAL_EXTRA:
            caps[r['name']] = (CAPITAL_EXTRA[r['name']], None, None)
            report.append('%-26s %-18s (added by hand: the game combines it with a neighbour)' % (r['name'], CAPITAL_EXTRA[r['name']][0]))
            continue
        if r.get('part_of') or code not in eligible or code in NO_CAPITAL:
            continue
        lst = cands.get(ALIAS.get(code, code), []) or cands.get(code, [])
        main_caps = [c for c in lst if c[0] != 'Admin-0 region capital']
        pool = main_caps or lst
        if pool:
            best = max(pool, key=lambda c: c[2])
            cap = (best[1], round(best[3], 4), round(best[4], 4))
            if len(pool) > 1:
                report.append('%-26s %-18s (of: %s)' % (r['name'], best[1], ', '.join('%s %d' % (c[1], c[2]) for c in sorted(pool, key=lambda c: -c[2]))))
        elif code in MANUAL:
            cap = MANUAL[code]
            report.append('%-26s %-18s (added by hand: not in the cities file)' % (r['name'], cap[0]))
        else:
            print('  NO CAPITAL for', r['name'], code)
            continue
        nudge = None
        if code in NUDGE:                       # the real position stays in lat / lon; the game shows the circle at "nudge"
            nudge = NUDGE[code]                 # only while the map is zoomed out (see nudge_zoom_levels)
            report.append('%-26s %-18s (circle moved while zoomed out, so it is not squashed by its neighbour)' % (r['name'], cap[0]))
        caps[r['name']] = (cap, WITH_REGION.get(code), nudge)

    # flags: <iso2>.svg in the flags folder; a few places use another place's file
    flags, missing, used = {}, [], set()
    if args.flags:
        have = set(f[:-4] for f in os.listdir(args.flags) if f.endswith('.svg'))
        for r in shapes['regions']:
            if r.get('decor'):
                continue
            iso = FLAG_FILE.get(r['name'], (r.get('iso2') or '').lower())
            if iso and iso in have:
                flags[r['name']] = 'flags/world/%s.svg' % iso
                used.add(iso)
            elif r['d'] or r['name'] in caps:
                missing.append(r)
    rows = [(r['name'],) + caps.get(r['name'], (None, None, None)) + (flags.get(r['name'], ''),)
            for r in shapes['regions'] if r['name'] in caps or r['name'] in flags]

    out = ["""/* ==========================================================================
   MAP SETTINGS: World   (hand-edited - the map SHAPES are in maps/world.js)
   --------------------------------------------------------------------------
   See map-settings/sierra_leone.js for an explanation of the settings every map has.
   Settings that are specific to this map:
     scope             'un'  the 193 UN member states, plus Vatican City and Palestine, are the regions of the
                             game. Everything else is drawn in grey and is not asked about, and parts of a
                             country (Alaska, French Guiana, Svalbard...) belong to that country.
                       'all' every country AND territory is a region of its own, and the far-away parts of a
                             country are separate regions too (Alaska, Hawaii, French Guiana, Kaliningrad...).
                       (a different scope is a different game, so its scores are saved separately)
     infinite_scroll   true: dragging the map sideways goes round the world without end. false: the map has edges.
                       (config.js has the default.)
     max_map_height   (optional) the map is never drawn taller than this many pixels. Not set here: the map is as big as
                       the window allows (see fit_all_min_height)
     page_width        widest the page may be, in pixels
     fit_all_min_height  the map is made smaller to fit the WINDOW HEIGHT: the map and the boxes under it together
                       when the window is at least this tall (px), otherwise just the map (a 768p laptop) and the
                       page scrolls to the boxes
     nudge_zoom_levels circles that were moved apart from a close neighbour (nudge: [lat, lon] of a capital, or a region's
                       circle) sit at the moved place only for this many of the most zoomed-out levels; zoomed in further
                       they are back at their real places
     circle_ratio      size of the capital and tiny-country circles (share of the map's width)
     marker_px         a country smaller than this many screen pixels gets a circle, so it can be found and clicked
                       (it disappears as you zoom in and the shape gets bigger)
     insets            the fixed boxes under the map, which do not scroll or zoom: title of each box
   Region settings: only regions with a capital are listed. A capital is { name, lat, lon, info }.
   Capitals are Natural Earth populated places. Where a country has several capitals, the most populated
   city was used (South Africa -> Johannesburg, Netherlands -> The Hague, Benin -> Cotonou, Israel -> Tel Aviv...);
   change any of them here. Territories have no capital unless another state recognises them as sovereign.
   Capitals are real latitude/longitude. Anything left empty ('') is not shown.
   Combined places: Saint Martin + Sint Maarten and Sint Eustatius + Saba are ONE region and ONE circle on the
   map (they are next to each other), but each keeps its own entry here (capital, info, flag) and its own question
   in every game mode: either can be answered by clicking the shared circle. Their capitals are added by hand.
   Doha / Manama and Apia are moved so their circles are apart from their neighbours' (the circles of their regions
   are moved the same way, see NUDGE_MARKER in world.py).
   Two more exceptions: Brazzaville and Kinshasa (4 km apart) are each moved 0.3 degrees away from the other so that
   their circles can be full size; and Vatican City has no capital (it is only a region). A capital with
   with: 'Vatican City' (Rome) is the same circle as that region in Practice mode.
   ========================================================================== */
(window.GeoMapSettings = window.GeoMapSettings || []).push({
  id: 'world',
  name: 'World',
  blurb: 'Find the countries of the world',
  credit: 'Boundaries and capitals: Natural Earth (public domain, naturalearthdata.com). Borders follow Natural Earth\\'s de facto lines. Small countries are marked with circles, and the Caribbean and the Pacific Islands are shown enlarged in the boxes below the map.',
  orientation: 'horizontal',
  scope: 'all',
  infinite_scroll: true,
  page_width: 2000,
  fit_all_min_height: 800,
  circle_ratio: 0.0045,
  marker_px: 16,
  zoom_levels: 5,
  insets: { caribbean: { title: 'Caribbean Islands' }, pacific: { title: 'Pacific Islands' } },
  pass_accuracy: { regions: 80, capitals: 0, flags: 0 },
  skip: true,
  nudge_zoom_levels: 2,
  modes: { practice: true, regions: true, capitals: true, flags: true },

  regions: {"""]
    for i, (name, cap, with_r, nudge, flag) in enumerate(rows):
        if cap:
            cn, lat, lon = cap
            extra = (", with: %s" % js(with_r)) if with_r else ''
            if nudge:
                extra += ", nudge: [%s, %s]" % nudge
            cline = "      capital: { name: %s, lat: %s, lon: %s, info: ''%s },\n" % (js(cn), lat, lon, extra)
        else:
            cline = ''
        out.append("    %s: {\n%s      info: %s,\n      flag: %s\n    }%s" % (
            js(name), cline, js(INFO.get(name, '')), js(flag), ',' if i < len(rows) - 1 else ''))
    out.append('  }\n});\n')
    open(args.out, 'w', encoding='utf-8').write('\n'.join(out))
    print('wrote %s with %d capitals and %d flags' % (args.out, len([r for r in rows if r[1]]), len(flags)))
    if args.flags:
        import shutil
        dest = os.path.join(os.path.dirname(os.path.abspath(args.out)), '..', 'flags', 'world')
        os.makedirs(dest, exist_ok=True)
        for iso in sorted(used):
            shutil.copy(os.path.join(args.flags, iso + '.svg'), os.path.join(dest, iso + '.svg'))
        print('\nNo flag file for (these are left out of the Flags game):')
        for r in missing:
            print('  %-42s %s' % (r['name'], 'part of ' + r['part_of'] if r.get('part_of') else r['kind']))
    print('\nCountries where more than one capital was possible (the most populated was used):')
    for line in report:
        print('  ' + line)


if __name__ == '__main__':
    main()
