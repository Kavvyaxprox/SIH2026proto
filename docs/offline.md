# Offline Architecture

The core SIH story: **a farmer with no signal still gets a working AI diagnosis.**
Every step of the diagnosis pipeline runs on the device.

```
user taps Capture / Demo Sample
        │
        ▼
┌──────────────────────────────┐   assessImageQuality()          FAIL ──► show "quality
│ Canvas quality gate           │ ── blur (Laplacian variance)          too low"
│  · blur score ≥ 45            │    brightness 45–235, size ≥ 96px
└──────────────────────────────┘
        │ pass
        ▼
┌──────────────────────────────┐   onnxInference.js
│ ONNX MobileNetV3-Small 224px  │ ── centre-crop → normalise (ImageNet)
│ (onnxruntime-web, WASM)       │    → tensor "input" → softmax
└──────────────────────────────┘
        │ probs
        ▼
├─ top-1 class + confidence     │   conf < 0.60 ⇒ needs_review
├─ severity (scoring.js)        │   0–100 + Mild/Moderate/Severe
├─ weather context              │   IndexedDB cache → manual → default
└─ recommendations              │   bundled knowledge base (en label data)
        │
        ▼
┌──────────────────────────────┐
│ IndexedDB "diagnoses"         │  { id, …, sync_status:"pending" }
└──────────────────────────────┘
```

## What makes it work offline

1. **The model is a local asset.** `Frontend/public/models/agriscan-v0.1-demo.onnx`
   (~4.5 MB) is pre-cached by the service worker (`public/sw.js`, cache `agriscan-v2`)
   the first time the app loads — after that it runs with **zero network**.
2. **The runtime is local too.** `Frontend/public/ort/*` (onnxruntime-web wasm).
3. **History lives in IndexedDB**, not the cloud. The History tab renders entirely from
   the device.
4. **Weather degrades gracefully.** Live temperature/humidity/rainfall comes from the
   backend when online; offline, the last cached reading is shown and clearly labelled
   *"cached weather"* so nobody mistakes it for live data.
5. **Demo samples** (`Frontend/public/demo-samples/`) are 10 curated, fully labelled
   leaf photos (≈25 KB each) that run through the *real* model — the UI badges them
   "Demo Sample" so nothing is disguised as a live capture.

## Offline queue + sync

- Every diagnosis is saved locally first, with `sync_status: "pending"`.
- The IndexedDB store exposes an index on `sync_status`; `syncEngine.js` queries it for
  the pending queue.
- When the browser fires the `online` event (or the user taps **Sync Now**), pending
  rows are uploaded in one `POST /api/sync` batch and marked `synced`.
- Failed uploads simply stay `pending` — the queue is never lost.

## PWA details

| Item | Value |
| --- | --- |
| Service worker | `public/sw.js` — cache-first assets, network-first navigations |
| Pre-cache list | app shell, ONNX model, ORT wasm glue, demo samples |
| Installable | `manifest.webmanifest` (icons under `public/icons/`) |
| Offline guarantee | Full diagnosis pipeline + history + recommendations |

## Honest boundary

The **regional map and officer dashboard need the backend** (they show aggregated
cloud data). That is by design: farmers work offline, dashboards show what synced. The
farmer-facing diagnosis, history and sync queue work with no signal.