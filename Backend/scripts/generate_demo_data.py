#!/usr/bin/env python3
"""Generate the AgriScan demo dataset deterministically.

Convenience wrapper around the seeding service so SIH judges (or a fresh
deploy) can recreate realistic demo data on demand — no manual staging.

Usage:
    python Backend/scripts/generate_demo_data.py [--force] [--reset]

Flags:
    --force  Re-seed even if diagnoses already exist (keeps data idempotent
             unless this flag is passed).
    --reset  Drop all demo tables first, then recreate + seed from scratch.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

# Allow running directly: `python Backend/scripts/generate_demo_data.py`
BACKEND = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND))

from app.database import SessionLocal, init_db  # noqa: E402
from app.services.seed import clear_demo_data, seed_demo_data  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description="Seed the AgriScan demo dataset")
    parser.add_argument("--force", action="store_true", help="re-seed even if diagnoses exist")
    parser.add_argument("--reset", action="store_true", help="wipe demo tables, then seed")
    args = parser.parse_args()

    init_db()
    db = SessionLocal()
    try:
        if args.reset:
            clear_demo_data(db)
        seed_demo_data(db, force=args.force)
    finally:
        db.close()
    print("Demo data ready. Start the API with: uvicorn app.main:app --host 127.0.0.1 --port 8000")
    return 0


if __name__ == "__main__":
    sys.exit(main())