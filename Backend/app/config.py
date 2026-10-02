"""AgriScan AI prototype backend.

Application configuration. Reads environment variables with sane
prototype defaults so the app runs with zero external setup:

  DATABASE_URL  SQLAlchemy connection string. SQLite by default so the
                prototype works out-of-the-box; switch to PostgreSQL in
                production, e.g.
                postgresql+psycopg2://user:pass@host/agriscan
"""

from __future__ import annotations

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]


class Settings:
    APP_NAME = "AgriScan AI"
    APP_VERSION = "0.1.0"

    DATABASE_URL = os.getenv(
        "DATABASE_URL", f"sqlite:///{BASE_DIR / 'data' / 'agriscan.db'}"
    )

    # Demo user for the prototype (no real auth on purpose).
    DEMO_FARMER_ID = "demo-farmer-001"
    DEMO_OFFICER_ID = "demo-officer-001"

    # Locations used for demo seeding (Indore-ish region).
    DEMO_REGION = {"name": "Indore Rural", "lat": 22.7, "lon": 75.9}

    # Whether to seed demo data on startup when the DB is empty.
    SEED_ON_STARTUP = os.getenv("AGRI_SCAN_SEED", "1") == "1"

    # Open-Meteo geocoding / weather endpoints (no API key required).
    WEATHER_URL = "https://api.open-meteo.com/v1/forecast"
    GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"


settings = Settings()

DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)