"""Officer dashboard aggregation endpoints."""

from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Diagnosis
from fastapi import APIRouter, Depends

router = APIRouter()


@router.get("/dashboard/stats")
def dashboard_stats(db: Session = Depends(get_db)) -> dict:
    """Aggregates used by the Agri Intelligence dashboard + charts."""
    total = db.scalar(select(func.count()).select_from(Diagnosis)) or 0
    synced = (
        db.scalar(
            select(func.count())
            .select_from(Diagnosis)
            .where(Diagnosis.sync_status == "synced")
        )
        or 0
    )
    high_severity = (
        db.scalar(
            select(func.count())
            .select_from(Diagnosis)
            .where(Diagnosis.severity_label == "Severe")
        )
        or 0
    )
    review_due = (
        db.scalar(
            select(func.count())
            .select_from(Diagnosis)
            .where(Diagnosis.review_status == "needs_review")
        )
        or 0
    )

    rows = db.execute(
        select(
            Diagnosis.crop,
            Diagnosis.disease,
            func.count().label("n"),
        )
        .group_by(Diagnosis.crop, Diagnosis.disease)
        .order_by(func.count().desc())
    ).all()
    top_condition = (
        {"crop": rows[0][0], "disease": rows[0][1], "count": rows[0][2]}
        if rows
        else None
    )
    by_crop_disease = [
        {"crop": c, "disease": d, "count": n} for c, d, n in rows
    ]
    by_crop = [
        {"crop": crop, "count": n}
        for crop, n in db.execute(
            select(Diagnosis.crop, func.count())
            .group_by(Diagnosis.crop)
            .order_by(func.count().desc())
        ).all()
    ]

    severity_dist = [
        {"label": label, "count": n}
        for label, n in db.execute(
            select(Diagnosis.severity_label, func.count())
            .group_by(Diagnosis.severity_label)
        ).all()
    ]

    # Cases per day for the last 14 days (filled with zeroes).
    from datetime import datetime, timedelta

    now = datetime.utcnow()
    by_day_raw = dict(
        db.execute(
            select(func.date(Diagnosis.created_at), func.count())
            .group_by(func.date(Diagnosis.created_at))
        ).all()
    )
    timeline = []
    for i in range(13, -1, -1):
        day = (now - timedelta(days=i)).date()
        timeline.append({"date": day.strftime("%d %b"), "count": by_day_raw.get(str(day), 0)})

    return {
        "total_diagnoses": total,
        "synced": synced,
        "high_severity": high_severity,
        "expert_review_due": review_due,
        "top_condition": top_condition,
        "by_crop": by_crop,
        "by_crop_disease": by_crop_disease,
        "severity_distribution": severity_dist,
        "timeline": timeline,
    }