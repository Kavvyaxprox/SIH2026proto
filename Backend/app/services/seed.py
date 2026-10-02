"""Deterministic demo-data seeding for the AgriScan prototype.

Produces realistic, internally-consistent data: farms in the Demo Region
(Indore Rural), diagnoses spread over the last ~30 days, weather
observations, outbreak points, expert reviews and model versions.

Seeding is idempotent: it no-ops when diagnoses already exist, and keeps
a fixed RNG seed so charts/dashboards are reproducible across restarts.
"""

from __future__ import annotations

import json
import random
from datetime import datetime, timedelta
from pathlib import Path

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..database import Base, engine, init_db
from ..models import (
    Diagnosis,
    DiseaseClass,
    EnvironmentalObservation,
    ExpertReview,
    Farm,
    KnowledgeBaseEntry,
    KnowledgeVersion,
    OutbreakPoint,
    User,
)
from .knowledge import load_knowledge

SEED = 42
FARMER_COUNT = 40
DIAGNOSIS_COUNT = 220
REGION_LAT, REGION_LON = 22.7, 75.9

CROPS = {
    "tomato": ["Healthy", "Early Blight", "Late Blight"],
    "potato": ["Healthy", "Early Blight", "Late Blight"],
    "maize": ["Healthy", "Northern Leaf Blight"],
    "apple": ["Healthy", "Apple Scab"],
}

CLASS_TO_CROP = {
    "apple_scab": ("Apple", "Apple Scab", False),
    "apple_healthy": ("Apple", "Healthy", True),
    "maize_leaf_blight": ("Maize", "Northern Leaf Blight", False),
    "maize_healthy": ("Maize", "Healthy", True),
    "potato_early_blight": ("Potato", "Early Blight", False),
    "potato_late_blight": ("Potato", "Late Blight", False),
    "potato_healthy": ("Potato", "Healthy", True),
    "tomato_early_blight": ("Tomato", "Early Blight", False),
    "tomato_late_blight": ("Tomato", "Late Blight", False),
    "tomato_healthy": ("Tomato", "Healthy", True),
}

WEATHER_OBSERVATIONS: list[dict] = [
    {
        "region": "Indore Rural",
        "temperature": temp,
        "humidity": hum,
        "rainfall_mm": rain,
        "obs_days_ago": days,
    }
    for temp, hum, rain, days in [
        (27, 72, 0.0, 0),
        (26, 78, 2.1, 1),
        (28, 69, 0.0, 2),
        (27, 74, 0.4, 3),
        (29, 63, 0.0, 4),
        (28, 76, 1.2, 5),
        (26, 81, 4.8, 6),
    ]
]

NEARBY = [
    "Ujjain", "Dewas", "Mhow", "Depalpur", "Sanaud", "Karvir", "Dr Ambedkar Nagar",
    "Gambhirpur", "Rau", "Piplya Gram", "Hatod", "Bicholi Hapsi",
]


def _severity_from_conf(conf: float) -> tuple[int, str]:
    level = max(0.0, min(1.0, conf))
    score = round(level * 85 + random.uniform(-5, 5))
    score = max(0, min(100, score))
    label = "Mild" if score <= 30 else "Moderate" if score <= 60 else "Severe"
    return score, label


