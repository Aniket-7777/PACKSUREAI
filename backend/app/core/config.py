import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent
# Load .env file from backend root directory
load_dotenv(dotenv_path=BASE_DIR / ".env")

UPLOAD_DIR = BASE_DIR / "uploads"
REPORT_DIR = BASE_DIR / "reports"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
REPORT_DIR.mkdir(parents=True, exist_ok=True)

class Settings:
    PROJECT_NAME: str = "PackSureAI"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Secret Key for JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "sih-2026-metrology-ai-super-secret-jwt-key-999888")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database: SQLite default, PostgreSQL ready via DATABASE_URL
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'metrology.db'}")
    
    # AI & Vision API Key (Optional: Falls back to built-in simulation/regex engine if empty)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Quality & Confidence Thresholds
    CONFIDENCE_THRESHOLD_HIGH: float = 0.85
    BLUR_THRESHOLD_LAPLACIAN: float = 80.0

    # Must be enabled only after counsel confirms the current central rules,
    # amendments, notifications, and category-specific exemptions.
    LEGAL_RULES_VALIDATED: bool = os.getenv("LEGAL_RULES_VALIDATED", "false").lower() == "true"

settings = Settings()
