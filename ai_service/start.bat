@echo off
echo ============================================
echo  CampusAI Python NLP Service  v2.0
echo  Port: 8001
echo ============================================
cd /d "%~dp0"
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
