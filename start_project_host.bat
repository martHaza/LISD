@echo off
cd /d "%~dp0backend"
start cmd /k "node server.js"

cd /d "%~dp0frontend"
start cmd /k "npm run dev -- --host"

start chrome https://localhost:5173/
