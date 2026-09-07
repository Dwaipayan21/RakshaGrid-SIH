# AGENTS.md — Disaster Intelligence Platform (Assam Prototype) Backend

This file defines the project context, architecture, and rules that any AI agent (Antigravity) must
follow when working on this backend. Read this fully before generating or modifying code.

---

## 1. Project Overview

**Title:** Intelligent Identification of Hazard-Based Red Zones, Carrying Capacity Assessment, and
Immediate Relocation Needs for Vulnerable Habitations (SIH project).

**Problem being solved:** India's disaster-prone regions face recurring hazards — landslides, floods,
coastal erosion, cloudbursts. Vulnerable habitations remain in unsafe zones, and relocation today is
reactive, not proactive. This platform is a GIS-enabled decision support system that:

- Dynamically identifies and updates multi-hazard **Red Zones** (areas unsuitable for permanent habitation)
- Assesses the **carrying capacity** of safer alternative relocation sites
- **Prioritizes vulnerable habitations** for immediate / short-term / medium-term relocation
- Integrates hazard intensity, population vulnerability, and disaster history into evidence-based decisions

**Prototype scope:** Assam → one flood-prone district → selected villages/settlements → full
end-to-end demo. Architecture must stay disaster-agnostic and reusable for nationwide, multi-hazard
scale-up (flood, landslide, cyclone, wildfire, earthquake).

---

## 2. Team Ownership — Respect These Boundaries

- **Database (PostgreSQL + PostGIS):** owned and designed by a teammate. The agent must **not**
  unilaterally redesign core schema/tables. Backend work integrates against this schema — propose
  changes, don't silently overwrite them.
- **Backend (this repo):** Node.js + Express + Prisma. This is the agent's primary scope.
- **Frontend:** separate team, React + TypeScript + Leaflet. Not in scope here.

---

## 3. Tech Stack (fixed — do not substitute without asking)

| Layer | Technology | Notes |
|---|---|---|
| Runtime | Node.js + Express | |
| ORM | Prisma | Chosen for type safety; PostGIS types handled via `Unsupported("geometry(...)")` + raw SQL |
| Database | PostgreSQL + PostGIS | Owned by teammate |
| Auth | JWT + bcrypt, RBAC | Roles: Authority/Control-Room vs Citizen/Public |
| Validation | Zod | |
| Realtime | WebSocket / SSE | Live alert + status updates |
| Geo queries | `prisma.$queryRaw` with PostGIS functions | `ST_Intersects`, `ST_DWithin`, `ST_Distance`, `ST_Contains` — Prisma cannot express these natively |

---

## 4. Architecture Flow

```
Authoritative sources (NRSC/ISRO, Census, SACHET, ASDMA, IMD/CWC)
        ↓
Data ingestion / validation
        ↓
PostgreSQL + PostGIS (teammate-owned)
        ↓
Backend repository layer (raw PostGIS SQL, isolated)
        ↓
Backend service layer (business logic: scoring, matching, prediction)
        ↓
Backend controller + route layer (Express REST API)
        ↓
Frontend (React + Leaflet) — settlement triage, shelter recommendation, protocol/alert display
```

**Rule for the agent:** never let raw SQL or PostGIS function calls leak into controllers or services.
They live only in `repositories/`. Services call repositories and apply business logic; controllers
call services and handle HTTP concerns only.

---

## 5. Data Hierarchy

```
State → District → Zone → Settlement → { Shelter, Route, RiskScore, FieldReport }
```

Supporting entities: `HazardLayer`, `Alert`, `Protocol` (hardcoded, not DB-driven), `User`, `AuditLog`.

Key Settlement fields: `population`, `households`, `areaSqKm`, `vulnerabilityScore`,
`nearestHospitalKm`, `housingStructure`, `lat`/`lon`, PostGIS `geom` (Point).

Key Zone fields: `hazardScore`, `riskClass` (Green/Yellow/Orange/Red), PostGIS `geom` (Polygon).

---

## 6. Core Features the Backend Must Serve

1. **Population density (village-wise)** — derived from `population` / `areaSqKm` per settlement.
2. **Living conditions / vulnerability** — housing structure type + nearest hospital distance, combined
   into the Vulnerability (V) component of the priority score.
3. **Hazard zone identification (data-based, not hardcoded)** — classify zones/settlements into
   Red/Orange/Yellow/Green from historical hazard data (NRSC/ISRO Assam Flood Hazard Zonation Atlas,
   1998–2023). **Open decision:** rule-based thresholding vs. trained ML model. Agent must ask before
   assuming either — this determines whether a Python microservice (`ml/`) is needed at all.
4. **Shelter matching + evacuation priority + protocols:**
   - Match nearest **safe** shelter across types (hospital, elevated building, govt school) — filter by
     safety + capacity + route feasibility **before** ranking by distance. Never recommend nearest-only.
   - Priority score formula (fixed):
     `Priority = 0.40×H + 0.20×E + 0.15×V + 0.10×A + 0.15×C` (each component normalized 0–100)
   - Priority bands: P1 ≥75 (immediate), P2 50–74 (high), P3 25–49 (moderate), P4 <25 (low/routine)
   - Protocols are **hardcoded** (`src/data/protocols.json`), keyed by hazard type + severity
     (Watch/Warning/Emergency) — served as static data, never computed or DB-stored.

---

## 7. Folder Structure (must be followed)

```
backend/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.js
├── src/
│   ├── config/              # db, env, constants (H/E/V/A/C weights, thresholds)
│   ├── data/
│   │   └── protocols.json   # hardcoded evacuation protocols
│   ├── controllers/         # HTTP layer only — no business logic, no raw SQL
│   ├── routes/
│   ├── services/            # business logic: scoring, matching, prediction
│   │   ├── riskEngine.service.js
│   │   ├── vulnerability.service.js
│   │   ├── hazardPrediction.service.js
│   │   ├── shelterMatching.service.js
│   │   ├── capacity.service.js
│   │   ├── geo.service.js
│   │   ├── routing.service.js
│   │   └── protocol.service.js
│   ├── repositories/        # ALL raw PostGIS SQL isolated here
│   ├── ml/                  # only if hazard prediction becomes model-based
│   ├── middlewares/
│   ├── validators/
│   ├── utils/
│   ├── jobs/                # scheduled recompute / stale-data checks
│   ├── sockets/
│   ├── app.js
│   └── server.js
├── tests/
└── package.json
```

---

## 8. Working Rules for the Agent

- **Ask before assuming schema changes** — the database is teammate-owned; propose, don't overwrite.
- **Ask before choosing rule-based vs. ML** for hazard prediction — this is an open decision, not settled.
- **Never hardcode protocol logic into services** — protocols are static JSON, served as-is.
- **Never skip the repository layer** for PostGIS queries — no raw SQL in controllers/services.
- **Every computed risk score must store `model_version` and `calculated_at`** for auditability — this
  is a governance requirement from the project blueprint, not optional.
- **Label all prototype values** (weights, thresholds, shelter capacities, simulated alerts) clearly as
  prototype/demo data in code comments and API responses where relevant.
- **Build incrementally, one module at a time** — models → repository → service → controller → route,
  in that order, per feature. Do not scaffold everything at once without confirmation.
- **Current status:** State/District/Zone/Settlement Prisma models are drafted. Next steps: Shelter,
  HazardLayer, Alert, RiskScore, Route models, then their repositories/services/controllers.
