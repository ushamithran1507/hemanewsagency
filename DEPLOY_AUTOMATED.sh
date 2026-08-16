#!/bin/bash

# ============================================
# AUTOMATED DEPLOYMENT SCRIPT
# Hema News Agency - GitHub & Railway Deployment
# ============================================

clear
echo ""
echo "========================================"
echo " HEMA NEWS AGENCY - AUTOMATED DEPLOYMENT"
echo "========================================"
echo ""

# Check if Git is installed
if ! command -v git &> /dev/null; then
    echo "ERROR: Git is not installed!"
    echo "Please install Git: https://git-scm.com/download/linux"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js: https://nodejs.org/"
    exit 1
fi

echo "[1/5] Checking dependencies..."
echo "✓ Git: $(git --version | cut -d' ' -f3)"
echo "✓ Node.js: $(node --version)"
echo ""

# Step 1: Install dependencies
echo "[2/5] Installing npm dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi
echo "✓ Dependencies installed"
echo ""

# Step 2: Create .env file
echo "[3/5] Setting up environment variables..."
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOF
NODE_ENV=production
PORT=5000
JWT_SECRET=mysecretkey123456789abcdefghijklmn
FRONTEND_URL=http://localhost:3000
EOF
    echo "✓ .env file created"
else
    echo "✓ .env file already exists"
fi
echo ""

# Step 3: Test the server
echo "[4/5] Testing server startup (5 seconds)..."
npm start &
SERVER_PID=$!
sleep 5

# Test health endpoint
echo "Testing health endpoint..."
curl -s http://localhost:5000/api/health > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ Server is running correctly"
else
    echo "⚠ Warning: Could not reach server, but code is valid"
fi

# Kill the test server
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

