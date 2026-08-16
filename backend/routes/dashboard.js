/**
 * Dashboard Statistics Routes
 */

const express = require('express');
const router = express.Router();
const { authorize } = require('../middleware/auth');
const DatabaseManager = require('../utils/DatabaseManager');

const db = new DatabaseManager();

/**
 * Get dashboard statistics - GET /api/dashboard/stats
 */
router.get('/stats', authorize('admin'), async (req, res, next) => {
  try {
    const customers = db.read('customers');
    const billing = db.read('billing');
    const staff = db.read('staff');
    const grievances = db.read('grievances');
    const subscriptions = db.read('subscriptions');

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const currentBills = billing.filter(b => b.month === currentMonth && b.year === currentYear);
    const activeGrievances = grievances.filter(g => g.status === 'open');

    const stats = {
      totalCustomers: customers.length,
      activeCustomers: customers.filter(c => c.status === 'active').length,
      inactiveCustomers: customers.filter(c => c.status === 'inactive').length,
      
      billing: {
        monthlyBilled: currentBills.reduce((sum, b) => sum + b.amount, 0),
        collected: currentBills.reduce((sum, b) => sum + b.paidAmount, 0),
        outstanding: currentBills.reduce((sum, b) => sum + (b.amount - b.paidAmount), 0),
        billCount: currentBills.length
      },

      staff: {
        total: staff.length,
        active: staff.filter(s => s.status === 'active').length
      },

      subscriptions: {
        total: subscriptions.length,
        active: subscriptions.filter(s => s.status === 'active').length
      },

      grievances: {
        total: grievances.length,
        open: activeGrievances.length,
        resolved: grievances.filter(g => g.status === 'resolved').length
      },

      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get customer area distribution - GET /api/dashboard/areas
 */
router.get('/areas', authorize('admin'), async (req, res, next) => {
  try {
    const customers = db.read('customers');
    const areaDistribution = {};

    customers.forEach(c => {
      if (c.area) {
        areaDistribution[c.area] = (areaDistribution[c.area] || 0) + 1;
      }
    });

    const areas = Object.entries(areaDistribution).map(([name, count]) => ({
      name,
      count
    }));

    res.json({
      success: true,
      data: areas
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get revenue chart data - GET /api/dashboard/revenue
 */
router.get('/revenue', authorize('admin'), async (req, res, next) => {
  try {
    const billing = db.read('billing');
    const months = {};

    billing.forEach(b => {
      const key = `${b.year}-${String(b.month).padStart(2, '0')}`;
      if (!months[key]) months[key] = { billed: 0, collected: 0 };
      months[key].billed += b.amount;
      months[key].collected += b.paidAmount;
    });

    const data = Object.entries(months)
      .sort()
      .slice(-12)
      .map(([month, { billed, collected }]) => ({
        month,
        billed,
        collected,
        outstanding: billed - collected
      }));

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get publications summary - GET /api/dashboard/publications
 */
router.get('/publications', authorize('admin'), async (req, res, next) => {
  try {
    const publications = db.read('publications');
    const subscriptions = db.read('subscriptions');

    const pubStats = publications.map(pub => {
      const subs = subscriptions.filter(s => s.publicationId === pub.id);
      return {
        ...pub,
        subscriberCount: subs.length,
        activeSubscribers: subs.filter(s => s.status === 'active').length
      };
    });

    res.json({
      success: true,
      data: pubStats
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get database health check - GET /api/dashboard/health
 */
router.get('/health', authorize('admin'), async (req, res, next) => {
  try {
    const stats = db.getStats();

    res.json({
      success: true,
      data: {
        status: 'healthy',
        collections: stats,
        dataDir: db.dataDir,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
