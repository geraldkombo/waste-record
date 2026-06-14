# Architecture

## Design Principles

1. **Zero-server sovereignty** - No backend, no database, no cloud. The cooperative owns its data completely.
2. **Offline-first** - Must function entirely without internet in the field. Only internet dependency is initial app load.
3. **Mobile-first** - Target device is a low-end Android smartphone with limited RAM and storage.
4. **Legally legible output** - Exported data must be immediately useful to NEMA auditors, county planners, and PROs without transformation.
5. **Accessible to semi-literate users** - Minimize text, maximize visual and audio documentation.

---

## Tech Stack Decisions

### React 18 + Vite 5

**Why React:** Component model maps naturally to the modular UI (side panel, map, overlay, forms). Large ecosystem for GIS tooling (react-leaflet). Familiar to most frontend developers - important for a project that needs to be maintained by the team.

**Why Vite:** Fastest build tool for React. Native ES module support (important since we use `"type": "module"`). Efficient HMR for development.

**Tradeoff:** React bundle is ~40 KB gzipped - acceptable for a PWA that loads once and caches.

### Leaflet 1.9 + react-leaflet 4

**Why not Mapbox/MapLibre:** Mapbox requires an API key (offline-hostile). MapLibre is heavier and more complex for our use case. Leaflet is lightweight (~40 KB), well-documented, and sufficient for 2D point/polygon rendering.

**Canvas renderer (`preferCanvas: true`):** By default, Leaflet renders vector layers as SVG DOM elements. With thousands of points, SVG causes catastrophic performance degradation on low-end devices. Canvas rendering draws all points as pixels on a single `<canvas>` element, maintaining 60 fps at 10,000+ points. This is a single configuration change (`preferCanvas={true}` on `MapContainer`) that has outsized performance impact.

**Tile source:** OpenStreetMap tiles loaded via HTTPS. No API key required. Tiles are cached aggressively by the Service Worker but not yet in IndexedDB (planned: `leaflet.dexie` for explicit offline tile download).

### Turf.js 6.5

**Why:** Client-side spatial analysis without a backend. Turf.js provides buffer generation (`turf.buffer`), point-in-polygon testing (`turf.booleanPointInPolygon`), distance calculation (`turf.pointToLineDistance`), and area measurement (`turf.area`).

**Tradeoff:** Turf.js is large (~500 KB minified). It dominates the bundle size. Future optimization: tree-shaking imports (only import the functions used) or dynamic import of Turf operations only when needed.

**Bundle size management:**
- Current: 874 KB JS (mainly Turf + React + Leaflet + Pica)
- PWA precaches this once - subsequent loads are instant from Cache Storage
- Chunk size warning is expected and acceptable for a PWA

### Dexie.js + IndexedDB

**Why not localStorage:** localStorage is limited to ~5 MB, is synchronous (blocks the main thread), and can only store strings. Spatial data with photo blobs will rapidly exceed this limit.

**Why Dexie.js:** Provides a clean, promise-based API over IndexedDB. `useLiveQuery` hook enables reactive UI - components re-render automatically when IndexedDB data changes. Schema with multiple stores (features, visits, media) keeps related data together and queryable.

**Schema:**
```javascript
features: '++id, type, timestamp, ward'    // Collection logs + hazard marks
visits: '++id, timestamp, verified'         // GPS site-verification records
media: '++id, featureId'                    // Compressed photo blobs linked to features
geoCache: 'url'                             // Fetch cache for remote GeoJSON
```

**Media separation:** Heavy photo blobs are stored in a separate `media` store, linked to features via `featureId`. This ensures querying thousands of spatial points for map rendering remains fast - photo data is loaded only when a specific marker popup is opened.

### Pica (Client-Side Image Compression)

**Why:** Modern smartphone cameras capture 5–10 MB images. Storing dozens of raw images in IndexedDB would quickly exhaust browser storage quotas (especially on iOS, which enforces a 50 MB limit and 7-day PWA cache eviction).

**How it works:**
1. User captures photo via `<input type="file" accept="image/*" capture="environment">`
2. Image is loaded into an off-screen canvas
3. Pica resizes the longest edge to 800 pixels using Lanczos filtering (runs in a Web Worker, non-blocking)
4. Output is compressed as JPEG at 60% quality
5. Resulting blob is typically < 150 KB

**Web Worker advantage:** Pica offloads the mathematical resize operation to a background thread. The React UI remains responsive during compression.

### vite-plugin-pwa + Workbox

**Service Worker strategy: `injectManifest`**
- Custom `src/sw.js` allows us to write custom routing logic for future map tile caching
- Workbox's `precacheAndRoute` handles aggressive caching of all static assets during build
- `skipWaiting()` + `clients.claim()` ensures the new SW activates immediately on update

**Manifest configuration:**
- `display: 'standalone'` - app launches without browser chrome when installed to home screen
- `orientation: 'portrait'` - optimal for field use on phones
- Theme color: `#0f172a` (slate-900, matching the dark UI)

