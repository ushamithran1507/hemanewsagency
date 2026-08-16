/**
 * HEMA NEWS AGENCY - Main Backend Server
 * Express API with Google Drive Integration
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

// Import route handlers
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const billingRoutes = require('./routes/billing');
const staffRoutes = require('./routes/staff');
const subscriptionRoutes = require('./routes/subscriptions');
const grievanceRoutes = require('./routes/grievances');
const driveRoutes = require('./routes/gdrive');
const dashboardRoutes = require('./routes/dashboard');

// Import middleware
const { authenticate } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Public routes (no authentication required)
app.use('/api/auth', authRoutes);

// Protected routes (authentication required)
app.use('/api/customers', authenticate, customerRoutes);
app.use('/api/billing', authenticate, billingRoutes);
app.use('/api/staff', authenticate, staffRoutes);
app.use('/api/subscriptions', authenticate, subscriptionRoutes);
app.use('/api/grievances', authenticate, grievanceRoutes);
app.use('/api/gdrive', authenticate, driveRoutes);
app.use('/api/dashboard', authenticate, dashboardRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path
  });
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║     HEMA NEWS AGENCY - BACKEND SERVER     ║
  ║  Newspaper Distribution Management System  ║
  ╚═══════════════════════════════════════════╝
  
  🚀 Server running on: http://localhost:${PORT}
  📂 Google Drive Integration: ${process.env.GOOGLE_DRIVE_ENABLED === 'true' ? '✓ Enabled' : '✗ Disabled'}
  🔐 Authentication: ${process.env.JWT_SECRET ? '✓ Configured' : '✗ Not configured'}
  
  API Documentation:
  - Auth: POST /api/auth/login
  - Customers: GET/POST/PUT /api/customers
  - Billing: GET/POST /api/billing
  - Staff: GET/POST /api/staff
  - Dashboard: GET /api/dashboard/stats
  - Google Drive: GET/POST /api/gdrive/backup
  `);
});

module.exports = app;
