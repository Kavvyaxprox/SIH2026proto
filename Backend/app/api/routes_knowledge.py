"""Knowledge base + model version endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import KnowledgeBaseEntry, KnowledgeVersion
from ..services.knowledge import load_knowledge

router = APIRouter()


@router.get("/knowledge")
def knowledge(db: Session = Depends(get_db)) -> dict:
    """Full structured knowledge base (also bundled offline on the client)."""
    payload = load_knowledge()
    rows = db.scalars(select(KnowledgeBaseEntry)).all()
    if rows:
        from ..services.knowledge import get_version

        payload["version"] = get_version()
    return payload


@router.get("/model/version")
def model_version(db: Session = Depends(get_db)) -> dict:
    rows = db.scalars(
        select(KnowledgeVersion).order_by(KnowledgeVersion.released_at.desc())
    ).all()
    versions = {r.artifact: r.version for r in rows}
    return {
        "ai_model": versions.get("ai-model", "v0.1-demo"),
        "knowledge_base": versions.get("knowledge-base", "v1.0"),
        "checks": {
            "ai_model_newer": False,
            "knowledge_base_newer": False,
        },
    }