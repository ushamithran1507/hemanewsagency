/**
 * Staff Management Routes
 */

const express = require('express');
const router = express.Router();
const { authorize } = require('../middleware/auth');
const DatabaseManager = require('../utils/DatabaseManager');
const { AppError } = require('../middleware/errorHandler');

const db = new DatabaseManager();

/**
 * Get all staff - GET /api/staff
 */
router.get('/', async (req, res, next) => {
  try {
    const staff = db.read('staff');
    res.json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
});

/**
 * Create staff member - POST /api/staff
 */
router.post('/', authorize('admin'), async (req, res, next) => {
  try {
    const { name, role, mobileNumber, email, area, dailyRate } = req.body;

    if (!name || !mobileNumber) {
      throw new AppError('Name and mobile required', 400, 'INVALID_INPUT');
    }

    const newStaff = db.insert('staff', {
      name,
      role,
      mobileNumber,
      email,
      area,
      dailyRate: parseFloat(dailyRate) || 0,
      monthlySalary: parseFloat(dailyRate) * 26 || 0,
      status: 'active',
      joiningDate: new Date(),
      attendance: []
    });

    res.status(201).json({
      success: true,
      message: 'Staff member added successfully',
      data: newStaff
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Mark attendance - POST /api/staff/attendance
 */
router.post('/attendance', authorize('admin'), async (req, res, next) => {
  try {
    const { staffId, date, status } = req.body;

    if (!staffId || !date || !status) {
      throw new AppError('Required fields missing', 400, 'INVALID_INPUT');
    }

    const record = db.insert('transactions', {
      type: 'attendance',
      staffId,
      date,
      status,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Attendance recorded',
      data: record
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get attendance summary - GET /api/staff/:staffId/attendance
 */
router.get('/:staffId/attendance', async (req, res, next) => {
  try {
    const records = db.find('transactions', {
      type: 'attendance',
      staffId: req.params.staffId
    });

    res.json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
