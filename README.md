# SINGE – Studies In Geography

A map game where you click the correct location of countries, capitals and flags. It is plain HTML, CSS and JavaScript (no libraries), works offline, and is built to run inside the [Kolibri](https://learningequality.org/kolibri/) Offline Learning Platform as an HTML5 app. Scores are saved in `localStorage` and reported through SCORM 1.2.

**Maps:** Sierra Leone, United States, World (UN members only, or all territories).
**Modes:** Practice, Regions, Capitals, Flags (each can be turned on or off per map).

## Play
Open `index.html` in a browser, or use the GitHub Pages site if it is enabled for this repo
(Settings → Pages → deploy from `main`, root). SCORM is not available outside Kolibri, so scores are kept in the browser only.

## Use in Kolibri
Download the latest `singe_vX.Y.Z.zip` from the [Releases](../../releases) page and import it as an HTML5 app.
The zip has `index.html` at its root.

## Make a release
1. Merge your changes into `main`.
2. Create and push a tag, e.g. `git tag v025 && git push origin v025` (or publish a release on GitHub).
3. The `Release zip` workflow builds `singe_<tag>.zip` (game files at the root, without `tools/`, `docs/` or `.github/`) and attaches it to the release.

You can also run the workflow by hand from the Actions tab to get the zip as a build artifact.

## Documentation
- [docs/GUIDE.md](docs/GUIDE.md): folder layout, settings, languages, adding maps, world-map notes and rebuild commands.
- [CREDITS.md](CREDITS.md): data and flag sources.

## Licence
Code: MIT (see [LICENSE](LICENSE)). Map data and flags have their own terms; see [CREDITS.md](CREDITS.md).
