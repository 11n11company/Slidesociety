@echo off
cd /d "%~dp0"
echo ========================================================
echo Starting Slidescoiety Sim Racing Store (React + Vite)
echo URL: http://localhost:5500
echo ========================================================
start http://localhost:5500
call npm.cmd run dev
pause
