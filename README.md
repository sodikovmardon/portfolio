<div align="center">

# Mardon Sodiqov — Portfolio

**FastAPI + vanilla JS portfolio — bitta portda frontend va backend**

[![CI](https://github.com/sodikovmardon/portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/sodikovmardon/portfolio/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/tests-66%20passing-22c55e)](https://github.com/sodikovmardon/portfolio/actions/workflows/ci.yml)
[![Python](https://img.shields.io/badge/python-3.12-3776ab?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.6-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-71b5a0)](https://www.sqlalchemy.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Code style: ruff](https://img.shields.io/badge/code%20style-ruff-261230)](https://docs.astral.sh/ruff/)

</div>

---

## Nima uchun bu loyiha

Ushbu loyiha mening backend ishlab chiqish ko'nikmalarimni amalda ko'rsatish uchun
qurilgan: xabarlarni qabul qiluvchi REST API, asinxron SQLAlchemy, Pydantic bilan
qat'iy validatsiya, in-memory rate limiting va xavfsizlik header'lari. Frontend
qismi esa maxsus kutubxonalarsiz — sof HTML, CSS va JavaScript — yozilgan, shuning
uchun sayt build bosqichisiz, to'g'ridan-to'g'ri ishlaydi.

Loyiha **bitta portda** ishlaydi: FastAPI ham API'ni, ham statik frontend fayllarini
bir xil manzildan beradi. Alohida frontend serveri yoki Node.js build pipeline yo'q.

> **Holat:** Bu mening ochiq kodli portfolio loyiham. Ma'lumotlar (ish tajribasi,
> muddatlar, sertifikatlar) mening haqiqiy faoliyatimga asoslangan.

---

## Texnologiyalar

### Backend

| Texnologiya | Versiya | Vazifasi |
|---|---|---|
| Python | 3.12 | Asosiy til |
| FastAPI | 0.115.6 | REST API, avtomatik Swaggerdocs (`/docs`) |
| Uvicorn | 0.32.1 | ASGI server |
| SQLAlchemy | 2.0.36 | ORM (async rejimda) |
| aiosqlite | 0.20.0 | Asinxron SQLite driver |
| Pydantic | 2.10.3 | Sozlamalar va sxemalar, validatsiya |
| pydantic-settings | 2.7.0 | `.env` dan sozlamalarni o'qish |
| email-validator | 2.2.0 | `EmailStr` maydoni uchun RFC tekshiruvi |
| python-dotenv | 1.0.1 | `.env` faylni yuklash |

> PostgreSQL'ga o'tish uchun `DATABASE_URL` ni almashtirish yetarli
> (`postgresql+asyncpg://...`) — kod boshqacha emas.

### Frontend

| Texnologiya | Vazifasi |
|---|---|
| HTML5 | Semantik markup, `schema.org` JSON-LD |
| CSS3 | Custom properties, `clamp()`, `backdrop-filter`, container-friendly layout |
| Vanilla JavaScript | Til almashtirish, tema, scroll-spy, lightbox |
| Google Fonts | Sora (sarlavha), Inter (matn), JetBrains Mono (kod) |

**Build step yo'q.** `package.json`, `node_modules` va bundler talab qilinmaydi.

### Test va sifat nazorati

| Vosita | Versiya | Vazifasi |
|---|---|---|
| pytest | 9.1.1 | 66 ta test |
| httpx | 0.28.1 | `TestClient` orqali so'rov yuborish |
| ruff | 0.16.9 | Linter + format checker |
| GitHub Actions | — | Har push/PR da avtomatik test |

---

## Loyiha strukturasi

```
mardon-portfolio/
├── backend/
│   ├── app/
│   │   ├── main.py              # Kirish nuqtasi, middleware, statik mount
│   │   ├── api/
│   │   │   └── contact.py       # /api/contact endpoint'lari
│   │   ├── core/
│   │   │   ├── config.py        # Pydantic Settings (.env)
│   │   │   ├── database.py      # Async engine, session, get_db
│   │   │   └── rate_limit.py    # In-memory sliding-window limiter
│   │   ├── models/contact.py    # SQLAlchemy model
│   │   ├── schemas/contact.py   # Pydantic sxemalar
│   │   └── services/
│   │       └── contact_service.py
│   ├── tests/                   # 66 ta pytest test
│   │   ├── conftest.py          # Izolyatsiyalangan test bazasi
│   │   ├── test_health.py
│   │   ├── test_contact.py
│   │   └── test_app.py          # header'lar, 404, SEO, config
│   ├── requirements.txt
│   ├── requirements-dev.txt     # + pytest, httpx, ruff
│   ├── ruff.toml
│   ├── pytest.ini
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── index.html
│   ├── 404.html                 # Maxsus 404 sahifasi
│   ├── sitemap.xml
│   ├── robots.txt
│   ├── css/style.css
│   ├── js/
│   │   ├── script.js
│   │   └── translations.js      # UZ / RU / EN
│   └── assets/                  # Rasmlar, favicon, CV, OG-image
├── .github/workflows/ci.yml
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── render.yaml
├── run.sh / stop.sh
├── LICENSE
└── README.md
```

---

## O'rnatish va ishga tushirish

### 1-usul: Docker bilan (tavsiya etiladi)

```bash
git clone https://github.com/sodikovmardon/portfolio.git
cd mardon-portfolio
docker compose up --build
```

Sayt: <http://localhost:8000> · Swagger: <http://localhost:8000/docs>

To'xtatish: `Ctrl+C` · To'liq tozalash: `docker compose down -v`

### 2-usul: Docker'siz (Python 3.12+)

```bash
git clone https://github.com/sodikovmardon/portfolio.git
cd mardon-portfolio

# Virtual muhit
python3 -m venv backend/.venv
source backend/.venv/bin/activate        # Windows: backend\.venv\Scripts\activate

# Dependency'lar
pip install -r backend/requirements-dev.txt

# Sozlamalar
cp backend/.env.example backend/.env

# Ishga tushirish
bash run.sh
```

Yoki qo'lda:

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

To'xtatish: `bash stop.sh`

> Ilova ishga tushganda jadvallar avtomatik yaratiladi
> (`init_db` → `Base.metadata.create_all`). Qo'lda `portfolio.db`
> yaratish shart emas.

### 3-usul: Faqat testlarni ishga tushirish

```bash
cd backend
source .venv/bin/activate
pip install -r requirements-dev.txt

pytest              # 66 ta test
ruff check app tests
ruff format --check app tests
```

> **Testlar real ma'lumotlar bazasiga tegmaydi.** `conftest.py` `DATABASE_URL` ni
> vaqtinchalik `_pytest_test.db` fayliga qayta yo'naltiradi va sessiya
> tugagach uni o'chiradi. Har bir testdan oldin jadval tozalanadi va
> rate limiter reset qilinadi.

---

## API

Barcha endpoint'lar `/api` prefiksi ostida. To'liq interaktiv hujjat:
**<http://localhost:8000/docs>**

| Metod | Endpoint | Tavsif | Kod |
|---|---|---|---|
| `GET` | `/api/health` | Ilova holatini tekshirish | `200` |
| `POST` | `/api/contact` | Yangi xabar yaratish | `201` |
| `GET` | `/api/contact` | Xabarlar ro'yxati (`?limit=`, standart 50) | `200` |

### `POST /api/contact` — so'rov tanasi

```json
{
  "name": "Aziz Karimov",
  "email": "aziz@example.com",
  "message": "Salom! Loyiha haqida qisqa savolim bor."
}
```

**Qoidalar:** `name` 2–120 belgi · `email` RFC-valid · `message` 5–3000 belgi

**Muvaffaqiyatli javob (`201`):**

```json
{
  "success": true,
  "detail": "Xabaringiz muvaffaqiyatli yuborildi.",
  "data": {
    "id": 1,
    "name": "Aziz Karimov",
    "email": "aziz@example.com",
    "message": "Salom! Loyiha haqida qisqa savolim bor.",
    "created_at": "2026-09-26T12:00:00Z"
  }
}
```

**Xatolar:**

| Kod | Sabab |
|---|---|
| `422` | Validatsiya xatosi (noto'g'ri email, bo'sh maydon, uzunlik chegarasi) |
| `429` | Rate limit: 1 daqiqada 3 tadan ortiq xabar |
| `500` | Server xatosi (ichki tafsilot foydalanuvchiga ko'rsatilmaydi) |

### Misol so'rov

```bash
curl -X POST http://localhost:8000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Aziz Karimov","email":"aziz@example.com","message":"Salom!"}'

curl http://localhost:8000/api/health
```

---

## Xavfsizlik

| Chora | Ta'sir ko'rsatadigan joy |
|---|---|
| `X-Content-Type-Options: nosniff` | MIME-sniffing'dan himoya |
| `X-Frame-Options: DENY` | Clickjacking'dan himoya |
| `Referrer-Policy: strict-origin-when-cross-origin` | Manzil oshkor qilinmasligi |
| CORS `allow_origins` | Faqat `.env` dagi ro'yxatdan |
| In-memory rate limiting | 1 email / daqiqada 3 ta xabar |
| Pydantic validatsiya | SQL injection o'rniga — sxema tekshiruvi |
| Umumiy xato handler'i | Stack trace va DB xatolari foydalanuvchiga chiqmaydi |
| `.env` `.gitignore` da | Maxfiy kalitlar tarihga tushmaydi |

> Ichki xatolar to'liq `logging` orqali server loglariga yoziladi
> (`logger.exception`), foydalanuvchiga esa faqat umumiy xabar qaytariladi.

---

## CI/CD

`.github/workflows/ci.yml` — `main` branch'ga har bir push va PR da ishga tushadi:

1. Python 3.12 o'rnatish (pip cache bilan)
2. `requirements-dev.txt` dan dependency o'rnatish
3. `ruff check` + `ruff format --check`
4. `pytest -v`

Workflow yashil bo'lsa, README'dagi **CI** badge yonishadi.

---

## SEO va topiluvchanlik

- `frontend/sitemap.xml` — 10 ta manzil (bosh sahifa + 9 bo'lim anchorlari)
- `frontend/robots.txt` — indekslashga ruxsat, `/api/` bloklangan
- `index.html`: `title`, `description`, `canonical`, Open Graph, Twitter Card
- `schema.org` JSON-LD (`@type: Person`) — til, ma'lumot, sertifikatlar
- `frontend/404.html` — dizayn tiliga mos maxsus sahifa, `noindex`
- `assets/og-image.png` — ijtimoiy tarmoqlar uchun

> **Diqqat:** Domen `SITE_URL` da belgilangan. Agar boshqa domen ishlatilsa,
> `backend/.env`, `frontend/sitemap.xml`, `frontend/robots.txt` va `index.html`
> dagi `canonical` / `og:url` qiymatlarini yangilash kerak.

---

## Litsenziya

MIT — [LICENSE](LICENSE) faylini ko'ring.

```
Copyright (c) 2026 Mardon Sodiqov
```

---

## Aloqa

- **GitHub** — <https://github.com/sodikovmardon>
- **Telegram** — <https://t.me/mardonsodikov>
- **Email** — mardonsodikov1@gmail.com
