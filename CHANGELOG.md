# Changelog

SINGE uses `major.minor.patch` version numbers. Builds made before versioning (v001 to v024) are treated as 0.1.0.

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
