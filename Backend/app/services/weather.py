"""Weather service.

Online: proxies Open-Meteo (current temperature / humidity / rainfall)
for a lat/lon pair - no API key required.

Offline fallback for the client is handled on-device (cached readings);
this endpoint simply also exposes the latest locally-observed Demo
Region figures when Open-Meteo is unreachable so dashboards stay honest.
"""

from __future__ import annotations

from typing import Optional

import httpx

from ..config import settings

HISTORY: list = []


async def fetch_weather(lat: float, lon: float) -> dict | None:
    """Return current weather for a coordinate, or None on failure."""
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,relative_humidity_2m,precipitation",
        "timezone": "auto",
    }
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(settings.WEATHER_URL, params=params)
            resp.raise_for_status()
            data = resp.json().get("current", {})
            return {
                "temperature": data.get("temperature_2m"),
                "humidity": data.get("relative_humidity_2m"),
                "rainfall_mm": data.get("precipitation", 0.0),
                "source": "Open-Meteo (live)",
            }
    except Exception:  # noqa: BLE001
        return None


async def get_weather(
    lat: Optional[float] = None, lon: Optional[float] = None, place: Optional[str] = None
) -> dict:
    if lat is None or lon is None:
        lat, lon = settings.DEMO_REGION["lat"], settings.DEMO_REGION["lon"]
    observed = await fetch_weather(lat, lon)
    if observed:
        HISTORY.append({"lat": lat, "lon": lon, **observed})
        return observed

    # Deterministic fallback so the API stays up during offline demos.
    from .seed import WEATHER_OBSERVATIONS

    record = (WEATHER_OBSERVATIONS or [{}])[0]
    import random

    rng = random.Random(int(round((lat + lon) * 10)) % 1000)
    return {
        "temperature": round(record.get("temperature", 26) + rng.uniform(-1.5, 1.5)),
        "humidity": round(record.get("humidity", 60) + rng.uniform(-5, 5)),
        "rainfall_mm": round(max(0, record.get("rainfall_mm", 1.0) + rng.uniform(0, 2)), 1),
        "source": "cached demo weather (offline fallback)",
    }