# HEMA NEWS AGENCY - Setup & Deployment Guide

Complete step-by-step guide to setup and deploy the complete end-to-end system with Google Drive integration.

---

## 🚀 Quick Start (5 minutes)

### 1. Install Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The backend will start at `http://localhost:5000`

### 2. Initialize Default Data

Visit: `http://localhost:5000/api/health`

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-16T10:30:00Z"
}
```

### 3. Create Admin User

```bash
# Use the registration endpoint to create admin
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@hemanewsagency.com",
    "password": "Admin@123456",
    "mobileNumber": "9876543210",
    "role": "admin"
  }'
```

Save the returned token for API requests.

---

## 📋 Detailed Setup Steps

### Step 1: Backend Installation

#### Requirements
- Node.js v14 or higher
- npm or yarn

#### Installation

```bash
# Navigate to backend directory
cd backend

# Install all dependencies
npm install

# Verify installation
npm list express

# You should see: express@4.18.2
```

### Step 2: Environment Configuration

#### Create .env file

```bash
cp .env.example .env
```

#### Edit .env with your configuration

**Minimum Required Settings:**

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_random_32_char_secret_key_here
JWT_EXPIRATION=7d
```

#### Optional: Google Drive Setup

If you want to enable Google Drive backups:

1. **Create Google Cloud Project**
   - Go to https://console.cloud.google.com
   - Create new project
   - Enable Google Drive API
   - Create Service Account
   - Download JSON key

2. **Configure .env**

```env
USE_GOOGLE_DRIVE=true
GOOGLE_CLIENT_ID=your_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_secret
GOOGLE_DRIVE_FOLDER_ID=your_folder_id
```

3. **Setup Folder Structure**

After starting server, call:

```bash
curl -X POST http://localhost:5000/api/gdrive/setup \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Step 3: Start the Server

#### Development Mode (recommended for testing)

```bash
npm run dev
```

This uses `nodemon` for auto-reload on file changes.

#### Production Mode

```bash
npm start
```

#### Verify Server is Running

```bash
curl http://localhost:5000/api/health
```

Expected output:
```json
{
  "status": "OK",
  "timestamp": "2024-01-16T10:30:00Z"
}
```

### Step 4: Initialize Sample Data (Optional)

Run the included data initialization script:

```bash
node scripts/initialize-data.js
```

This will create:
- 50 sample customers
- 10 staff members
- 5 publications
- Sample billing records

### Step 5: Frontend Integration

#### Update Frontend Configuration

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_JWT_TOKEN_KEY=hema_token
```

#### Update API calls in components

Use the provided API service module:

```javascript
// In your React component
import apiService from './services/api';

// Login
const handleLogin = async (email, password) => {
  try {
    const response = await apiService.auth.login(email, password);
    apiService.setToken(response.data.token);
    // Redirect to dashboard
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Get customers
const loadCustomers = async () => {
  try {
    const response = await apiService.customers.getAll(1, 10);
    setCustomers(response.data);
  } catch (error) {
    console.error('Failed to load customers:', error);
  }
};
```

---

## 🔐 Google Drive Integration Setup

### Prerequisites
- Google Cloud Console account
- Email address for Google Drive

### Step-by-Step Guide

#### 1. Create Google Cloud Project

```
1. Visit: https://console.cloud.google.com
2. Click "Select a Project" → "NEW PROJECT"
3. Name: "Hema News Agency"
4. Click "CREATE"
5. Wait for project creation
```

#### 2. Enable Google Drive API

```
1. In Google Cloud Console
2. Search for "Google Drive API"
3. Click "Google Drive API"
4. Click "ENABLE"
5. Wait for API to enable
```

#### 3. Create Service Account

```
1. Go to "Service Accounts" page
2. Click "CREATE SERVICE ACCOUNT"
3. Service account name: "hema-news-agency"
4. Click "CREATE AND CONTINUE"
5. Grant "Editor" role
6. Click "CONTINUE" then "DONE"
```

#### 4. Create and Download Key

```
1. Click on the service account you just created
2. Go to "KEYS" tab
3. Click "ADD KEY" → "Create new key"
4. Select "JSON"
5. Click "CREATE"
6. Save the downloaded JSON file
```

#### 5. Extract Credentials

From the downloaded JSON file, extract:

```json
{
  "type": "service_account",
  "project_id": "...",
  "private_key_id": "...",
  "private_key": "...",
  "client_email": "...",    // ← Use as GOOGLE_CLIENT_ID
  "client_id": "...",       // ← Use as GOOGLE_CLIENT_SECRET
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

#### 6. Create Google Drive Folder

```
1. Go to Google Drive
2. Create a new folder: "Hema News Agency Backups"
3. Right-click → "Share"
4. Add the service account email address
5. Give "Editor" access
6. Copy folder ID from URL
```

The folder ID is in the URL:
```
https://drive.google.com/drive/folders/[FOLDER_ID]
```

#### 7. Update .env File

```env
GOOGLE_CLIENT_ID=your_project_id
GOOGLE_CLIENT_SECRET=your_client_secret_from_json
GOOGLE_DRIVE_FOLDER_ID=your_folder_id
USE_GOOGLE_DRIVE=true
```

#### 8. Test Connection

```bash
curl -X GET http://localhost:5000/api/gdrive/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Should return:
```json
{
  "success": true,
  "data": {
    "configured": true,
    "backupEnabled": true,
    "databaseStats": {...}
  }
}
```

