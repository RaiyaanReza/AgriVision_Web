"""
AgriVision Configuration Settings
"""

from pydantic_settings import BaseSettings
from typing import List, Dict
import os
from pathlib import Path
from dotenv import load_dotenv

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = Path(__file__).resolve().parent / "models" / "Models"

# Explicitly load .env so os.environ is populated before BaseSettings reads it
load_dotenv(dotenv_path=str(BASE_DIR / ".env"))


class Settings(BaseSettings):
    # App Info
    PROJECT_NAME: str = "AgriVision"
    VERSION: str = "2.0.0"
    API_PREFIX: str = "/api"
    API_BASE_URL: str = "http://localhost:8000"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*",
    ]

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./agrivision.db"

    # AI/ML — use GEMINI_API_KEY_1 from .env, fallback to GEMINI_API_KEY
    GEMINI_API_KEY: str = (
        os.getenv("GEMINI_API_KEY_1") or os.getenv("GEMINI_API_KEY") or ""
    )
    MODEL_THRESHOLD: float = 0.5

    # Model Paths
    CROP_CLASSIFIER_MODEL_PATH: Path = MODELS_DIR / "Crops Classifier" / "best.pt"
    DISEASE_MODELS: Dict[str, Path] = {
        "Brassica": MODELS_DIR / "Brassica" / "best.pt",
        "Corn": MODELS_DIR / "Corn" / "best.pt",
        "Potato": MODELS_DIR / "Potato" / "best.pt",
        "Rice": MODELS_DIR / "Rice" / "best.pt",
        "GourdGuava": MODELS_DIR / "Brassica" / "best.pt",
        "Solanacea": MODELS_DIR / "Potato" / "best.pt",
    }
    CROP_NAME_MAPPING: Dict[str, str] = {
        "Solanacea": "Potato",
        "GourdGuava": "Brassica",
        "Wheat": "Rice",
    }

    # Thresholds
    CROP_CONFIDENCE_THRESHOLD: float = 0.60
    DISEASE_CONFIDENCE_THRESHOLD: float = 0.50

    # File Upload
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: List[str] = ["jpg", "jpeg", "png", "webp"]

    class Config:
        env_file = str(Path(__file__).resolve().parent.parent / ".env")
        case_sensitive = True
        extra = "ignore"


settings = Settings()

# Compatibility constants for old code
CROP_CONFIDENCE_THRESHOLD = settings.CROP_CONFIDENCE_THRESHOLD
DISEASE_CONFIDENCE_THRESHOLD = settings.DISEASE_CONFIDENCE_THRESHOLD
CROP_NAME_MAPPING = settings.CROP_NAME_MAPPING
CROP_CLASSIFIER_MODEL_PATH = settings.CROP_CLASSIFIER_MODEL_PATH
DISEASE_MODELS = settings.DISEASE_MODELS
