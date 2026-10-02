# SIH 2026 Demo Runbook (≈5 minutes)

## Before you start

- Backend running on :8000 with seeded data (220 diagnoses).
- Frontend built & served (ideally `npm run preview` or the deployed URL so the SW
  pre-caches the ONNX model + wasm).
- Have a way to disable network (airplane mode / devtools "Offline").

## Script

### 1 · "Farmers have no signal, but still get answers" (OFFLINE)

1. Open the app → **Home**.
2. Tap **Try a Demo Sample**, pick e.g. *Tomato — Late Blight*.
3. Point out the real 5-step pipeline in the overlay:
   *image quality → disease detection (on-device AI) → severity → environmental
   context → recommendation* — and that no network is used.
4. Toggle **Offline** (airplane mode / Network tab). Scan another sample — it still
   works. The result shows a "Demo Sample" badge, real confidence %, severity meter and
   treatment guidance ("guidance only" caveat shown).
5. Open **History** → the scan is saved locally, marked *pending*. Open **Sync Center**
   → shows the offline queue.

### 2 · "When connectivity returns, data flows up" (SYNC)

6. Restore connectivity. Return to the app — auto-sync fires (or open **Sync Center**
   → **Sync Now**). Queue drains; rows flip to *synced*; live weather now appears.

### 3 · "Officers see the regional picture" (DASHBOARD)

7. Tap the shield icon in the header (bigger screen: officer dashboard).
8. Walk through:
   - KPI cards (Total Cases / High Severity / Expert Review / Synced)
   - Top condition, severity distribution, 14-day timeline
   - **Regional outbreak map** (Leaflet; note tile layer needs connectivity)
   - Regional Risk score card — explicitly labelled *Prototype Regional Risk Model*
     (tap to see formula components if desired)
   - **Expert Review queue** — low-confidence cases; open one, press *Confirmed* —
     it leaves the queue and is recorded via `/api/expert-review`.

### 4 · "Technology that scales to Indian field conditions"

9. Go back to farmer view → **About** → **Launch SIH Demo Mode** for the guided recap,
   or `npm run build && npm run preview` to show the PWA install + offline story.

## Talking points

- Real ONNX inference in the browser — the model file + wasm are bundled/pre-cached.
- No fake AI: low confidence → expert review, cached vs live weather clearly labelled.
- Offline-first with online enhancement; deterministic demo data for judges.
- Full English/हिन्दी switch mid-demo.