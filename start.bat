@echo off
chcp 65001 >nul
echo ==============================================
echo          Project Auto Start
echo ==============================================

echo Starting Backend Server...
start "Backend" cmd /k "cd /d D:\traeproject\intro\backend && node src/app.js"

echo Waiting 10 seconds for backend to load...
timeout /t 10 /nobreak >nul

echo Starting Frontend Server...
start "Frontend" cmd /k "cd /d D:\traeproject\intro\frontend && npm run dev"

echo All servers started!
pause >nul