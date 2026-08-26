#!/bin/bash
kill $(lsof -t -i:8000) 2>/dev/null
echo "✅ Backend to'xtatildi."
