# HEMA NEWS AGENCY - Architecture & Developer Guide

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                         │
│  • React / Vue.js Application                               │
│  • REST API Communication                                   │
│  • JWT Token Management                                     │
│  • Local State Management                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST API
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway Layer                         │
│  • Express.js Server                                        │
│  • CORS & Security Middleware                               │
│  • Request/Response Handling                                │
│  • Error Management                                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
      ┌────────────────┼────────────────┐
      ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────────┐
│  Auth Routes │ │  CRUD Routes │ │  Drive Routes    │
│  • Login     │ │  • Customers │ │  • Backup        │
│  • Register  │ │  • Billing   │ │  • Restore       │
│  • Validate  │ │  • Staff     │ │  • Sync          │
└──────────────┘ └──────────────┘ └──────────────────┘
      │                │                │
      └────────────────┼────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                       │
│  • DatabaseManager (JSON Storage)                           │
│  • GoogleDriveManager (Cloud Sync)                          │
│  • Authentication Logic                                     │
│  • Data Validation                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
      ┌────────────────┴────────────────┐
      ▼                                 ▼
┌──────────────────┐          ┌──────────────────┐
│  Local Database  │          │  Google Drive    │
│  (./data/)       │          │  Cloud Storage   │
│  • users.json    │          │  • Backups       │
│  • customers.json│          │  • Exports       │
│  • billing.json  │          │  • Archives      │
│  • staff.json    │          │  • Sync Files    │
└──────────────────┘          └──────────────────┘
```

---

## Directory Structure

```
hema-news-agency/
├── backend/
│   ├── server.js                 # Main server entry point
│   ├── package.json              # Dependencies
│   ├── .env.example              # Environment template
│   ├── README.md                 # API documentation
│   │
│   ├── middleware/
│   │   ├── auth.js               # JWT & role-based auth
│   │   └── errorHandler.js       # Centralized error handling
│   │
│   ├── routes/
│   │   ├── auth.js               # Authentication endpoints
│   │   ├── customers.js          # Customer CRUD
│   │   ├── billing.js            # Billing management
│   │   ├── staff.js              # Staff operations
│   │   ├── subscriptions.js       # Publication subscriptions
│   │   ├── grievances.js         # Issue reporting
│   │   ├── gdrive.js             # Google Drive integration
│   │   └── dashboard.js          # Analytics & stats
│   │
│   ├── utils/
│   │   ├── DatabaseManager.js    # JSON file operations
│   │   └── GoogleDriveManager.js # Google Drive API wrapper
│   │
│   └── data/                     # Local JSON database
│       ├── users.json
│       ├── customers.json
│       ├── billing.json
│       ├── staff.json
│       ├── subscriptions.json
│       ├── publications.json
│       ├── grievances.json
│       ├── transactions.json
│       ├── areas.json
│       └── settings.json
│
├── frontend/
│   ├── services/
│   │   └── api.js                # API service wrapper
│   ├── components/               # React components
│   ├── pages/                    # Page components
│   └── styles/                   # CSS/Styling
│
├── SETUP_AND_DEPLOYMENT.md       # Setup guide
├── setup.sh                      # Linux setup script
├── setup.bat                     # Windows setup script
└── README.md                     # Project overview
```

---

## Data Models

### User Model
```javascript
{
  id: "uuid",
  name: "John Doe",
  email: "john@example.com",
  mobileNumber: "9876543210",
  passwordHash: "bcrypt_hash",
  role: "admin|customer|subadmin",
  isActive: true,
  lastLogin: "2024-01-16T10:30:00Z",
  driveRefreshToken: "google_drive_token",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-16T10:30:00Z"
}
```

### Customer Model
```javascript
{
  id: "uuid",
  name: "ABC Store",
  email: "store@example.com",
  mobileNumber: "9876543210",
  whatsapp: "9876543210",
  houseNumber: "123",
  address: "Main Street",
  landmark: "Near Market",
  areaLocality: "Downtown",
  area: "Area 1",
  line: "Line A",
  billingDueDay: 15,
  paymentMethod: "UPI|Bank Transfer",
  walletBalance: 500.00,
  assignedStaffId: "staff_uuid",
  yearlySubscriber: false,
  status: "active|inactive",
  totalBilled: 5000.00,
  totalPaid: 3000.00,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-16T10:30:00Z"
}
```

### Billing Model
```javascript
{
  id: "uuid",
  customerId: "customer_uuid",
  month: 1,  // 1-12
  year: 2024,
  amount: 500.00,
  items: [
    {
      name: "Dinamalar",
      type: "Daily",
      quantity: 26,
      rateMoney: "450.00"
    }
  ],
  status: "pending|partial|paid",
  dueDate: "2024-01-15",
  paidDate: null,
  paidAmount: 0,
  notes: "",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-16T10:30:00Z"
}
```

### Subscription Model
```javascript
{
  id: "uuid",
  customerId: "customer_uuid",
  publicationId: "publication_uuid",
  subscriptionType: "Monthly|Lifetime|Customized Days",
  days: ["Monday", "Wednesday", "Friday"],
  startDate: "2024-01-01T00:00:00Z",
  status: "active|paused|cancelled",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-16T10:30:00Z"
}
```

---

## API Flow Diagrams

### Login Flow
```
User submits credentials
        ↓
POST /api/auth/login
        ↓
Validate email/mobile & password
        ↓
Check password hash with bcrypt
        ↓
Generate JWT token
        ↓
Return token to frontend
        ↓
Frontend stores in localStorage
        ↓
Attach token to Authorization header for future requests
```

### Backup & Sync Flow
```
User triggers backup
        ↓
GET all data from JSON files
        ↓
