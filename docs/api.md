# API Reference (prototype)

Base URL: `http://127.0.0.1:8000` (frontend: `VITE_API_BASE`). Interactive docs at
`/docs` (Swagger). All responses JSON; CORS is enabled for the Vite dev origin.

## Health & meta

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | `{"status":"ok","app":"AgriScan AI","version":"0.1.0"}` |
| GET | `/api/model/version` | `{"ai_model":"v0.1-demo","knowledge_base":"v1.0"}` |

## Sync & diagnoses

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/sync` | Offline-queue batch upload |
| POST | `/api/diagnoses` | Single diagnosis (direct sync) |
| GET | `/api/diagnoses?limit=&offset=&class_id=` | List diagnoses |
| GET | `/api/diagnoses/review-queue` | Low-confidence cases (`needs_review`) |

**`POST /api/sync`** request body:

```json
{
  "device_id": "demo-device",
  "diagnoses": [
    {
      "id": "9f1c…",
      "user_id": "demo-farmer-001",
      "crop": "Tomato",
      "disease": "Early Blight",
      "class_id": "tomato_early_blight",
      "confidence": 0.91,
      "severity": 68,
      "severity_label": "Severe",
      "temperature": 27.4,
      "humidity": 78.2,
      "rainfall_mm": 2.1,
      "weather_cached": false,
      "latitude": 22.72,
      "longitude": 75.88,
      "created_at": "2026-09-23T06:12:00Z",
      "is_demo_sample": false
    }
  ]
}
```

Response: `{"synced": 1, "skipped": 0, "ids": ["9f1c…"]}` (id → idempotent).

## Weather & risk

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/weather?lat=&lon=` | Live Open-Meteo, cached fallback |
| GET | `/api/disease-risk` | Prototype regional risk (score 0–100, label, components) |
| GET | `/api/outbreaks` | Anonymous map points `{count, points:[…]}` |

## Dashboard (officer)

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/dashboard/stats` | Aggregates for the Agri Intelligence dashboard |

`/api/dashboard/stats` returns:

```json
{
  "total_diagnoses": 220,
  "synced": 220,
  "high_severity": 166,
  "expert_review_due": 36,
  "top_condition": { "crop": "Tomato", "disease": "Early Blight", "count": 31 },
  "by_crop": [ { "crop": "Tomato", "count": 120 } ],
  "by_crop_disease": [ { "crop": "Tomato", "disease": "Early Blight", "count": 31 } ],
  "severity_distribution": [ { "label": "Severe", "count": 166 } ],
  "timeline": [ { "date": "01 Sep", "count": 4 } ]
}
```

## Expert review

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/expert-review` | Record an expert decision |

Body: `{ "diagnosis_id": "...", "decision": "confirmed|incorrect|more_info", "note": "" }`
→ `{ "id": …, "review_status": "confirmed" }`.

## Knowledge

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/knowledge` | Verified-label guidance for all 10 classes |

```json
{
  "version": "v1.0",
  "entries": {
    "tomato_early_blight": {
      "crop": "Tomato", "disease": "Early Blight", "pathogen": "Alternaria solani",
      "summary": "…", "symptoms": ["…"], "immediate_actions": ["…"],
      "prevention": ["…"], "chemical_guidance": [{"name":"…","dosage":"…","frequency":"…","note":"…"}],
      "organic": ["…"], "contact_advice": "…"
    }
  }
}
```

## Error handling

- Non-2xx responses throw on the client (`api.js`); components decide (e.g. the
  dashboard shows "offline" + Retry, the sync queue simply stays pending).
- Weather: network failure falls back to cached readings; the response source field
  (`live` vs `cached`) is surfaced in the UI.