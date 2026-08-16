# HEMA NEWS AGENCY - Quick Reference Card

## 🚀 Quick Start Commands

### Setup (Windows)
```bash
setup.bat
```

### Setup (Linux/Mac)
```bash
bash setup.sh
```

### Manual Setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

---

## 🔧 Development

### Start Server
```bash
npm run dev          # With auto-reload
npm start            # Production mode
```

### Install Dependencies
```bash
npm install
npm install package-name    # Add new package
```

### Check Health
```bash
curl http://localhost:5000/api/health
```

---

## 🔐 Environment Variables

### Required
```env
PORT=5000
JWT_SECRET=your_random_32_char_secret_key_here
```

### Optional (Google Drive)
```env
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
GOOGLE_DRIVE_FOLDER_ID=folder_id
USE_GOOGLE_DRIVE=true
```

---

## 📡 API Quick Reference

### Authentication
```bash
# Register
POST /api/auth/register
Body: {name, email, password, mobileNumber, role}

# Login
POST /api/auth/login
Body: {email, password}

# Current User
GET /api/auth/me
Header: Authorization: Bearer TOKEN
```

### Customers
```bash
# List
GET /api/customers

# Create
POST /api/customers
Body: {name, mobileNumber, email, area, address}

# Update
PUT /api/customers/:id

# Delete
DELETE /api/customers/:id

# Import CSV
POST /api/customers/bulk/import
Body: {customers: [...]}
```

### Google Drive
```bash
# Create Backup
POST /api/gdrive/backup

# List Backups
GET /api/gdrive/backups

# Restore
POST /api/gdrive/restore
Body: {backupId, isLocalBackup}

# Sync
POST /api/gdrive/sync

# Export
POST /api/gdrive/export
Body: {format: "json|csv"}
```

### Dashboard
```bash
# Stats
GET /api/dashboard/stats

# Areas
GET /api/dashboard/areas

# Revenue
GET /api/dashboard/revenue

# Health
GET /api/dashboard/health
```

---

## 📁 File Structure

```
backend/
├── server.js              # Main server
├── package.json           # Dependencies
├── .env.example           # Config template
├── middleware/            # Auth, errors
├── routes/                # API endpoints
│   ├── auth.js
│   ├── customers.js
│   ├── billing.js
│   ├── staff.js
│   ├── subscriptions.js
│   ├── grievances.js
│   ├── gdrive.js          # ⭐ Google Drive
│   └── dashboard.js
├── utils/                 # Managers
│   ├── DatabaseManager.js
│   └── GoogleDriveManager.js
└── data/                  # JSON database
    ├── users.json
    ├── customers.json
    ├── billing.json
    └── ...
```

---

## 🧪 Testing API with curl

### 1. Register
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

### 2. Save Token
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5..."
```

### 3. Create Customer
```bash
curl -X POST http://localhost:5000/api/customers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Store",
    "mobileNumber": "9999999998",
    "email": "store@test.com",
    "area": "Downtown"
  }'
```

### 4. Get Dashboard
```bash
curl http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Linux/Mac
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Dependencies Issue
```bash
rm -rf node_modules package-lock.json
npm install
```

### CORS Error
```
Edit .env:
FRONTEND_URL=http://your-frontend-url
Restart server
```

### Google Drive Not Working
```
1. Check GOOGLE_CLIENT_ID in .env
2. Verify API enabled in Google Cloud Console
3. Ensure folder shared with service account
4. Check credentials are correct
```

---

## 📊 Common Tasks

### Create Backup
```bash
curl -X POST http://localhost:5000/api/gdrive/backup \
  -H "Authorization: Bearer $TOKEN"
```

### Restore Backup
```bash
curl -X POST http://localhost:5000/api/gdrive/restore \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"backupId":"file_id"}'
```

### Export Data
```bash
curl -X POST http://localhost:5000/api/gdrive/export \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"format":"json"}' > backup.json
```

### Check Database Health
```bash
curl http://localhost:5000/api/dashboard/health \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🚀 Deployment

### Heroku
```bash
heroku login
heroku create hema-news-agency
heroku config:set JWT_SECRET=your_secret
git push heroku main
```

### Docker
```bash
docker build -t hema-news .
docker run -p 5000:5000 -e JWT_SECRET=secret hema-news
```

### AWS EC2
```bash
ssh -i key.pem ec2-user@instance
sudo yum install -y nodejs
git clone repo
cd backend && npm install
npm start
```

---

## 📚 Documentation Links

- **Setup Guide**: SETUP_AND_DEPLOYMENT.md
- **API Reference**: backend/README.md
- **Architecture**: ARCHITECTURE.md
- **This Card**: QUICK_REFERENCE.md

---

## 🔑 Key Concepts

**JWT Token**: Expires in 7 days, includes user ID, email, role  
**Database**: JSON files in ./data/, auto-backed up to Google Drive  
**Google Drive**: Automatic backup, restore, and sync capability  
**Authentication**: All routes protected except /auth/login and /auth/register  
**Roles**: admin (full access), customer (own data), subadmin (limited)  

---

## 💡 Tips

1. Always use `.env` file - don't hardcode secrets
2. Generate strong JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
3. Use Postman for API testing
4. Check logs for debugging
5. Enable Google Drive for automatic backup
6. Test restore regularly

---

## 📞 Need Help?

1. Check error message in logs
2. Review SETUP_AND_DEPLOYMENT.md troubleshooting section
3. Check API endpoint format in backend/README.md
4. Verify .env configuration
5. Check Google Drive credentials if using backup

---

**Version**: 1.0.0  
**Last Updated**: 2024-01-16  
**Status**: ✅ Production Ready
