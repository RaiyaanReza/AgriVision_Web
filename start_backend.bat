@echo off
cd /d "e:\CSE499 Prototype\backend"
"e:\CSE499 Prototype\backend\venv\Scripts\python.exe" -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
