# Flag sources

Original files of flags that are kept in the game in a smaller form. Never in the game's zips (`data/*` is excluded).

| File | In the game |
|---|---|
| `Flag_of_Tristan_da_Cunha.svg.zip` | `maps/world/flags/sh-ta.svg`: the 2023 flag from Wikipedia (public domain), 1036 KB, an Inkscape drawing with 500-plus nested transforms. The game's copy (496 KB) is the same drawing with each shape's numbers rounded to what its scale on the finished flag needs (under 1/20 of a pixel at 1000 px wide), then optimised with svgo keeping transforms at 9 significant digits (svgo's default 5 moves whole groups of the crown). Checked by rendering both at 2000 px: 24 pixels of 2 million differ, from anti-aliasing. |

New flags: run `python3 tools/clean_svg.py IN.svg OUT.svg` to remove what doesn't draw anything (metadata such as
Flagpedia's C2PA content credentials, and Inkscape/Sodipodi editor settings), and compare the two by rendering them.
