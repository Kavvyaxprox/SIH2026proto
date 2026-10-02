"""ORM models for the AgriScan prototype database.

SQLite-flavoured where noted; switching DATABASE_URL to PostgreSQL does
not change these definitions.
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)  # demo ids like "demo-farmer-001"
    name = Column(String, nullable=False)
    role = Column(String, default="farmer")  # farmer | officer
    region = Column(String, default="")


class Farm(Base):
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    crop = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    area_hectares = Column(Float, default=1.0)


class DiseaseClass(Base):
    __tablename__ = "disease_classes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    class_id = Column(String, unique=True, nullable=False)  # e.g. tomato_early_blight
    crop = Column(String, nullable=False)
    disease = Column(String, nullable=False)  # e.g. Early Blight
    label = Column(String, nullable=False)  # full display label
    healthy = Column(Boolean, default=False)
    description = Column(Text, default="")


class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id = Column(String, primary_key=True)  # client-generated uuid
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=True)

    crop = Column(String, nullable=False)
    disease = Column(String, nullable=False)
    class_id = Column(String, nullable=False)

    confidence = Column(Float, nullable=False)  # 0..1
    severity = Column(Integer, nullable=False)  # 0..100 index
    severity_label = Column(String, nullable=False)  # Mild | Moderate | Severe

    temperature = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    rainfall_mm = Column(Float, nullable=True)
    weather_cached = Column(Boolean, default=False)

    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    image_url = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    sync_status = Column(String, default="pending")  # pending | synced
    review_status = Column(String, default="none")  # none | needs_review | reviewed
    is_demo_sample = Column(Boolean, default=False)


class EnvironmentalObservation(Base):
    __tablename__ = "environmental_observations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    region = Column(String, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    rainfall_mm = Column(Float, default=0.0)
    observed_at = Column(DateTime, default=datetime.utcnow)


class SyncRecord(Base):
    __tablename__ = "sync_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(String, default="unknown")
    diagnosis_id = Column(String, ForeignKey("diagnoses.id"), nullable=True)
    synced_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="ok")


class ExpertReview(Base):
    __tablename__ = "expert_reviews"

    id = Column(Integer, primary_key=True, autoincrement=True)
    diagnosis_id = Column(String, ForeignKey("diagnoses.id"), nullable=False)
    expert_id = Column(String, default="demo-officer-001")
    decision = Column(String, nullable=False)  # confirmed | incorrect | more_info
    note = Column(Text, default="")
    reviewed_at = Column(DateTime, default=datetime.utcnow)


class OutbreakPoint(Base):
    __tablename__ = "outbreak_points"

    id = Column(Integer, primary_key=True, autoincrement=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    crop = Column(String, nullable=False)
    condition = Column(String, nullable=False)
    severity = Column(Integer, nullable=False)  # 0..100
    region = Column(String, default="Indore Rural")
    occurred_at = Column(DateTime, default=datetime.utcnow)
    case_id = Column(String, nullable=True)  # anonymous reference to a diagnosis


class KnowledgeVersion(Base):
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    artifact = Column(String, nullable=False)  # "ai-model" | "knowledge-base"
    version = Column(String, nullable=False)
    released_at = Column(DateTime, default=datetime.utcnow)


class KnowledgeBaseEntry(Base):
    """Local-structured agronomy knowledge shipped to the client."""

    __tablename__ = "knowledge"

    id = Column(Integer, primary_key=True, autoincrement=True)
    class_id = Column(String, nullable=False, index=True)
    crop = Column(String, nullable=False)
    disease = Column(String, nullable=False)
    pathogen = Column(String, default="")
    summary = Column(Text, default="")
    symptoms = Column(Text, default="[]")
    immediate_actions = Column(Text, default="[]")
    prevention = Column(Text, default="[]")
    chemical_guidance = Column(Text, default="[]")
    organic = Column(Text, default="[]")
    contact_advice = Column(Text, default="")