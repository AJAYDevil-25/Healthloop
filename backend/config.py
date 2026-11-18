import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "healthloop-super-secure-key-2026-prod")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "healthloop-jwt-token-secret-health-tech")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    # MongoDB Configuration
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/healthloop_db")
    DB_NAME = os.getenv("DB_NAME", "healthloop_db")
    
    # Google Gemini AI Configuration
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    
    # CORS Configuration
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")
    
    # Guest Account Config
    GUEST_USER_EMAIL = "guest.evaluator@healthloop.ai"
    GUEST_USER_ID = "guest_evaluator_001"