def seed_demo_data(db: Session, force: bool = False) -> None:
    init_db()

    existing = db.scalar(select(func.count()).select_from(Diagnosis))
    if existing and not force:
        return

    rng = random.Random(SEED)
    now = datetime.utcnow().replace(second=0, microsecond=0)

    # ---- knowledge base + disease classes ---------------------------------
    kb = load_knowledge()
    for class_id, entry in kb["entries"].items():
        rec = db.scalar(
            select(KnowledgeBaseEntry).where(KnowledgeBaseEntry.class_id == class_id)
        )
        if rec is None:
            db.add(
                KnowledgeBaseEntry(
                    class_id=class_id,
                    crop=entry["crop"],
                    disease=entry["disease"],
                    pathogen=entry.get("pathogen", ""),
                    summary=entry.get("summary", ""),
                    symptoms=json.dumps(entry.get("symptoms", [])),
                    immediate_actions=json.dumps(entry.get("immediate_actions", [])),
                    prevention=json.dumps(entry.get("prevention", [])),
                    chemical_guidance=json.dumps(entry.get("chemical_guidance", [])),
                    organic=json.dumps(entry.get("organic", [])),
                    contact_advice=entry.get("contact_advice", ""),
                )
            )
        crop, disease, healthy = CLASS_TO_CROP[class_id]
        dc = db.scalar(select(DiseaseClass).where(DiseaseClass.class_id == class_id))
        if dc is None:
            db.add(
                DiseaseClass(
                    class_id=class_id,
                    crop=crop,
                    disease=disease,
                    label=f"{crop} {disease}",
                    healthy=healthy,
                    description=entry.get("summary", ""),
                )
            )

    if db.scalar(select(func.count()).select_from(KnowledgeVersion)) == 0:
        db.add_all(
            [
                KnowledgeVersion(artifact="knowledge-base", version=kb["version"]),
                KnowledgeVersion(artifact="ai-model", version="v0.1-demo"),
            ]
        )

    # ---- users / farms ------------------------------------------------------
    if db.scalar(select(func.count()).select_from(User)) == 0:
        db.add(User(id="demo-farmer-001", name="Demo Farmer", role="farmer", region="Indore Rural"))
        db.add(User(id="demo-officer-001", name="Demo Officer", role="officer", region="Indore Rural"))

    if db.scalar(select(func.count()).select_from(Farm)) == 0:
        for i in range(FARMER_COUNT):
            place = rng.choice(NEARBY)
            db.add(
                Farm(
                    user_id=f"demo-farmer-001",
                    name=f"{place} Farm {i + 1}",
                    crop=rng.choice(list(CROPS)),
                    latitude=REGION_LAT + rng.uniform(-0.2, 0.2),
                    longitude=REGION_LON + rng.uniform(-0.2, 0.2),
                    area_hectares=round(rng.uniform(0.5, 6.0), 1),
                )
            )
        db.commit()
    farm_ids = [f.id for f in db.scalars(select(Farm)).all()]

    # ---- diagnoses over the last 30 days -----------------------------------
    class_ids = list(CLASS_TO_CROP)
    review_due = 0
    for i in range(DIAGNOSIS_COUNT):
        class_id = rng.choice(class_ids)
        crop, disease, healthy = CLASS_TO_CROP[class_id]
        created = now - timedelta(
            days=rng.randint(0, 30), minutes=rng.randint(0, 1439)
        )
        conf = rng.uniform(0.52, 0.99)
        severity, severity_label = _severity_from_conf(conf)
        if not healthy:
            severity = round(20 + conf * 70 + rng.uniform(-8, 8))
            severity = max(5, min(100, severity))
            severity_label = "Mild" if severity <= 30 else "Moderate" if severity <= 60 else "Severe"
        farm = rng.choice(farm_ids)
        farm_obj = db.get(Farm, farm)
        geo = {"lat": farm_obj.latitude, "lon": farm_obj.longitude} if farm_obj else {"lat": REGION_LAT, "lon": REGION_LON}
        temp = 26 + rng.uniform(-3, 4)
        hum = rng.uniform(48, 88)

        review_status = "none"
        if conf < 0.60:
            review_status = "needs_review"
            review_due += 1

        d = Diagnosis(
            id=f"SEED-{i + 1:04d}",
            user_id="demo-farmer-001",
            farm_id=farm,
            crop=crop,
            disease=disease,
            class_id=class_id,
            confidence=round(conf, 3),
            severity=severity,
            severity_label=severity_label,
            temperature=round(temp, 1),
            humidity=round(hum, 1),
            rainfall_mm=round(max(0.0, rng.uniform(0, 5)), 1),
            latitude=geo["lat"],
            longitude=geo["lon"],
            created_at=created,
            sync_status="synced",
            review_status=review_status,
            is_demo_sample=True,
        )
        db.add(d)
        db.add(
            OutbreakPoint(
                latitude=geo["lat"],
                longitude=geo["lon"],
                crop=crop,
                condition=disease,
                severity=severity,
                region="Indore Rural",
                occurred_at=created,
                case_id=d.id,
            )
        )
        if rng.random() < 0.12 and conf < 0.85:
            db.add(
                ExpertReview(
                    diagnosis_id=d.id,
                    decision=rng.choice(["confirmed", "more_info", "incorrect"]),
                    note="Recorded from prototype review queue.",
                    reviewed_at=created + timedelta(hours=rng.randint(1, 48)),
                )
            )

    # ---- environmental observations -----------------------------------------
    if db.scalar(select(func.count()).select_from(EnvironmentalObservation)) == 0:
        for rec in WEATHER_OBSERVATIONS:
            db.add(
                EnvironmentalObservation(
                    region=rec["region"],
                    latitude=REGION_LAT,
                    longitude=REGION_LON,
                    temperature=rec["temperature"],
                    humidity=rec["humidity"],
                    rainfall_mm=rec["rainfall_mm"],
                    observed_at=now - timedelta(days=rec["obs_days_ago"]),
                )
            )

    db.commit()


def clear_demo_data(db: Session) -> None:
    for model in [
        OutbreakPoint, ExpertReview, Diagnosis, EnvironmentalObservation,
        Farm, User, KnowledgeBaseEntry, DiseaseClass,
        KnowledgeVersion,
    ]:
        db.execute(model.__table__.delete())
    db.commit()