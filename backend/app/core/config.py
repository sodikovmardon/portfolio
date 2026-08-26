"""
Ilova sozlamalari (Settings).
Barcha muhim qiymatlar .env fayl orqali beriladi, kodga qattiq yozilmaydi.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "Mardon Portfolio API"
    ENVIRONMENT: str = "development"

    DATABASE_URL: str = "sqlite+aiosqlite:///./portfolio.db"

    # Same-origin bo'lgani uchun CORS muammosi bo'lmasligi kerak.
    # Lekin xavfsizlik uchun asosiy manzillarni saqlab qo'yamiz.
    ALLOWED_ORIGINS: str = "http://localhost:8000,http://127.0.0.1:8000"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
