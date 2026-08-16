# 🚀 RAILWAY DEPLOYMENT - DIRECT GUIDE

**Status**: Code ready, deploying now

---

## **STEP 1: CONNECT GITHUB TO RAILWAY (If not already connected)**

1. Go to: https://railway.app
2. Click "Sign In"
3. Choose "GitHub" or "Email"
4. If GitHub: Authorize Railway to access your repositories
   - Look for `ushamithran1507/hemanewsagency`
   - Click "Authorize Railway"

---

## **STEP 2: CREATE NEW PROJECT ON RAILWAY**

1. In Railway dashboard, click **"New Project"**
2. Click **"Deploy from GitHub"**
3. In the "Repo" field, search: `hemanewsagency`
4. Select: `ushamithran1507/hemanewsagency`
5. Click **"Deploy"**

Railway will:
- ✅ Detect your Node.js backend
- ✅ Auto-install dependencies (npm install)
- ✅ Start building your app
- ✅ Show deployment progress

---

## **STEP 3: ADD ENVIRONMENT VARIABLES**

Once Railway creates your project:

1. Click **"Variables"** tab
2. Click **"Add Variable"**
3. Add these one by one:

```
KEY: JWT_SECRET
VALUE: mysecretkey123456789abcdefghijklmn

KEY: NODE_ENV
VALUE: production

KEY: PORT
VALUE: 5000
```

4. Click **"Save"**

---

## **STEP 4: WAIT FOR DEPLOYMENT**

- Railway automatically starts deploying
- Shows build progress: `Building... → Deploying... → Live ✅`
- Usually takes **2-3 minutes**

Check the **Logs** tab to see:
```
npm install → Building → npm start
```

---

## **STEP 5: GET YOUR LIVE URL**

When deployment finishes:

1. Click **"Deployments"** tab
2. You'll see a URL like:
   ```
   https://hemanewsagency-prod-xxxxx.up.railway.app
   ```
3. **COPY THIS URL** - You'll need it!

---

## **STEP 6: TEST YOUR DEPLOYMENT**

Open PowerShell or Git Bash and run:

```bash
curl https://YOUR_LIVE_URL/api/health
```

**Expected Response:**
```json
{"status":"OK","timestamp":"2026-08-16T..."}
```

If you see this ✅ → Your app is LIVE!

---

## **STEP 7: CREATE ADMIN ACCOUNT**

Open PowerShell and run:

```powershell
$url = "https://YOUR_LIVE_URL/api/auth/register"
$body = @{
    name = "Admin"
    email = "admin@hemanewsagency.com"
    password = "Admin@123456"
    mobileNumber = "9876543210"
    role = "admin"
} | ConvertTo-Json

Invoke-WebRequest -Uri $url -Method POST -ContentType "application/json" -Body $body | Select-Object -Property Content
```

**Or use curl:**

```bash
curl -X POST https://YOUR_LIVE_URL/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Admin\",\"email\":\"admin@hemanewsagency.com\",\"password\":\"Admin@123456\",\"mobileNumber\":\"9876543210\",\"role\":\"admin\"}"
```

**Expected Response:**
```json
{"success":true,"message":"Admin created successfully","token":"eyJ..."}
```

✅ Admin account created!

---

## **STEP 8: LOGIN TO YOUR SYSTEM**

Test login:

```powershell
$url = "https://YOUR_LIVE_URL/api/auth/login"
$body = @{
    email = "admin@hemanewsagency.com"
    password = "Admin@123456"
} | ConvertTo-Json

Invoke-WebRequest -Uri $url -Method POST -ContentType "application/json" -Body $body | Select-Object -Property Content
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

✅ **Your system is LIVE and working!**

---

## **STEP 9: TEST ALL ENDPOINTS**

Save your token from login response, then test:

### Get Dashboard Stats:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" ^
  https://YOUR_LIVE_URL/api/dashboard/stats
```

### Get Customers:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" ^
  https://YOUR_LIVE_URL/api/customers
```

### Get Billing:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" ^
  https://YOUR_LIVE_URL/api/billing
```

All endpoints should return ✅ 200 OK with data

---

