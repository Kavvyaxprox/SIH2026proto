# AgriScan AI — Spatiotemporal Edge Diagnostics for Crop Pathology

An **offline-first + online-enhanced** Smart India Hackathon 2026 prototype that detects
crop diseases **on the device** (no cloud needed for diagnosis), stores scans locally,
and synchronises to a FastAPI backend so agriculture officers get a live regional
intelligence dashboard.

> **Prototype notice.** This is a working demo, not a production system. The AI model is
> trained on a small public dataset; the risk engine uses transparent rule-based scoring;
> chemical guidance must be verified against local product labels.

---

## Why this design?

| Constraint (typical Indian field conditions) | AgriScan answer |
| --- | --- |
| Poor / no connectivity in farms | Real ONNX model runs in the browser via `onnxruntime-web`, fully offline |
| Language barrier | Complete English / हिन्दी UI (switches live) |
| Extension officers need trends, not just cases | FastAPI backend aggregates cases into an Agri Intelligence dashboard + regional map |
| Data must survive a crash / no internet | IndexedDB offline queue with auto-sync on reconnect |
| No camera libraries needed | Canvas-based quality gate (blur / brightness / size) before inference |

## Repository layout

```
.
├── AI/                # Dataset prep, training, evaluation, ONNX export
│   ├── scripts/
│   │   ├── download_data.py            # PlantVillage subset → data/raw
│   │   ├── train_model.py              # MobileNetV3-Small training loop
│   │   ├── evaluate_model.py           # Held-out metrics + confusion matrix
│   │   ├── export_onnx.py              # → Frontend/public/models/*.onnx
│   │   └── prepare_demo_samples.py     # curated offline demo images + manifest
│   └── models/         # best_model.pth, class_map.json, evaluation.json
├── Backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI app
│   │   ├── api/                        # dashboard / diagnoses / risk / knowledge / expert
│   │   └── services/                   # weather (Open-Meteo), risk, knowledge, seed
│   ├── data/           # SQLite DB + knowledge_base.json
│   └── scripts/generate_demo_data.py   # deterministic demo dataset
├── Frontend/
│   ├── public/
│   │   ├── ort/                        # onnxruntime-web wasm glue
│   │   ├── models/                     # agriscan-v0.1-demo.onnx
│   │   └── demo-samples/               # labelled sample leaves + manifest
│   └── src/
│       ├── components/                 # farmer shell, result, officer dashboard…
│       ├── services/                   # diagnosis pipeline, onnx, db, sync, weather…
│       ├── i18n/                       # en + hi bundles
│       └── lib/                        # config, class map, knowledge base
├── data/
│   ├── raw/<class>/…JPG                # shared 10-class PlantVillage subset
│   ├── classes.json
│   └── splits.json                     # reproducible 70/15/15 split
└── docs/                               # architecture & judge documentation
```

## Quick start

**1. Backend**

```bash
cd Backend
python -m venv .venv && .venv\Scripts\activate    # or: python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python scripts/generate_demo_data.py --reset      # deterministic demo dataset
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Leave it running — http://127.0.0.1:8000/docs has the live API.

**2. Frontend**

```bash
cd Frontend
npm install
npm run dev        # → http://localhost:5173
```

Make sure the model file exists: `Frontend/public/models/agriscan-v0.1-demo.onnx`
(see [docs/ai.md](docs/ai.md) to regenerate it). The ORT wasm is already committed under
`Frontend/public/ort/`.

## How to demo it (5 minutes)

1. **Offline diagnosis** — turn on airplane mode, open the app, tap *Try a Demo Sample*,
   pick a leaf. The 5-step pipeline runs entirely on-device and saves a *pending* scan.
2. **Restore connectivity** — the app auto-syncs; or open *Sync Center* → *Sync Now*.
3. **Officer view** — tap the shield icon (header) for the Agri Intelligence dashboard:
   KPIs, severity distribution, 14-day timeline, regional outbreak map, expert-review queue.

Full walkthrough: [docs/demo.md](docs/demo.md).

## Documentation

| Doc | Covers |
| --- | --- |
| [architecture.md](docs/architecture.md) | System design, data flow, tech choices |
| [offline.md](docs/offline.md) | Offline architecture (pipeline, queue, PWA) |
| [online.md](docs/online.md) | Online architecture + sync + dashboard |
| [ai.md](docs/ai.md) | Dataset, model, training, metrics, ONNX, scoring equations |
| [dataset.md](docs/dataset.md) | The 10-class PlantVillage subset + split |
| [database.md](docs/database.md) | SQLite schema |
| [api.md](docs/api.md) | REST endpoint reference |
| [setup.md](docs/setup.md) | Step-by-step environment setup |
| [demo.md](docs/demo.md) | SIH demo runbook |
| [limitations.md](docs/limitations.md) | Honest known limitations |
| [roadmap.md](docs/roadmap.md) | Production roadmap (incl. ST-GNN) |

## License / data

Prototype code for SIH demonstration. PlantVillage dataset subset is public-domain
research data (Camera Traps `/PlantVillage`, "Dataset of diseased plant leaves").