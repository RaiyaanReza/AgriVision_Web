import logging
import os
import shutil
from pathlib import Path
from typing import Any, List, Dict, Optional
from datetime import datetime

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from agents.router_agent import run_agrivision_agent
from services.database import (
    init_db,
    get_db_session,
    get_prediction_history,
    get_prediction_by_id,
    get_user_preferences,
    update_user_preferences,
    get_stats,
)
from routes import chat
import json
from pathlib import Path

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory exists
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Mount static files for images
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Register Routers
app.include_router(chat.router, prefix="/api/chat", tags=["AgriBot Chat"])


@app.on_event("startup")
async def startup_event() -> None:
    logger.info("Initializing database...")
    await init_db()
    logger.info("Database initialized.")


@app.exception_handler(Exception)
async def global_internal_error_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    logger.error(
        "Unhandled exception on path=%s: %s", request.url.path, exc, exc_info=True
    )
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
    )


@app.get("/api/health")
async def health_check(db: AsyncSession = Depends(get_db_session)) -> dict:
    return {"status": "ok", "version": settings.VERSION, "database": "connected"}


@app.post("/api/predict")
async def predict(file: UploadFile = File(...)) -> dict:
    """
    Upload an image and run the AgriVision agentic workflow.
    """
    try:
        # Save file temporarily
        file_extension = file.filename.split(".")[-1]
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_name = f"upload_{timestamp}.{file_extension}"
        file_path = UPLOAD_DIR / file_name

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        logger.info(f"File saved to {file_path}. Running agent...")

        # Run the agentic workflow
        # Note: We pass the absolute path for reliability
        result = await run_agrivision_agent(str(file_path.absolute()))

        return {"status": "success", "data": result}
    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/predictions/history")
async def history(
    skip: int = 0, limit: int = 20, db: AsyncSession = Depends(get_db_session)
) -> dict:
    predictions = await get_prediction_history(db, skip=skip, limit=limit)

    # Format for frontend
    data = []
    for pred in predictions:
        item = {
            "id": pred.id,
            "image_path": pred.image_path,
            "predicted_class": pred.predicted_class,
            "confidence": pred.confidence,
            "is_disease": pred.is_disease,
            "created_at": pred.created_at.isoformat(),
            "treatment": None,
        }
        if pred.treatment:
            item["treatment"] = {
                "treatment_text": pred.treatment.treatment_text,
                "source": pred.treatment.source,
            }
        data.append(item)

    return {"status": "success", "data": data, "count": len(data)}


@app.get("/api/predictions/{prediction_id}")
async def prediction_detail(
    prediction_id: int, db: AsyncSession = Depends(get_db_session)
) -> dict:
    pred = await get_prediction_by_id(db, prediction_id)
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")

    data = {
        "id": pred.id,
        "image_path": pred.image_path,
        "predicted_class": pred.predicted_class,
        "confidence": pred.confidence,
        "is_disease": pred.is_disease,
        "created_at": pred.created_at.isoformat(),
        "treatment": None,
    }
    if pred.treatment:
        data["treatment"] = {
            "treatment_text": pred.treatment.treatment_text,
            "source": pred.treatment.source,
        }

    return {"status": "success", "data": data}


@app.get("/api/stats")
async def stats(db: AsyncSession = Depends(get_db_session)) -> dict:
    stats_data = await get_stats(db)
    return {"status": "success", "data": stats_data}


@app.get("/api/user/preferences")
async def user_preferences(db: AsyncSession = Depends(get_db_session)) -> dict:
    prefs = await get_user_preferences(db)
    return {
        "status": "success",
        "data": {
            "id": prefs.id,
            "language": prefs.language,
            "theme": prefs.theme,
            "offline_mode": prefs.offline_mode,
            "notifications_enabled": prefs.notifications_enabled,
        },
    }


@app.put("/api/user/preferences/{pref_id}")
async def update_preferences(
    pref_id: int, updates: Dict[str, Any], db: AsyncSession = Depends(get_db_session)
) -> dict:
    try:
        prefs = await update_user_preferences(db, pref_id, updates)
        return {
            "status": "success",
            "data": {
                "id": prefs.id,
                "language": prefs.language,
                "theme": prefs.theme,
                "offline_mode": prefs.offline_mode,
                "notifications_enabled": prefs.notifications_enabled,
            },
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# Load treatments JSON once at module level
_TREATMENTS_DATA: list[dict] = []
_TREATMENTS_PATH = Path(__file__).resolve().parent.parent / "treatments.json"
if _TREATMENTS_PATH.exists():
    try:
        with open(_TREATMENTS_PATH, "r", encoding="utf-8") as f:
            _TREATMENTS_DATA = json.load(f)
    except Exception:
        _TREATMENTS_DATA = []


@app.get("/api/treatments/search")
async def search_treatments(disease: str = "", crop: str = "") -> list[dict]:
    """
    Search treatment recommendations by disease and/or crop type.
    Returns matching treatments from the local knowledge base.
    """
    if not _TREATMENTS_DATA:
        return []

    query_disease = disease.strip().lower().replace(" ", "_")
    query_crop = crop.strip().lower()
    results = []

    for item in _TREATMENTS_DATA:
        item_disease = (item.get("disease_name") or "").strip().lower()
        item_crop = (item.get("crop_type") or "").strip().lower()

        disease_match = (
            not query_disease
            or query_disease in item_disease
            or item_disease in query_disease
        )
        crop_match = (
            not query_crop or query_crop in item_crop or item_crop in query_crop
        )

        if disease_match or crop_match:
            results.append(
                {
                    "title": item.get("title"),
                    "crop_type": item.get("crop_type"),
                    "disease_name": item.get("disease_name"),
                    "treatment_details": item.get("content"),
                    "tags": item.get("tags", []),
                }
            )

    return results


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
