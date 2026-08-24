"""
Asinxron SQLAlchemy engine va session sozlamalari.
"""
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import get_settings

settings = get_settings()

engine = create_async_engine(settings.DATABASE_URL, echo=False, future=True)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Barcha ORM modellari uchun asosiy klass."""
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency: har bir so'rov uchun alohida DB sessiya beradi."""
    async with AsyncSessionLocal() as session:
        yield session


async def init_db() -> None:
    """Ilova ishga tushganda jadvallarni yaratadi (oddiy loyihalar uchun,
    katta production tizimlarda Alembic migratsiyasi tavsiya etiladi)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
