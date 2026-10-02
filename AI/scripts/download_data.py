"""Download a small, prototype-sized subset of the public PlantVillage
dataset (raw colour images) for training and evaluation.

Why not the full dataset?
  * The SIH prototype only needs a working proof-of-concept classifier.
  * Keeping the download small makes training reproduce quickly on a
    CPU-only laptop (torch CPU wheel).

Described classes (id -> PlantVillage folder):
  Apple        : apple_scab, apple_healthy
  Maize (Corn) : maize_leaf_blight, maize_healthy
  Potato       : potato_early_blight, potato_late_blight, potato_healthy
  Tomato       : tomato_early_blight, tomato_late_blight, tomato_healthy

Usage:
  python AI/scripts/download_data.py --images-per-class 80 --seed 7
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import random
import sys
import urllib.parse
import urllib.request
from pathlib import Path

REPO = "spMohanty/PlantVillage-Dataset"
BRANCH = "master"
COLOR_DIR = "raw/color"
GITHUB_API = "https://api.github.com"
RAW_BASE = f"https://raw.githubusercontent.com/{REPO}/{BRANCH}/{COLOR_DIR}"

CLASSES = {
    "apple_scab": "Apple___Apple_scab",
    "apple_healthy": "Apple___healthy",
    "maize_leaf_blight": "Corn_(maize)___Northern_Leaf_Blight",
    "maize_healthy": "Corn_(maize)___healthy",
    "potato_early_blight": "Potato___Early_blight",
    "potato_late_blight": "Potato___Late_blight",
    "potato_healthy": "Potato___healthy",
    "tomato_early_blight": "Tomato___Early_blight",
    "tomato_late_blight": "Tomato___Late_blight",
    "tomato_healthy": "Tomato___healthy",
}

ROOT = Path(__file__).resolve().parents[2]
RAW_DIR = ROOT / "data" / "raw"


def api_headers(url: str):
    req = urllib.request.Request(url, headers={"User-Agent": "agriscan-sih"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        body = json.loads(resp.read().decode("utf-8"))
        return body, resp.headers.get("Link", "")


def list_folder(folder_url: str) -> list:
    """GitHub contents API: page through results honouring rate limits."""
    items: list = []
    url = folder_url
    while url:
        batch, link_header = api_headers(url)
        items.extend(batch)
        url = None
        for part in link_header.split(","):
            if 'rel="next"' in part:
                url = part[part.find("<") + 1 : part.find(">")]
                break
    return items


def download_file(url: str, dest: Path) -> None:
    req = urllib.request.Request(url, headers={"User-Agent": "agriscan-sih"})
    with urllib.request.urlopen(req, timeout=60) as resp, dest.open("wb") as fh:
        fh.write(resp.read())


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--images-per-class", type=int, default=80)
    parser.add_argument("--seed", type=int, default=7)
    args = parser.parse_args()

    RAW_DIR.mkdir(parents=True, exist_ok=True)
    rng = random.Random(args.seed)

    for class_id, folder in CLASSES.items():
        class_dir = RAW_DIR / class_id
        class_dir.mkdir(parents=True, exist_ok=True)

        # Re-suming: skip classes already downloaded.
        existing = [p for p in class_dir.glob("*.JPG")]
        if len(existing) >= args.images_per_class:
            print(f"[skip] {class_id} already has {len(existing)} images")
            continue

        listed = list_folder(
            f"{GITHUB_API}/repos/{REPO}/contents/{COLOR_DIR}/{urllib.parse.quote(folder)}"
        )
        candidates = [it for it in listed if it.get("name", "").upper().endswith(".JPG")]
        if len(candidates) < args.images_per_class:
            print(f"[warn] {class_id}: only {len(candidates)} JPGs available", file=sys.stderr)
        chosen = rng.sample(candidates, min(args.images_per_class, len(candidates)))

        total = 0
        for item in chosen:
            dest = class_dir / item["name"]
            if not dest.exists():
                try:
                    download_file(item["download_url"], dest)
                except Exception as exc:  # noqa: BLE001
                    print(f"[warn] {item['name']}: {exc}", file=sys.stderr)
                    continue
            total += 1
        print(f"[ok] {class_id}: {total}/{len(chosen)} images")

    # Store class metadata consumed by the training pipeline.
    meta = {"classes": {cid: {"folder": folder} for cid, folder in CLASSES.items()}}
    (ROOT / "data" / "classes.json").write_text(
        json.dumps(meta, indent=2), encoding="utf-8"
    )
    print("Class map written to data/classes.json")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())