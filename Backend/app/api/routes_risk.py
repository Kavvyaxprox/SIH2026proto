"""Weather + regional risk + outbreak endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import OutbreakPoint
from ..schemas import WeatherQuery
from ..services.risk import compute_region_risk
from ..services.weather import get_weather

router = APIRouter()


@router.get("/weather")
async def weather(query: WeatherQuery = Depends()) -> dict:
    """Live Open-Meteo weather, or clearly-labelled cached fallback."""
    weather = await get_weather(query.lat, query.lon, query.place)
    return {"place": query.place or "Demo Region", **weather}


@router.get("/disease-risk")
async def regional_risk(db: Session = Depends(get_db)) -> dict:
    """Prototype regional risk model output (rule-based, ST-GNN-ready)."""
    weather = await get_weather()
    risk = compute_region_risk(
        db, 22.7, 75.9, weather.get("temperature"), weather.get("humidity")
    )
    return {"region": "Indore Rural", "weather": weather, "risk": risk}


@router.get("/outbreaks")
def outbreaks(db: Session = Depends(get_db)) -> dict:
    """Anonymous diagnostic points for the public regional map."""
    rows = db.scalars(
        select(OutbreakPoint).order_by(OutbreakPoint.occurred_at.desc())
    ).all()
    return {
        "count": len(rows),
        "points": [
            {
                "lat": p.latitude,
                "lon": p.longitude,
                "crop": p.crop,
                "condition": p.condition,
                "severity": p.severity,
                "region": p.region,
                "date": p.occurred_at.strftime("%d %b %Y"),
                "case": p.case_id,
            }
            for p in rows
        ],
    }