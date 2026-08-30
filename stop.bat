@echo off
title PACKSURE AI - Stop Services
echo ========================================================
echo   Stopping PACKSURE AI Services...
echo ========================================================
echo.
echo Stopping process on Port 8000 (Backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a 2>nul
)

echo Stopping process on Port 5173 (Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a 2>nul
)

echo.
echo All PACKSURE AI servers have been stopped.
echo ========================================================
pause
