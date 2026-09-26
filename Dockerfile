# Multi-stage emas, oddiy single-stage image: loyiha kichik va
# runtime'da hech narsa kompilyatsiya qilinmaydi.
FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/backend

# Avval faqat dependency fayllari — qatlam keshi uchun
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Keyin kod. Bu tartib layer keshini samarali qiladi.
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# SQLite fayli runtime'da yaratilishi mumkin — fayl owner root
RUN mkdir -p /app/backend/data

EXPOSE 8000

# HEALTHCHECK — docker-compose "healthy" holatini kuzatishi uchun
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://localhost:8000/api/health',timeout=4).status==200 else 1)"

# WORKDIR /app/backend bo'lishi kerak: ilova ichki importlari
# "app.*" ko'rinishida yozilgan (masalan `from app.api import ...`),
# ya'ni ular backend/ papkasiga nisbatan absolyut.
WORKDIR /app/backend

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
