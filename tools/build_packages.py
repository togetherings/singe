#!/usr/bin/env python3
"""Build SINGE's zipped packages of maps with EduGame Kit.

    python tools/build_packages.py [--out dist] [--only world]

For each package in tools/packages.json this copies the game and just that package's maps
into build/<slug>/, writes a config.js that lists only those maps, fills in the scoreboard
names, then runs `python -m edugame check` and `build`. Zips end up in <out>/singe-<slug>-<version>.zip
with the files at the root. Needs EduGame Kit (pip install git+https://github.com/togetherings/edugame-kit).
"""
import argparse, json, os, re, shutil, subprocess, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAME_FILES = ['index.html', 'js', 'icon.svg', 'LICENSE', 'CREDITS.md', 'edugame.json']
MODES = [('', 'regions'), ('_capitals', 'capitals'), ('_flags', 'flags')]


def entry(m):
    """A config.js entry as an object with id and file."""
    return {'id': m, 'file': m} if isinstance(m, str) else m


def js(value):
    return json.dumps(value, ensure_ascii=False, indent=2)


def write_config(src, dest, maps):
    """Copy config.js, replacing the maps list with this package's maps."""
    text = open(src, encoding='utf-8').read()
    new = 'maps: ' + js(maps).replace('\n', '\n  ') + ','
    text, n = re.subn(r'maps:\s*\[.*?\n  \],', lambda _: new, text, count=1, flags=re.S)
    if n != 1:
        sys.exit('Could not find the maps list in config.js')
    open(dest, 'w', encoding='utf-8').write(text)


def build(pkg, out, version):
    maps = [entry(m) for m in pkg['maps']]
    work = os.path.join(ROOT, 'build', pkg['slug'])
    shutil.rmtree(work, ignore_errors=True)
    os.makedirs(work)
    for f in GAME_FILES:
        s = os.path.join(ROOT, f)
        shutil.copytree(s, os.path.join(work, f)) if os.path.isdir(s) else shutil.copy(s, work)
    write_config(os.path.join(ROOT, 'config.js'), os.path.join(work, 'config.js'), maps)
    # Maps, settings and translations for the files these maps use.
    files = sorted({m['file'] for m in maps})
    for sub in ('maps', 'map-settings'):
        os.makedirs(os.path.join(work, sub))
        for f in files:
            shutil.copy(os.path.join(ROOT, sub, f + '.js'), os.path.join(work, sub))
    os.makedirs(os.path.join(work, 'languages'))
    for f in glob.glob(os.path.join(ROOT, 'languages', '*.js')):
        shutil.copy(f, os.path.join(work, 'languages'))
    for f in files:
        s = os.path.join(ROOT, 'languages', 'maps', f)
        if os.path.isdir(s):
            shutil.copytree(s, os.path.join(work, 'languages', 'maps', f))
    # Flags and picture used by each map's settings.
    for f in files:
        text = open(os.path.join(ROOT, 'map-settings', f + '.js'), encoding='utf-8').read()
        for p in set(re.findall(r"['\"](flags/[^'\"]+)['\"]", text)):
            if p and os.path.exists(os.path.join(ROOT, p)):
                os.makedirs(os.path.dirname(os.path.join(work, p)), exist_ok=True)
                shutil.copy(os.path.join(ROOT, p), os.path.join(work, p))
    if os.path.isdir(os.path.join(ROOT, 'flags', 'world')) and 'world' in files:
        shutil.copytree(os.path.join(ROOT, 'flags', 'world'), os.path.join(work, 'flags', 'world'), dirs_exist_ok=True)
    # Translations of the kit's words, with this package's title.
    os.makedirs(os.path.join(work, 'lang'))
    for code in ('en', 'fr'):
        words = json.load(open(os.path.join(ROOT, 'lang', code + '.json'), encoding='utf-8'))
        title = pkg.get('title_fr' if code == 'fr' else 'title')
        if title:
            words['title'] = title
        json.dump(words, open(os.path.join(work, 'lang', code + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    # Scoreboard names: one per map and mode.
    names = {}
    for m in maps:
        label = m.get('name') or m['id']
        for suffix, mode in MODES:
            names[m['id'] + suffix] = '%s (%s)' % (label, mode)
    spec = json.load(open(os.path.join(work, 'edugame.json'), encoding='utf-8'))
    spec['scoring']['boards']['names'] = names
    json.dump(spec, open(os.path.join(work, 'edugame.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    run = [sys.executable, '-m', 'edugame']
    subprocess.check_call(run + ['check', work])
    tmp = os.path.join(ROOT, 'build', '_out_' + pkg['slug'])
    shutil.rmtree(tmp, ignore_errors=True)
    subprocess.check_call(run + ['build', work, '-o', tmp])
    os.makedirs(out, exist_ok=True)
    for z in glob.glob(os.path.join(tmp, '*.zip')):
        dest = os.path.join(out, 'singe-%s-%s.zip' % (pkg['slug'], version))
        shutil.move(z, dest)
        print('Built', dest)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=os.path.join(ROOT, 'dist'))
    ap.add_argument('--only', help='build just this package')
    a = ap.parse_args()
    version = json.load(open(os.path.join(ROOT, 'edugame.json')))['version']
    for pkg in json.load(open(os.path.join(ROOT, 'tools', 'packages.json')))['packages']:
        if a.only and a.only != pkg['slug']:
            continue
        if not pkg['maps']:
            print('Skipping %s: no maps yet' % pkg['slug'])
            continue
        build(pkg, a.out, version)


if __name__ == '__main__':
    main()
