"""Pydantic request/response schemas for the AgriScan API."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class DiagnosisCreate(BaseModel):
    id: str = Field(description="Client-generated unique id (uuid)")
    user_id: str = "demo-farmer-001"
    farm_id: Optional[int] = None
    crop: str
    disease: str
    class_id: str
    confidence: float = Field(ge=0.0, le=1.0)
    severity: int = Field(ge=0, le=100)
    severity_label: str = "Moderate"
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    rainfall_mm: Optional[float] = None
    weather_cached: bool = False
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None
    created_at: datetime
    is_demo_sample: bool = False


class SyncBatch(BaseModel):
    device_id: str = "demo-device"
    diagnoses: list[DiagnosisCreate] = []


class SyncResult(BaseModel):
    synced: int = 0
    skipped: int = 0
    ids: list[str] = []


class ExpertReviewCreate(BaseModel):
    diagnosis_id: str
    decision: str  # confirmed | incorrect | more_info
    note: str = ""


class WeatherQuery(BaseModel):
    lat: float | None = None
    lon: float | None = None
    place: str | None = None


class ReviewQueueItem(BaseModel):
    id: str
    crop: str
    disease: str
    confidence: float
    severity: int
    created_at: datetime
    review_status: str

    class Config:
        from_attributes = True