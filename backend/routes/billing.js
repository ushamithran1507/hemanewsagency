/**
 * Billing Routes
 */

const express = require('express');
const router = express.Router();
const { authorize } = require('../middleware/auth');
const DatabaseManager = require('../utils/DatabaseManager');
const { AppError } = require('../middleware/errorHandler');

const db = new DatabaseManager();

/**
 * Get all bills - GET /api/billing
 */
router.get('/', async (req, res, next) => {
  try {
    const { customerId, month, year, status } = req.query;
    let bills = db.read('billing');

    if (customerId) bills = bills.filter(b => b.customerId === customerId);
    if (month) bills = bills.filter(b => b.month === parseInt(month));
    if (year) bills = bills.filter(b => b.year === parseInt(year));
    if (status) bills = bills.filter(b => b.status === status);

    res.json({ success: true, data: bills });
  } catch (error) {
    next(error);
  }
});

/**
 * Create bill - POST /api/billing
 */
router.post('/', authorize('admin'), async (req, res, next) => {
  try {
    const { customerId, month, year, amount, items } = req.body;

    if (!customerId || !month || !year || !amount) {
      throw new AppError('Required fields missing', 400, 'INVALID_INPUT');
    }

    const newBill = db.insert('billing', {
      customerId,
      month,
      year,
      amount,
      items: items || [],
      status: 'pending',
      dueDate: new Date(year, month, 15),
      paidDate: null,
      paidAmount: 0,
      notes: ''
    });

    res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      data: newBill
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Record payment - POST /api/billing/payment
 */
router.post('/payment', authorize('admin'), async (req, res, next) => {
  try {
    const { billId, amountPaid, paymentMethod, reference } = req.body;

    const bill = db.findOne('billing', { id: billId });
    if (!bill) {
      throw new AppError('Bill not found', 404, 'BILL_NOT_FOUND');
    }

    const transaction = db.insert('transactions', {
      billId,
      customerId: bill.customerId,
      type: 'payment',
      amount: amountPaid,
      paymentMethod,
      reference,
      status: 'completed'
    });

    // Update bill
    const newStatus = (bill.paidAmount + amountPaid) >= bill.amount ? 'paid' : 'partial';
    db.update('billing', billId, {
      paidAmount: bill.paidAmount + amountPaid,
      status: newStatus,
      paidDate: newStatus === 'paid' ? new Date() : bill.paidDate
    });

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      data: transaction
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get customer bill history - GET /api/billing/customer/:customerId
 */
router.get('/customer/:customerId', async (req, res, next) => {
  try {
    const bills = db.find('billing', { customerId: req.params.customerId });

    res.json({
      success: true,
      data: bills,
      count: bills.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get billing dashboard stats - GET /api/billing/dashboard/stats
 */
router.get('/dashboard/stats', authorize('admin'), async (req, res, next) => {
  try {
    const bills = db.read('billing');
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const currentMonthBills = bills.filter(b => b.month === currentMonth && b.year === currentYear);

    const stats = {
      totalBilled: currentMonthBills.reduce((sum, b) => sum + b.amount, 0),
      totalCollected: currentMonthBills.reduce((sum, b) => sum + b.paidAmount, 0),
      totalOutstanding: currentMonthBills.reduce((sum, b) => sum + (b.amount - b.paidAmount), 0),
      billCount: currentMonthBills.length,
      paidBills: currentMonthBills.filter(b => b.status === 'paid').length,
      partialBills: currentMonthBills.filter(b => b.status === 'partial').length,
      pendingBills: currentMonthBills.filter(b => b.status === 'pending').length
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
