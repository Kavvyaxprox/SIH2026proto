"""Knowledge base service: loads and looks up the structured agronomy KB."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from ..config import BASE_DIR

KB_PATH = BASE_DIR / "data" / "knowledge_base.json"


def load_knowledge() -> dict[str, Any]:
    return json.loads(KB_PATH.read_text(encoding="utf-8"))


def get_entry(class_id: str) -> Any | None:
    return load_knowledge()["entries"].get(class_id)


def get_version() -> str:
    return load_knowledge().get("version", "v1.0")