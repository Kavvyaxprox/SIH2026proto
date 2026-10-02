#!/usr/bin/env python3
"""Evaluate the trained AgriScan classifier on the held-out test split.

Reports per-class + macro metrics and writes a confusion matrix JSON for the
prototype docs, using the exact same transform the on-device runtime applies.

Usage:
    python AI/scripts/evaluate_model.py [--checkpoint AI/models/best_model.pth]

Outputs:
    AI/models/evaluation.json
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "data"
RAW_DIR = DATA_DIR / "raw"
MODELS_DIR = ROOT / "AI" / "models"

try:
    import torch
    import torch.nn as nn
    from torch.utils.data import DataLoader, Dataset
    import torchvision.transforms as T
    from PIL import Image
except ImportError as exc:  # pragma: no cover
    sys.exit(f"Missing evaluation dependencies. Reason: {exc}")

IMG_SIZE = 224
MEAN = (0.485, 0.456, 0.406)
STD = (0.229, 0.224, 0.225)


class LeafRows(Dataset):
    def __init__(self, rows, class_to_idx, transform):
        self.rows = rows
        self.class_to_idx = class_to_idx
        self.transform = transform

    def __len__(self):
        return len(self.rows)

    def __getitem__(self, idx):
        class_id, name = self.rows[idx]
        image = Image.open(RAW_DIR / class_id / name).convert("RGB")
        return self.transform(image), self.class_to_idx[class_id]


def build_model(num_classes: int) -> nn.Module:
    from torchvision.models import mobilenet_v3_small

    model = mobilenet_v3_small(weights=None)
    in_features = model.classifier[-1].in_features
    model.classifier[-1] = nn.Linear(in_features, num_classes)
    return model


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--checkpoint", type=Path, default=MODELS_DIR / "best_model.pth")
    args = parser.parse_args()

    state = torch.load(args.checkpoint, map_location="cpu", weights_only=True)
    info = json.loads((MODELS_DIR / "class_map.json").read_text(encoding="utf-8"))
    classes = info["classes"]

    model = build_model(len(classes))
    model.load_state_dict(state)
    model.eval()

    splits = json.loads((DATA_DIR / "splits.json").read_text(encoding="utf-8"))
    test_rows = splits["test"]["rows"]

    transform = T.Compose(
        [
            T.Resize(int(IMG_SIZE * 1.15)),
            T.CenterCrop(IMG_SIZE),
            T.ToTensor(),
            T.Normalize(MEAN, STD),
        ]
    )
    loader = DataLoader(
        LeafRows(test_rows, info["class_to_idx"], transform),
        batch_size=16,
        num_workers=0,
    )

    all_preds, all_labels = [], []
    with torch.inference_mode():
        for images, labels in loader:
            logits = model(images)
            all_preds.extend(logits.argmax(1).tolist())
            all_labels.extend(labels.tolist())

    n = len(all_labels)
    correct = sum(1 for p, l in zip(all_preds, all_labels) if p == l)
    accuracy = correct / n

    # Per-class precision / recall / F1 + confusion matrix.
    confusion = [[0] * len(classes) for _ in classes]
    for pred, label in zip(all_preds, all_labels):
        confusion[label][pred] += 1

    per_class = []
    for i, cid in enumerate(classes):
        tp = confusion[i][i]
        fp = sum(row[i] for row in confusion) - tp
        fn = sum(confusion[i]) - tp
        precision = tp / (tp + fp) if tp + fp else 0.0
        recall = tp / (tp + fn) if tp + fn else 0.0
        f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
        per_class.append(
            {
                "class_id": cid,
                "samples": sum(confusion[i]),
                "precision": round(precision, 4),
                "recall": round(recall, 4),
                "f1": round(f1, 4),
            }
        )

    macro_precision = sum(p["precision"] for p in per_class) / len(per_class)
    macro_recall = sum(p["recall"] for p in per_class) / len(per_class)
    macro_f1 = sum(p["f1"] for p in per_class) / len(per_class)

    report = {
        "classes": classes,
        "samples": n,
        "test_accuracy": round(accuracy, 4),
        "macro_precision": round(macro_precision, 4),
        "macro_recall": round(macro_recall, 4),
        "macro_f1": round(macro_f1, 4),
        "per_class": per_class,
        "confusion_matrix": confusion,
    }
    (MODELS_DIR / "evaluation.json").write_text(json.dumps(report, indent=2), encoding="utf-8")

    print(f"Test accuracy: {accuracy * 100:.1f}%  ({n} samples)")
    print(f"Macro precision {macro_precision:.3f} · recall {macro_recall:.3f} · F1 {macro_f1:.3f}")
    for p in per_class:
        print(f"  {p['class_id']:<22} P {p['precision']:.2f} R {p['recall']:.2f} F1 {p['f1']:.2f} (n={p['samples']})")
    print(f"Saved AI/models/evaluation.json")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())