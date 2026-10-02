"""Expert-review (human-in-the-loop) endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Diagnosis, ExpertReview
from ..schemas import ExpertReviewCreate

router = APIRouter()


@router.post("/expert-review")
def submit_review(payload: ExpertReviewCreate, db: Session = Depends(get_db)) -> dict:
    """Expert confirms/labels a low-confidence case."""
    d = db.get(Diagnosis, payload.diagnosis_id)
    if d is None:
        raise HTTPException(status_code=404, detail="Diagnosis not found")
    if payload.decision not in {"confirmed", "incorrect", "more_info"}:
        raise HTTPException(status_code=422, detail="Invalid decision")

    review = ExpertReview(
        diagnosis_id=payload.diagnosis_id,
        expert_id="demo-officer-001",
        decision=payload.decision,
        note=payload.note,
    )
    d.review_status = "reviewed"
    db.add(review)
    db.commit()
    return {
        "diagnosis_id": payload.diagnosis_id,
        "decision": payload.decision,
        "review_status": "reviewed",
    }