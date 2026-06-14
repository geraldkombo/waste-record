# Research Foundation

## 1. Primary Source: Nairobi Waste Picker Organizing Chat

**Source:** `WhatsApp Chat with Waste pickers working group...txt`

This repository includes a real WhatsApp transcript from an active waste picker organizing group in Nairobi. It documents ongoing organizing around the Sustainable Waste Management Act implementation, EPR (Extended Producer Responsibility) pricing disputes, Dandora dumpsite politics, and the fight for formal recognition.

### Key Findings Extracted

| Finding | Evidence from Chat | Design Response |
|---------|-------------------|-----------------|
| **EPR pricing set without pickers** | PROs determining prices per kg without picker representation; pickers discovering rates after decisions made | Collection Pricing slider (KES 5–100/kg) lets pickers model their own price scenarios; GeoJSON export provides counter-data for negotiation |
| **The Ghana formula problem** | NEMA using a 41 kg/day formula from Ghana that doesn't match Kenyan waste composition or collection patterns | Heuristics engine with Kenyan-specific material densities and local container volumes (Gunia, Mkokoteni) |
| **Dandora dumpsite politics** | Organizing around dumpsite closure threats, relocation without alternatives, cartel control of incoming waste trucks | 4-ward system including Dandora with dumpsite boundary mapping; hazard tagging for cartel activity |
| **"Chokora" stigma** | Pervasive societal stigma that blocks formal recognition, contracts, insurance, minimum wage | The entire EPR Evidence Pack export is designed as a formalization tool — GPS-stamped data counters stigma with evidence |
| **Harassment by Kanjo & cartels** | County enforcement officers and private cartels blocking access, demanding bribes, confiscating materials | Hazard/incident tagging with discreet photo evidence capture; data stays on-device until cooperative chooses to export |
| **17 sub-county organizing** | Organizers spread across Nairobi's sub-counties with no shared spatial picture of conditions or collection activity | GeoJSON export as a universal spatial format; City Dashboard for aggregated ward-level statistics |
| **Health impacts undocumented** | Respiratory disease, injuries from medical waste, toxic smoke from open burning | Hazard tagging captures type and location of health incidents; photo evidence provides medical-legal documentation |

### Organizing Context

The chat reveals a movement at a critical juncture:

- **December 2024 EPR Regulations** are being operationalized — the legal framework exists but the data infrastructure for implementation is absent
- **Dandora** — the largest dumpsite — is at the center of organizing around closure, relocation, and just transition
- **County consolidation** — waste pickers are being asked to register and consolidate, but without clear terms for inclusion or compensation
- **Pricing disputes** — PET, cardboard, and metal prices are set by middlemen with no transparency; pickers want a formal pricing index
- **Meeting overload** — the group coordinates across multiple sub-county meetings, county assembly sessions, and NEMA consultations, but lacks shared data to advocate from

---

## 2. Legal Framework

### Kenya's Sustainable Waste Management Act (2022)

The Act fundamentally reformed Kenya's waste governance by:
- Establishing the **polluter-pays principle** as law
- Mandating Extended Producer Responsibility (EPR) for all producers
- Creating legal recognition for waste as a resource
- Establishing county-level waste management responsibilities

### Sustainable Waste Management (EPR) Regulations (2024)

Gazetted November 2024, these regulations operationalize the Act by:

1. **Mandating Producer Responsibility Organizations (PROs)** — collective schemes that producers must fund
2. **Establishing 5 statutory EPR categories:**
   - Category 1: Non-hazardous packaging (plastics, paper, glass, aluminum)
   - Category 2: Hazardous products packaging
   - Category 3: Electrical and Electronic Equipment (e-waste)
   - Category 4: End-of-life motor vehicles
   - Category 5: Non-packaging items
3. **Requiring Monthly Volume Declarations (MVDs)** — producers must report tonnages placed in the market
4. **Enabling compliance via PRO membership** — all producers must join a NEMA-approved PRO

### The Data Gap

The regulations require PROs to execute physical take-back of post-consumer materials. However:

- **No mechanism exists for PROs to verify collection by informal sector**
- **Waste pickers have no standardized way to document tonnages collected**
- **The 41 kg/day "Ghana formula"** is used by NEMA as a proxy, despite Kenyan waste composition being different
- **Without data, pickers cannot negotiate inclusion in EPR fee distribution**

Waste Record directly addresses this gap by providing a standardized, offline, GPS-stamped data collection and export mechanism that produces NEMA-legible audit trails.

