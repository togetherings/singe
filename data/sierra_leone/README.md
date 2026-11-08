# Sierra Leone administrative boundaries: unofficial update (v0.2.0)

> **UNOFFICIAL.** These files are a community update built on the best publicly available data at the time
> (November 2026). They are **not** an official boundary product of the Government of Sierra Leone, OCHA, or any
> other agency. Boundaries of the new districts and chiefdoms are approximations assembled from existing chiefdom and
> section polygons and may differ from official surveys. Do not use them for legal, electoral, or humanitarian
> decisions without checking official sources.

## Original source and attribution
**Sierra Leone - Subnational Administrative Boundaries (COD-AB SLE), version v02** (valid 2023-12-15),
Government of Sierra Leone / OCHA / ITOS, via the Humanitarian Data Exchange:
<https://data.humdata.org/dataset/cod-ab-sle#data-and-resources>.
Licence: **CC BY-IGO** (<https://creativecommons.org/licenses/by/3.0/igo/>). These files are modified versions of that
data; the original publishers do not endorse them. Please keep this attribution and the list of changes below.

## What is here
| File | Contents |
|---|---|
| `sle_admin_boundaries_unofficial.geojson.zip` | The full package, with the same 14 files and fields as the original HDX download (`sle_admin0` to `sle_admin4`, their `_em` edge-matched versions, `sle_adminlines`, `sle_adminlines_em`, `sle_adminpoints`, `sle_admincapitals`). |
| `sle_admin2.geojson` | Districts (18), unzipped for easy viewing on GitHub. |
| `sle_admin3.geojson` | Chiefdoms (176 chiefdoms), unzipped. |
| `sle_admincapitals.geojson` | National, provincial and **district capitals**, unzipped. |

Every feature that was changed has an extra last field, `unofficial_change`, saying what changed (empty for untouched
features). The files are the same as the original in every other way (WGS84 longitude/latitude, same field order).

## Changes from the original (v02)
1. **New Bandajuma District** (Southern Province), made from chiefdoms of Bo, Pujehun and Kenema Districts:
   Wonde (Bo); Sowa, Pejeh (Futa Peje), Barri, Makpele, Soro Gbema (Pujehun); Langrama, Niawa, Tunkia (Kenema).
   Capital: Bandajuma (7.572, -11.651).
2. **New Kpanguima District** (Eastern Province; also spelled Kpanguma or Panguma), made from chiefdoms of Kenema and
   Kailahun Districts: Lower Bambara, Malegohun (Kenema); Yawei, Penguia, Kpeje West, Kpeje Bongre (Kailahun);
   and the new Jahn Chiefdom. Capital: Panguma (8.186, -11.135).
3. **New Jahn Chiefdom**, made from the Falley and Jonga sections of Njaluahun Chiefdom. The other Njaluahun sections
   stay in Njaluahun Chiefdom (Kailahun District), which keeps its P-code.
4. **Kpeje Bongre** is now two chiefdoms (Kpeje and Bongre). The dividing line is not yet known, so it is still one
   chiefdom here.
5. **Gbanti Kamarank Chiefdom** (Bombali) was divided into two chiefdoms: **Gbanti Chiefdom** (the part that went to
   Karene District) and **Kamaranka Chiefdom** (the part that stayed in Bombali District: the Kamaranka, Romaneh, Royeama A/B,
   Sakuma A/B and Sendugu A/B sections).
6. **Nieni Chiefdom** (Koinadugu) was divided: the Barawa and Wollay sections became **Wollay Barawa Chiefdom** in Falaba
   District; the Kalian section became **Kalian Chiefdom** (still in Koinadugu); Yiffin and Sumbaria remain **Nieni Chiefdom**.
7. **Mongo Chiefdom** (Falaba) was divided into **Kamadugu Yiraia** (Upper Kamadugu, Lower Kamadugu, Yiraia sections),
   **Morifindugu** (the Morifindugu section), **Delemandugu** (Benadugu, Mankalia, Deldugu) and **Mongo** (Mongo I and II).
   **Neya Chiefdom** (Falaba) was divided into **Kulor Saradu** (Kulor, Saradu), **Nyedu** (Nyedu) and **Neya** (Neya I and II).
   Chiefdoms that continue an old name (Mongo, Neya, Nieni, Njaluahun) keep their original P-code; all new chiefdoms have none.
   **Other chiefdom splits around the country are not covered by this release.**
8. District and province outlines (`admin2`, `admin1`) are re-drawn by merging chiefdom pieces; Kenema, Kailahun, Bo,
   Pujehun, Bombali, Koinadugu, Falaba and Karene Districts and the Eastern, Southern, Northern and North Western
   Provinces therefore differ from the original. Districts and provinces that did not change are copied unchanged.
9. `area_sqkm` of re-drawn features is the sum of the `area_sqkm` of their sections. `center_lat` / `center_lon` of
   re-drawn features were recalculated.
10. `sle_adminlines` was regenerated from the section edges (level 0 = land border, 1-4 = the highest level that
    differs across the edge). The coastline (level 99) is copied unchanged.
11. `sle_admincapitals`: the original national (Freetown) and provincial (Bo, Kenema, Makeni) capitals are kept
    (the typo "Northen" is fixed); a capital was added for **every district** (18), using the coordinates in the SINGE
    game (approximate, as shown on Google Maps). The original district capitals are replaced.
12. The new districts and all new chiefdoms have **no official P-codes**, so their `*_pcode` fields are empty. Sections
    show their new parent names but keep their own original P-codes.
13. The country outline (`admin0`) is unchanged.

## Rebuild
`tools/make_sierra_leone_package.py` makes these files from the original HDX files; the rules for the changes are in
`tools/sierra_leone.py`:

```
python3 tools/make_sierra_leone_package.py <folder with the original sle_*.geojson> \
        --settings maps/sierra_leone/settings.js --out <output folder>
```
