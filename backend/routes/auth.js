/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { generateToken } = require('../middleware/auth');
const DatabaseManager = require('../utils/DatabaseManager');
const { AppError } = require('../middleware/errorHandler');

const db = new DatabaseManager();

/**
 * Login - POST /api/auth/login
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password, mobileNumber, role } = req.body;

    if (!email && !mobileNumber) {
      throw new AppError('Email or mobile number required', 400, 'INVALID_INPUT');
    }

    if (!password) {
      throw new AppError('Password required', 400, 'INVALID_INPUT');
    }

    // Search by email or mobile
    let user;
    if (email) {
      user = db.findOne('users', { email });
    } else {
      user = db.findOne('users', { mobileNumber });
    }

    if (!user) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Check role match if specified
    if (role && user.role !== role) {
      throw new AppError('Invalid role', 401, 'INVALID_ROLE');
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          mobileNumber: user.mobileNumber,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Register - POST /api/auth/register
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, mobileNumber, password, role = 'customer' } = req.body;

    if (!name || !password) {
      throw new AppError('Name and password required', 400, 'INVALID_INPUT');
    }

    if (!email && !mobileNumber) {
      throw new AppError('Email or mobile number required', 400, 'INVALID_INPUT');
    }

    // Check if user exists
    if (email) {
      const existing = db.findOne('users', { email });
      if (existing) {
        throw new AppError('User already exists', 409, 'USER_EXISTS');
      }
    }

    if (mobileNumber) {
      const existing = db.findOne('users', { mobileNumber });
      if (existing) {
        throw new AppError('Mobile number already registered', 409, 'MOBILE_EXISTS');
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = db.insert('users', {
      name,
      email,
      mobileNumber,
      passwordHash,
      role,
      isActive: true,
      lastLogin: null
    });

    // Generate token
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          mobileNumber: newUser.mobileNumber,
          role: newUser.role
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get current user - GET /api/auth/me
 */
router.get('/me', (req, res, next) => {
  try {
    const user = db.findOne('users', { id: req.user.id });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Change password - POST /api/auth/change-password
 */
router.post('/change-password', async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError('Current and new password required', 400, 'INVALID_INPUT');
    }

    const user = db.findOne('users', { id: req.user.id });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!passwordMatch) {
      throw new AppError('Current password is incorrect', 401, 'INVALID_PASSWORD');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user
    db.update('users', user.id, { passwordHash });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Logout - POST /api/auth/logout
 */
router.post('/logout', (req, res) => {
  // Token invalidation would be handled on frontend
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = router;
