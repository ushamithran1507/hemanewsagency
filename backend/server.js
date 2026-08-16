/**
 * HEMA NEWS AGENCY - Main Backend Server
 * Express API with Google Drive Integration
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
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
  origin: process.env.FRONTEND_URL || '*',
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

// Root endpoint - Serve Login Page
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Hema News Agency - Login</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }
        
        .login-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          width: 100%;
          max-width: 450px;
          padding: 50px 40px;
          animation: slideUp 0.5s ease-out;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .logo-section {
          text-align: center;
          margin-bottom: 40px;
        }
        
        .logo {
          font-size: 48px;
          margin-bottom: 15px;
        }
        
        .logo-text {
          font-size: 28px;
          font-weight: 700;
          color: #667eea;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }
        
        .logo-subtitle {
          font-size: 13px;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }
        
        .form-group {
          margin-bottom: 24px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #333;
          font-weight: 600;
          font-size: 14px;
        }
        
        .form-group input {
          width: 100%;
          padding: 12px 15px;
          border: 2px solid #e5e5e5;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.3s ease;
          font-family: inherit;
        }
        
        .form-group input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .form-group input::placeholder {
          color: #bbb;
        }
        
        .login-btn {
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        }
        
        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        
        .login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .message {
          margin-top: 20px;
          padding: 12px;
          border-radius: 6px;
          display: none;
          text-align: center;
          font-size: 13px;
        }
        
        .message.error {
          background: #fee;
          color: #c33;
          display: block;
          border-left: 4px solid #c33;
        }
        
        .message.success {
          background: #efe;
          color: #3c3;
          display: block;
          border-left: 4px solid #3c3;
        }
        
        .loading {
          display: none;
          text-align: center;
          font-size: 13px;
          color: #667eea;
        }
        
        .spinner {
          border: 2px solid #f3f3f3;
          border-top: 2px solid #667eea;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          animation: spin 1s linear infinite;
          display: inline-block;
          margin-right: 8px;
          vertical-align: middle;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .demo-creds {
          background: #f9f9f9;
          border: 1px solid #e5e5e5;
          border-radius: 8px;
          padding: 15px;
          margin-top: 25px;
          font-size: 12px;
          color: #666;
        }
        
        .demo-creds strong {
          color: #333;
          display: block;
          margin-bottom: 8px;
        }
        
        .demo-creds p {
          margin: 4px 0;
          font-family: monospace;
          color: #667eea;
        }
      </style>
    </head>
    <body>
      <div class="login-container">
        <div class="logo-section">
          <div class="logo">📰</div>
          <div class="logo-text">Hema News Agency</div>
          <div class="logo-subtitle">Newspaper Distribution System</div>
        </div>
        
        <form id="loginForm">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              placeholder="Enter your email"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              placeholder="Enter your password"
              required
            >
          </div>
          
          <button type="submit" class="login-btn" id="submitBtn">
            Sign In
          </button>
          
          <div class="loading" id="loading">
            <span class="spinner"></span>Signing in...
          </div>
          
          <div class="message" id="message"></div>
        </form>
        
        <div class="demo-creds">
          <strong>🧪 Test Credentials:</strong>
          <p>Email: demo@hemanews.com</p>
          <p>Password: Demo@123</p>
        </div>
      </div>
      
      <script>
        const form = document.getElementById('loginForm');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const submitBtn = document.getElementById('submitBtn');
        const loading = document.getElementById('loading');
        const message = document.getElementById('message');
        
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const email = emailInput.value.trim();
          const password = passwordInput.value;
          
          if (!email || !password) {
            showMessage('Please fill in all fields', 'error');
            return;
          }
          
          submitBtn.disabled = true;
          submitBtn.style.display = 'none';
          loading.style.display = 'block';
          message.textContent = '';
          message.className = 'message';
          
          try {
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok && data.token) {
              // Store token in localStorage
              localStorage.setItem('authToken', data.token);
              localStorage.setItem('user', JSON.stringify(data.user || { email }));
              
              showMessage('Login successful! Redirecting...', 'success');
              
              // Redirect after 1.5 seconds
              setTimeout(() => {
                // You can redirect to a dashboard or another page
                window.location.href = '/dashboard' || '/';
              }, 1500);
            } else {
              showMessage(data.message || 'Login failed. Please try again.', 'error');
            }
          } catch (error) {
            console.error('Login error:', error);
            showMessage('Network error. Please try again.', 'error');
          } finally {
            submitBtn.disabled = false;
            submitBtn.style.display = 'block';
            loading.style.display = 'none';
          }
        });
        
        function showMessage(text, type) {
          message.textContent = text;
          message.className = 'message ' + type;
        }
        
        // Auto-fill demo credentials for testing
        emailInput.addEventListener('focus', () => {
          if (!emailInput.value) {
            emailInput.value = 'demo@hemanews.com';
            passwordInput.value = 'Demo@123';
          }
        });
      </script>
    </body>
    </html>
  `);
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
  
  📋 API Routes:
  - Login Page: GET /
  - Auth: POST /api/auth/login
  - Customers: GET/POST/PUT /api/customers
  - Billing: GET/POST /api/billing
  - Staff: GET/POST /api/staff
  - Dashboard: GET /api/dashboard/stats
  - Google Drive: GET/POST /api/gdrive/backup
  `);
});

module.exports = app;

