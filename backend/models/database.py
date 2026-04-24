"""
Database Models for AgriVision
Using SQLAlchemy Async with SQLite
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class PredictionHistory(Base):
    """Stores all crop disease predictions"""
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    image_path = Column(String, nullable=False)
    predicted_class = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    is_disease = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to treatment
    treatment = relationship("TreatmentRecommendation", back_populates="prediction", uselist=False)

class TreatmentRecommendation(Base):
    """Stores AI-generated treatment plans"""
    __tablename__ = "treatments"
    
    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey("predictions.id"), unique=True)
    treatment_text = Column(Text, nullable=False)
    source = Column(String, default="Gemini AI")  # e.g., "Gemini AI", "Expert"
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship back to prediction
    prediction = relationship("PredictionHistory", back_populates="treatment")

class UserPreference(Base):
    """User settings and preferences"""
    __tablename__ = "user_preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    language = Column(String, default="en")  # en, bn, es, hi
    theme = Column(String, default="light")  # light, dark
    offline_mode = Column(Boolean, default=False)
    notifications_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Document(Base):
    """Knowledge base documents for RAG"""
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    content_summary = Column(Text)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
