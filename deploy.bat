@echo off
REM HEMA NEWS AGENCY - ONLINE DEPLOYMENT HELPER (WINDOWS)

setlocal enabledelayedexpansion

cls
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║   HEMA NEWS AGENCY - ONLINE DEPLOYMENT HELPER (WINDOWS)       ║
echo ║   Choose your deployment platform                            ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo Select deployment platform:
echo.
echo 1) Heroku (Easiest - 5 minutes)
echo 2) DigitalOcean (Best value - $5/month)
echo 3) AWS EC2 (Most powerful)
echo 4) Railway (Modern and simple)
echo 5) Docker (Local/Any cloud)
echo 6) Exit
echo.
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto heroku
if "%choice%"=="2" goto digitalocean
if "%choice%"=="3" goto aws
if "%choice%"=="4" goto railway
if "%choice%"=="5" goto docker
if "%choice%"=="6" goto exit
goto invalid

:heroku
cls
echo.
echo ═══════════════════════════════════════════════════════════════
echo HEROKU DEPLOYMENT
echo ═══════════════════════════════════════════════════════════════
echo.

REM Check if Heroku CLI is installed
heroku --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Heroku CLI not found.
    echo Installing via npm...
    npm install -g heroku
)

echo ✅ Heroku CLI is installed
echo.
set /p app_name="Enter your Heroku app name (e.g., hema-news-agency): "
echo.
echo Opening Heroku login...
heroku login

echo.
echo Creating Heroku app: %app_name%
heroku create %app_name%

echo.
echo Generating JWT secret...
for /f "delims=" %%A in ('node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"') do set jwt_secret=%%A
echo JWT Secret: %jwt_secret%

echo.
echo Setting environment variables...
heroku config:set JWT_SECRET=%jwt_secret%
heroku config:set NODE_ENV=production
heroku config:set PORT=5000

echo.
echo Initializing Git repository...
git init
git add .
git commit -m "Initial deployment"

echo.
echo Creating Procfile...
(
    echo web: cd backend ^&^& node server.js
) > Procfile
git add Procfile
git commit -m "Add Procfile"

echo.
echo Deploying to Heroku...
git push heroku main

echo.
echo ✅ Deployment complete!
echo Your app is live at: https://%app_name%.herokuapp.com
echo.
echo Test it with:
echo curl https://%app_name%.herokuapp.com/api/health
echo.
pause
goto menu

:digitalocean
cls
echo.
echo ═══════════════════════════════════════════════════════════════
echo DIGITALOCEAN DEPLOYMENT
echo ═══════════════════════════════════════════════════════════════
echo.
echo Steps:
echo 1. Go to DigitalOcean.com
echo 2. Create ^-^> Droplets
echo 3. Choose: Ubuntu 20.04 LTS
echo 4. Size: Basic ($5/month)
echo 5. Add your SSH key
echo 6. Create Droplet
echo.
set /p droplet_ip="Enter your Droplet IP address: "
echo.
echo Run these commands on the droplet:
echo.
echo apt update ^&^& apt upgrade -y
echo curl -fsSL https://deb.nodesource.com/setup_16.x ^| sudo bash -
echo apt install -y nodejs git pm2 nginx certbot python3-certbot-nginx
echo.
echo git clone YOUR_REPO_URL
echo cd hema-news-agency/backend
echo npm install
echo cp .env.example .env
echo nano .env  # Edit and add JWT_SECRET
echo.
echo pm2 start server.js --name 'hema'
echo pm2 startup
echo pm2 save
echo.
echo Then setup Nginx and SSL...
echo.
echo Visit: ONLINE_DEPLOYMENT.md for detailed instructions
echo.
pause
goto menu

:aws
cls
echo.
echo ═══════════════════════════════════════════════════════════════
echo AWS EC2 DEPLOYMENT
echo ═══════════════════════════════════════════════════════════════
echo.
echo Steps:
echo 1. Go to AWS.amazon.com
echo 2. EC2 ^-^> Instances ^-^> Launch Instance
echo 3. Choose Ubuntu 20.04 LTS
echo 4. Select t2.micro (free tier)
echo 5. Add security group rules (80, 443, 5000)
echo 6. Create key pair and download .pem file
echo.
echo After instance is running:
echo 1. Use PuTTY or SSH to connect
echo 2. Follow commands in ONLINE_DEPLOYMENT.md
echo.
echo Visit: ONLINE_DEPLOYMENT.md for detailed instructions
echo.
pause
goto menu

:railway
cls
echo.
echo ═══════════════════════════════════════════════════════════════
echo RAILWAY DEPLOYMENT
echo ═══════════════════════════════════════════════════════════════
echo.
echo Steps:
echo 1. Go to railway.app
echo 2. Sign up with GitHub
echo 3. Create new project
echo 4. Deploy from GitHub
echo 5. Select your repository
echo 6. Add environment variables:
echo    - JWT_SECRET (generate random 32 chars)
echo    - NODE_ENV=production
echo    - PORT=5000
echo 7. Deploy!
echo.
echo Then point your domain:
echo 1. Go to project Settings
echo 2. Click Domains
echo 3. Add custom domain
echo.
echo Opening railway.app...
start https://railway.app
echo.
pause
goto menu

:docker
cls
echo.
echo ═══════════════════════════════════════════════════════════════
echo DOCKER DEPLOYMENT
echo ═══════════════════════════════════════════════════════════════
echo.
echo Creating Dockerfile...

(
    echo FROM node:16-alpine
    echo.
    echo WORKDIR /app
    echo COPY backend/package*.json ./
    echo RUN npm install --production
    echo.
    echo COPY backend .
    echo.
    echo EXPOSE 5000
    echo CMD ["node", "server.js"]
) > Dockerfile

echo ✅ Dockerfile created
echo.
echo Build Docker image:
echo docker build -t hema-news .
echo.
echo Run container:
echo docker run -p 5000:5000 ^
echo   -e JWT_SECRET="your_secret_here" ^
echo   hema-news
echo.
echo Deploy to cloud (Docker Hub, AWS ECR, etc.^):
echo 1. Build image
echo 2. Tag image: docker tag hema-news your-registry/hema-news
echo 3. Push: docker push your-registry/hema-news
echo 4. Deploy on any Docker-capable platform
echo.
pause
goto menu

:invalid
cls
echo Invalid choice. Please select 1-6.
pause
goto menu

:menu
cls
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║   DEPLOYMENT HELPER                                          ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo 1) Heroku
echo 2) DigitalOcean
echo 3) AWS EC2
echo 4) Railway
echo 5) Docker
echo 6) Exit
echo.
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto heroku
if "%choice%"=="2" goto digitalocean
if "%choice%"=="3" goto aws
if "%choice%"=="4" goto railway
if "%choice%"=="5" goto docker
if "%choice%"=="6" goto exit
goto invalid

:exit
cls
echo.
echo ═══════════════════════════════════════════════════════════════
echo Need help? Check these files:
echo - QUICK_ONLINE_DEPLOYMENT.md (quick start)
echo - ONLINE_DEPLOYMENT.md (detailed guide)
echo - SETUP_AND_DEPLOYMENT.md (complete setup)
echo ═══════════════════════════════════════════════════════════════
echo.
echo Your newspaper distribution system is ready to deploy!
echo.
pause
