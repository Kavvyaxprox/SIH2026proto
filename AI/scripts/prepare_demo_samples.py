#!/usr/bin/env python3
"""Prepare offline demo-sample images for the AgriScan frontend.

Picks one representative leaf photo per class from the shared dataset and
writes a small, resized JPEG + a manifest the frontend ScanCard reads.
The images are clearly polite to keep the shipped bundle small.

Usage:
    python AI/scripts/prepare_demo_samples.py

Outputs:
    Frontend/public/demo-samples/<class_id>.jpg
    Frontend/public/demo-samples/manifest.json
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "data" / "raw"
OUT = ROOT / "Frontend" / "public" / "demo-samples"

# Pick the same class ids the model was trained on (index order preserved
# only by CLASS_META key names, not the manifest array order).
CLASS_META = {
    "apple_healthy": {"crop": "Apple", "disease": "Healthy"},
    "apple_scab": {"crop": "Apple", "disease": "Apple Scab"},
    "maize_healthy": {"crop": "Maize", "disease": "Healthy"},
    "maize_leaf_blight": {"crop": "Maize", "disease": "Northern Leaf Blight"},
    "potato_early_blight": {"crop": "Potato", "disease": "Early Blight"},
    "potato_healthy": {"crop": "Potato", "disease": "Healthy"},
    "potato_late_blight": {"crop": "Potato", "disease": "Late Blight"},
    "tomato_early_blight": {"crop": "Tomato", "disease": "Early Blight"},
    "tomato_healthy": {"crop": "Tomato", "disease": "Healthy"},
    "tomato_late_blight": {"crop": "Tomato", "disease": "Late Blight"},
}

MAX_SIDE = 512  # px — tiny on-device demo images


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    samples = []
    for class_id, meta in CLASS_META.items():
        folder = RAW / class_id
        images = sorted(folder.glob("*.jpg")) if folder.is_dir() else []
        if not images:
            print(f"!! no images for {class_id}", file=sys.stderr)
            continue
        src = images[0]

        # Crop to a centred square for display consistency; the pipeline
        # itself centre-crops anyway.
        with Image.open(src) as img:
            if img.mode != "RGB":
                img = img.convert("RGB")
            w, h = img.size
            side = min(w, h)
            img = img.crop(((w - side) // 2, (h - side) // 2, (w + side) // 2, (h + side) // 2))
            scale = min(1.0, MAX_SIDE / side)
            if scale < 1.0:
                img = img.resize((round(side * scale), round(side * scale)), Image.LANCZOS)
            dest = OUT / f"{class_id}.jpg"
            img.save(dest, "JPEG", quality=82, optimize=True)

        samples.append({"file": f"{class_id}.jpg", "classId": class_id, **meta})
        print(f"ok {class_id} <- {src.name}")

    manifest = {"version": 1, "note": "Verified PlantVillage labels; Demo Sample badge shown in UI.", "samples": samples}
    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"manifest written ({len(samples)} samples) -> {OUT / 'manifest.json'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())