**Caching:** 7 entries, ~869 KB precached. This includes the entire app shell - React bundle, Leaflet, Turf.js, CSS, icons. After first load, the app opens instantly with no network requests.

---

## Data Flow

### Collection Log (Write Path)

```
User fills material/container/fullness → Photo capture (optional) → Pica compress → "Place on Map" → click map → "Log Collection"
                                                                                                             ↓
                                                                                                    db.features.add(feature)
                                                                                                    → returns featureId
                                                                                                    db.media.add({ featureId, blob })
```

### Hazard Tag (Write Path)

```
"Tag Hazard / Incident" → click map → addStroke(feature) → db.features.add(geoJson)
```

### Site Visit (Write Path)

```
"Log Site Visit" → GPS position → turf.booleanPointInPolygon(coord, buffer60) → db.visits.add(record)
```

### Map Rendering (Read Path)

```
useLiveQuery(() => db.features.toArray()) → FeatureCollection → GeoJSON → Leaflet Canvas renderer → purple circles on map
```

### Export (Read Path)

```
"Download EPR Evidence Pack"
  → db.features.toArray() → map to EPR schema
  → db.visits.toArray() → map to Point features
  → generateAuditExport(features, visits)
  → Blob → URL.createObjectURL → <a download="epr-evidence-*.geojson"> → click
```

---

## Component Tree

```
App
├── Side Panel (w-[420px])
│   ├── Header (Waste Record branding)
│   ├── Dumpsite Proximity stats
│   ├── Collection Pricing slider
│   ├── CollectionForm
│   │   ├── Material select (8 types)
│   │   ├── Container select (Sack/Cart)
│   │   ├── Fullness slider (25-100%)
│   │   ├── Live estimated weight display
│   │   ├── Camera capture (pica compression)
│   │   └── Place on Map / Log Collection
│   ├── CityDashboard (collapsible)
│   │   ├── Total data points, kg, hazards, visits
│   │   ├── Material breakdown
│   │   └── Visit verification rate
│   └── LocalLedger (Baze Route Ledger)
│       ├── Log Site Visit button
│       └── Recent visits list
└── Map (flex-1)
    └── MapViewer
        ├── PIMAOverlay (floating toolbar)
        │   ├── Ward toggle
        │   ├── Tag Hazard/Incident
        │   ├── Undo / Clear
        │   ├── Upload GeoJSON
        │   └── Download EPR Evidence Pack
        ├── Leaflet Map (Canvas-rendered)
        │   ├── TileLayer (OSM)
        │   ├── RecenterMap
        │   ├── Buffer60 (orange fill)
        │   ├── Buffer30 (red fill)
        │   ├── Dumpsite boundary (dashed)
        │   ├── Collection points (color-coded by zone)
        │   ├── Hazard markers (purple circles)
        │   ├── PaintBrush (click-to-tag)
        │   └── CollectionClickCatcher (click-to-place)
        └── Stroke overlay (if any)
```

---

## Offline Strategy

| Feature | Online | Offline |
|---------|--------|---------|
| App load | Full speed (precached) | Full speed (precached) |
| Map tiles | Load from OSM | Browser cache (limited) |
| Data entry | Full | Full (IndexedDB) |
| Photo capture | Full | Full (pica works offline) |
| GPS | Full | Full (no network needed) |
| GeoJSON export | Full | Full (Blob download) |
| Custom GeoJSON upload | Full | Full |
| Ward switching | Full (synthetic data) | Full |

**Current tile limitation:** Map tiles loaded while online are cached by the browser's HTTP cache, but this cache is volatile and opaque. For guaranteed offline tile availability, `leaflet.offline` or `leaflet.dexie` would need to be integrated with an explicit "Download ward tiles" button. This is a planned enhancement.

---

## Security Model

1. **No network transmission** - All data lives in IndexedDB. No data is sent over the network. No API keys, no analytics, no telemetry.
2. **No authentication** - The app does not authenticate users. This is intentional: authentication requires a server. The device *is* the identity.
3. **File-based sharing** - Data leaves the device only via explicit file export (GeoJSON download). The user chooses where to share it (Bluetooth, WhatsApp, USB, email).
4. **No surveillance surface** - There is no server to hack, no database to breach, no cloud account to compromise.
5. **Physical security risk** - If a device is confiscated, the IndexedDB data can be read. Mitigation: a PIN-protected lock screen or self-destruct mechanism is a planned enhancement.

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| First load (cached) | < 2s | ~1s (PWA cache) |
| Map pan (1,000 points) | 60 fps | 60 fps |
| Map pan (10,000 points) | 30+ fps | 60 fps (Canvas) |
| Photo compress + store | < 2s | ~500ms (pica Web Worker) |
| GeoJSON export (1,000 features) | < 1s | Instant (Blob API) |
| Bundle size | < 1 MB gzip | ~870 KB JS, ~244 KB gzip |
