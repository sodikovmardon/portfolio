# Mardon Sodiqov — Portfolio

"Liquid glass" uslubidagi shaxsiy portfolio sayt. Frontend va backend butunlay
alohida papkalarda, real ishlaydigan Bog'lanish formasi bilan.

```
project/
├── backend/     → FastAPI (Python) — Bog'lanish formasi API'si
├── frontend/    → Static sayt (HTML/CSS/JS) — dizayn va UI
└── docker-compose.yml
```

## Dizayn

- Fon: chuqur tungi ("deep space") gradient + sekin suzuvchi rangli "blob"lar
- Barcha panellar: frosted-glass (`backdrop-filter: blur`) effekti, yumaloq burchaklar
- Shrift: Sora (sarlavhalar), Inter (matn), JetBrains Mono (raqam/teglar)
- To'liq responsive, scroll'da paydo bo'luvchi animatsiyalar

## Tezkor ishga tushirish (Docker bilan — tavsiya etiladi)

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Swagger hujjatlari: http://localhost:8000/docs

## Docker'siz ishga tushirish

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Backend http://localhost:8000 manzilida ishga tushadi.

### Frontend

Frontend — oddiy statik fayllar, build kerak emas. Istalgan usulda oching:

```bash
cd frontend
python -m http.server 5500
```

Keyin brauzerda: http://localhost:5500

> Eslatma: `frontend/js/script.js` faylida `API_BASE` o'zgaruvchisi backend
> manzilini ko'rsatadi (standart: `http://localhost:8000`). Agar backend
> boshqa manzilda ishlasa, shu joyni o'zgartiring.

## API

| Method | Endpoint         | Tavsif                          |
|--------|------------------|----------------------------------|
| GET    | `/api/health`    | Server holatini tekshirish       |
| POST   | `/api/contact`   | Yangi xabar yuborish (forma)     |
| GET    | `/api/contact`   | So'nggi xabarlar ro'yxati        |

To'liq interaktiv hujjatlar: `/docs` (Swagger UI).

## Texnologiyalar

**Backend:** FastAPI, SQLAlchemy 2 (async), SQLite (production'da PostgreSQL'ga
oson o'zgartiriladi), Pydantic v2, CORS.

**Frontend:** Toza HTML/CSS/JS — hech qanday build vositasi shart emas,
istalgan statik hosting'ga (GitHub Pages, Netlify, Vercel) joylash mumkin.
