#!/bin/bash

# HEMA NEWS AGENCY - ONLINE DEPLOYMENT HELPER
# This script helps you deploy to various platforms

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║   HEMA NEWS AGENCY - ONLINE DEPLOYMENT HELPER                ║"
echo "║   Choose your deployment platform                            ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

echo "Select deployment platform:"
echo ""
echo "1) Heroku (Easiest - 5 minutes)"
echo "2) DigitalOcean (Best value - \$5/month)"
echo "3) AWS EC2 (Most powerful)"
echo "4) Railway (Modern & simple)"
echo "5) Docker (Local/Any cloud)"
echo "6) Exit"
echo ""
read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        echo ""
        echo "═══════════════════════════════════════════════════════════════"
        echo "HEROKU DEPLOYMENT"
        echo "═══════════════════════════════════════════════════════════════"
        echo ""
        
        # Check if Heroku CLI is installed
        if ! command -v heroku &> /dev/null; then
            echo "❌ Heroku CLI not found. Installing..."
            npm install -g heroku
        fi
        
        echo "✅ Heroku CLI is installed"
        echo ""
        read -p "Enter your Heroku app name (e.g., hema-news-agency): " app_name
        echo ""
        echo "Opening Heroku login..."
        heroku login
        
        echo ""
        echo "Creating Heroku app: $app_name"
        heroku create $app_name
        
        echo ""
        echo "Generating JWT secret..."
        jwt_secret=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
        echo "JWT Secret: $jwt_secret"
        
        echo ""
        echo "Setting environment variables..."
        heroku config:set JWT_SECRET=$jwt_secret
        heroku config:set NODE_ENV=production
        heroku config:set PORT=5000
        
        echo ""
        echo "Initializing Git repository..."
        git init
        git add .
        git commit -m "Initial deployment"
        
        echo ""
        echo "Creating Procfile..."
        echo "web: cd backend && node server.js" > Procfile
        git add Procfile
        git commit -m "Add Procfile"
        
        echo ""
        echo "Deploying to Heroku..."
        git push heroku main
        
        echo ""
        echo "✅ Deployment complete!"
        echo "Your app is live at: https://$app_name.herokuapp.com"
        echo ""
        echo "Test it with:"
        echo "curl https://$app_name.herokuapp.com/api/health"
        ;;
        
    2)
        echo ""
        echo "═══════════════════════════════════════════════════════════════"
        echo "DIGITALOCEAN DEPLOYMENT"
        echo "═══════════════════════════════════════════════════════════════"
        echo ""
        echo "Steps:"
        echo "1. Go to DigitalOcean.com"
        echo "2. Create → Droplets"
        echo "3. Choose: Ubuntu 20.04 LTS"
        echo "4. Size: Basic (\$5/month)"
        echo "5. Add your SSH key"
        echo "6. Create Droplet"
        echo ""
        read -p "Enter your Droplet IP address: " droplet_ip
        echo ""
        read -p "Enter path to your SSH key (e.g., ~/.ssh/id_rsa): " ssh_key
        
        echo ""
        echo "Connecting to droplet..."
        echo ""
        echo "Run these commands on the droplet:"
        echo ""
        echo "apt update && apt upgrade -y"
        echo "curl -fsSL https://deb.nodesource.com/setup_16.x | sudo bash -"
        echo "apt install -y nodejs git pm2 nginx certbot python3-certbot-nginx"
        echo ""
        echo "git clone YOUR_REPO_URL"
        echo "cd hema-news-agency/backend"
        echo "npm install"
        echo "cp .env.example .env"
        echo "nano .env  # Edit and add JWT_SECRET"
        echo ""
        echo "pm2 start server.js --name 'hema'"
        echo "pm2 startup"
        echo "pm2 save"
        echo ""
        echo "Then setup Nginx and SSL..."
        echo ""
        ssh -i $ssh_key root@$droplet_ip
        ;;
        
    3)
        echo ""
        echo "═══════════════════════════════════════════════════════════════"
        echo "AWS EC2 DEPLOYMENT"
        echo "═══════════════════════════════════════════════════════════════"
        echo ""
        echo "Steps:"
        echo "1. Go to AWS.amazon.com"
        echo "2. EC2 → Instances → Launch"
        echo "3. Choose Ubuntu 20.04 LTS"
        echo "4. Select t2.micro (free tier)"
        echo "5. Add security group rules (80, 443, 5000)"
        echo "6. Create key pair and download .pem file"
        echo ""
        read -p "Enter your EC2 public IP: " ec2_ip
        echo ""
        read -p "Enter path to your .pem key file: " pem_key
        
        echo ""
        echo "Connecting to EC2 instance..."
        ssh -i $pem_key ubuntu@$ec2_ip
        ;;
        
    4)
        echo ""
        echo "═══════════════════════════════════════════════════════════════"
        echo "RAILWAY DEPLOYMENT"
        echo "═══════════════════════════════════════════════════════════════"
        echo ""
        echo "Steps:"
        echo "1. Go to railway.app"
        echo "2. Sign up with GitHub"
        echo "3. Create new project"
        echo "4. Deploy from GitHub"
        echo "5. Select your repository"
        echo "6. Add environment variables:"
        echo "   - JWT_SECRET (generate random 32 chars)"
        echo "   - NODE_ENV=production"
        echo "   - PORT=5000"
        echo "7. Deploy!"
        echo ""
        echo "Then point your domain:"
        echo "1. Go to project Settings"
        echo "2. Click Domains"
        echo "3. Add custom domain"
        echo ""
        echo "Opening railway.app..."
        open "https://railway.app"
        ;;
        
    5)
        echo ""
        echo "═══════════════════════════════════════════════════════════════"
        echo "DOCKER DEPLOYMENT"
        echo "═══════════════════════════════════════════════════════════════"
        echo ""
        
        echo "Creating Dockerfile..."
        cat > Dockerfile << 'EOF'
FROM node:16-alpine

WORKDIR /app
COPY backend/package*.json ./
RUN npm install --production

COPY backend .

EXPOSE 5000
CMD ["node", "server.js"]
EOF
        
        echo "✅ Dockerfile created"
        echo ""
        echo "Build Docker image:"
        echo "docker build -t hema-news ."
        echo ""
        echo "Run container:"
        echo "docker run -p 5000:5000 \\"
        echo "  -e JWT_SECRET='your_secret_here' \\"
        echo "  hema-news"
        echo ""
        echo "Deploy to cloud (Docker Hub, AWS ECR, etc.):"
        echo "1. Build image"
        echo "2. Tag image: docker tag hema-news your-registry/hema-news"
        echo "3. Push: docker push your-registry/hema-news"
        echo "4. Deploy on any Docker-capable platform"
        ;;
        
    6)
        echo "Exiting..."
        exit 0
        ;;
        
    *)
        echo "Invalid choice. Please select 1-6."
        exit 1
        ;;
esac

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "Need help? Check these files:"
echo "- QUICK_ONLINE_DEPLOYMENT.md (quick start)"
echo "- ONLINE_DEPLOYMENT.md (detailed guide)"
echo "- SETUP_AND_DEPLOYMENT.md (complete setup)"
echo "═══════════════════════════════════════════════════════════════"
