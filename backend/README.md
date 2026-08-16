# HEMA NEWS AGENCY - Backend API Documentation

## Complete End-to-End Newspaper Distribution System
### With Google Drive Integration for Cloud Storage

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [API Endpoints](#api-endpoints)
7. [Google Drive Integration](#google-drive-integration)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

---

## Overview

This is a complete **Newspaper Distribution Management System** backend API built with:

- **Express.js** - Fast and lightweight Node.js web framework
- **JSON File Storage** - Local data persistence with cloud sync
- **Google Drive API** - Cloud backup and restore capability
- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control** - Admin, Customer, Sub-Admin roles

### Key Capabilities

✅ **Customer Management** - Add, edit, delete, bulk import customers  
✅ **Billing System** - Monthly billing, payment tracking, wallet balance  
✅ **Subscription Management** - Publications, subscription types, pricing  
✅ **Staff Management** - Staff profiles, attendance tracking, salary management  
✅ **Grievance System** - Non-receipt reporting, issue resolution  
✅ **Google Drive Sync** - Automatic backup, restore, and cloud storage  
✅ **Dashboard Analytics** - KPIs, charts, revenue tracking  
✅ **Secure Authentication** - JWT tokens, password hashing  

---

## Features

### 1. **Complete User Management**
- Multi-role system (Admin, Customer, SubAdmin)
- User registration and login
- Password management
- Profile management

### 2. **Customer Portal**
- View subscriptions and publications
- Track bills and payments
- Upload payment receipts
- Report missing newspapers
- Chat with agency
- View wallet balance

### 3. **Admin Dashboard**
- Real-time KPI metrics
- Revenue charts and analytics
- Customer distribution by area
- Staff attendance tracking
- Billing and payment status
- Grievance management

### 4. **Google Drive Integration**
- **Automatic Backup** - Daily backup of all data
- **Restore Points** - Multiple backup versions
- **Real-time Sync** - Continuous data synchronization
- **Share & Export** - Export data for reporting
- **Disaster Recovery** - One-click restore

### 5. **Data Management**
- CSV import for bulk operations
- Data export in JSON/CSV format
- Local and cloud storage options
- Transaction history tracking

---

## Architecture

```
┌─────────────────────────────────────────┐
│        Frontend (React/Vue.js)          │
│    Hema News Agency - Standalone.html   │
└──────────────┬──────────────────────────┘
               │ (HTTP/REST API)
               ▼
┌─────────────────────────────────────────┐
│       Express.js Backend API            │
│        (Node.js Server:5000)            │
├─────────────────────────────────────────┤
│  ✓ Authentication (JWT)                 │
│  ✓ Route Handlers                       │
│  ✓ Error Handling                       │
│  ✓ Middleware (CORS, Compression)       │
└──────────────┬──────────────────────────┘
               │
      ┌────────┴────────┐
      ▼                 ▼
┌──────────────┐  ┌──────────────────┐
│  Local JSON  │  │  Google Drive    │
│   Database   │  │   Cloud Storage  │
│  (./data/)   │  │  (Backup/Sync)   │
└──────────────┘  └──────────────────┘
```

---

## Installation

### Prerequisites
- Node.js v14+ and npm
- Google Cloud Console account (for Drive API)
- Internet connection

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Setup Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

JWT_SECRET=your_random_secret_key_at_least_32_chars
JWT_EXPIRATION=7d

USE_GOOGLE_DRIVE=true
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
GOOGLE_DRIVE_FOLDER_ID=your_folder_id
```

### Step 3: Create Data Directory

```bash
mkdir -p data
```

### Step 4: Start the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

Server will run at: `http://localhost:5000`

---

## Configuration

### Google Drive Setup

#### 1. Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable **Google Drive API**

#### 2. Create Service Account
1. Go to Service Accounts page
2. Create new service account
3. Download JSON key file
4. Share a Google Drive folder with the service account email

#### 3. Configure Environment Variables
```
GOOGLE_CLIENT_ID=from_service_account.json
GOOGLE_CLIENT_SECRET=from_service_account.json
GOOGLE_DRIVE_FOLDER_ID=folder_id_from_url
```

### JWT Secret Generation

Generate a secure random secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Database Initialization

The application automatically creates necessary JSON files on first run:

```
data/
├── users.json
├── customers.json
├── billing.json
├── staff.json
├── subscriptions.json
├── publications.json
├── grievances.json
├── transactions.json
├── areas.json
└── settings.json
```

---

## API Endpoints

### Authentication

```
POST   /api/auth/login              - Login user
POST   /api/auth/register            - Register new user
POST   /api/auth/change-password     - Change password
GET    /api/auth/me                  - Get current user
POST   /api/auth/logout              - Logout
```

### Customers

```
GET    /api/customers                 - Get all customers (paginated)
GET    /api/customers/:id             - Get single customer
POST   /api/customers                 - Create customer
PUT    /api/customers/:id             - Update customer
DELETE /api/customers/:id             - Delete customer
POST   /api/customers/bulk/import     - Bulk import
GET    /api/customers/area/:area      - Get by area
PATCH  /api/customers/:id/toggle-status - Toggle status
```

### Billing

```
GET    /api/billing                   - Get all bills
GET    /api/billing/customer/:id      - Get customer bills
POST   /api/billing                   - Create bill
POST   /api/billing/payment           - Record payment
GET    /api/billing/dashboard/stats   - Billing stats
```

### Staff

```
GET    /api/staff                     - Get all staff
POST   /api/staff                     - Add staff member
POST   /api/staff/attendance          - Mark attendance
GET    /api/staff/:id/attendance      - Get attendance
```

### Subscriptions

```
GET    /api/subscriptions/publications - Get publications
POST   /api/subscriptions/publications - Add publication
POST   /api/subscriptions             - Create subscription
GET    /api/subscriptions/customer/:id - Get customer subs
```

### Grievances

```
POST   /api/grievances/non-receipt    - Report non-receipt
GET    /api/grievances                - Get all grievances
PATCH  /api/grievances/:id/resolve    - Resolve grievance
GET    /api/grievances/pending/count  - Pending count
```

### Dashboard

```
GET    /api/dashboard/stats           - Dashboard statistics
GET    /api/dashboard/areas           - Area distribution
GET    /api/dashboard/revenue         - Revenue chart data
GET    /api/dashboard/publications    - Publication stats
GET    /api/dashboard/health          - Database health
```

### Google Drive

```
GET    /api/gdrive/status             - Google Drive status
POST   /api/gdrive/backup             - Create backup
GET    /api/gdrive/backups            - List backups
POST   /api/gdrive/restore            - Restore from backup
POST   /api/gdrive/sync               - Sync to Google Drive
POST   /api/gdrive/export             - Export data (JSON/CSV)
POST   /api/gdrive/setup              - Initialize folder structure
GET    /api/gdrive/backup/:id/content - Get backup content
DELETE /api/gdrive/backup/:id         - Delete backup
```

---

## Google Drive Integration

### Automatic Daily Backup

Add to server startup for automatic scheduled backups:

```javascript
// In server.js
setInterval(async () => {
  // Trigger daily backup
  const allData = db.exportAll();
  // Backup to Google Drive
}, 24 * 60 * 60 * 1000); // Every 24 hours
```

### Backup and Restore Flow

```
User triggers backup
        ↓
All data exported from JSON files
        ↓
Encrypted and compressed
        ↓
Uploaded to Google Drive
        ↓
Backup point created
        ↓
Timestamp logged
```

### Usage Examples

#### Create Backup
```bash
curl -X POST http://localhost:5000/api/gdrive/backup \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"backupName":"backup-2024-01-15"}'
```

#### List Backups
```bash
curl -X GET http://localhost:5000/api/gdrive/backups \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Restore Backup
```bash
curl -X POST http://localhost:5000/api/gdrive/restore \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"backupId":"file_id_from_gdrive","isLocalBackup":false}'
```

---

## Deployment

### Heroku Deployment

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create hema-news-agency`
4. Set environment variables:
   ```bash
   heroku config:set JWT_SECRET=your_secret
   heroku config:set GOOGLE_CLIENT_ID=your_id
   heroku config:set GOOGLE_CLIENT_SECRET=your_secret
   ```
5. Deploy: `git push heroku main`

### Docker Deployment

```dockerfile
FROM node:16-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .

EXPOSE 5000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t hema-news-agency .
docker run -p 5000:5000 -e JWT_SECRET=your_secret hema-news-agency
```

### AWS Deployment

1. Use EC2 instance with Node.js
2. Configure security groups
3. Set up RDS (optional) or use local JSON
4. Use S3 for backups (or Google Drive)
5. Configure CloudFront CDN

---

## Troubleshooting

### Common Issues

#### 1. "Cannot find module" errors
```bash
Solution: npm install
```

#### 2. Google Drive connection failed
- Verify credentials in `.env`
- Check API is enabled in Google Cloud Console
- Ensure folder is shared with service account

#### 3. Port already in use
```bash
Solution: Change PORT in .env or kill process:
lsof -ti:5000 | xargs kill -9
```

#### 4. Data not syncing
- Check Google Drive configuration
- Verify folder structure exists
- Check browser console for errors
- Review server logs

#### 5. Authentication token expired
```bash
Solution: Frontend should refresh token:
POST /api/auth/refresh-token (requires implementation)
```

---

## Performance Optimization

### Caching
```javascript
// Enable caching in env
ENABLE_CACHE=true
CACHE_TTL=3600
```

### Database Indexing
- Consider moving to SQLite or MongoDB for large datasets
- Current JSON structure suitable for ~10,000+ records

### API Rate Limiting
Add `express-rate-limit`:
```bash
npm install express-rate-limit
```

---

## Security Best Practices

1. **Always use HTTPS in production**
2. **Never commit .env file**
3. **Rotate JWT_SECRET periodically**
4. **Use strong passwords (min 12 chars)**
5. **Enable CORS only for trusted domains**
6. **Validate all inputs**
7. **Use rate limiting**
8. **Keep dependencies updated**

---

## Support & Maintenance

### Regular Tasks
- [ ] Monitor disk space usage
- [ ] Review and archive old backups
- [ ] Update dependencies monthly
- [ ] Check Google Drive quota
- [ ] Review error logs

### Backup Schedule
- Daily automatic backups to Google Drive
- Weekly archive to cold storage
- Monthly full data verification

---

## License

ISC License - © 2024 HEMA NEWS AGENCY

---

## Contact & Support

For issues, questions, or contributions:
- Email: support@hemanewsagency.com
- GitHub: [Your Repository]
- Documentation: [Your Docs Site]

---

**Version:** 1.0.0  
**Last Updated:** 2024-01-16  
**Status:** Production Ready ✅
