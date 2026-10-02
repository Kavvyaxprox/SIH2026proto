"""API package: exposes the router tree and top-level router."""

from __future__ import annotations

from fastapi import APIRouter

from . import (
    routes_dashboard,
    routes_diagnoses,
    routes_expert,
    routes_knowledge,
    routes_risk,
)

api_router = APIRouter(prefix="/api")

api_router.include_router(routes_diagnoses.router, tags=["diagnoses"])
api_router.include_router(routes_risk.router, tags=["weather", "risk"])
api_router.include_router(routes_knowledge.router, tags=["knowledge", "model"])
api_router.include_router(routes_expert.router, tags=["expert"])
api_router.include_router(routes_dashboard.router, tags=["dashboard"])