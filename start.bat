@echo off
title PACKSURE AI - Master Launcher
echo ========================================================
echo   PACKSURE AI - Statutory Legal Metrology AI Platform
echo ========================================================
echo.
echo [1/3] Starting Backend Server (FastAPI on Port 8000)...
start "PACKSURE AI - Backend (Port 8000)" cmd /k "cd /d %~dp0backend && python main.py"

echo [2/3] Starting Frontend Server (Vite on Port 5173)...
start "PACKSURE AI - Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo [3/3] Waiting for servers to initialize...
timeout /t 3 /nobreak >nul

echo.
echo Opening PACKSURE AI in your browser: http://localhost:5173/
start http://localhost:5173/

echo.
echo ========================================================
echo   Both services are now RUNNING!
echo   - Frontend: http://localhost:5173/
echo   - Backend API: http://127.0.0.1:8000/docs
echo.
echo   Keep the two background terminal windows open while working.
echo   To shut down, simply close both terminal windows or run stop.bat.
echo ========================================================
