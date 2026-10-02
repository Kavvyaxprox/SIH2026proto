#!/usr/bin/env python3
"""Export the trained AgriScan classifier to ONNX for on-device inference.

The exported file is dropped straight into the frontend's public folder so
the Vite build ships it for the browser runtime (onnxruntime-web).

Input/output naming MUST match the frontend:
  - input  name: "input"    (onnxInference.js preprocessToTensor sends this)
  - output name: "output"   (read via session.outputNames[0])

Usage:
    python AI/scripts/export_onnx.py [--checkpoint AI/models/best_model.pth]

Outputs:
    Frontend/public/models/agriscan-v0.1-demo.onnx
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MODELS_DIR = ROOT / "AI" / "models"
PUBLIC_MODELS = ROOT / "Frontend" / "public" / "models"
MODEL_FILENAME = "agriscan-v0.1-demo.onnx"

try:
    import onnx
    import torch
    import torch.nn as nn
    from torchvision.models import mobilenet_v3_small
except ImportError as exc:  # pragma: no cover
    sys.exit(f"Missing export dependencies. Reason: {exc}")


def build_model(num_classes: int) -> nn.Module:
    model = mobilenet_v3_small(weights=None)
    in_features = model.classifier[-1].in_features
    model.classifier[-1] = nn.Linear(in_features, num_classes)
    return model


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--checkpoint", type=Path, default=MODELS_DIR / "best_model.pth")
    parser.add_argument("--opset", type=int, default=17)
    args = parser.parse_args()

    if not args.checkpoint.exists():
        sys.exit(f"Checkpoint not found: {args.checkpoint}")

    state = torch.load(args.checkpoint, map_location="cpu", weights_only=True)

    # Infer class count from the final linear layer's weight rows.
    last_key = next(k for k in reversed(state) if k.endswith("weight"))
    num_classes = state[last_key].shape[0]
    model = build_model(num_classes)
    model.load_state_dict(state)
    model.eval()

    dummy = torch.randn(1, 3, 224, 224)
    export_dir = str(PUBLIC_MODELS)
    PUBLIC_MODELS.mkdir(parents=True, exist_ok=True)
    out_path = PUBLIC_MODELS / MODEL_FILENAME

    with torch.no_grad():
        torch.onnx.export(
            model,
            dummy,
            str(out_path),
            input_names=["input"],
            output_names=["output"],
            opset_version=args.opset,
            do_constant_folding=True,
            dynamic_axes={"input": {0: "batch"}, "output": {0: "batch"}},
        )

    # The dynamo exporter may split initializers into a *.onnx.data sidecar,
    # which onnxruntime-web cannot resolve from a plain ArrayBuffer. Force a
    # single self-contained file that the browser can load in one fetch.
    sidecar = Path(str(out_path) + ".data")
    if onnx.load(str(out_path)).graph.initializer:
        model_proto = onnx.load(str(out_path))
        onnx.save_model(model_proto, str(out_path), save_as_external_data=False)
    if sidecar.exists():
        sidecar.unlink()
    onnx.checker.check_model(str(out_path))

    # Quick ORT round-trip sanity check to guarantee the on-device path works.
    try:
        import numpy as np
        import onnxruntime as ort

        session = ort.InferenceSession(str(out_path), providers=["CPUExecutionProvider"])
        output = session.run(["output"], {"input": np.zeros((1, 3, 224, 224), dtype=np.float32)})
        shape = output[0].shape
    except Exception as exc:  # noqa: BLE001
        sys.exit(f"Post-export ORT check failed: {exc}")

    size_kb = out_path.stat().st_size / 1024
    print(f"Exported {out_path.relative_to(ROOT)} ({size_kb:.0f} KB)")
    print(f"  input  name : input  shape [batch,3,224,224]")
    print(f"  output name : output shape {list(shape)} == {num_classes} classes")
    print("  ORT round-trip: OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())