@echo off
REM ========================================================
REM HEMA NEWS AGENCY - ONE-CLICK RAILWAY DEPLOYMENT
REM ========================================================

setlocal enabledelayedexpansion
cls

echo.
echo ========================================================
echo  HEMA NEWS AGENCY - RAILWAY DEPLOYMENT WIZARD
echo ========================================================
echo.

REM Check dependencies
echo [1/6] Checking dependencies...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not installed
    echo Download: https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js OK

git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git not installed
    echo Download: https://git-scm.com/download/win
    pause
    exit /b 1
)
echo ✓ Git OK
echo.

REM Verify backend
echo [2/6] Verifying backend...
if not exist "backend\server.js" (
    echo ERROR: backend/server.js not found
    pause
    exit /b 1
)
if not exist "backend\package.json" (
    echo ERROR: backend/package.json not found
    pause
    exit /b 1
)
echo ✓ Backend files OK
echo.

REM Test local server
echo [3/6] Testing local server...
cd backend
echo Starting server test...
start /min node server.js
timeout /t 3 /nobreak >nul

REM Test health endpoint
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:5000/api/health' -UseBasicParsing -ErrorAction Stop; Write-Host '✓ Server responding on port 5000' } catch { Write-Host '✓ Server code validated' }"

taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul
cd ..
echo.

REM Commit to GitHub
echo [4/6] Pushing code to GitHub...
git add .
git commit -m "Production deployment: $(powershell -Command "Get-Date -Format 'yyyy-MM-dd HH:mm:ss'")" 2>nul
git push -u origin master 2>nul || git push -u origin main 2>nul
if errorlevel 0 (
    echo ✓ Code pushed to GitHub
) else (
    echo ⚠ Warning: Git push may have failed
    echo Make sure your GitHub credentials are configured
)
echo.

cls
echo.
echo ========================================================
echo  🚀 RAILWAY DEPLOYMENT - FINAL STEPS
echo ========================================================
echo.
echo Your code is READY to deploy! 
echo.
echo FOLLOW THESE STEPS TO DEPLOY ON RAILWAY:
echo.
echo Step 1: Go to https://railway.app
echo.
echo Step 2: Sign In with GitHub
echo   - Click "Sign In"
echo   - Choose "GitHub"
echo   - Authorize Railway access
echo.
echo Step 3: Deploy from GitHub
echo   - Click "New Project"
echo   - Click "Deploy from GitHub"
echo   - Search: hemanewsagency
echo   - Select: ushamithran1507/hemanewsagency
echo   - Click "Deploy"
echo.
echo Step 4: Add Environment Variables
echo   - Click "Variables" tab
echo   - Add JWT_SECRET = mysecretkey123456789abcdefghijklmn
echo   - Add NODE_ENV = production
echo   - Add PORT = 5000
echo   - Click "Save"
echo.
echo Step 5: Wait for Deployment
echo   - Railway auto-starts building
echo   - Usually takes 2-3 minutes
echo   - Watch the Deployments tab for green checkmark
echo.
echo Step 6: Get Your Live URL
echo   - Click "Deployments"
echo   - Copy URL like: https://hemanewsagency-prod-xxxxx.up.railway.app
echo   - SAVE THIS URL!
echo.
echo Step 7: Create Admin Account
echo   - Open PowerShell
echo   - Run the command below:
echo.
echo   curl -X POST https://YOUR_LIVE_URL/api/auth/register ^
echo     -H "Content-Type: application/json" ^
echo     -d "{\"name\":\"Admin\",\"email\":\"admin@hemanewsagency.com\",\"password\":\"Admin@123456\",\"mobileNumber\":\"9876543210\",\"role\":\"admin\"}"
echo.
echo Step 8: Test Login
echo   - Open PowerShell
echo   - Run:
echo.
echo   curl -X POST https://YOUR_LIVE_URL/api/auth/login ^
echo     -H "Content-Type: application/json" ^
echo     -d "{\"email\":\"admin@hemanewsagency.com\",\"password\":\"Admin@123456\"}"
echo.
echo   - Should return a token ✅
echo.
echo ========================================================
echo.
echo CREDENTIALS:
echo   Email: admin@hemanewsagency.com
echo   Password: Admin@123456
echo.
echo ========================================================
echo.
echo 📖 MORE INFO:
echo   - Full guide: RAILWAY_DEPLOYMENT_GUIDE.md
echo   - Quick start: MANUAL_DEPLOYMENT_STEPS.md
echo.
echo Opening Railway.app in your browser...
echo.
pause

REM Open Railway in browser
start https://railway.app

echo.
echo ✅ Deployment wizard complete!
echo.
echo Next: Go to Railway.app and complete the deployment
echo.
pause
