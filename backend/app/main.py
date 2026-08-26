"""
Mardon Sodiqov — Portfolio Backend
FastAPI ilovasining kirish nuqtasi.
Backend va frontend bir portda ishlaydi.
"""
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api import api_router
from app.core.config import get_settings
from app.core.database import init_db

settings = get_settings()

BACKEND_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BACKEND_DIR.parent / "frontend"

# Agar frontend papkasi topilmasa (masalan, deploy paytida), backend papkasidagi frontend'ni qidiramiz
if not FRONTEND_DIR.is_dir():
    FRONTEND_DIR = BACKEND_DIR / "frontend"


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="Mardon Sodiqov portfolio sayti uchun backend API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Kutilmagan server xatoligi yuz berdi."},
    )


@app.get("/api/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}


app.include_router(api_router)

print(f"[INFO] FRONTEND_DIR: {FRONTEND_DIR} (exists: {FRONTEND_DIR.is_dir()})")

if FRONTEND_DIR.is_dir():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
else:
    print(f"[WARNING] Frontend directory not found at {FRONTEND_DIR}")
