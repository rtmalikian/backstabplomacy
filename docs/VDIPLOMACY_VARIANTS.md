# vDiplomacy / webDiplomacy variant-map compatibility

## What compatibility means here
vDiplomacy variants are defined by **structured data, not just a picture**: a territory list where each territory has a type, supply-centre/home flags, coordinates, and a border graph (the variant editor draws move/support arrows between territories; split coasts are separate territories). Backstabplomacy speaks that same data model in JSON, so a variant expressed in that model can be imported and played on this engine.

## This project's format — `variants/classic.json`
```json
{
  "variant": "Classic",
  "territories": [
    {"id":"LON","name":"London","type":"coast","supplyCenter":true,
     "home":"England","lat":51.5,"lon":-0.12,
     "borders":["YOR","WAL","ENG","NTH"]}
  ],
  "startingUnits": {"England":[{"unit":"F","prov":"EDI"}]},
  "winSupplyCenters": 18
}
```
- `type`: `land` (inland — armies only), `coast` (armies + fleets), `sea` (fleets only).
- Coordinates here are **real latitude/longitude of each province centre**; the renderer projects lon/lat to the screen, which is why the map is geographically accurate. Files without lat/lon fall back to a default position (and will look wrong — add coordinates for a good map).
- Split coasts: to model e.g. Spain North Coast / Spain South Coast or St. Petersburg North/South Coast exactly as vDiplomacy does, define each coast as its **own territory entry** with its own borders. The engine treats territories generically, so split-coast variants just work. The bundled Classic keeps single-province coasts in v1 for beginner clarity (documented in the file's `notes`).

## Importing a vDiplomacy-style file
In the app: **AI & Settings → vDiplomacy variant maps → Import variant JSON**. The importer accepts common field spellings (`borders`/`neighbours`/`neighbors`, `supplyCenter`/`isSupplyCenter`/`SC`, `lat`/`latitude`, `lon`/`longitude`, `home`/`homePower`) and starts a new game on the loaded map.

## Converting an existing vDiplomacy variant
vDiplomacy stores variants as PHP classes + map images rather than a single JSON. To convert one:
1. Export its territory list (id, name, type, SC, home) from the variant's `Variant`/`Territory` definitions or the Map Info page.
2. Add each territory's border list from its adjacency definition.
3. Add real-world lat/lon for each territory centre (any atlas) — or its x/y from the variant map image, converted to lon/lat for this renderer.
4. Add `startingUnits` and `winSupplyCenters` (usually half the centres + 1).
The result is a file this engine (and any engine speaking the same model) can play. Map **artwork** from vDiplomacy is not redistributed here — this project ships original art/data only.
