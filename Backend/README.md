# AgriScan AI — Backend (FastAPI + SQLite)

Officer analytics, weather proxy, risk engine, sync intake and expert-review API for
the AgriScan prototype.

## Run

```bash
python -m venv .venv && .venv\Scripts\activate   # Windows
pip install -r requirements.txt
python scripts/generate_demo_data.py --reset      # deterministic demo dataset
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

- Interactive API docs: http://127.0.0.1:8000/docs
- Health check: http://127.0.0.1:8000/api/health

## Layout

```
app/
├── main.py            FastAPI app, CORS, router mount, seed-on-boot
├── config.py          Settings (database URL, region, seed flag)
├── database.py        SQLAlchemy engine/session + init_db()
├── models.py          ORM models (diagnosis, farm, review, outbreak…)
├── schemas.py         Pydantic request/response schemas
├── api/
│   ├── routes_dashboard.py   /api/dashboard/stats
│   ├── routes_diagnoses.py   /api/sync, /api/diagnoses, review-queue
│   ├── routes_risk.py        /api/weather, /api/disease-risk, /api/outbreaks
│   ├── routes_knowledge.py   /api/knowledge, /api/model/version
│   └── routes_expert.py      /api/expert-review
└── services/
    ├── seed.py        Deterministic demo data (220 diagnoses, 40 farms…)
    ├── knowledge.py   Knowledge-base loader (→ SQLite tables)
    ├── weather.py     Open-Meteo proxy with cached fallback
    └── risk.py        Prototype modular regional risk model
data/
    agriscan.db        SQLite (gitignored; recreated + seeded on startup)
    knowledge_base.json  Verified-label guidance (v1.0)
```

Schema + endpoint reference: `docs/database.md`, `docs/api.md` (repo root).