Encrypt & compress data
        ↓
POST to Google Drive API
        ↓
Create backup file with timestamp
        ↓
Store file ID in metadata
        ↓
Return success response
        ↓
Frontend shows backup confirmation
```

### Customer Creation Flow
```
Admin submits customer form
        ↓
Frontend calls: POST /api/customers
        ↓
Server validates input
        ↓
Check if customer exists (by phone)
        ↓
Hash any sensitive data
        ↓
INSERT into customers.json
        ↓
Return created customer
        ↓
Optional: Auto-sync to Google Drive
```

---

## Key Features & Implementation

### 1. Authentication & Authorization

**JWT Token Structure:**
```javascript
{
  id: "user_uuid",
  email: "user@example.com",
  name: "User Name",
  role: "admin",
  mobileNumber: "9876543210",
  iat: 1234567890,
  exp: 1234654290
}
```

**Role-Based Access Control:**
- `admin` - Full access to all endpoints
- `customer` - Access to own data only
- `subadmin` - Limited admin functions

### 2. Data Persistence Strategy

```javascript
// Current: JSON Files (suitable for < 50,000 records)
// Location: ./data/
// Pros: No external dependencies, human-readable
// Cons: Not optimal for concurrent writes

// Future: SQLite/PostgreSQL migration
// Better performance, transaction support, querying
```

### 3. Google Drive Integration

**File Structure in Google Drive:**
```
Hema News Agency Backups/
├── backups/
│   ├── hema-news-backup-2024-01-16T10-30-00.json
│   ├── hema-news-backup-2024-01-15T10-30-00.json
│   └── ...
├── exports/
│   ├── export-2024-01-16-customers.csv
│   └── ...
├── imports/
│   └── imported-data-2024-01-16.json
├── archives/
│   └── archive-2024-01-10.tar.gz
└── reports/
    └── monthly-report-2024-01.pdf
```

### 4. Error Handling

**Custom Error Class:**
```javascript
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

// Usage:
throw new AppError('Customer not found', 404, 'CUSTOMER_NOT_FOUND');
```

**Error Response Format:**
```json
{
  "success": false,
  "message": "Customer not found",
  "code": "CUSTOMER_NOT_FOUND"
}
```

---

## Security Considerations

### 1. Password Security
```javascript
// Bcrypt configuration
const saltRounds = 10;
const hash = await bcrypt.hash(password, saltRounds);
```

### 2. JWT Configuration
```javascript
// Token expiration: 7 days
// Secret: 32+ character random string
// Algorithm: HS256
```

### 3. Input Validation
```javascript
// All inputs validated before database operations
// Sanitization of user input
// SQL injection prevention (N/A for JSON)
// XSS protection with Content-Security-Policy headers
```

### 4. CORS Configuration
```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
};
```

---

## Performance Optimization Tips

### 1. Caching Strategy
```javascript
// Implement Redis caching for:
// - Publications list (rarely changes)
// - User roles and permissions
// - Dashboard stats (cache for 5 minutes)
```

### 2. Database Optimization
```javascript
// For large datasets, implement:
// - Pagination (default: 10 items/page)
// - Indexing on frequently queried fields
// - Archive old records (>1 year)
```

### 3. API Response Optimization
```javascript
// Use compression middleware
// Limit response payload size
// Implement field selection (only return needed fields)
```

---

## Testing Guidelines

### Unit Testing
```bash
npm test

# Test structure:
tests/
├── auth.test.js
├── customers.test.js
├── billing.test.js
└── gdrive.test.js
```

### API Testing
```bash
# Using curl
curl -X GET http://localhost:5000/api/health

# Using Postman
Import: postman-collection.json
Run: Test Suite
```

### Load Testing
```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:5000/api/health

# Using loadtest
npm install -g loadtest
loadtest -c 10 -n 1000 http://localhost:5000/api/health
```

---

## Migration Guide

### From Local Only to Google Drive Integration

```bash
# 1. Setup Google Cloud & credentials
# 2. Update .env with Google credentials
# 3. Run setup endpoint
POST /api/gdrive/setup

# 4. Create first backup
POST /api/gdrive/backup

# 5. Enable auto-sync
ENABLE_GDRIVE_SYNC=true
```

### From JSON to SQL Database

```javascript
// 1. Install database library
npm install sqlite3  // or postgres/mongodb

// 2. Create database migration scripts
scripts/migrate-to-sqlite.js

// 3. Update DatabaseManager to use new database
// 4. Test with subset of data
// 5. Full migration with rollback plan
```

---

## Deployment Checklist

- [ ] All environment variables configured
- [ ] JWT_SECRET is strong and unique
- [ ] Google Drive credentials verified
- [ ] HTTPS/SSL enabled
- [ ] Rate limiting configured
- [ ] Error logging setup
- [ ] Backup strategy tested
- [ ] Performance tested
- [ ] Security audit completed
- [ ] Monitoring & alerts configured
- [ ] Disaster recovery plan documented
- [ ] Team trained on operations

---

## Monitoring & Logging

### Log Levels
```
DEBUG   - Detailed information for developers
INFO    - General application flow
WARNING - Warning messages
ERROR   - Error messages
FATAL   - Critical errors requiring immediate attention
```

### Key Metrics to Monitor
```
- API response time
- Error rate
- Database size
- Google Drive quota usage
- Authentication failure rate
- Backup success rate
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-16 | Initial release with Google Drive integration |

---

## Contributors

- Development Team: Hema News Agency
- Last Updated: 2024-01-16

---

For more details, see:
- `README.md` - API Reference
- `SETUP_AND_DEPLOYMENT.md` - Installation Guide
- `backend/` - Source code with comments
