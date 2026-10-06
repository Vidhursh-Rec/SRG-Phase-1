@echo off
title SRG Support Bot Launcher

echo ==========================================
echo        Starting SRG Support Bot
echo ==========================================

:: Start FastAPI backend
start "SRG Backend" cmd /k "cd /d C:\Users\mgvin\Desktop\SRG_Phase_1\backend && uvicorn main:app --reload"

:: Start n8n
start "n8n" cmd /k "n8n start"

:: Start frontend server from project root
start "SRG Frontend" cmd /k "cd /d C:\Users\mgvin\Desktop\SRG_Phase_1 && py -m http.server 5501"

:: Wait for frontend
timeout /t 3 /nobreak >nul

:: Open chatbot
start "" "http://127.0.0.1:5501/LOGIN/login.html"

echo.
echo SRG services are starting...
echo Backend:  http://127.0.0.1:8000
echo n8n:      http://localhost:5678
echo Frontend: http://127.0.0.1:5501/LOGIN/login.html
echo.
pause