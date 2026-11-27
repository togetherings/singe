# Changelog

SINGE uses `major.minor.patch` version numbers. Builds made before versioning (v001 to v024) are treated as 0.1.0.

## Unreleased
- **British Isles:** a new map in the Countries package, with 12 places: England, Scotland, Wales, Northern Ireland, Ireland, the Isle of Man, Jersey, Guernsey, Cornwall, the Hebrides, the Orkney Islands and the Shetland Islands, in every mode, in English and French, with France and the other neighbours in grey. Made by `tools/british_isles.py` from Natural Earth 5.1.2 (map units, and Cornwall's admin-1 border), at ten times the World map's detail. Three new scoreboards.
- World-type maps can be squeezed sideways (`x_scale` in the shapes file's projection), so the British Isles keep their true shape.
- **New flags** in `maps/world/flags/` (from Wikipedia, public domain): England, Scotland, Wales, Northern Ireland (the Ulster Banner, with a note that it hasn't been official since 1972), Cornwall, the Hebrides (the Western Isles Council's), Orkney and Shetland. The World map's "all" map uses the last three, so the Hebrides, Orkney and Shetland are now in its Flags mode.
- **Natural Earth 5.1.2** (the newest release; was 4.0.0): the World and Africa maps' borders are rebuilt from it. Borders and coasts are a little more detailed in places, and a few tiny islands come or go; every map asks about the same places as before. New, in grey on every map and never asked about: Bir Tawil (claimed by neither Egypt nor Sudan), Brazilian Island (Brazil / Uruguay) and the Southern Patagonian Ice Field (Chile / Argentina). The Cocos (Keeling) Islands now have a shape, not only a circle.
- **Natural Earth data in `data/natural_earth/`**: the countries, lakes and populated places files the World map's tools read, with a README. `tools/world.py` handles 5.1's outlines (drawn the other way round), and `tools/world_settings.py` picks Abuja for Nigeria.
- **Africa:** a new package, *Studies In Geography: Africa*, with seven maps: North, West, Central, East and Southern Africa (the African Union's regions, UN countries only), Africa (the 54 UN countries) and Africa (all countries and territories: also Western Sahara, Somaliland, Ceuta, Melilla, the Canary Islands, Madeira, Réunion, Mayotte, Saint Helena and Tristan da Cunha). Every mode (Practice, Regions, Capitals, Flags), in English and French, with neighbouring countries in grey. Western Sahara is grey and Somaliland is part of Somalia except on the last map. 21 new scoreboards.
- **Windows on the World map:** the Africa maps draw the World map's shapes (borders, circles of small places, lakes), so they look and work like it. A map's settings can name the regions asked about (`in_game`: the rest are grey), put more parts into a country in UN scope (`merge`), and leave out the boxes under the map (`insets: false`); the map opens on the regions in the game (`view_pad`). A package's map can draw another map's shapes (`"shapes": "world"`).
- **Ceuta and Melilla** are split off Spain (`tools/world.py`, and the same two pieces moved in `maps/world/shapes.js`): places of their own on the World map's "all" map and the Africa "all" map, and part of Spain in UN scope. Each is a city, so neither has a capital (like Vatican City).
- **New flags** in `maps/world/flags/` (from Wikipedia, public domain): Somaliland, Ceuta, Melilla, Tristan da Cunha, the Canary Islands and Madeira. The World map's "all" map uses them too, so those six are now in its Flags mode.
- **Fixed:** Nigeria's capital is Abuja, not Lagos, on the World map too.
- **Kit updates come as pull requests.** The checks, the zips and GitHub Pages use EduGame Kit's own workflows at a kit release, and Dependabot opens a pull request for each new kit release (and for the GitHub actions). `ci.yml` and `release.yml` are replaced by `build.yml`; releases are made when a release is published (its tag must match `version` in `edugame.json`), with the package zips and the Sierra Leone data zip.
- **Played in a real Kolibri:** each package's zip (`tests/kolibri_play.py`: a Capitals round of the package's first map).
- **EduGame Kit 0.3.7.** The workflows call the kit at `@v0.3.7` (was `@v0.3.2`).
- **A menu on the website:** the site opens on the kit's menu of the sets of maps (`menu.html` and `menu/`, made by `edugame menu`), in English and French, with "Use it in your school". Each set has its own address (`/en/countries/`), with a "Sets of maps" link back in the header. A set gets a tick once a round in it counts: SINGE now calls `EduGame.complete()` then, which in Kolibri and other learning systems is the same "passed" as before. The menu and its files are never in the zips.
- **Releases get bundles** (`release-bundles`): one zip with every package's zip, one per language, and `singe-all-maps-<version>.zip`, the website to use offline. The Sierra Leone data zip is attached as before.
- `tests/e2e_browser.py` also plays the website: the menu, a counted round that ticks its set, and the menu in French.

## 0.4.0
### Options, languages and maps, the EduGame Kit way
- **Options** is now the kit's: a header at the top with the title and an Options button, which opens a panel over the game (Appearance and Language) instead of a separate page. The appearance shows straight away; the language changes on Apply. On the Kolibri Games games page, the header has only the button.
- **Language:** a learner who hasn't chosen one gets Kolibri's language (on the Kolibri Games games page), then the browser's. The choice is kept in the learner's save. Saves from earlier versions keep their scores but not the theme or language choice.
- **One file per language:** `languages/english.js` and `french.js` are now `lang/en.json` and `lang/fr.json`, with the kit's words, notes for translators (`_notes`) and the scoreboard and package names.
- **One folder per map:** `maps/<map>/shapes.js`, `settings.js`, its pictures, and `lang/<code>.json` for its translations (was `maps/`, `map-settings/`, `flags/` and `languages/maps/`).
- **Packages** are in `edugame.json` and built with `edugame build` (was `tools/packages.json` and `tools/build_packages.py`). Scoreboard names come in English and French.
- The World map's two variants (UN countries, everything) have their names in `maps/world/settings.js` (`variants`), so they can be translated.
- GitHub Pages is built by the kit (`edugame pages`), with each package to play.
- New `tests/e2e_browser.py` plays each package in a browser.

## 0.3.0: 2026-11-06
### Now a Scored Game (EduGame Kit)
- SINGE is built with EduGame Kit and works with the Kolibri Games plugin's scoreboards (one board per map and mode, plus an all-maps total). Existing learner saves carry over.
- **Scoring change:** a round counts, and sets SCORM "passed", when it reaches the mode's accuracy goal (0 = every round counts). Before, "passed" needed every goal in every map.
- The language and theme choices are saved through the kit.
- `lang/` is now `languages/` (the kit uses `lang/`).
### Packages
- Releases now have separate zips: **Countries** (Sierra Leone, United States), **World** (UN countries, and all countries, territories and islands) and **Continents** (not built until it has maps, starting with Africa). Build them with `tools/build_packages.py`; edit `tools/packages.json` to change what each holds.
- The World map can be listed twice with different settings (`id`, `file`, `scope` in `config.js`).
### Map display
- The zoom buttons are now at the left of the second row (swapping places with the totals box in Practice and with the skip arrows in games). The skip arrows are centred in the middle column in every mode, under the flag in Flags mode.
- Fixed the page container and attribution overlapping the map after viewing several maps and returning to the menu.

## 0.2.1: 2026-11-02
### Sierra Leone data
- **Releases now include the unofficial Sierra Leone boundary package** (`sle_admin_boundaries_unofficial_<version>.geojson.zip`) next to the game zip. (The zip was missing from the repository in 0.2.0 because of a `.gitignore` rule; fixed.)
- Chiefdom splits are now separate, uniquely named chiefdoms in the GeoJSON package:
  - Gbanti Kamarank became **Gbanti** (Karene District) and **Kamaranka** (Bombali District).
  - Nieni became **Wollay Barawa** (Falaba District), **Kalian** (Koinadugu) and **Nieni** (Yiffin and Sumbaria).
  - Mongo became **Kamadugu Yiraia**, **Morifindugu**, **Delemandugu** and **Mongo**; Neya became **Kulor Saradu**, **Nyedu** and **Neya** (all Falaba District).
  - New chiefdoms have no P-code; chiefdoms that keep their name (Mongo, Neya, Nieni, Njaluahun) keep theirs. Other chiefdom splits around the country are not covered.
- The game's district outlines are redrawn from section data (Falaba's edge differs by a fraction of a percent).
- `tools/sierra_leone.py` now holds all chiefdom splits in one table (`CHIEFDOM_SPLITS`).

## 0.2.0: 2026-11-02
### Sierra Leone
- **18 districts.** New **Bandajuma District** (Southern Province, capital Bandajuma) and **Kpanguima District** (Eastern Province, capital Panguma; also spelled Kpanguma). Both are unofficial, drawn from the best publicly available chiefdom data.
- Bandajuma is made from the Wonde, Sowa, Langrama, Niawa, Pejeh (Futa Peje), Barri, Tunkia, Makpele and Soro Gbema chiefdoms (Bo, Pujehun, Kenema).
- Kpanguima is made from the Lower Bambara, Malegohun, Yawei, Penguia, Kpeje West, Jahn and Kpeje Bongre chiefdoms (Kenema, Kailahun). Kpeje Bongre is now two chiefdoms (Kpeje and Bongre), shown as one.
- New **Jahn Chiefdom**, made from the Falley and Jonga sections of Njaluahun Chiefdom.
- Earlier changes kept: Gbanti Kamaranka (divided between Bombali and Karene), Nieni (Barawa and Wollay joined Falaba), Falaba spelling.
- Credit line and district info say the boundaries are unofficial; French text updated.

### Data
- New `data/sierra_leone/`: an unofficial, updated copy of the HDX Sierra Leone boundary package (admin 0-4, edge-matched versions, lines, points, capitals) with the changes above and a **capital for every district**. Attribution to the original HDX source and a full list of changes are in its README.
- New `tools/make_sierra_leone_package.py` rebuilds these files from the original download.

### Project
- Version numbering `major.minor.patch` (`config.js`, `index.html`, this file, release tags such as `v0.2.0`).
- README now links to the live preview (GitHub Pages).

## 0.1.0: v001 to v024
Sierra Leone, United States and World maps; Practice, Regions, Capitals and Flags modes; light and dark themes; English and French; SCORM 1.2. See `docs/GUIDE.md` for the older world-map notes (labelled v023 and v024).
