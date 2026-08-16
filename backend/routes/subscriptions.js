/**
 * Subscriptions Routes
 */

const express = require('express');
const router = express.Router();
const { authorize } = require('../middleware/auth');
const DatabaseManager = require('../utils/DatabaseManager');
const { AppError } = require('../middleware/errorHandler');

const db = new DatabaseManager();

/**
 * Get all publications - GET /api/subscriptions/publications
 */
router.get('/publications', async (req, res, next) => {
  try {
    const publications = db.read('publications');
    res.json({ success: true, data: publications });
  } catch (error) {
    next(error);
  }
});

/**
 * Create publication - POST /api/subscriptions/publications
 */
router.post('/publications', authorize('admin'), async (req, res, next) => {
  try {
    const { name, type, monthlyRate } = req.body;

    if (!name) {
      throw new AppError('Publication name required', 400, 'INVALID_INPUT');
    }

    const newPub = db.insert('publications', {
      name,
      type,
      monthlyRate: parseFloat(monthlyRate) || 0,
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Publication created',
      data: newPub
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Subscribe customer to publication - POST /api/subscriptions
 */
router.post('/', authorize('admin'), async (req, res, next) => {
  try {
    const { customerId, publicationId, subscriptionType, days } = req.body;

    const newSub = db.insert('subscriptions', {
      customerId,
      publicationId,
      subscriptionType,
      days: days || [],
      startDate: new Date(),
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Subscription created',
      data: newSub
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get customer subscriptions - GET /api/subscriptions/customer/:customerId
 */
router.get('/customer/:customerId', async (req, res, next) => {
  try {
    const subs = db.find('subscriptions', { customerId: req.params.customerId });
    res.json({ success: true, data: subs });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
