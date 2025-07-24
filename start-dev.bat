@echo off
chcp 65001 > nul
title PDF-Tech HR System - Development Server
color 0B

echo.
echo ========================================
echo   PDF-Tech HR Management System
echo   Development Server
echo   ဖွံ့ဖြိုးတိုးတက်မှု ဆာဗာ
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo [INFO] Dependencies not found. Installing...
    npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
)

REM Check if .env file exists
if not exist ".env" (
    echo [WARNING] .env file not found!
    echo [INFO] Please run setup-windows.bat first or create .env file manually.
    echo [INFO] See LOCAL_SETUP_GUIDE.md for instructions.
    pause
    exit /b 1
)

echo [INFO] Starting development server...
echo [INFO] Application will be available at: http://localhost:5173/
echo [INFO] Press Ctrl+C to stop the server.
echo.
echo [INFO] Demo credentials:
echo   Admin: admin@pdf.gov.mm / admin123
echo   User:  user@pdf.gov.mm / user123
echo.

REM Start the development server
npm run dev

pause
