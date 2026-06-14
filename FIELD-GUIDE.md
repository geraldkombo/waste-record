# Field Guide

## Quick Start

1. **Open Waste Record** on your phone's browser. Tap the browser menu → "Add to Home Screen" to install as an app.
2. **Allow GPS** when prompted. The app works without GPS but site verification requires location access.
3. **Allow camera** when using photo evidence. Photos are compressed on your phone and never uploaded anywhere.

---

## Sheng Glossary

Using Sheng (Nairobi street slang) in the interface makes the tool feel like it belongs to the community. Here are the terms used in Waste Record:

| Term | Meaning | Used In |
|------|---------|---------|
| **Baze** | Basecamp, gathering space, cooperative meeting point | Baze Route Ledger |
| **Mkokoteni** | Manual pushcart (standard: 1.5 m³ volume) | Collection Form container selector |
| **Gunia** | Standard 100-liter agricultural sack | Collection Form container selector |
| **Kanjo** | County enforcement officers | Hazard tagging incident type |
| **Chupa** | Bottles (both plastic and glass) | Material selector labels |
| **Katoni** | Cardboard / paper packaging | Material selector labels |
| **Karatasi** | Mixed paper | Material selector labels |
| **Mkebe** | Metal cans (aluminum/tin) | Material selector labels |
| **Chuma** | Steel / scrap metal | Material selector labels |
| **Chirambe** | Organic food waste | Material selector labels |
| **Nyarere** | Rubber / tyres | Future material category |

---

## Collection Logging Workflow

### Step-by-Step

```
1. Open Waste Record → side panel shows Dumpsite Proximity stats
2. Select a ward (Mathare → Dandora → Kibera → Kawangware)
3. Scroll to "Log Collection" section
4. Select material type:
   → Chupa (PET Plastics)
   → Chupa (HDPE Plastics)
   → Katoni (Cardboard)
   → Karatasi (Mixed Paper)
   → Mkebe (Aluminum Cans)
   → Chuma (Steel)
   → Chupa (Glass)
   → Chirambe (Organic)
5. Select container:
   → Gunia (100L sack) — for small/medium loads carried on back
   → Mkokoteni (1.5m³ cart) — for full pushcart loads
6. Set fullness (25% / 50% / 75% / 100%)
   → Estimate how full the container is visually
7. View estimated weight — updates live as you change material/container/fullness
8. (Optional) Tap "Capture Photo Evidence" → take a photo
   → Photo is compressed on your phone (no upload)
   → Preview shows in the form
9. Tap "Place on Map" → then tap the location on the map
10. Tap "Log Collection" to save

→ Purple circle marker appears on the map
→ Collection count and kg total update in City Dashboard
```

### Tips for Accurate Estimates

- **Fullness:** 25% = bottom of sack covered, 50% = half full, 75% = three-quarters, 100% = overflowing/heaped
- **Consistency:** Use the same container type for the same route to make estimates comparable over time
- **Photos:** Take a photo of the loaded container for visual verification — a jury or NEMA officer can verify a photo alongside the GPS coordinate
- **Material separation:** If you collect multiple materials, log each separately for accurate weight breakdown

---

## Hazard Tagging Workflow

### Step-by-Step

```
1. Tap "Tag Hazard / Incident" in the Field Toolkit overlay (top-right)
   → Button turns red
   → Cursor changes to crosshair
2. Tap any location on the map
   → Purple marker appears
   → Marker is automatically saved
3. Tap "Stop Tagging" when done
4. Use "Undo" to remove the most recent marker
5. Use "Clear" to remove all markers
```

### What to Tag

| Incident Type | Example | Why Tag It |
|---------------|---------|------------|
| **Harassment** | Kanjo demanding bribes, cartel blocking access | Builds case for safe passage agreements |
| **Health hazard** | Toxic smoke, medical waste, chemical spills | Documents occupational health risks for advocacy |
| **Unfair pricing** | Aggregator offering below-market rate | Creates spatial price map for negotiation |
| **Burn site** | Open burning of synthetic materials | Maps pollution hotspots for environmental action |
| **Medical waste** | Needles, syringes, biohazards | Safety mapping for pickers and advocacy for proper disposal |

