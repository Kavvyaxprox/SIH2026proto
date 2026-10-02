"""Train the AgriScan prototype leaf-classification model.

Pipeline:
  dataset (data/raw/<class>/...JPG)
    -> stratified 70/15/15 split
    -> augment / normalize
    -> MobileNetV3-Small classifier
    -> CrossEntropy training loop (CPU-friendly)
    -> best checkpoint by validation accuracy

Usage:
  python AI/scripts/train_model.py --epochs 15 --batch-size 24 --seed 42

Outputs:
  AI/models/best_model.pth
  AI/models/class_map.json
  data/splits.json           (shared split for consistent evaluation)
"""

from __future__ import annotations

import argparse
import copy
import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "data"
RAW_DIR = DATA_DIR / "raw"

try:
    import torch
    import torch.nn as nn
    from torch.utils.data import DataLoader, Dataset
    import torchvision.transforms as T
    from torchvision.models import mobilenet_v3_small
    from PIL import Image
except ImportError as exc:  # pragma: no cover
    sys.exit(
        "Missing training dependencies (torch, torchvision, Pillow). "
        f"Install them first. Reason: {exc}"
    )

IMG_SIZE = 224
MEAN = (0.485, 0.456, 0.406)
STD = (0.229, 0.224, 0.225)


def discover_classes() -> list[str]:
    """Deterministically ordered class ids from data/raw subfolders."""
    classes = sorted(p.name for p in RAW_DIR.iterdir() if p.is_dir())
    if not classes:
        raise SystemExit(f"No class folders found under {RAW_DIR}")
    return classes


def is_valid_image(path: Path) -> bool:
    """Drop partially-downloaded/corrupt images so training never crashes."""
    try:
        with Image.open(path) as img:
            img.verify()
        return True
    except Exception:  # noqa: BLE001
        print(f"[prune] removing unreadable image {path.name}")
        path.unlink(missing_ok=True)
        return False


def build_splits(classes: list[str], seed: int) -> dict:
    """Stratified train/val/test split with a fixed seed (reusable)."""
    images: dict[str, list[str]] = {}
    for cid in classes:
        class_dir = RAW_DIR / cid
        images[cid] = [
            p.name
            for p in class_dir.glob("*.JPG")
            if is_valid_image(p)
        ]

    rng = random.Random(seed)
    splits: dict[str, list[tuple[str, str]]] = {
        "train": [],
        "val": [],
        "test": [],
    }
    for cid, names in images.items():
        rng.shuffle(names)
        n = len(names)
        n_test = max(1, round(n * 0.15))
        n_val = max(1, round(n * 0.15))
        n_train = n - n_test - n_val
        for name in names[:n_train]:
            splits["train"].append((cid, name))
        for name in names[n_train : n_train + n_val]:
            splits["val"].append((cid, name))
        for name in names[n_train + n_val :]:
            splits["test"].append((cid, name))
    rng.shuffle(splits["train"])
    return splits


class LeafDataset(Dataset):
    def __init__(
        self,
        rows: list[tuple[str, str]],
        class_to_idx: dict[str, int],
        transform: T.Compose,
    ) -> None:
        self.rows = rows
        self.class_to_idx = class_to_idx
        self.transform = transform

    def __len__(self) -> int:
        return len(self.rows)

    def __getitem__(self, idx: int):
        class_id, name = self.rows[idx]
        path = RAW_DIR / class_id / name
        image = Image.open(path).convert("RGB")
        label = self.class_to_idx[class_id]
        return self.transform(image), label


def build_model(num_classes: int) -> nn.Module:
    # ImageNet-pretrained backbone converges to useful accuracy with the
    # small prototype dataset; a from-scratch CNN would need 10-100x data.
    model = mobilenet_v3_small(weights="IMAGENET1K_V1")
    in_features = model.classifier[-1].in_features
    model.classifier[-1] = nn.Linear(in_features, num_classes)
    return model


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--epochs", type=int, default=25)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=6e-4)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--num-workers", type=int, default=2)
    args = parser.parse_args()

    torch.manual_seed(args.seed)
    classes = discover_classes()
    class_to_idx = {cid: i for i, cid in enumerate(classes)}
    splits = build_splits(classes, args.seed)
    (DATA_DIR / "splits.json").write_text(
        json.dumps(
            {
                k: {"classes": classes, "rows": v}
                for k, v in splits.items()
            },
            indent=2,
        ),
        encoding="utf-8",
    )

    train_t = T.Compose(
        [
            T.RandomResizedCrop(IMG_SIZE, scale=(0.75, 1.0)),
            T.RandomHorizontalFlip(),
            T.RandomRotation(15),
            T.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.05),
            T.ToTensor(),
            T.Normalize(MEAN, STD),
        ]
    )
    eval_t = T.Compose(
        [
            T.Resize(int(IMG_SIZE * 1.15)),
            T.CenterCrop(IMG_SIZE),
            T.ToTensor(),
            T.Normalize(MEAN, STD),
        ]
    )

    train_ds = LeafDataset(splits["train"], class_to_idx, train_t)
    val_ds = LeafDataset(splits["val"], class_to_idx, eval_t)
    test_ds = LeafDataset(splits["test"], class_to_idx, eval_t)

    train_loader = DataLoader(
        train_ds, batch_size=args.batch_size, shuffle=True, num_workers=args.num_workers
    )
    val_loader = DataLoader(val_ds, batch_size=args.batch_size, num_workers=args.num_workers)
    test_loader = DataLoader(test_ds, batch_size=args.batch_size, num_workers=args.num_workers)

    print(f"Classes ({len(classes)}): {classes}")
    print(
        f"Split sizes -> train {len(train_ds)} / val {len(val_ds)} / "
        f"test {len(test_ds)}"
    )

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = build_model(len(classes)).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
        optimizer, T_max=args.epochs
    )

    best_acc = 0.0
    best_state = None
    for epoch in range(1, args.epochs + 1):
        model.train()
        running_loss, correct, seen = 0.0, 0, 0
        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            logits = model(images)
            loss = criterion(logits, labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item() * images.size(0)
            correct += (logits.argmax(1) == labels).sum().item()
            seen += images.size(0)
        scheduler.step()

        val_acc = evaluate(model, val_loader, device)
        train_acc = correct / seen
        print(
            f"epoch {epoch:02d} | loss {running_loss / seen:.4f} | "
            f"train_acc {train_acc * 100:.1f}% | val_acc {val_acc * 100:.1f}%"
        )
        if val_acc > best_acc:
            best_acc = val_acc
            best_state = copy.deepcopy(model.state_dict())

    model.load_state_dict(best_state)
    models_dir = ROOT / "AI" / "models"
    models_dir.mkdir(parents=True, exist_ok=True)
    torch.save(model.state_dict(), models_dir / "best_model.pth")
    (models_dir / "class_map.json").write_text(
        json.dumps({"classes": classes, "class_to_idx": class_to_idx}, indent=2),
        encoding="utf-8",
    )

    test_acc = evaluate(model, test_loader, device)
    print(
        f"\nBest val accuracy: {best_acc * 100:.1f}% | "
        f"Test accuracy: {test_acc * 100:.1f}%"
    )
    print(f"Saved AI/models/best_model.pth and class_map.json")
    return 0


@torch.inference_mode()
def evaluate(model: nn.Module, loader: DataLoader, device: torch.device) -> float:
    model.eval()
    correct, seen = 0, 0
    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)
        correct += (model(images).argmax(1) == labels).sum().item()
        seen += images.size(0)
    return correct / seen


if __name__ == "__main__":
    raise SystemExit(main())