## **✅ YOUR SYSTEM IS LIVE!**

### What You Now Have:

| Feature | Status | URL |
|---------|--------|-----|
| **API** | 🟢 LIVE | `https://YOUR_LIVE_URL/api` |
| **Authentication** | 🟢 LIVE | `/api/auth/login` |
| **Customers** | 🟢 LIVE | `/api/customers` |
| **Billing** | 🟢 LIVE | `/api/billing` |
| **Staff** | 🟢 LIVE | `/api/staff` |
| **Subscriptions** | 🟢 LIVE | `/api/subscriptions` |
| **Grievances** | 🟢 LIVE | `/api/grievances` |
| **Google Drive** | 🟢 LIVE | `/api/gdrive` |
| **Dashboard** | 🟢 LIVE | `/api/dashboard` |

---

## **🔑 CREDENTIALS**

```
Email: admin@hemanewsagency.com
Password: Admin@123456
```

---

## **📊 ALL 43+ ENDPOINTS AVAILABLE**

- `/api/auth/register` - Create user
- `/api/auth/login` - User login
- `/api/auth/me` - Get current user
- `/api/auth/change-password` - Change password
- `/api/customers` - CRUD operations
- `/api/customers/:id`
- `/api/customers/area/:area` - Customers by area
- `/api/customers/bulk/import` - Bulk import
- `/api/billing` - Billing operations
- `/api/billing/customer/:id` - Customer bills
- `/api/billing/payment` - Record payment
- `/api/billing/dashboard/stats` - Billing stats
- `/api/staff` - Staff management
- `/api/staff/attendance` - Attendance tracking
- `/api/staff/:id/attendance` - Staff attendance history
- `/api/subscriptions` - Customer subscriptions
- `/api/subscriptions/publications` - Publications list
- `/api/grievances` - Grievance tracking
- `/api/grievances/non-receipt` - Report non-receipt
- `/api/grievances/:id/resolve` - Resolve issue
- `/api/gdrive/status` - Google Drive status
- `/api/gdrive/backup` - Create backup
- `/api/gdrive/backups` - List backups
- `/api/gdrive/restore` - Restore from backup
- `/api/gdrive/sync` - Sync to Google Drive
- `/api/gdrive/export` - Export data
- `/api/dashboard/stats` - KPI dashboard
- `/api/dashboard/areas` - Customer areas
- `/api/dashboard/revenue` - Revenue trends
- `/api/dashboard/publications` - Publication stats
- ... and 14 more endpoints

---

## **🆘 TROUBLESHOOTING**

### "Deployment Failed"
- Check Railway "Logs" tab
- Look for error messages
- Common issues:
  - Missing Node.js detected (shouldn't happen)
  - Port conflict (shouldn't happen on Railway)
  - Environment variable issue

### "Can't connect to URL"
- Wait 5 minutes after deployment
- Refresh the page
- Check Railway shows "Live" status

### "Admin creation failed"
- Wait 2 minutes after deployment completes
- Make sure URL is exact (no typos)
- Check you're using correct email format

### "Login returns 401 error"
- Verify email exactly: `admin@hemanewsagency.com`
- Verify password exactly: `Admin@123456`
- Make sure admin account was created successfully

---

## **📱 QUICK COMMAND REFERENCE**

### PowerShell Commands:

```powershell
# Test health
Invoke-WebRequest -Uri "https://YOUR_URL/api/health"

# Create admin
$body = @{
    name = "Admin"
    email = "admin@hemanewsagency.com"
    password = "Admin@123456"
    mobileNumber = "9876543210"
    role = "admin"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://YOUR_URL/api/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body

# Login
$loginBody = @{
    email = "admin@hemanewsagency.com"
    password = "Admin@123456"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://YOUR_URL/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $loginBody
```

---

## **🎯 NEXT STEPS**

1. ✅ Go to https://railway.app
2. ✅ Create new project from GitHub
3. ✅ Add environment variables
4. ✅ Wait for deployment (2-3 min)
5. ✅ Get live URL
6. ✅ Create admin account
7. ✅ Test login
8. ✅ Start using your system!

---

**Your Hema News Agency system is now LIVE! 🎉**
