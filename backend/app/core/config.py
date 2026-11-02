from typing import List
from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_DEVELOPMENT_SECRET_KEY = "development-only-insecure-secret-key"


class Settings(BaseSettings):
    PROJECT_NAME: str = "EcoTrack – Smart Energy & Asset Management System"
    API_V1_STR: str = "/api/v1"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"

    # Security
    SECRET_KEY: str = _DEVELOPMENT_SECRET_KEY
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Database
    # Default to async sqlite for seamless local development, asyncpg for postgres
    DATABASE_URL: str = "sqlite+aiosqlite:///./ecotrack.db"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    @model_validator(mode="after")
    def require_production_secret(self) -> "Settings":
        if self.ENVIRONMENT.lower() == "production" and (
            self.SECRET_KEY == _DEVELOPMENT_SECRET_KEY
            or self.SECRET_KEY.startswith("replace_")
            or len(self.SECRET_KEY) < 32
        ):
            raise ValueError("Set SECRET_KEY to a unique random value of at least 32 characters in production.")
        return self


settings = Settings()
