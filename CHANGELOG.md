# Changelog

SINGE uses `major.minor.patch` version numbers. Builds made before versioning (v001 to v024) are treated as 0.1.0.

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
