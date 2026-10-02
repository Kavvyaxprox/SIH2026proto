"""AgriScan AI — FastAPI application entrypoint."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import api_router
from .config import settings
from .database import engine, init_db


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="Spatiotemporal edge diagnostics for crop pathology — prototype backend.",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # prototype only; tighten for production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    def on_startup() -> None:
        init_db()
        if settings.SEED_ON_STARTUP:
            from sqlalchemy.orm import Session

            from .database import SessionLocal
            from .services.seed import seed_demo_data

            with SessionLocal() as db:
                seed_demo_data(db)

    @app.get("/api/health")
    def health() -> dict:
        return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}

    app.include_router(api_router)
    return app


app = create_app()