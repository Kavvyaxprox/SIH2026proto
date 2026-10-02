# Setup Guide

Tested on Windows 11 (PowerShell), Python 3.14, Node 24. Linux/macOS commands are noted
where they differ. Everything runs locally or on a VPS — no external infrastructure
beyond Open-Meteo/OSM tiles (which are only used when online).

## 1. Prerequisites

- Python 3.10+ (developed on 3.14)
- Node 20+ (developed on 24)
- git

## 2. Clone & install Python

```bash
git clone <repo> SIH2026
cd SIH2026
python -m venv Backend/.venv
# Windows:
Backend\.venv\Scripts\activate
# Linux/mac:
# source Backend/.venv/bin/activate

pip install -r Backend/requirements.txt
```

`Backend/requirements.txt` pins 16 packages. The first 7 are all the API server needs:

`fastapi`, `uvicorn[standard]`, `sqlalchemy`, `pydantic`, `pydantic-settings`,
`python-multipart`, `httpx`.

The remaining 9 (`torch`, `torchvision`, `onnx`, `onnxruntime`, `numpy`, `Pillow`,
`opencv-python-headless`, `scikit-learn`) are only needed to retrain or re-export the
model under `AI/scripts/`. They are commented in the file as AI-pipeline-only, but a
plain `pip install -r` installs them too — roughly 2 GB. To skip them, install the API
dependencies explicitly:

```bash
pip install "fastapi>=0.140" "uvicorn[standard]>=0.30" "sqlalchemy>=2.0" \
            "pydantic>=2.7" "pydantic-settings>=2.3" "httpx>=0.27" \
            "python-multipart>=0.0.9"
```

### AI-only extras (training / export / eval)

```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install onnx onnxruntime scikit-learn numpy Pillow opencv-python-headless
```

## 3. Dataset

```bash
python AI/scripts/download_data.py      # → data/raw/<class>/…JPG (10 classes)
python AI/scripts/prepare_demo_samples.py
```

If you cloned the repo the images are likely already present; the script is idempotent.

## 4. Train + export the model

```bash
python AI/scripts/train_model.py --epochs 25 --batch-size 48
python AI/scripts/evaluate_model.py
python AI/scripts/export_onnx.py
# → Frontend/public/models/agriscan-v0.1-demo.onnx  (committed or local)
```

## 5. Seed + run the backend

```bash
python Backend/scripts/generate_demo_data.py --reset
cd Backend
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Verify:

```bash
curl http://127.0.0.1:8000/api/health          # {"status":"ok",…}
curl http://127.0.0.1:8000/api/dashboard/stats  # 220 diagnoses etc.
```

## 6. Run the frontend

```bash
cd Frontend
npm install
npm run dev          # → http://localhost:5173
```

Dev build works with the model file present. For the PWA to precache the model, use a
**production build**:

```bash
npm run build
npm run preview      # → http://localhost:4173
```

## 7. Env knobs

| Variable | Default | Effect |
| --- | --- | --- |
| `VITE_API_BASE` | `http://localhost:8000` | Backend URL for the frontend |
| `AGRI_SCAN_SEED` | (set) | Backend seeds demo data on boot if unset |
| (none) | — | Frontend reads `VITE_API_BASE` at build time |

## 8. Trouble-shooting

| Symptom | Fix |
| --- | --- |
| Scan stays "Model unavailable" | Confirm `Frontend/public/models/agriscan-v0.1-demo.onnx` exists & CORS origin matches |
| ORT throws on CPU | Use the bundled `simd-threaded` wasm; enable threads in Chrome. Fallback: non-threaded build |
| Demo samples missing | Run `prepare_demo_samples.py` |
| Port 8000 busy | `uvicorn … --port 8001` and set `VITE_API_BASE` |
| CORS errors in dev | Rebuild frontend after changing `VITE_API_BASE` (it is baked at build time in `src/lib/config.js`).