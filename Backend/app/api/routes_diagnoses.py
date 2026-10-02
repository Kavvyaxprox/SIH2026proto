"""Diagnosis + sync endpoints."""

from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Diagnosis, SyncRecord
from ..schemas import DiagnosisCreate, SyncBatch, SyncResult

router = APIRouter()


@router.post("/diagnoses")
def create_diagnosis(payload: DiagnosisCreate, db: Session = Depends(get_db)) -> dict:
    """Accept a single diagnosis from a client (direct sync)."""
    exists = db.get(Diagnosis, payload.id)
    if exists:
        return {
            "id": payload.id,
            "status": "exists",
            "review_status": exists.review_status,
        }

    record = Diagnosis(
        id=payload.id,
        user_id=payload.user_id,
        farm_id=payload.farm_id,
        crop=payload.crop,
        disease=payload.disease,
        class_id=payload.class_id,
        confidence=payload.confidence,
        severity=payload.severity,
        severity_label=payload.severity_label,
        temperature=payload.temperature,
        humidity=payload.humidity,
        rainfall_mm=payload.rainfall_mm,
        weather_cached=payload.weather_cached,
        latitude=payload.latitude,
        longitude=payload.longitude,
        image_url=payload.image_url,
        created_at=payload.created_at,
        sync_status="synced",
        review_status="needs_review" if payload.confidence < 0.60 else "none",
        is_demo_sample=payload.is_demo_sample,
    )
    db.add(record)
    db.add(SyncRecord(device_id="api", diagnosis_id=payload.id, status="ok"))
    db.commit()
    return {"id": payload.id, "status": "created", "review_status": record.review_status}


@router.post("/sync")
def sync_batch(payload: SyncBatch, db: Session = Depends(get_db)) -> SyncResult:
    """Synchronise queued offline diagnoses in one batch."""
    synced, skipped, ids = 0, 0, []
    for item in payload.diagnoses:
        if db.get(Diagnosis, item.id) is not None:
            skipped += 1
            continue
        record = Diagnosis(
            id=item.id,
            user_id=item.user_id,
            farm_id=item.farm_id,
            crop=item.crop,
            disease=item.disease,
            class_id=item.class_id,
            confidence=item.confidence,
            severity=item.severity,
            severity_label=item.severity_label,
            temperature=item.temperature,
            humidity=item.humidity,
            rainfall_mm=item.rainfall_mm,
            weather_cached=item.weather_cached,
            latitude=item.latitude,
            longitude=item.longitude,
            image_url=item.image_url,
            created_at=item.created_at,
            sync_status="synced",
            review_status="needs_review" if item.confidence < 0.60 else "none",
            is_demo_sample=item.is_demo_sample,
        )
        db.add(record)
        db.add(SyncRecord(device_id=payload.device_id, diagnosis_id=item.id, status="ok"))
        ids.append(item.id)
        synced += 1
    db.commit()
    return SyncResult(synced=synced, skipped=skipped, ids=ids)


@router.get("/diagnoses")
def list_diagnoses(
    db: Session = Depends(get_db),
    limit: int = Query(50, le=500),
    offset: int = Query(0),
    class_id: str | None = Query(None),
) -> dict:
    q = select(Diagnosis).order_by(Diagnosis.created_at.desc())
    if class_id:
        q = q.where(Diagnosis.class_id == class_id)
    rows = db.scalars(q.offset(offset).limit(limit)).all()
    return {
        "count": len(rows),
        "diagnoses": [
            {
                "id": d.id,
                "crop": d.crop,
                "disease": d.disease,
                "class_id": d.class_id,
                "confidence": d.confidence,
                "severity": d.severity,
                "severity_label": d.severity_label,
                "latitude": d.latitude,
                "longitude": d.longitude,
                "temperature": d.temperature,
                "humidity": d.humidity,
                "rainfall_mm": d.rainfall_mm,
                "created_at": d.created_at.isoformat(),
                "sync_status": d.sync_status,
                "review_status": d.review_status,
                "is_demo_sample": d.is_demo_sample,
            }
            for d in rows
        ],
    }


@router.get("/diagnoses/review-queue")
def review_queue(db: Session = Depends(get_db)) -> dict:
    """Low-confidence cases flagged for expert review."""
    rows = (
        db.scalars(
            select(Diagnosis)
            .where(Diagnosis.review_status == "needs_review")
            .order_by(Diagnosis.created_at.desc())
        )
        .all()
    )
    return {
        "count": len(rows),
        "cases": [
            {
                "id": d.id,
                "crop": d.crop,
                "disease": d.disease,
                "class_id": d.class_id,
                "confidence": d.confidence,
                "severity": d.severity,
                "severity_label": d.severity_label,
                "created_at": d.created_at.isoformat(),
                "latitude": d.latitude,
                "longitude": d.longitude,
            }
            for d in rows
        ],
    }