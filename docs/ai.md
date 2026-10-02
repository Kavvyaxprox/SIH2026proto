# AI — training, export & scoring equations

Everything the app scores is derived from **real inference output** and **transparent
formulas** — nothing is fabricated.

## 1. Dataset

- **Source**: subset of the public PlantVillage dataset (10 classes, 4 crops).
- **Location**: `data/raw/<class_id>/…JPG`, `data/classes.json`.
- **Classes** (index order = ONNX output order, alphabetical):

```text
0 apple_healthy        5 potato_healthy
1 apple_scab           6 potato_late_blight
2 maize_healthy        7 tomato_early_blight
3 maize_leaf_blight    8 tomato_healthy
4 potato_early_blight  9 tomato_late_blight
```

| Crop | Classes | Images |
| --- | --- | --- |
| Apple | healthy, scab | 120 |
| Maize | healthy, northern leaf blight | 120 |
| Potato | healthy, early blight, late blight | ~187 |
| Tomato | healthy, early blight, late blight | ~189 |

> Rice is excluded: PlantVillage has no rice images. The UI/About text is honest about
> coverage (see `limitations.md`). Splits are fixed in `data/splits.json` (seed 42,
> stratified 70/15/15) and reused by training AND evaluation for reproducible docs.

## 2. Model

- **Architecture**: `torchvision.models.mobilenet_v3_small` with an ImageNet-pretrained
  backbone; final Linear head replaced with `(in_features → 10)`.
- **Input**: RGB 224×224, ImageNet normalisation `mean=(0.485,0.456,0.406)`
  `std=(0.229,0.224,0.225)`.

  ```
  x = (pixel/255 − mean) / std        per channel
  ```
- **Training**: CrossEntropyLoss, AdamW (lr 6e-4, wd 1e-4), CosineAnnealingLR over 25
  epochs, batch 48. Augmentations: random resized crop (scale .75–1), horizontal flip,
  ±15° rotation, colour jitter. Best checkpoint by **validation** accuracy.
- **Eval transform** (also used by the on-device runtime): resize shorter side ×1.15 →
  centre crop 224.

## 3. Training result

| Metric | Value |
| --- | --- |
| Validation accuracy (best) | 95.7% |
| Test accuracy | 93.5% (92 held-out images) |
| Macro precision / recall / F1 | 0.941 / 0.934 / 0.935 |
| Epochs | 25 |

Per-class F1 (all ≥ 0.86): maize_healthy & maize_leaf_blight, potato_early_blight 1.00 ·
apple_healthy 0.95 · potato_healthy, apple_scab 0.94–0.95 · potato_late_blight,
tomato_healthy 0.89 · tomato_late_blight 0.88 · tomato_early_blight 0.86.
Saved in `AI/models/best_model.pth`, `class_map.json`, `evaluation.json`.

Evaluate with:

```bash
python AI/scripts/evaluate_model.py
python AI/scripts/export_onnx.py     # → Frontend/public/models/agriscan-v0.1-demo.onnx
```

## 4. ONNX export contract (frontend must match)

- Input tensor name **`input`**, shape `[batch, 3, 224, 224]`.
- Output tensor name **`output`** (read via `session.outputNames[0]`), shape
  `[batch, 10]` softmax-scaled probabilities.
- opset 18, CPU `CPUExecutionProvider` (WASM on-device; onnxruntime-web 1.30 fully
  supports opset 18). See `Frontend/src/services/onnxInference.js`.

## 5. Scoring equations

### 5.1 Confidence tier (human-in-the-loop)

```text
confidence ≥ 0.80 → "high"
0.60 ≤ conf < 0.80 → "medium"      (still shown, slightly hedged)
conf < 0.60         → "low"         → flagged: needs_review → expert queue
```

### 5.2 Severity index (0–100)

```text
healthy leaf            → severity = 0, label "Mild"

else:
  env  = environmentalRisk(temp, humidity)
  base = 20 + 60 · min(1, max(0, confidence))
  severity = clamp(base · 0.7 + env · 0.3, 0, 100)

  label:  0–30 Mild · 31–60 Moderate · 61–100 Severe
```

### 5.3 Environmental (fungal) risk

```text
tempOk  = 1 if 18°C ≤ temp ≤ 32°C else 0.4
hum     = clamp(humidity/100, 0, 1)
envRisk = round(100 · (0.6 · hum + 0.4 · tempOk))      # 0..100
```

### 5.4 Regional risk (backend, `/api/disease-risk`)

```text
regional_risk = round( 0.45 · case_density
                     + 0.35 · env_risk
                     + 0.20 · case_growth , 1)

case_density = min(100, 100 · cases_in_21d / 500)
case_growth  = min(100, 100 · cases_in_last_7d / 21)
label:  ≥66 HIGH · ≥40 MODERATE · else LOW
```

The interface is modular so a future ST-GNN swaps into `services/risk.py` without
touching callers (see `roadmap.md`).

## 6. Why not a fake/loading-only AI?

The original demo showed loading animations without real inference. This prototype
replaces them with a real 5-stage pipeline (quality → inference → severity →
environment → recommendation) whose numbers come from an actual forward pass.
Low-confidence cases explicitly route to an expert queue instead of bluffing.