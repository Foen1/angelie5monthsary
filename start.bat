@echo off
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is needed to run the page editor. Install Node.js, then open this file again.
  pause
  exit /b 1
)
start "Angelie's page server" cmd /k "cd /d ""%~dp0"" && node server.js"
timeout /t 2 /nobreak >nul
start "" "http://localhost:4173"
