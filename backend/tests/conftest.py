"""
Pytest konfiguratsiyasi.

MUHIM: testlar REAL portfolio.db fayliga tegmaydi. DATABASE_URL
testga xos, vaqtinchalik SQLite fayliga (tmp_path) qayta yo'naltiriladi
va sessiya yakunlanganda o'chiriladi.

Shuning uchun DATABASE_URL muhit o'zgaruvchisi app import qilinishidan
OLDIN o'zgartiriladi — chunki app.core.database modul darajasida
async engine yaratadi.
"""

import os
import sqlite3
import sys
from pathlib import Path

import pytest

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

# app importidan oldin sozlamalarni testga xos qilamiz.
os.environ["ENVIRONMENT"] = "test"
# Haqiqiy .env faylini o'qimisligimiz uchun izolatsiya
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./_test_placeholder.db"
# Betallangan sozlamalar keshini tozalash
from app.core.config import get_settings  # noqa: E402

get_settings.cache_clear()

_TEST_DB_PATH = BACKEND_DIR / "_pytest_test.db"
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{_TEST_DB_PATH}"
get_settings.cache_clear()

from fastapi.testclient import TestClient  # noqa: E402

from app.core.rate_limit import contact_limiter  # noqa: E402
from app.main import app  # noqa: E402


def _drop_test_db() -> None:
    if _TEST_DB_PATH.exists():
        _TEST_DB_PATH.unlink()


@pytest.fixture(scope="session", autouse=True)
def _prepare_database():
    """Test bazasini toza holda boshlaydi va tugagach o'chiradi."""
    _drop_test_db()
    yield
    _drop_test_db()


@pytest.fixture(autouse=True)
def _reset_rate_limiter():
    """Har bir testdan oldin rate limiter tozalanadi.

    Aks holda birinchi test yuborgan xabarlar keyingi testlarni
    429 ga tushirib qo'yardi (limit: 1 daqiqada 3 ta).
    """
    contact_limiter._hits.clear()
    yield
    contact_limiter._hits.clear()


@pytest.fixture(autouse=True)
def _clean_database():
    """Har bir testdan oldin jadval tozalanadi.

    Aks holda testlar bir-birining yozuvlarini ko'rar va
    "bo'sh ro'yxat" kabi taxminlar buzilardi. To'g'ridan-to'g'ri
    sqlite3 orqali o'chiramiz — ilova aiosqlite ishlatadi, ya'ni
    ostida bir xil SQLite fayli.
    """
    if _TEST_DB_PATH.exists():
        with sqlite3.connect(_TEST_DB_PATH) as conn:
            conn.execute("DELETE FROM contact_messages")
            conn.commit()
    yield


@pytest.fixture
def client():
    """FastAPI ilovasi uchun sinov mijozi."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def valid_payload():
    """To'g'ri kontakt formasi payload'i."""
    return {
        "name": "Aziz Karimov",
        "email": "aziz@example.com",
        "message": "Salom! Loyiha haqida qisqa savolim bor.",
    }
