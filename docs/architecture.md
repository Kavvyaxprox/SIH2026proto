# Architecture

AgriScan AI is a **three-tier offline-first prototype**:

```
┌────────────────────────────────────────────────────────────┐
│  BROWSER (farmer)                                          │
│                                                            │
│  React SPA (Vite)                                          │
│  ├─ Scan pipeline (fully on-device):                      │
│  │   image → quality gate → MobileNetV3-Small (ONNX)      │
│  │   → severity → weather context → recommendations       │
│  ├─ IndexedDB (offline store: diagnoses, weather, meta)   │
│  ├─ Sync engine (auto on `online` event + manual)         │
│  └─ i18n (en/hi) + PWA service worker                     │
└───────────────┬────────────────────────────────────────────┘
                │  HTTPS / localhost  (JSON over REST)
┌───────────────▼────────────────────────────────────────────┐
│  BACKEND (FastAPI + SQLite)                                │
│  ├─ /api/dashboard/stats     aggregates for officer view   │
│  ├─ /api/sync                batch upload of offline cases │
│  ├─ /api/weather             live Open-Meteo w/ fallback   │
│  ├─ /api/disease-risk        prototype regional risk       │
│  ├─ /api/outbreaks           anonymous map points          │
│  ├─ /api/knowledge           verified label guidance       │
│  └─ /api/expert-review       expert decisions on low conf  │
└───────────────┬────────────────────────────────────────────┘
                │  (offline: skipped; device queue grows)
```

## Data flow

### Offline (no connectivity — the primary path)
1. Farmer captures a photo (or picks a bundled demo sample).
2. The Canvas-based **quality gate** rejects blurry/dark/tiny images before any AI runs.
3. The image is centre-cropped to 224×224, normalised with ImageNet stats, and passed to
   the **ONNX MobileNetV3-Small** running in the browser (`onnxruntime-web`).
4. Softmax probabilities → top-1 class + confidence. Confidence < 0.60 flags the scan
   for **expert review**.
5. Severity is computed from AI confidence and local (cached) weather; recommendations
   come from the bundled knowledge base.
6. The result is written to **IndexedDB** with `sync_status = pending`.

### Online (adding context)
7. Weather resolves live from **Open-Meteo** on the backend (temperature/humidity/rainfall).
8. Pending diagnoses upload in a single `POST /api/sync` batch; each success flips the
   local row to `synced`.
9. Officers open the dashboard; the backend aggregates SQLite data into KPIs, charts and
   an outbreak point map, and surfaces low-confidence cases for expert review.

## Technology decisions (and why)

| Choice | Rationale |
| --- | --- |
| React + Vite | Fast SPA; `public/` assets (model/wasm) ship without bundling pain |
| onnxruntime-web | Real inference in-browser; same model as training — **no fake AI** |
| MobileNetV3-Small | ~9 MB model, CPU-friendly, ImageNet-pretrained backbone |
| IndexedDB | Survives reload; permits querying the pending queue via indexes |
| FastAPI + SQLite | Minimal moving parts for a prototype; auto schema + docs UI |
| Open-Meteo | Free, no API key, low-traffic JSON |
| Leaflet + OpenStreetMap | No-key tiles for the regional map (needs connectivity, clearly signalled) |
| Service worker | Pre-caches model + wasm so the AI itself works offline |

## Key module map

| Region | Module | Responsibility |
| --- | --- | --- |
| Frontend | `services/diagnosis.js` | Orchestrates the 5-stage pipeline |
| Frontend | `services/onnxInference.js` | ORT session, preprocess, `input`/`output` tensors |
| Frontend | `services/imageQuality.js` | Laplacian blur, brightness, size gate |
| Frontend | `services/scoring.js` | Severity + environmental risk equations |
| Frontend | `services/syncEngine.js` | Offline queue, mark-synced, version checks |
| Frontend | `components/AppShell.jsx` | Farmer shell, scan orchestration, history |
| Frontend | `components/OfficerDashboard.jsx` | Officer analytics + review queue |
| Backend | `app/services/seed.py` | Deterministic demo dataset |
| Backend | `app/services/weather.py` | Open-Meteo with cached fallback |
| Backend | `app/services/risk.py` | Prototype regional risk model |
| AI | `AI/scripts/train_model.py` | Training (pretrained backbone) |
| AI | `AI/scripts/export_onnx.py` | ONNX export (`input`/`output` names) |

## Reproducibility

- Dataset split (`data/splits.json`) is generated once with `seed=42` and reused by
  training **and** evaluation, so numbers in the docs match the shipped model.
- The demo dataset (`Backend/scripts/generate_demo_data.py --reset`) reseeds 220
  diagnoses, 40 farms and weather observations with a fixed RNG seed.