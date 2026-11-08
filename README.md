# SINGE – Studies In Geography

A map game where you click the correct location of countries, capitals and flags. It is plain HTML, CSS and JavaScript (no libraries), works offline, and is built to run inside the [Kolibri](https://learningequality.org/kolibri/) Offline Learning Platform as an HTML5 app. It is a *Scored Game* made with [EduGame Kit](https://github.com/togetherings/edugame-kit), so it works with the [Kolibri Games](https://github.com/togetherings/kolibri-games) plugin's scoreboards. Scores are saved through SCORM 1.2 in Kolibri (and in the browser when played elsewhere).

**Maps:** Sierra Leone (18 districts, including the new Bandajuma and Kpanguima), United States, World (two versions: UN members only, or every country, territory and island).
**Modes:** Practice, Regions, Capitals, Flags (each can be turned on or off per map).

**Current version: 0.4.0** (see [CHANGELOG.md](CHANGELOG.md)).

## Live preview
**[▶ Play SINGE in your browser: togetherings.github.io/singe](https://togetherings.github.io/singe/)**

The site is built from the current `main` branch by EduGame Kit (`edugame pages`), with each package of maps to play in the browser. Scores there are saved in your own browser only. Updates to `main` appear within a few minutes.

*(Maintainers: under Settings → Pages, set Source to "GitHub Actions"; the `GitHub Pages` workflow publishes the site.)*

## Play locally
Install [EduGame Kit](https://github.com/togetherings/edugame-kit) (`pip install git+https://github.com/togetherings/edugame-kit.git`), then run `edugame preview .` in this folder (`--package world` for the World maps). The kit makes the files the page needs.

## Use in Kolibri
SINGE comes in separate zipped packages of maps. Download the ones you want from the [Releases](../../releases) page and upload them to a channel in Kolibri Studio as HTML5 apps (see the Kolibri Games plugin's docs):

| Package | Maps |
|---|---|
| `singe-countries-<version>.zip` | Sierra Leone, United States |
| `singe-world-<version>.zip` | World (UN countries) and World (all countries, territories and islands) |
| Continents | Coming next, starting with Africa |

All packages are the same game (same id), so a learner's scores from every package appear together on the scoreboards. Each zip has every language (English and French); learners choose theirs with the Options button, and get Kolibri's language until they do. To make your own package, add it to `packages` in `edugame.json` and run `edugame build . -o dist` (see [docs/GUIDE.md](docs/GUIDE.md)).

## Make a release
Versions are numbered `major.minor.patch` (for example `0.4.0`); the version is set in `edugame.json` and described in `CHANGELOG.md`.

1. Merge your changes into `main` and update the version and `CHANGELOG.md`.
2. Publish a release on GitHub with a new tag such as `v0.4.0`.
3. The `Release zip` workflow builds the package zips with EduGame Kit (game files at the root) and attaches them, and the Sierra Leone data zip, to the release.

You can also run the workflow by hand from the Actions tab to get the zips as a build artifact.

## Documentation
- [data/sierra_leone/](data/sierra_leone/README.md): an **unofficial** updated set of Sierra Leone boundary GeoJSON files (new districts, district capitals), free to reuse with attribution.
- [docs/GUIDE.md](docs/GUIDE.md): folder layout, settings, languages, adding maps, world-map notes and rebuild commands.
- [CREDITS.md](CREDITS.md): data and flag sources.

## Licence
Code: MIT (see [LICENSE](LICENSE)). Map data and flags have their own terms; see [CREDITS.md](CREDITS.md).
