# Mardon Sodiqov — Portfolio

"Liquid glass" uslubidagi shaxsiy portfolio sayt. Backend va frontend bir
portda (8000) ishlaydi — FastAPI orqali API va statik fayllar xizmat qilinadi.

```
project/
├── backend/     → FastAPI (Python) — API + statik fayllarni serve qiladi
├── frontend/    → Static sayt (HTML/CSS/JS) — dizayn va UI
├── Dockerfile
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

- Sayt + API: http://localhost:8000
- Swagger hujjatlari: http://localhost:8000/docs

## Docker'siz ishga tushirish

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Brauzerda oching: http://localhost:8000

Backend orqali statik fayllar (HTML/CSS/JS) ham serve qilinadi — alohida
http-server yoki boshqa port kerak emas.

## API

| Method | Endpoint         | Tavsif                          |
|--------|------------------|----------------------------------|
| GET    | `/api/health`    | Server holatini tekshirish       |
| POST   | `/api/contact`   | Yangi xabar yuborish (forma)     |
| GET    | `/api/contact`   | So'nggi xabarlar ro'yxati        |

To'liq interaktiv hujjatlar: `/docs` (Swagger UI).

## Texnologiyalar

**Backend:** FastAPI, SQLAlchemy 2 (async), SQLite (production'da PostgreSQL'ga
oson o'zgartiriladi), Pydantic v2, StaticFiles.

**Frontend:** Toza HTML/CSS/JS — hech qanday build vositasi shart emas.
