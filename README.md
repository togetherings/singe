# SINGE – Studies In Geography

A map game where you click the correct location of countries, capitals and flags. It is plain HTML, CSS and JavaScript (no libraries), works offline, and is built to run inside the [Kolibri](https://learningequality.org/kolibri/) Offline Learning Platform as an HTML5 app. Scores are saved in `localStorage` and reported through SCORM 1.2.

**Maps:** Sierra Leone (18 districts, including the new Bandajuma and Kpanguima), United States, World (UN members only, or all territories).
**Modes:** Practice, Regions, Capitals, Flags (each can be turned on or off per map).

**Current version: 0.2.0** (see [CHANGELOG.md](CHANGELOG.md)).

## Live preview
**[▶ Play SINGE in your browser: togetherings.github.io/singe](https://togetherings.github.io/singe/)**

The live preview is the current `main` branch served by GitHub Pages. It is the full game, running offline-capable in any modern browser, so you can try every map and mode, check changes, or share a link, without importing anything into Kolibri. It is only a preview: SCORM reporting needs Kolibri, so on the preview your scores are saved in your own browser (`localStorage`) only. Updates to `main` appear on the page within a minute or two.

*(Maintainers: if the link shows a 404, turn on Pages once under Settings → Pages → "Deploy from a branch" → `main` / root.)*

## Play locally
Open `index.html` in a browser.

## Use in Kolibri
Download the latest `singe_v0.2.0.zip` (or newer) from the [Releases](../../releases) page and import it as an HTML5 app.
The zip has `index.html` at its root.

## Make a release
Versions are numbered `major.minor.patch` (for example `0.2.0`); the version is set in `config.js` and `index.html` and described in `CHANGELOG.md`.

1. Merge your changes into `main` and update the version and `CHANGELOG.md`.
2. Create and push a tag, e.g. `git tag v0.2.0 && git push origin v0.2.0` (or publish a release on GitHub).
3. The `Release zip` workflow builds `singe_<tag>.zip` (game files at the root, without `tools/`, `docs/` or `.github/`) and attaches it to the release.

You can also run the workflow by hand from the Actions tab to get the zip as a build artifact.

## Documentation
- [data/sierra_leone/](data/sierra_leone/README.md): an **unofficial** updated set of Sierra Leone boundary GeoJSON files (new districts, district capitals), free to reuse with attribution.
- [docs/GUIDE.md](docs/GUIDE.md): folder layout, settings, languages, adding maps, world-map notes and rebuild commands.
- [CREDITS.md](CREDITS.md): data and flag sources.

## Licence
Code: MIT (see [LICENSE](LICENSE)). Map data and flags have their own terms; see [CREDITS.md](CREDITS.md).
