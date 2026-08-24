#!/bin/bash
kill $(lsof -t -i:8000) $(lsof -t -i:5500) 2>/dev/null
echo "✅ Barcha xizmatlar to'xtatildi."
