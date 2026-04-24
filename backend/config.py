"""
AgriVision Configuration Settings
"""
from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # App Info
    PROJECT_NAME: str = "AgriVision"
    VERSION: str = "2.0.0"
    API_PREFIX: str = "/api"
    
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
        "*"
    ]
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./agrivision.db"
    
    # AI/ML
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    MODEL_THRESHOLD: float = 0.5
    
    # File Upload
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: List[str] = ["jpg", "jpeg", "png", "webp"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