### Safety Notes

- **Discretion:** The app looks like a utility tool, not a surveillance app
- **No cloud upload:** All data stays on your phone
- **Export is a deliberate action:** Data leaves your device ONLY when you tap "Download EPR Evidence Pack" and share the file
- **Fake mode (planned):** "Hide" button that shows a benign screen if someone looks at your phone

---

## GPS Site Visit Verification

### Step-by-Step

```
1. Scroll to "Baze Route Ledger" section in side panel
2. Tap "Log Site Visit"
3. Allow GPS access (only needed once)
4. Wait for GPS fix (a few seconds outdoors)
5. Status message shows:
   → "Site visit verified" (if you're within 60m of the dumpsite)
   → "Location outside dumpsite buffer" (if you're further away)
6. Record appears in the ledger with timestamp and coordinates
```

### Why Verify?

- **Proof of presence:** Shows you were actually at the site
- **Route evidence:** Builds a time-stamped location history for advocacy
- **Verification rate:** The City Dashboard shows what percentage of visits are verified — high rates strengthen your data's credibility

---

## Exporting Data

### Step-by-Step

```
1. Tap "Download EPR Evidence Pack" in the Field Toolkit overlay
2. A `.geojson` file downloads to your phone
3. Share via:
   → WhatsApp (send to cooperative group)
   → Bluetooth / ShareIt (to another phone)
   → USB cable (to a laptop)
   → Email (when you have internet)
```

### What's in the Export

The GeoJSON file contains:
- All collection logs with material, container, estimated weight, GPS coordinates
- All hazard tags with incident type and location
- All site visits with verification status
- Full metadata including export time and EPR framework reference

### Opening in QGIS

1. Transfer the `.geojson` file to a laptop
2. Open QGIS
3. **Layer → Add Layer → Add Vector Layer**
4. Select the downloaded file
5. You now have a professional-grade map layer with full attribute data

---

## Sheng-Localized Interface Reference

| English | Waste Record UI | Location |
|---------|-----------|----------|
| Collection Route Ledger | **Baze Route Ledger** | Side panel |
| Log Site Visit | **Log Site Visit** | Baze Route Ledger |
| Material Type | **Material type dropdown** | Collection Form |
| Container | **Container selector** | Collection Form |
| Photo Evidence | **Capture Photo Evidence** | Collection Form |
| Tag Hazard / Incident | **Tag Hazard / Incident** | Field Toolkit overlay |
| Download EPR Evidence Pack | **Download EPR Evidence Pack** | Field Toolkit overlay |

---

## Offline Usage

| Task | Works Offline? |
|------|---------------|
| Open the app | ✅ (after first load — PWA) |
| View map | ⚠️ (tiles cached from previous visits) |
| Switch wards | ✅ (synthetic data generated locally) |
| Log collections | ✅ |
| Take photos | ✅ |
| Tag hazards | ✅ |
| Log site visits (GPS) | ✅ |
| Export GeoJSON | ✅ |
| Upload custom data | ✅ |

**Map tiles:** The app loads OpenStreetMap tiles when online. Your browser caches recently viewed tiles, so areas you've looked at will be available offline. For guaranteed offline tiles at a specific ward (e.g., Mathare), open the app while connected to Wi-Fi and pan around the ward at zoom levels 15–17 to cache tiles.

---

## Device Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Operating System | Android 8+ | Android 10+ |
| Browser | Chrome 90+ | Chrome 110+ |
| RAM | 2 GB | 3 GB+ |
| Storage | 100 MB free | 500 MB+ (for photo evidence) |
| GPS | A-GPS | GPS + GLONASS |
| Camera | Any | 5 MP+ |
| Internet | Required only for first load | Wi-Fi for tile caching |

**Note:** iOS is not recommended for field use due to Apple's 7-day PWA cache eviction policy. If using iOS, export data frequently to avoid data loss.
