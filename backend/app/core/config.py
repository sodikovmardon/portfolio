"""
Ilova sozlamalari (Settings).
Barcha muhim qiymatlar .env fayl orqali beriladi, kodga qattiq yozilmaydi.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Umumiy
    APP_NAME: str = "Mardon Portfolio API"
    ENVIRONMENT: str = "development"

    # Database — standart holatda lokal SQLite fayli ishlatiladi,
    # production uchun .env orqali PostgreSQL DSN berish mumkin:
    # postgresql+asyncpg://user:pass@host:5432/dbname
    DATABASE_URL: str = "sqlite+aiosqlite:///./portfolio.db"

    # CORS — frontend qaysi manzillardan so'rov yubora olishini belgilaydi
    ALLOWED_ORIGINS: str = "http://localhost:8000,http://127.0.0.1:8000,http://localhost:5500,http://127.0.0.1:5500,null"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
