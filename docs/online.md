# Online Architecture

When connectivity exists, AgriScan adds **live context** on top of the same device-first
pipeline: live weather, cloud sync, officer analytics and expert review.

```
┌─ FARMER APP ────────────────────────────┐        ┌─ OFFICER APP ───────────────────┐
│ • live weather context                  │        │ • KPI cards (total, severe, …)  │
│ • background model/KB version check     │        │ • severity distribution chart   │
│ • instant Sync Now                      │        │ • 14-day cases timeline         │
│ • pending badge fades as queue drains   │        │ • regional outbreak map (Leaflet)│
└──────────────────┬──────────────────────┘        │ • expert review queue           │
                   │  REST/JSON                    └───────────────▲──────────────────┘
                   ▼                                  (same backend!)
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  FastAPI (uvicorn)  +  SQLite (app/data/agriscan.db)                                 │
│                                                                                     │
│  /api/weather            Open-Meteo live, cached fallback                            │
│  /api/sync               offline queue batch upload                                  │
│  /api/dashboard/stats    totals / by_crop / severity_dist / timeline                 │
│  /api/outbreaks          anonymous map points                                        │
│  /api/disease-risk       prototype regional risk score                               │
│  /api/diagnoses/review-queue + /api/expert-review   low-confidence cases            │
│  /api/knowledge, /api/model/version   versioning for client checks                  │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Sync protocol

1. Client holds `device_id` (generated once, persisted in `localStorage`).
2. `syncEngine.syncNow()` reads the pending queue, maps each record to the API contract
   (no PII; crops/diseases/scores/geometry only) and POSTs `{ device_id, diagnoses[] }`.
3. The backend inserts rows it hasn't seen (`id` idempotency) and returns
   `{ synced, skipped, ids }`.
4. The client marks matching local rows `synced` and records `last_sync_at`.
5. Auto-sync fires on the `online` event; manual **Sync Now** is in the Sync Center.

## Weather

- `GET /api/weather?lat=&lon=` proxies Open-Meteo (current temperature, humidity,
  rainfall).
- Offline: the frontend reads its cached weather key (`region:<lat>:<lon>`) and labels
  the result *cached*.
- Risk engine silently degrades if weather is missing (moderate default).

## Prototype regional risk model

`/api/disease-risk` combines **live weather** with **recent case load**:

```
risk = risk_score(recency-weighted cases in region) blended with a weather score
       (temperature + humidity raise fungal/severity risk)
```

Exported as `{ risk: { score, label, … } }`. The dashboard labels it explicitly as a
*"Prototype Regional Risk Model"* — the equations are transparent and auditable
(`Backend/app/services/risk.py`), and the spec allows this to be a scaffold for the
ST-GNN described in `roadmap.md`.

## Officer dashboard

- Purely **online** (aggregates live SQLite data); renders a clear offline banner if
  the API is unreachable with a Retry action.
- View-only protection is mocked via the header shield toggle; auth is out of scope for
  the prototype (see `limitations.md`).

## Versioning

- `GET /api/model/version` returns `{ ai_model, knowledge_base }`; the app records them
  and shows the current versions in About.
- Model-download/bypass channels are described in `roadmap.md`.