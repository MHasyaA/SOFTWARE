@echo off
title BMC Air Compressor Management System
color 0B
echo.
echo  =====================================================
echo  ^| BMC Air Compressor Management System v1.0       ^|
echo  =====================================================
echo.

:: Try port 8080, fallback to 3000
set PORT=8080

:: Check if node is installed
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo  ERROR: Node.js tidak terinstall!
  echo  Download dari https://nodejs.org
  pause
  exit /b 1
)

:: Check if express is installed
if not exist "node_modules\express" (
  echo  Menginstall dependencies...
  npm install
  echo.
)

echo  Menjalankan server di http://localhost:%PORT%
echo  Tekan Ctrl+C untuk menghentikan server
echo.
echo  Login Credentials:
echo    admin    / admin123   (Administrator)
echo    operator / operator1  (Operator)
echo    viewer   / viewer1    (Read Only)
echo.
echo  WebSocket Node-RED: ws://localhost:1880/ws/dashboard
echo.

:: Open browser after 1.5s
start "" timeout /t 2 /nobreak >nul && start http://localhost:%PORT%

:: Start server
set PORT=%PORT% && node server.js

pause
