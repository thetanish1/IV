from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "InternVision Tech API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    
    # Database Settings
    DATABASE_URL: str = "sqlite:///./sql_app.db"
    
    # JWT Auth Settings
    SECRET_KEY: str = "super-secret-key-internvision-tech-2026-production-ready"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    # Razorpay Settings (Test Mode)
    RAZORPAY_KEY_ID: str = "rzp_test_internvision123"
    RAZORPAY_KEY_SECRET: str = "secret_internvision_key_456"
    
    # CORS Origins
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