---

## 📦 Deployment Options

### Option 1: Heroku Cloud Deployment

#### Prerequisites
- Heroku account (free)
- Heroku CLI installed

#### Steps

```bash
# Login to Heroku
heroku login

# Create app
heroku create hema-news-agency

# Set environment variables
heroku config:set JWT_SECRET=your_secret_key
heroku config:set GOOGLE_CLIENT_ID=your_id
heroku config:set GOOGLE_CLIENT_SECRET=your_secret
heroku config:set GOOGLE_DRIVE_FOLDER_ID=your_folder

# Deploy
git push heroku main

# View logs
heroku logs --tail

# Visit app
heroku open
```

Your backend will be live at:
```
https://hema-news-agency.herokuapp.com/api/health
```

### Option 2: AWS EC2 Deployment

#### Prerequisites
- AWS account
- EC2 instance (t2.micro eligible for free tier)

#### Steps

```bash
# 1. SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-instance.com

# 2. Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_16.x | sudo bash -
sudo yum install -y nodejs

# 3. Clone your repository
git clone your-repo-url
cd hema-news-agency/backend

# 4. Install dependencies
npm install

# 5. Create .env file
nano .env
# Paste your configuration

# 6. Start with PM2 (process manager)
npm install -g pm2
pm2 start server.js --name "hema-api"
pm2 startup
pm2 save

# 7. Setup nginx reverse proxy
sudo yum install -y nginx
# Configure nginx to proxy to :5000
```

### Option 3: Docker Deployment

#### Create Dockerfile

```dockerfile
FROM node:16-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application
COPY . .

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
```

#### Build and Run

```bash
# Build image
docker build -t hema-news-agency:latest .

# Run container
docker run -d \
  -p 5000:5000 \
  -e JWT_SECRET=your_secret \
  -e GOOGLE_CLIENT_ID=your_id \
  -e NODE_ENV=production \
  --name hema-api \
  hema-news-agency:latest

# View logs
docker logs -f hema-api

# Stop container
docker stop hema-api
```

### Option 4: VPS Deployment (DigitalOcean, Linode)

```bash
# 1. SSH to VPS
ssh root@your-vps-ip

# 2. Update system
apt update && apt upgrade -y

# 3. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Clone and setup
git clone your-repo-url
cd hema-news-agency/backend
npm install

# 5. Setup .env
nano .env

# 6. Use PM2 + Nginx
npm install -g pm2
pm2 start server.js
pm2 startup
pm2 save

# 7. Configure Nginx
sudo apt install nginx
# Setup reverse proxy config

# 8. SSL Certificate (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 🔒 Production Checklist

Before deploying to production, ensure:

- [ ] `.env` file is NOT committed to git
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] HTTPS/SSL is enabled
- [ ] CORS is restricted to your frontend domain
- [ ] Database backups are scheduled
- [ ] Error logging is configured
- [ ] Rate limiting is enabled
- [ ] Input validation is in place
- [ ] Security headers are set
- [ ] Dependencies are updated
- [ ] Load testing completed
- [ ] Backup/restore tested
- [ ] Google Drive access verified

---

## 🧪 Testing the API

### Manual Testing with curl

#### 1. Register Admin User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@test.com",
    "password": "Admin@123",
    "mobileNumber": "9999999999",
    "role": "admin"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIsInR5..."
  }
}
```

#### 2. Save Token

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5..."
```

#### 3. Create Customer

```bash
curl -X POST http://localhost:5000/api/customers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "mobileNumber": "9999999998",
    "address": "123 Street",
    "area": "Downtown",
    "billingDueDay": 15
  }'
```

#### 4. Get Dashboard Stats

```bash
curl -X GET http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer $TOKEN"
```

### Automated Testing with Postman

1. Download Postman
2. Import `postman-collection.json` (included in repo)
3. Set environment variable `token` from login response
4. Run test suite

---

## 🐛 Troubleshooting

### Common Issues

#### "Cannot find module 'express'"

```bash
Solution: npm install
```

#### "Port 5000 already in use"

```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=3001
```

#### "Google Drive API not enabled"

```bash
Solution:
1. Go to Google Cloud Console
2. Search for "Google Drive API"
3. Click "Enable"
```

#### "CORS error from frontend"

```bash
Solution: Update .env
FRONTEND_URL=http://localhost:3000
# or your actual frontend URL
```

#### "Cannot read JWT_SECRET"

```bash
Solution: 
1. Check .env file exists
2. Verify JWT_SECRET is set
3. Restart server
```

---

## 📞 Support

- **Documentation**: See `README.md`
- **Issues**: Check troubleshooting section
- **Email**: support@hemanewsagency.com
- **Repository**: [Your GitHub URL]

---

## 📊 Monitoring & Maintenance

### Daily Tasks
- [ ] Check server health endpoint
- [ ] Monitor Google Drive quota
- [ ] Review error logs
- [ ] Check database size

### Weekly Tasks
- [ ] Verify automated backups
- [ ] Update dependencies (npm update)
- [ ] Review performance logs
- [ ] Test backup restore

### Monthly Tasks
- [ ] Security audit
- [ ] Database optimization
- [ ] Update documentation
- [ ] Review API usage

---

**Version:** 1.0.0  
**Last Updated:** 2024-01-16  
**Status:** ✅ Ready for Deployment
