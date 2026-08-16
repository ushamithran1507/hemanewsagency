# 🚀 MANUAL DEPLOYMENT GUIDE
## Hema News Agency - Step by Step

---

## **STEP 1: PUSH CODE TO GITHUB**

### Open Git Bash (or Terminal)

1. **Open Git Bash** (comes with Git installation)
2. Navigate to your project:
   ```bash
   cd c:/Users/UAE/Downloads/"Hema News Agency"
   ```

3. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   ```

4. **Push to GitHub:**
   ```bash
   git push -u origin main
   ```

   If you get authentication error:
   ```bash
   git remote set-url origin https://github.com/ushamithran1507/hemanewsagency.git
   git push -u origin main
   ```

5. **Verify on GitHub:**
   - Go to: https://github.com/ushamithran1507/hemanewsagency
   - Your code should now be visible

---

## **STEP 2: DEPLOY ON RAILWAY (RECOMMENDED - 2 MINUTES)**

### Option A: Quick Deploy
1. Go to: https://railway.app
2. Click "Sign Up" → "GitHub"
3. Authorize with your GitHub account
4. Click "New Project"
5. Click "Deploy from GitHub"
6. Search and select: `hemanewsagency`
7. Railway auto-detects `backend` folder
8. Click "Deploy" ✅

### Option B: Add Environment Variables (Recommended)
1. After clicking Deploy, Railway shows "Deployments"
2. Click "Variables" tab
3. Add these:
   - `JWT_SECRET` = `mysecretkey123456789abcdefghijklmn`
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
4. Click "Save"
5. Deployment starts automatically

### Option C: Get Your Live URL
1. Wait 2-3 minutes for deployment
2. Click "Deployment" tab
3. You'll see a URL like: `https://xxxxx.up.railway.app`
4. **Copy this URL!** ✅

---

## **STEP 3: CREATE ADMIN ACCOUNT**

### Open Terminal/Git Bash and run:

```bash
curl -X POST https://YOUR_LIVE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@hemanewsagency.com",
    "password": "Admin@123456",
    "mobileNumber": "9876543210",
    "role": "admin"
  }'
```

**Replace `YOUR_LIVE_URL`** with your actual Railway URL

**Expected Response:**
```json
{
  "success": true,
  "message": "Admin created successfully",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

✅ If you see this, admin account created successfully!

---

## **STEP 4: LOGIN TO YOUR SYSTEM**

### Use these credentials:
```
Email: admin@hemanewsagency.com
Password: Admin@123456
```

### Login via API:
```bash
curl -X POST https://YOUR_LIVE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hemanewsagency.com",
    "password": "Admin@123456"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "name": "Admin",
    "email": "admin@hemanewsagency.com",
    "role": "admin"
  }
}
```

---

## **STEP 5: TEST YOUR DEPLOYMENT**

### Check if app is running:
```bash
curl https://YOUR_LIVE_URL/api/health
```

**Should return:**
```json
{
  "status": "OK",
  "timestamp": "2026-08-16T..."
}
```

### Test some endpoints:
```bash
# Get dashboard stats
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://YOUR_LIVE_URL/api/dashboard/stats

# Get customers
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://YOUR_LIVE_URL/api/customers

# Get billing
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://YOUR_LIVE_URL/api/billing
```

---

## **✅ YOUR SYSTEM IS LIVE!**

### You now have:
✅ **Live API** at: `https://YOUR_URL`  
✅ **Admin Login** with email/password  
✅ **All 43+ Endpoints** working  
✅ **Database** running  
✅ **Google Drive** integration available  
✅ **24/7 Online** access  

---

## **AVAILABLE MODULES**

Once logged in, you can access:

### 1. **Customers** (8 endpoints)
```bash
GET    /api/customers
POST   /api/customers
GET    /api/customers/:id
PUT    /api/customers/:id
DELETE /api/customers/:id
POST   /api/customers/bulk/import
GET    /api/customers/area/:area
PATCH  /api/customers/:id/toggle-status
```

### 2. **Billing** (5 endpoints)
```bash
GET    /api/billing
POST   /api/billing
GET    /api/billing/customer/:id
POST   /api/billing/payment
GET    /api/billing/dashboard/stats
```

### 3. **Staff** (4 endpoints)
```bash
GET    /api/staff
POST   /api/staff
POST   /api/staff/attendance
GET    /api/staff/:id/attendance
```

### 4. **Subscriptions** (4 endpoints)
```bash
GET    /api/subscriptions/publications
POST   /api/subscriptions/publications
POST   /api/subscriptions
GET    /api/subscriptions/customer/:id
```

### 5. **Grievances** (4 endpoints)
```bash
POST   /api/grievances/non-receipt
GET    /api/grievances
PATCH  /api/grievances/:id/resolve
GET    /api/grievances/pending/count
```

### 6. **Google Drive** (9 endpoints)
```bash
GET    /api/gdrive/status
POST   /api/gdrive/backup
GET    /api/gdrive/backups
POST   /api/gdrive/restore
POST   /api/gdrive/sync
POST   /api/gdrive/export
POST   /api/gdrive/setup
GET    /api/gdrive/backup/:id/content
DELETE /api/gdrive/backup/:id
```

### 7. **Dashboard** (5 endpoints)
```bash
GET    /api/dashboard/stats
GET    /api/dashboard/areas
GET    /api/dashboard/revenue
GET    /api/dashboard/publications
GET    /api/dashboard/health
```

### 8. **Authentication** (4 endpoints)
```bash
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/change-password
```

---

## **TROUBLESHOOTING**

### "Deployment stuck at building"
- Wait 10 minutes
- Click "Logs" to see what's happening
- Check if `.env` has all required variables

### "Can't create admin account"
- Make sure deployment finished (check Railway dashboard)
- Verify your URL is correct
- Wait 2 minutes after deployment completes

### "Login fails"
- Double-check email and password
- Make sure admin account was created successfully

### "Port already in use"
- Railway assigns a port automatically
- Don't manually set PORT in variables

---

## **🎉 NEXT STEPS**

1. ✅ Code pushed to GitHub
2. ✅ Deployed on Railway
3. ✅ Admin account created
4. ✅ System tested

### Now you can:
- Create customers in Billing system
- Track staff attendance
- Manage subscriptions
- Report and resolve grievances
- Auto-backup to Google Drive
- Monitor dashboard analytics

---

## **NEED MORE HELP?**

📖 Full documentation: `SETUP_AND_DEPLOYMENT.md`  
📋 API reference: `DEPLOY_YOUR_REPO.md`  
🚀 Quick reference: `QUICK_ONLINE_DEPLOYMENT.md`  

---

**Your Hema News Agency system is now live and ready to use! 🎉**
