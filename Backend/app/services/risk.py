"""Prototype spatiotemporal Risk Engine.

Transparent, rule-based formula so the dashboard can explain exactly how
a risk score is built. The interface is intentionally modular so a future
ST-GNN can replace the internals without touching callers.

  regional_risk(0..100) =
     0.45 * disease_case_density  +
     0.35 * environmental_risk     +
     0.20 * recent_case_growth

where each sub-term is normalised to 0..100. Environmental risk uses a
simple temperature/humidity disease-favourability matrix (fungal crops).

UI label: "Prototype Regional Risk Model".
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..models import Diagnosis


def _env_risk(temp_c: float | None, humidity: float | None) -> float:
    """0..100 favourability of weather for fungal disease spread."""
    if temp_c is None or humidity is None:
        return 50.0
    temp_ok = 1.0 if 18 <= temp_c <= 32 else 0.4
    hum = max(0.0, min(1.0, humidity / 100.0))
    return round(100 * (0.6 * hum + 0.4 * temp_ok), 1)


def _density(cases: int, region_population_scale: int = 500) -> float:
    return min(100.0, 100.0 * cases / region_population_scale)


def _growth(now: datetime, recent_days: int = 7, window_days: int = 21) -> float:
    if window_days <= 0:
        return 0.0
    return max(0.0, min(100.0, 100.0 * recent_days / window_days))


def label(score: float) -> str:
    if score >= 66:
        return "HIGH"
    if score >= 40:
        return "MODERATE"
    return "LOW"


def compute_region_risk(
    db: Session,
    lat: float,
    lon: float,
    temperature: float | None = None,
    humidity: float | None = None,
) -> dict:
    """Risk for a region at (lat, lon) over the last 21 days."""
    now = datetime.now(UTC).replace(tzinfo=None)
    since = now - timedelta(days=21)
    recent = since + timedelta(days=14)  # last 7 days subset

    recent_cases = db.scalar(
        select(func.count())
        .select_from(Diagnosis)
        .where(Diagnosis.created_at >= recent)
    ) or 0
    total_cases = db.scalar(
        select(func.count())
        .select_from(Diagnosis)
        .where(Diagnosis.created_at >= since)
    ) or 0

    density = _density(total_cases)
    env = _env_risk(temperature, humidity)
    growth = _growth(now - since, recent_cases)

    score = round(0.45 * density + 0.35 * env + 0.20 * growth, 1)

    return {
        "score": score,
        "label": label(score),
        "components": {
            "disease_case_density": round(density, 1),
            "environmental_risk": env,
            "recent_case_growth": round(growth, 1),
        },
        "method": "Prototype rule-based risk model (modular, ST-GNN-ready)",
        "window_days": 21,
    }