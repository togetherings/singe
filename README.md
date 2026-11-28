# SINGE – Studies In Geography

A map game where you click the correct location of countries, capitals and flags. It is plain HTML, CSS and JavaScript (no libraries), works offline, and is built to run inside the [Kolibri](https://learningequality.org/kolibri/) Offline Learning Platform as an HTML5 app. It is a *Scored Game* made with [EduGame Kit](https://github.com/togetherings/edugame-kit), so it works with the [Kolibri Games](https://github.com/togetherings/kolibri-games) plugin's scoreboards. Scores are saved through SCORM 1.2 in Kolibri (and in the browser when played elsewhere).

**Maps:** Sierra Leone (18 districts, including the new Bandajuma and Kpanguima), United States, British Isles (the UK's four nations, Ireland, the Crown Dependencies, Cornwall, and Scotland's three island groups), France (18 regions, the overseas ones in boxes), Africa (seven maps: the African Union's five regions, the whole continent, and every country and territory), Asia (seven maps: North and Central, East, Southeast, South and West Asia, the whole continent, and every country and territory), World (two versions: UN members only, or every country, territory and island).
**Modes:** Practice, Regions, Capitals, Flags (each can be turned on or off per map).

**Current version: 0.4.0** (see [CHANGELOG.md](CHANGELOG.md)).

## Live preview
**[▶ Play SINGE in your browser: togetherings.github.io/singe](https://togetherings.github.io/singe/)**

The site is built from the current `main` branch by EduGame Kit (`edugame pages`). It opens on a menu of the sets of maps (the kit's menu page: `menu.html` and `menu/`), in English or French, and each set has its own address (`/en/countries/`, `/fr/world/`). A set gets a tick on the menu once a round in it counts. Scores there are saved in your own browser only, shared by every page of the site. Updates to `main` appear within a few minutes.

*(Maintainers: under Settings → Pages, set Source to "GitHub Actions"; the `GitHub Pages` workflow publishes the site.)*

## Play locally
Install [EduGame Kit](https://github.com/togetherings/edugame-kit) (`pip install git+https://github.com/togetherings/edugame-kit.git`), then run `edugame preview .` in this folder (`--package world` for the World maps). The kit makes the files the page needs.

## Use in Kolibri
SINGE comes in separate zipped packages of maps. Download them from the [Releases](../../releases) page and upload the ones you want to a channel in Kolibri Studio as HTML5 apps (see the Kolibri Games plugin's docs). A release has `singe-all-languages-<version>.zip` with every package's zip, `singe-en-<version>.zip` and `singe-fr-<version>.zip` with each package in one language only, and `singe-all-maps-<version>.zip`, the website to use on a computer without the internet (unzip it and open `index.html`). The package zips are:

| Package | Maps |
|---|---|
| `singe-countries-<version>.zip` | Sierra Leone, United States, British Isles, France |
| `singe-world-<version>.zip` | World (UN countries) and World (all countries, territories and islands) |
| `singe-africa-<version>.zip` | North, West, Central, East and Southern Africa, Africa (UN countries) and Africa (all countries and territories) |
| `singe-asia-<version>.zip` | North and Central, East, Southeast, South and West Asia, Asia (UN countries) and Asia (all countries and territories) |

All packages are the same game (same id), so a learner's scores from every package appear together on the scoreboards. Each zip has every language (English and French); learners choose theirs with the Options button, and get Kolibri's language until they do. To make your own package, add it to `packages` in `edugame.json` and run `edugame build . -o dist` (see [docs/GUIDE.md](docs/GUIDE.md)).

## Make a release
Versions are numbered `major.minor.patch` (for example `0.4.0`); the version is set in `edugame.json` and described in `CHANGELOG.md`.

1. Merge your changes into `main` and update the version and `CHANGELOG.md`.
2. Publish a release on GitHub with a new tag such as `v0.4.0` (it must match `version` in `edugame.json`).
3. The `Build` workflow builds the package zips with EduGame Kit (game files at the root) and attaches the bundles of them (`release-bundles`), the offline copy of the website and the Sierra Leone data zip to the release.

Every push builds the zips too: they're in the run's Artifacts (Actions tab > the run > game-zips).

## Checks and kit updates
The `Build` workflow calls EduGame Kit's own (`game.yml`, at a kit release like `@v0.3.11`) on every push: `edugame check`, a zip per package, `tests/e2e_browser.py` (each package in a browser, in English and French, then the website: its menu, a counted round ticking its set, and the menu in French) and **Real Kolibri**: each package's zip in a throwaway Kolibri, played with `tests/kolibri_play.py` (a Capitals round of the package's first map), checking that the result is saved, comes back, and that a damaged save isn't written over. When the kit has a new release, Dependabot opens a pull request moving it on; merge it when **Checks passed** passes, after reading the release's **What games need to do** (the kit's `docs/UPDATING.md`).

To play the packages in Kolibri on your own computer: `pip install kolibri playwright && python -m playwright install chromium`, then `edugame kolibri-test .` (`--packages 1` for the first package only).

## Documentation
- [data/sierra_leone/](data/sierra_leone/README.md): an **unofficial** updated set of Sierra Leone boundary GeoJSON files (new districts, district capitals), free to reuse with attribution.
- [docs/GUIDE.md](docs/GUIDE.md): folder layout, settings, languages, adding maps, world-map notes and rebuild commands.
- [CREDITS.md](CREDITS.md): data and flag sources.

## Licence
Code: MIT (see [LICENSE](LICENSE)). Map data and flags have their own terms; see [CREDITS.md](CREDITS.md).
