# Dataset

## What we ship

A **10-class, 4-crop subset** of the public **PlantVillage** dataset (Camera Traps /
PlantVillage on Kaggle) used for training the prototype classifier.

The images live at `data/raw/<class_id>/…JPG` and are referenced by the documented
reproducible split.

| # | class_id | Crop | Disease | Healthy? | Images |
| --- | --- | --- | --- | --- | --- |
| 0 | apple_healthy | Apple | — | ✅ | 60 |
| 1 | apple_scab | Apple | Apple Scab | ❌ | 60 |
| 2 | maize_healthy | Maize | — | ✅ | 60 |
| 3 | maize_leaf_blight | Maize | Northern Leaf Blight | ❌ | 60 |
| 4 | potato_early_blight | Potato | Early Blight | ❌ | 60 |
| 5 | potato_healthy | Potato | — | ✅ | ~67 |
| 6 | potato_late_blight | Potato | Late Blight | ❌ | 60 |
| 7 | tomato_early_blight | Tomato | Early Blight | ❌ | ~69 |
| 8 | tomato_healthy | Tomato | — | ✅ | 60 |
| 9 | tomato_late_blight | Tomato | Late Blight | ❌ | 60 |

620 images total. Files use the original PlantVillage naming
(e.g. `…___RS_Erly.B 8389.JPG`).

## Why this subset?

- **Relevance to India**: potato, tomato, maize and apple are major Indian cash crops
  with modelled diseases.
- **Size vs. CPU constraints**: the training runs on a laptop CPU; 620 images with a
  pretrained backbone reaches usable accuracy in minutes.
- **Offline-friendly**: the smallest class sample is 60 → the demo bundle stays tiny.

## Split (reproducible)

`AI/scripts/train_model.py` writes `data/splits.json` once (seed 42):

- stratified **70% train / 15% val / 15% test** per class,
- the split is reused verbatim by `evaluate_model.py`, so reported metrics correspond
  to the shipped model.

## Download & preprocessing

```bash
python AI/scripts/download_data.py        # re-fetch subset into data/raw
python AI/scripts/prepare_demo_samples.py # curated 512px samples for the PWA
```

Corrupt images are pruned on first read (`is_valid_image` verifies each JPEG).

## Coverage caveats

- **No rice**: PlantVillage has no rice class. UI text is explicit that coverage is
  Tomato / Potato / Maize / Apple.
- Small per-class N ⇒ the model generalises well on similar images but should not be
  treated as production-trained (see `limitations.md`).
- Labels follow PlantVillage conventions; "Apple Scab" here is the class folder's
  FREC_Scab subset.