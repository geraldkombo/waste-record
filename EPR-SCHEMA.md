# EPR-Aligned GeoJSON Export Schema

## Legal Basis

Kenya's **Sustainable Waste Management Act (2022)** and the **Sustainable Waste Management (Extended Producer Responsibility) Regulations (2024)** establish the legal framework for Extended Producer Responsibility. These regulations mandate:

1. **Producer Responsibility Organizations (PROs)** must report aggregated collection data to NEMA
2. **Monthly Volume Declarations (MVDs)** tracking tonnages introduced to market
3. **5 statutory categories** of Producer Responsibility Organizations

Waste Record's GeoJSON export schema is designed to produce data that is immediately legible within this regulatory framework, enabling waste picker cooperatives to present verifiable collection evidence to PROs, NEMA, and county environmental officers.

---

## Complete Schema

### Envelope

```json
{
  "type": "FeatureCollection",
  "metadata": {
    "exportedAt": "2026-06-14T18:37:07.000Z",
    "source": "pima",
    "toolkit": "Waste Record",
    "visitsLogged": 12,
    "hazardsTagged": 8,
    "epr_framework": "Kenya Sustainable Waste Management (EPR) Regulations 2024"
  },
  "features": []
}
```

### Collection Log Feature

```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [36.8571, -1.2567]
  },
  "properties": {
    "collection_id": "pima-1718383027000",
    "timestamp_iso": "2026-06-14T09:42:17.000Z",
    "picker_coop_name": "Nairobi Recyclable Waste Association",
    "ward_boundary": "Mathare",
    "epr_statutory_category": "Category 1: Non-hazardous packaging (plastics, paper, glass, aluminum)",
    "material_sub_type": "CARDBOARD",
    "container_volume_type": "MKOKOTENI",
    "fullness_percentage": 100,
    "estimated_weight_kg": 67.5,
    "hazard_incident": false,
    "incident_type": "",
    "evidence_photo_local_id": ""
  }
}
```

### Hazard Tag Feature

```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [36.8582, -1.2559]
  },
  "properties": {
    "collection_id": "pima-1718383100000",
    "timestamp_iso": "2026-06-14T09:45:10.000Z",
    "picker_coop_name": "Nairobi Recyclable Waste Association",
    "ward_boundary": "",
    "epr_statutory_category": "Category 1: Non-hazardous packaging (plastics, paper, glass, aluminum)",
    "material_sub_type": "mixed",
    "container_volume_type": "gunia",
    "fullness_percentage": 100,
    "estimated_weight_kg": 0,
    "hazard_incident": true,
    "incident_type": "harassment",
    "evidence_photo_local_id": "ph_001.jpg"
  }
}
```

### Site Visit Feature

```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [36.8575, -1.2565]
  },
  "properties": {
    "visit_id": "WR-47291",
    "timestamp_iso": "2026-06-14T10:15:00.000Z",
    "gps_verified": true,
    "feature_type": "site_visit"
  }
}
```

---

## Field Reference

### Metadata Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `exportedAt` | ISO 8601 | When the export was generated | `2026-06-14T18:37:07.000Z` |
| `source` | string | Application identifier | `pima` |
| `toolkit` | string | Full application name | `Waste Record` |
| `visitsLogged` | integer | Count of site visit records in export | `12` |
| `hazardsTagged` | integer | Count of hazard/incident records | `8` |
| `epr_framework` | string | Legal framework reference | `Kenya Sustainable Waste Management (EPR) Regulations 2024` |

### Collection Log Properties

