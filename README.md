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

## Render.com ga deploy qilish

### 1-qadam: GitHub repo'ni Render'ga ulash

1. https://dashboard.render.com ga kiring
2. **New** > **Web Service** ni bosing
3. GitHub'dan `sodikovmardon/portfolio` repo'ni tanlang
4. Quyidagilarni kiriting:
   - **Name:** `mardon-portfolio`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free

### 2-qadam: Muhit o'zgaruvchilarini qo'shish

Render dashboard'da **Environment** bo'limiga quyidagilarni kiriting:

| Kalit | Qiymat | Izoh |
|-------|--------|------|
| `ENVIRONMENT` | `production` | Muhit turi |
| `DATABASE_URL` | `sqlite+aiosqlite:///./portfolio.db` | Hozircha SQLite |
| `ALLOWED_ORIGINS` | `https://mardon-portfolio.onrender.com` | CORS uchun |

> **Muhim:** `ALLOWED_ORIGINS` qiymatini deploy bo'lgandan keyin o'zgartiring —
> haqiqiy Render manzilingiz ko'rinishida bo'lishi kerak.

### 3-qadam: PostgreSQL ga o'tish (ixtiyoriy, lekin tavsiya etiladi)

Render'ning bepul PostgreSQL xizmatidan foydalanishingiz mumkin:

1. Dashboard'da **New** > **PostgreSQL** bosing
2. Bepul rejani tanlang
3. yaratilgan DATABASE_URL ni Web Service env vars'iga qo'shing:
   ```
   DATABASE_URL=postgresql+asyncpg://user:password@host:5432/dbname
   ```
4. `requirements.txt` ga `asyncpg` qo'shing:
   ```
   pip install asyncpg
   ```

> **Diqqat:** Render bepul rejasida SQLite fayli doimiy saqlanmaydi.
> Har safar qayta deploy yoki restart bo'lganda Bog'lanish xabarlari yo'qoladi.
> Doimiy saqlash uchun PostgreSQL ishlating.

### Free plan cheklovlari

- Sayt 15 daqiqa foydalanilmasa "uxlab qoladi" (cold start)
- Birinchi so'rov 30-50 soniya sekin ochilishi mumkin
- Render uni qayta ishga tushirgandan keyin yana tez ishlaydi

### Blueprint (avtomatik setup)

Agar `render.yaml` fayli repo'ning ildizida bo'lsa, Render uni avtomatik aniqlaydi
va Blueprint orqali avtomatik sozlaydi. Bunda yuqoridagi qo'lda kirish kerak emas.