---

## 3. Global Precedent Research

### SWaCH Cooperative (Pune, India)

**Model:** Picker-owned social enterprise with formal municipal contract
**Key takeaway:** Data is leverage. SWaCH's 25+ year track record of verifiable collection data enabled them to negotiate a formal service agreement with the Pune Municipal Corporation.
**Applied in Waste Record:** The City Dashboard and standardized GeoJSON schema are designed to produce the same kind of auditable collection record that SWaCH uses for municipal contracting.

### African Reclaimers Organisation (South Africa)

**Model:** Informal reclaimers organized as a collective bargaining unit
**Key takeaway:** Data on tonnages collected and environmental value created enabled reclaimers to negotiate integration into South Africa's PRO framework.
**Applied in Waste Record:** The `estimated_weight_kg` field in every exported Feature, combined with the `epr_statutory_category`, directly mirrors the data points South African reclaimers used to prove their contribution.

### WIEGO (Women in Informal Employment: Globalizing and Organizing)

**Key research:** Data sovereignty and participatory ethics
- Informal workers must control their own data
- Technology should not create new surveillance risks
- Data collection must be grounded in informed consent

**Applied in Waste Record:**
- **Zero-server architecture** — data never leaves the device until explicit export
- **No telemetry, no analytics, no cloud** — the cooperative is the sole data custodian
- **Visual consent prompts** before any export is generated

### Brazil's Catadores and UNICATA

**Model:** Picker cooperatives with educational technology platforms
**Key takeaway:** Technology must be accessible to semi-literate users; visual interfaces and peer training are more effective than text-heavy documentation.
**Applied in Waste Record:** Icon-based UI, photo evidence as primary documentation method, audio capture (MediaRecorder API) for voice notes.

### KoboToolbox / ODK / OpenMapKit

**Assessment:** These are the industry-standard humanitarian GIS tools. Key limitations for the picker use case:
- **Client-server architecture** — data syncs to a central database, shifting control away from the cooperative
- **Generic survey forms** — not optimized for rapid, high-frequency spatial event logging
- **No specialized waste sector schema** — no material types, container volumes, or EPR category mapping

**Waste Record's differentiation:** Zero-server sovereignty + specialized picker workflow + EPR-native schema.

---

## 4. Density Heuristics

**Source:** US EPA and global solid waste management bulk density standards, adapted for loose/uncompacted materials typical of informal manual collection.

| Material | Density (kg/m³) | 100L Gunia (kg) | 1.5m³ Mkokoteni (kg) |
|----------|----------------|-----------------|----------------------|
| PET Plastics (Chupa) | 21 | 2.1 | 31.5 |
| HDPE Plastics (Chupa) | 14 | 1.4 | 21.0 |
| Cardboard (Katoni) | 45 | 4.5 | 67.5 |
| Mixed Paper (Karatasi) | 205 | 20.5 | 307.5 |
| Aluminum Cans (Mkebe) | 35.5 | 3.6 | 53.3 |
| Steel (Chuma) | 96.5 | 9.7 | 144.8 |
| Glass (Chupa) | 355.5 | 35.6 | 533.3 |
| Organic/Food (Chirambe) | 255 | 25.5 | 382.5 |

**Methodology:** `estimatedWeight = containerVolume × fullnessPercentage × density`

These values are conservative estimates for loose, uncompacted materials as collected manually. Baled or compacted materials would have higher densities. The tool uses the median value from each density range to ensure defensible, conservative estimates for NEMA auditors.

---

## 5. Technical Precedent: Why Zero-Server

| Approach | Example | Suitability for Picker Use Case |
|----------|---------|-------------------------------|
| **Cloud backend** | Firebase, Supabase, custom server | Eliminated: requires internet, ongoing costs, data sovereignty risk |
| **Client-server with offline sync** | KoboToolbox, ODK | Eliminated: sync dependency, data leaves cooperative control |
| **Decentralized / IPFS** | Web3 storage | Eliminated: complexity, no clear benefit over local file for this scale |
| **Pure client-side + file export** | **Waste Record** | Selected: zero operational cost, full data sovereignty, works offline, GeoJSON is universal |

The key insight: **a cooperative does not need a server to prove its value to a regulator.** A GeoJSON file on a phone, opened in a county official's QGIS, is as persuasive as a cloud dashboard — and does not require the cooperative to maintain infrastructure, pay hosting fees, or trust a third party with its data.
