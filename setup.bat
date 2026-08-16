@echo off
REM HEMA NEWS AGENCY - Quick Start Script for Windows
REM This script automates the setup process

setlocal enabledelayedexpansion

echo.
echo ╔═══════════════════════════════════════════╗
echo ║  HEMA NEWS AGENCY - Backend Setup         ║
echo ║  Newspaper Distribution Management System ║
echo ╚═══════════════════════════════════════════╝
echo.

REM Check Node.js installation
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from: https://nodejs.org
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION% found
echo.

REM Navigate to backend directory
cd backend 2>nul
if %errorlevel% neq 0 (
    echo ❌ Could not find backend directory
    pause
    exit /b 1
)

echo 📁 Working directory: %cd%
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ❌ npm install failed
    pause
    exit /b 1
)

echo ✅ Dependencies installed
echo.

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file...
    
    if exist .env.example (
        copy .env.example .env
        echo ✅ .env file created from .env.example
        echo.
        echo ⚠️  IMPORTANT: Edit .env file with your configuration:
        echo    - JWT_SECRET: Generate a random 32-character string
        echo    - GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET (optional for Google Drive)
        echo.
    ) else (
        echo ❌ .env.example not found
        pause
        exit /b 1
    )
) else (
    echo ✅ .env file already exists
)

REM Create data directory
if not exist data (
    echo 📂 Creating data directory...
    mkdir data
    echo ✅ Data directory created
)

echo.
echo ╔═══════════════════════════════════════════╗
echo ║         Setup Complete! ✅                ║
echo ╚═══════════════════════════════════════════╝
echo.
echo 📋 Next Steps:
echo.
echo 1. Configure Environment Variables:
echo    Edit: .env
echo    Set: JWT_SECRET=your_random_32_char_secret
echo.
echo 2. Start the Server:
echo    npm run dev        (Development with auto-reload)
echo    npm start          (Production mode)
echo.
echo 3. Verify Server is Running:
echo    Visit: http://localhost:5000/api/health
echo.
echo 4. Update Frontend:
echo    Set REACT_APP_API_URL=http://localhost:5000/api
echo.
echo 5. Create Admin User:
echo    See: SETUP_AND_DEPLOYMENT.md
echo.
echo 📚 Documentation:
echo    - README.md (API documentation)
echo    - SETUP_AND_DEPLOYMENT.md (Complete setup guide)
echo.
echo 🚀 Get started with:
echo    npm run dev
echo.
pause
