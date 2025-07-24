@echo off
chcp 65001 > nul
title PDF-Tech HR System - Windows Setup
color 0A

echo.
echo ========================================
echo   PDF-Tech HR Management System
echo   Windows Setup Script
echo   အစိုးရ ဝန်ထမ်းစီမံခန့်ခွဲမှုစနစ်
echo ========================================
echo.

REM Check if Node.js is installed
echo [INFO] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo [INFO] Please install Node.js from: https://nodejs.org/
    echo [INFO] Choose LTS version and restart this script.
    pause
    exit /b 1
) else (
    echo [SUCCESS] Node.js is installed:
    node --version
)

REM Check if npm is available
echo [INFO] Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not available!
    echo [INFO] Please reinstall Node.js with npm included.
    pause
    exit /b 1
) else (
    echo [SUCCESS] npm is installed:
    npm --version
)

echo.
echo [INFO] Installing project dependencies...
echo [INFO] This may take 2-5 minutes depending on internet speed...
echo.

REM Install dependencies
npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies!
    echo [INFO] Try running: npm install --force
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Dependencies installed successfully!

REM Check if .env file exists
if not exist ".env" (
    echo.
    echo [INFO] Creating .env file from template...
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo [SUCCESS] .env file created from template.
    ) else (
        echo [INFO] Creating basic .env file...
        (
            echo # Firebase Configuration
            echo VITE_FIREBASE_API_KEY=your_firebase_api_key_here
            echo VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
            echo VITE_FIREBASE_PROJECT_ID=your_project_id
            echo VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
            echo VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
            echo VITE_FIREBASE_APP_ID=your_app_id
            echo.
            echo # Development Settings
            echo NODE_ENV=development
            echo VITE_APP_VERSION=1.0.0
        ) > .env
        echo [SUCCESS] Basic .env file created.
    )
    echo.
    echo [IMPORTANT] Please edit .env file with your Firebase configuration!
    echo [INFO] You can find Firebase config at: https://console.firebase.google.com/
    echo.
) else (
    echo [INFO] .env file already exists.
)

echo.
echo ========================================
echo   Setup Complete! / ပြင်ဆင်မှု ပြီးပါပြီ!
echo ========================================
echo.
echo [INFO] To start the application:
echo   1. Edit .env file with Firebase configuration
echo   2. Run: npm run dev
echo   3. Open: http://localhost:5173/
echo.
echo [INFO] Demo login credentials:
echo   Admin: admin@pdf.gov.mm / admin123
echo   User:  user@pdf.gov.mm / user123
echo.
echo [INFO] For detailed setup guide, see: LOCAL_SETUP_GUIDE.md
echo.

REM Ask if user wants to start the dev server
set /p choice="Do you want to start the development server now? (y/n): "
if /i "%choice%"=="y" (
    echo.
    echo [INFO] Starting development server...
    echo [INFO] Application will be available at: http://localhost:5173/
    echo [INFO] Press Ctrl+C to stop the server.
    echo.
    npm run dev
) else (
    echo.
    echo [INFO] Setup complete! Run 'npm run dev' when ready to start.
)

pause
