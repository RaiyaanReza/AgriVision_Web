"""
Database Service Layer
Handles all async database operations with SQLAlchemy
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List, Optional, Dict, Any
from datetime import datetime
from contextlib import asynccontextmanager

from config import settings
from models.database import Base, PredictionHistory, TreatmentRecommendation, UserPreference

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True
)

# Create async session factory
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def init_db():
    """Initialize database tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db_session():
    """Dependency to get async database session for FastAPI"""
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()

@asynccontextmanager
async def get_manual_session():
    """Context manager for manual database session usage"""
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()

async def save_prediction(
    session: AsyncSession,
    image_path: str,
    predicted_class: str,
    confidence: float,
    is_disease: bool
) -> PredictionHistory:
    """Save a new prediction to database"""
    pred = PredictionHistory(
        image_path=image_path,
        predicted_class=predicted_class,
        confidence=confidence,
        is_disease=is_disease
    )
    session.add(pred)
    await session.commit()
    await session.refresh(pred)
    return pred

async def save_treatment_recommendation(
    session: AsyncSession,
    prediction_id: int,
    treatment_text: str,
    source: str = "Gemini AI"
) -> TreatmentRecommendation:
    """Save treatment recommendation linked to a prediction"""
    treatment = TreatmentRecommendation(
        prediction_id=prediction_id,
        treatment_text=treatment_text,
        source=source
    )
    session.add(treatment)
    await session.commit()
    await session.refresh(treatment)
    return treatment

async def get_prediction_history(
    session: AsyncSession,
    skip: int = 0,
    limit: int = 20
) -> List[PredictionHistory]:
    """Get paginated prediction history with treatments"""
    result = await session.execute(
        select(PredictionHistory)
        .order_by(PredictionHistory.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    predictions = result.scalars().all()
    
    # Load treatments for each prediction
    for pred in predictions:
        await session.refresh(pred, attribute_names=['treatment'])
    
    return predictions

async def get_prediction_by_id(
    session: AsyncSession,
    prediction_id: int
) -> Optional[PredictionHistory]:
    """Get a specific prediction with its treatment"""
    result = await session.execute(
        select(PredictionHistory)
        .where(PredictionHistory.id == prediction_id)
    )
    prediction = result.scalar_one_or_none()
    
    if prediction:
        await session.refresh(prediction, attribute_names=['treatment'])
    
    return prediction

async def get_user_preferences(session: AsyncSession) -> UserPreference:
    """Get existing preferences or create default ones"""
    result = await session.execute(select(UserPreference).limit(1))
    prefs = result.scalar_one_or_none()
    
    if not prefs:
        prefs = UserPreference()
        session.add(prefs)
        await session.commit()
        await session.refresh(prefs)
    
    return prefs

async def update_user_preferences(
    session: AsyncSession,
    pref_id: int,
    updates: Dict[str, Any]
) -> UserPreference:
    """Update user preferences"""
    result = await session.execute(
        select(UserPreference).where(UserPreference.id == pref_id)
    )
    prefs = result.scalar_one_or_none()
    
    if not prefs:
        raise ValueError(f"Preferences with id {pref_id} not found")
    
    for key, value in updates.items():
        if hasattr(prefs, key):
            setattr(prefs, key, value)
    
    prefs.updated_at = datetime.utcnow()
    await session.commit()
    await session.refresh(prefs)
    return prefs

async def get_stats(session: AsyncSession) -> Dict[str, Any]:
    """Get basic statistics"""
    total_predictions = await session.execute(
        select(func.count(PredictionHistory.id))
    )
    total_diseases = await session.execute(
        select(func.count(PredictionHistory.id))
        .where(PredictionHistory.is_disease == True)
    )
    
    return {
        "total_predictions": total_predictions.scalar(),
        "total_diseases_detected": total_diseases.scalar(),
        "healthy_count": total_predictions.scalar() - total_diseases.scalar()
    }