| Field | Type | Description | Values |
|-------|------|-------------|--------|
| `collection_id` | string | Unique identifier | `pima-{timestamp}` |
| `timestamp_iso` | ISO 8601 | When the collection was logged | `2026-06-14T09:42:17.000Z` |
| `picker_coop_name` | string | Cooperative or picker identifier | Configurable |
| `ward_boundary` | string | Nairobi ward name | `mathare`, `dandora`, `kibera`, `kawangware` |
| `epr_statutory_category` | string | EPR category per Kenya 2024 Regulations | See below |
| `material_sub_type` | string | Specific material | `PET`, `HDPE`, `CARDBOARD`, `PAPER`, `ALUMINUM`, `STEEL`, `GLASS`, `ORGANIC` |
| `container_volume_type` | string | Local container standard | `GUNIA` (100L), `MKOKOTENI` (1.5m³) |
| `fullness_percentage` | integer | Estimated fullness | `25`, `50`, `75`, `100` |
| `estimated_weight_kg` | float | Calculated weight | `67.5` |
| `hazard_incident` | boolean | Whether this point is a hazard | `true`, `false` |
| `incident_type` | string | Type of incident | `harassment`, `health`, `unfair_pricing`, `cartel`, `burn_site`, `medical_waste` |
| `evidence_photo_local_id` | string | Reference to stored photo | `ph_001.jpg` (currently local reference) |

### Site Visit Properties

| Field | Type | Description | Values |
|-------|------|-------------|--------|
| `visit_id` | string | Unique identifier | `WR-{random}` |
| `timestamp_iso` | ISO 8601 | When the visit was logged | `2026-06-14T10:15:00.000Z` |
| `gps_verified` | boolean | Whether coords fall within dumpsite buffer | `true`, `false` |
| `feature_type` | string | Record type discriminator | `site_visit` |

---

## EPR Statutory Categories

Per the First Schedule of Kenya's **Sustainable Waste Management (EPR) Regulations, 2024**:

| Code | Category | Description | Materials |
|------|----------|-------------|-----------------|
| 1 | Non-hazardous packaging | Plastics, paper, glass, aluminum, cardboard | PET, HDPE, CARDBOARD, PAPER, ALUMINUM, STEEL, GLASS |
| 2 | Hazardous products packaging | Industrial chemicals, hazardous materials | (Future) |
| 3 | Electrical and Electronic Equipment | E-waste | (Future) |
| 4 | End-of-life motor vehicles | Vehicles, tyres | (Future) |
| 5 | Non-packaging items | Organic waste, textiles, other | ORGANIC |

Currently, Waste Record defaults all material types to **Category 1** (non-hazardous packaging) since the initial target materials (plastics, paper, glass, metals, cardboard) fall under this category. Organic waste maps to Category 5. Future iterations will expand to include Categories 2–4.

---

## How to Use the Schema

### For QGIS / ArcGIS

1. Open QGIS
2. **Layer → Add Layer → Add Vector Layer**
3. Select the exported `.geojson` file
4. Features appear as point data with full attribute table
5. Style by `feature_type` (collection_log vs hazard_mark vs site_visit)
6. Style by `material_sub_type` for material breakdown visualization

### For NEMA / County Reporting

The GeoJSON can be transformed into tabular reports by:
1. Opening in any GIS software
2. Exporting the attribute table as CSV
3. Aggregating by `ward_boundary`, `material_sub_type`, `estimated_weight_kg`

### For PRO Verification

PROs requiring proof of collection can:
1. Cross-reference GPS coordinates with known collection zones
2. Verify timestamps against collection schedules
3. Aggregate `estimated_weight_kg` by `material_sub_type` to verify tonnage claims

---

## Schema Design Decisions

1. **Flat properties** — No nested objects. GIS software handles flat attribute tables most reliably.
2. **ISO 8601 timestamps** — Universal date format, sorted correctly by all GIS platforms.
3. **Container + fullness instead of raw volume** — Containers (Gunia, Mkokoteni) are locally understood units. Combining with fullness percentage enables estimation without scales.
4. **Conservative density estimates** — Using median bulk density values ensures estimates are defensible and not inflated.
5. **Feature type discrimination** — Collection logs, hazard marks, and site visits are all GeoJSON Points but distinguished by `feature_type` and property structures, enabling filtered visualization.
