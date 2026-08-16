/**
 * Grievances & Issues Routes
 */

const express = require('express');
const router = express.Router();
const { authorize } = require('../middleware/auth');
const DatabaseManager = require('../utils/DatabaseManager');
const { AppError } = require('../middleware/errorHandler');

const db = new DatabaseManager();

/**
 * Report non-receipt - POST /api/grievances/non-receipt
 */
router.post('/non-receipt', async (req, res, next) => {
  try {
    const { customerId, date, publicationId, notes } = req.body;

    if (!customerId || !date) {
      throw new AppError('Customer ID and date required', 400, 'INVALID_INPUT');
    }

    const grievance = db.insert('grievances', {
      type: 'non_receipt',
      customerId,
      publicationId,
      date,
      notes,
      status: 'open',
      reportedAt: new Date(),
      resolvedAt: null
    });

    res.status(201).json({
      success: true,
      message: 'Grievance registered',
      data: grievance
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get all grievances - GET /api/grievances
 */
router.get('/', authorize('admin'), async (req, res, next) => {
  try {
    const { status } = req.query;
    let grievances = db.read('grievances');

    if (status) {
      grievances = grievances.filter(g => g.status === status);
    }

    res.json({
      success: true,
      data: grievances,
      count: grievances.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Resolve grievance - PATCH /api/grievances/:id/resolve
 */
router.patch('/:id/resolve', authorize('admin'), async (req, res, next) => {
  try {
    const { resolution } = req.body;

    const grievance = db.findOne('grievances', { id: req.params.id });
    if (!grievance) {
      throw new AppError('Grievance not found', 404, 'GRIEVANCE_NOT_FOUND');
    }

    const updated = db.update('grievances', req.params.id, {
      status: 'resolved',
      resolution,
      resolvedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Grievance resolved',
      data: updated
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get pending grievances - GET /api/grievances/pending/count
 */
router.get('/pending/count', authorize('admin'), async (req, res, next) => {
  try {
    const grievances = db.find('grievances', { status: 'open' });

    res.json({
      success: true,
      count: grievances.length,
      grievances: grievances
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