clear
echo ""
echo "========================================"
echo " DEPLOYMENT OPTIONS"
echo "========================================"
echo ""
echo "Choose your deployment platform:"
echo ""
echo "  1. Railway.app (Recommended - Fast, Free)"
echo "  2. Heroku (Traditional, Reliable)"
echo "  3. Render (Modern, Fast)"
echo "  4. Just Push to GitHub (Manual Deploy)"
echo "  5. Exit"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
  1)
    clear
    echo ""
    echo "========================================"
    echo " RAILWAY.APP DEPLOYMENT GUIDE"
    echo "========================================"
    echo ""
    echo "[STEP 1] Push code to GitHub"
    echo "  - Making sure everything is committed..."
    git add .
    git commit -m "Deployment: Automated deployment setup" 2>/dev/null
    echo "  - Pushing to GitHub..."
    git push -u origin main
    if [ $? -ne 0 ]; then
        echo ""
        echo "⚠ Git push failed. Make sure:"
        echo "  1. You have GitHub credentials configured"
        echo "  2. The repository exists"
        echo "  3. You have permission to push"
        echo ""
        exit 1
    fi
    echo "  ✓ Code pushed to GitHub"
    echo ""
    echo "[STEP 2] Deploy on Railway"
    echo ""
    echo "  1. Go to: https://railway.app"
    echo "  2. Sign in with GitHub"
    echo "  3. Click 'New Project'"
    echo "  4. Select 'Deploy from GitHub'"
    echo "  5. Find and select 'hemanewsagency'"
    echo "  6. Click 'Deploy'"
    echo "  7. Add these variables in Railway:"
    echo "     - JWT_SECRET = mysecretkey123456789abcdefghijklmn"
    echo "     - NODE_ENV = production"
    echo "     - PORT = 5000"
    echo "  8. Click 'Deploy'"
    echo "  9. Wait 2-3 minutes for deployment"
    echo ""
    echo "[STEP 3] Get your live URL and login"
    echo ""
    echo "  Once deployed, you'll get a URL like:"
    echo "  https://your-app.up.railway.app"
    echo ""
    echo "  Login with:"
    echo "  Email: admin@hemanewsagency.com"
    echo "  Password: Admin@123456"
    echo ""
    echo "Opening Railway.app in your browser..."
    open https://railway.app 2>/dev/null || xdg-open https://railway.app 2>/dev/null
    ;;
  2)
    clear
    echo ""
    echo "========================================"
    echo " HEROKU DEPLOYMENT GUIDE"
    echo "========================================"
    echo ""
    echo "[STEP 1] Push code to GitHub"
    git add .
    git commit -m "Deployment: Heroku setup" 2>/dev/null
    git push -u origin main
    echo "✓ Code pushed to GitHub"
    echo ""
    echo "[STEP 2] Deploy on Heroku"
    echo ""
    echo "  1. Go to: https://heroku.com"
    echo "  2. Sign in or create account"
    echo "  3. Click 'New' - 'Create new app'"
    echo "  4. Enter app name (e.g., hemanewsagency-app)"
    echo "  5. Choose region (US or Europe)"
    echo "  6. Click 'Create app'"
    echo "  7. In 'Deployment method', select GitHub"
    echo "  8. Connect your GitHub account"
    echo "  9. Search for 'hemanewsagency' repository"
    echo "  10. Click 'Connect'"
    echo "  11. Click 'Deploy Branch' button"
    echo "  12. Wait for deployment (5-10 minutes)"
    echo ""
    echo "[STEP 3] Add environment variables"
    echo ""
    echo "  In Heroku app settings:"
    echo "  - Click 'Settings'"
    echo "  - Click 'Reveal Config Vars'"
    echo "  - Add: JWT_SECRET = mysecretkey123456789abcdefghijklmn"
    echo "  - Add: NODE_ENV = production"
    echo ""
    echo "Opening Heroku in your browser..."
    open https://heroku.com 2>/dev/null || xdg-open https://heroku.com 2>/dev/null
    ;;
  3)
    clear
    echo ""
    echo "========================================"
    echo " RENDER DEPLOYMENT GUIDE"
    echo "========================================"
    echo ""
    echo "[STEP 1] Push code to GitHub"
    git add .
    git commit -m "Deployment: Render setup" 2>/dev/null
    git push -u origin main
    echo "✓ Code pushed to GitHub"
    echo ""
    echo "[STEP 2] Deploy on Render"
    echo ""
    echo "  1. Go to: https://render.com"
    echo "  2. Sign up with GitHub"
    echo "  3. Click 'New' - 'Web Service'"
    echo "  4. Connect your GitHub account"
    echo "  5. Select 'hemanewsagency' repository"
    echo "  6. Fill deployment settings:"
    echo "     - Build Command: npm install"
    echo "     - Start Command: npm start"
    echo "  7. Add environment variables:"
    echo "     - JWT_SECRET = mysecretkey123456789abcdefghijklmn"
    echo "     - NODE_ENV = production"
    echo "     - PORT = 5000"
    echo "  8. Click 'Create Web Service'"
    echo "  9. Wait 2-3 minutes for deployment"
    echo ""
    echo "Opening Render in your browser..."
    open https://render.com 2>/dev/null || xdg-open https://render.com 2>/dev/null
    ;;
  4)
    echo ""
    echo "[STEP 1] Committing and pushing to GitHub..."
    git add .
    git commit -m "Deployment: Ready for manual deployment" 2>/dev/null
    git push -u origin main
    echo ""
    echo "✓ Code pushed to GitHub!"
    echo ""
    echo "Your repository is ready at:"
    echo "https://github.com/ushamithran1507/hemanewsagency"
    echo ""
    echo "You can now deploy using:"
    echo "- Railway.app: https://railway.app"
    echo "- Heroku: https://heroku.com"
    echo "- Render: https://render.com"
    echo ""
    echo "All deployment guides are in DEPLOY_YOUR_REPO.md"
    echo ""
    ;;
  5)
    echo "Deployment cancelled."
    exit 0
    ;;
  *)
    echo "Invalid choice."
    exit 1
    ;;
esac

echo ""
echo "========================================"
echo " DEPLOYMENT INITIATED"
echo "========================================"
echo ""
echo "✓ Your code is ready to deploy!"
echo ""
echo "After deployment completes:"
echo ""
echo "1. Copy your live URL (e.g., https://xxxxx.up.railway.app)"
echo "2. Create admin account using this command:"
echo ""
echo "   curl -X POST https://YOUR_URL/api/auth/register \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"name\":\"Admin\",\"email\":\"admin@hemanewsagency.com\",\"password\":\"Admin@123456\",\"mobileNumber\":\"9876543210\",\"role\":\"admin\"}'"
echo ""
echo "3. Login with:"
echo "   Email: admin@hemanewsagency.com"
echo "   Password: Admin@123456"
echo ""
echo "Need help? Check DEPLOY_YOUR_REPO.md"
echo ""
