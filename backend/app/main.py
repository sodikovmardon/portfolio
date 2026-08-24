"""
Mardon Sodiqov — Portfolio Backend
FastAPI ilovasining kirish nuqtasi.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import api_router
from app.core.config import get_settings
from app.core.database import init_db

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ilova ishga tushganda jadvallarni tayyorlaydi
    await init_db()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="Mardon Sodiqov portfolio sayti uchun backend API (Bog'lanish formasi va h.k.)",
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


@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "service": settings.APP_NAME}


@app.get("/api/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}


app.include_router(api_router)
