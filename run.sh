#!/bin/bash
trap 'kill $(jobs -p) 2>/dev/null; exit' SIGINT SIGTERM

cd "$(dirname "$0")/backend"
source .venv/bin/activate
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &
disown
BACKEND=$!

sleep 2
echo ""
echo "✅ Backend ishga tushdi:"
echo "   Sayt + API:  http://localhost:8000"
echo "   Swagger:     http://localhost:8000/docs"
echo ""
curl -s http://localhost:8000/api/health && echo ""
echo ""
echo "To'xtatish uchun: bash $(dirname "$0")/stop.sh"
