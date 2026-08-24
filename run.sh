#!/bin/bash
trap 'kill $(jobs -p) 2>/dev/null; exit' SIGINT SIGTERM

cd "$(dirname "$0")/backend"
source .venv/bin/activate
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &
disown
BACKEND=$!

cd "$(dirname "$0")/frontend"
nohup python3 -m http.server 5500 > /tmp/frontend.log 2>&1 &
disown
FRONTEND=$!

sleep 2
echo ""
echo "✅ Ikkala xizmat ishga tushdi:"
echo "   Frontend:  http://localhost:5500"
echo "   Backend:   http://localhost:8000"
echo "   Swagger:   http://localhost:8000/docs"
echo ""
echo "Tekshirish:"
curl -s http://localhost:8000/ && echo ""
curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://localhost:5500/
echo ""
echo "To'xtatish uchun: bash /home/mardon/Загрузки/mardon-portfolio/project/stop.sh"
