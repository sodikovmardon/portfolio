"""
Mardon Sodiqov — Portfolio Backend
FastAPI ilovasining kirish nuqtasi.
Backend va frontend bir portda ishlaydi.
"""

import logging
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

logger = logging.getLogger("portfolio")

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


@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    """Asosiy xavfsizlik header'larini qo'shadi.

    Bu kichik, lekin production talablarining bir qismi:
      - X-Content-Type-Options: brauzer MIME-sniffing'ni taqiqlaydi
      - X-Frame-Options: saytni iframe ichiga joylashdan himoya qiladi
      - Referrer-Policy: tashqi havolalarda manzilni oshkor qilmaydi
    """
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Kutilmagan xatolarni foydalanuvchiga xavfsiz tarzda qaytaradi.

    MUHIM: foydalanuvchiga hech qachon stack trace, SQL xato matni
    yoki boshqa ichki tafsilot yuborilmaydi. To'liq izoh faqat
    server loglariga yoziladi (logger.exception).
    """
    logger.exception("Unhandled exception: %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Kutilmagan server xatoligi yuz berdi."},
    )


@app.get("/api/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}


class ApiAwareStaticFiles(StaticFiles):
    """Statik fayllarni beradi, lekin /api/* uchun JSON 404 qaytaradi.

    Standart StaticFiles(html=True) topilmagan manzil uchun 404.html'ni
    qaytaradi — bu brauzer uchun to'g'ri, lekin API mijozi (JavaScript
    fetch) HTML olib, xato tahlil qilishda qiynaladi.

    Shu sababli /api/* so'rovlari uchun JSON 404 qaytaramiz.
    Routing o'zgartirilmaganligi uchun mavjud endpoint'larda
    noto'g'ri metodga 405 qaytish o'zgarishsiz saqlanadi.
    """

    async def get_response(self, path: str, scope):
        # Faqat o'qish metodlari uchun JSON 404. Boshqa metodlarda
        # super() chaqiriladi -> u 405 Method Not Allowed qaytaradi,
        # bu HTTP semantikasi to'g'ri (manzil bor, metod noto'g'ri).
        if scope.get("path", "").startswith("/api/") and scope.get("method") in ("GET", "HEAD"):
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"detail": "Topilmadi."},
            )
        return await super().get_response(path, scope)


app.include_router(api_router)

print(f"[INFO] FRONTEND_DIR: {FRONTEND_DIR} (exists: {FRONTEND_DIR.is_dir()})")

if FRONTEND_DIR.is_dir():
    # StaticFiles + html=True allaqachon 404.html faylini o'zi topadi,
    # shuning uchun alohida 404 route'ini qo'shish shart emas.
    app.mount("/", ApiAwareStaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
else:
    print(f"[WARNING] Frontend directory not found at {FRONTEND_DIR}")

    @app.exception_handler(404)
    async def not_found_handler(request: Request, exc: Exception):
        """Frontend papkasi topilmasa — zaxira JSON 404."""
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"detail": "Sahifa topilmadi."},
        )
