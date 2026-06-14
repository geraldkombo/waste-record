# Waste Record

Offline-first collection logging app for waste picker cooperatives in Kenya. Log materials, take photos, mark locations on a map, and export GPS-stamped evidence for EPR advocacy. No internet. No server. No cloud.

> **Full documentation:**
> - [Research Foundation](RESEARCH.md) — WhatsApp transcript analysis, global precedents, legal framework, density heuristics
> - [Architecture](ARCHITECTURE.md) — Zero-server design, IndexedDB, Canvas renderer, PWA decisions
> - [EPR GeoJSON Schema](EPR-SCHEMA.md) — NEMA-aligned export schema, field reference, legal basis
> - [Field Guide](FIELD-GUIDE.md) — Sheng glossary, collection workflows, offline usage, device requirements
> - [Team](TEAM.md) — Team bios, roles, domain expertise, contact

## Features

- **Offline-first PWA** — installable on home screen; works without internet after first load
- **IndexedDB persistence** — crash-proof data layer for features, site visits, and photo evidence
- **Dumpsite proximity mapping** — 30m (Hot Zone) and 60m (Buffer) zones around dumpsite boundaries
- **4-ward support** — cycle through Mathare, Dandora, Kibera, Kawangware with synthetic collection point data
- **Collection logging** — log material type (8 categories), container (Mkokoteni/Gunia), fullness, with live estimated kg
- **Photo evidence** — native camera capture with pica client-side compression (~150 KB JPEG), stored in IndexedDB
- **Hazard/incident tagging** — click to mark health incidents, harassment, unfair pricing directly on the map
- **Collection Pricing tool** — adjust price per kg (KES 5–100) and see daily affected value per ward
- **GPS geofence verification** — log site visits with high-accuracy GPS; records are timestamped and buffer-verified
- **City Dashboard** — aggregated stats: total kg collected, material breakdown, hazard count, visit verification rate
- **Canvas-rendered map** — Leaflet with `preferCanvas` for smooth 60fps at 10,000+ points on low-end devices
- **EPR Evidence Pack export** — download all tagged hazards, collection logs, and visit records as NEMA-aligned `.geojson`
- **Custom GeoJSON upload** — bring your own collection point data

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Build | Vite 5 |
| Map | Leaflet 1.9 + react-leaflet 4 (Canvas renderer) |
| Spatial | Turf.js 6.5 |
| Styling | Tailwind CSS 3.3 |
| Icons | Lucide React |
| Persistence | IndexedDB via Dexie.js |
| Image | Pica (Web Worker resize) |
| PWA | vite-plugin-pwa + Workbox |
| Testing | Vitest 4 |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Production build
npm run build
```

## Usage

1. Open the app — a dark-themed side panel shows **Dumpsite Proximity** stats for the current ward
2. Click the ward button in the Field Toolkit to cycle wards (Mathare → Dandora → Kibera → Kawangware)
3. Adjust the **Price per kg** slider to see total daily value for affected collection points
4. **Log a collection**: select material type (Katoni, Chupa, Chuma, etc.), container (Gunia/Mkokoteni), fullness %, tap **Place on Map**, then click the desired location on the map
5. **Add photo evidence**: tap **Capture Photo Evidence** to take a photo — it's compressed on-device and attached to the collection point
6. **Tag hazards**: click **Tag Hazard / Incident**, then click any map location to mark an incident
7. **Log a site visit**: click **Log Site Visit** to capture your GPS coordinates and verify you're within the dumpsite buffer
8. **City Dashboard**: expand the collapsible dashboard in the side panel to see aggregated stats across all logged data
9. Click **Download EPR Evidence Pack** to export all collections, hazards, and visits as NEMA-aligned `.geojson`

## Architecture

```
src/
├── App.jsx                          # Main layout: side panel + map
├── main.jsx                         # Entry point
├── components/
│   ├── MapViewer.jsx                # Leaflet map with buffer zones, collection points, hazard overlay
│   ├── PIMAOverlay.jsx              # Floating toolbar: ward toggle, hazard brush, export
│   └── LocalLedger.jsx              # GPS site-verification widget with localStorage persistence
├── hooks/
│   ├── useTraumaBrush.js            # Centralized hazard-mark state with undo/clear/auto-save
│   └── useGeoData.js                # Async fetch with localStorage cache
└── utils/
    ├── spatialEngine.js             # Turf.js calculations: buffer, runoff, LVS, GeoJSON validation
    ├── exportUtils.js               # GeoJSON audit export with metadata
    └── spatialEngine.test.js        # Vitest suite (2/2 passing)
```

### Key Design Decisions

- **100% client-side** — no backend, no database, no SIM required in the field
- **ES modules** throughout (`"type": "module"` in package.json)
- **Crash-proof persistence** — `saveToLedger` wraps writes in try-catch with timestamp metadata to prevent corruption from `localStorage` quota overflows
- **Centralized brush state** — `useTraumaBrush` hook keeps hazard marks outside the view layer so undo/clear/persistence work independently of the map component
- **Standard GeoJSON output** — exports are valid `FeatureCollection` objects compatible with QGIS, ArcGIS, and any GIS pipeline

## Deployment

Push to `master` triggers GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and deploys to `gh-pages`.

```bash
git push origin master
```

## Team

| Name | Email | Role |
|------|-------|------|
| Gerald Kombo | geraldshikunyi@gmail.com | Lead Developer |
| Peter Maina | nj.peter.maina@gmail.com | Blockchain & Value Chain |
| Gisore Nyabuti | gisorenyabuti@gmail.com | Chairman, Kenya National Waste Pickers Welfare Association |
| Shadrack Otieno | shadrackmeshack7@gmail.com | Community & Developer |
| James Murithi | jamespmurithi@gmail.com | Developer |

## Context

This toolkit was built alongside the Nairobi waste picker organizing movement. The WhatsApp transcript in this repository documents real organizing around EPR pricing disputes, county consolidation, Dandora evictions, and the fight for formal recognition.

Key organizing pain points the toolkit addresses:
- **Data gap** — NEMA uses a Ghana formula (41 kg/day) that doesn't fit Kenyan reality; pickers now collect their own site-level data
- **Stigma → exclusion** — "Chokora" stigma means no contracts, insurance, or minimum wage; GPS-verified route logs build the case for formalization
- **Meeting overload** — organizers spread across 17 sub-counties can now share a unified spatial picture
- **City visibility** — the City Dashboard aggregates ward-level data for county environmental officers, translating field reality into policy-ready metrics

## License

MIT
