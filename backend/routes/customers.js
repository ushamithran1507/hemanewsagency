/**
 * Customer Management Routes
 */

const express = require('express');
const router = express.Router();
const { authorize } = require('../middleware/auth');
const DatabaseManager = require('../utils/DatabaseManager');
const { AppError } = require('../middleware/errorHandler');

const db = new DatabaseManager();

/**
 * Get all customers - GET /api/customers
 */
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    let customers = db.read('customers');

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      customers = customers.filter(c =>
        c.name?.toLowerCase().includes(searchLower) ||
        c.email?.toLowerCase().includes(searchLower) ||
        c.mobileNumber?.includes(search) ||
        c.areaLocality?.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const start = (page - 1) * limit;
    const paginatedCustomers = customers.slice(start, start + parseInt(limit));

    res.json({
      success: true,
      data: paginatedCustomers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: customers.length,
        pages: Math.ceil(customers.length / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get single customer - GET /api/customers/:id
 */
router.get('/:id', async (req, res, next) => {
  try {
    const customer = db.findOne('customers', { id: req.params.id });

    if (!customer) {
      throw new AppError('Customer not found', 404, 'CUSTOMER_NOT_FOUND');
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Create customer - POST /api/customers
 */
router.post('/', authorize('admin'), async (req, res, next) => {
  try {
    const {
      name, email, mobileNumber, whatsapp, houseNumber, address,
      landmark, areaLocality, area, line, billingDueDay, paymentMethod,
      walletBalance, assignedStaffId, yearlySubscriber
    } = req.body;

    if (!name || !mobileNumber) {
      throw new AppError('Name and mobile number required', 400, 'INVALID_INPUT');
    }

    // Check if customer exists
    const existing = db.findOne('customers', { mobileNumber });
    if (existing) {
      throw new AppError('Customer already exists', 409, 'CUSTOMER_EXISTS');
    }

    const newCustomer = db.insert('customers', {
      name,
      email,
      mobileNumber,
      whatsapp: whatsapp || mobileNumber,
      houseNumber,
      address,
      landmark,
      areaLocality,
      area,
      line,
      billingDueDay: billingDueDay || 15,
      paymentMethod: paymentMethod || 'UPI',
      walletBalance: parseFloat(walletBalance) || 0,
      assignedStaffId,
      yearlySubscriber: yearlySubscriber === 'yes',
      status: 'active',
      totalBilled: 0,
      totalPaid: 0
    });

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: newCustomer
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Update customer - PUT /api/customers/:id
 */
router.put('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const customer = db.findOne('customers', { id: req.params.id });

    if (!customer) {
      throw new AppError('Customer not found', 404, 'CUSTOMER_NOT_FOUND');
    }

    const updated = db.update('customers', req.params.id, req.body);

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Delete customer - DELETE /api/customers/:id
 */
router.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    db.delete('customers', req.params.id);

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Bulk import customers - POST /api/customers/bulk/import
 */
router.post('/bulk/import', authorize('admin'), async (req, res, next) => {
  try {
    const { customers } = req.body;

    if (!Array.isArray(customers)) {
      throw new AppError('Customers must be an array', 400, 'INVALID_INPUT');
    }

    let created = 0, updated = 0, errors = [];

    customers.forEach((customer, index) => {
      try {
        const existing = db.findOne('customers', { mobileNumber: customer.mobileNumber });

        if (existing) {
          db.update('customers', existing.id, customer);
          updated++;
        } else {
          db.insert('customers', {
            ...customer,
            status: customer.status || 'active',
            walletBalance: parseFloat(customer.walletBalance) || 0
          });
          created++;
        }
      } catch (error) {
        errors.push({
          row: index + 1,
          customer: customer.name,
          error: error.message
        });
      }
    });

    res.json({
      success: true,
      message: `Import completed: ${created} created, ${updated} updated`,
      data: {
        created,
        updated,
        errors,
        total: customers.length
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get customers by area - GET /api/customers/area/:area
 */
router.get('/area/:area', async (req, res, next) => {
  try {
    const customers = db.find('customers', { area: req.params.area });

    res.json({
      success: true,
      data: customers,
      count: customers.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Toggle customer active status - PATCH /api/customers/:id/toggle-status
 */
router.patch('/:id/toggle-status', authorize('admin'), async (req, res, next) => {
  try {
    const customer = db.findOne('customers', { id: req.params.id });

    if (!customer) {
      throw new AppError('Customer not found', 404, 'CUSTOMER_NOT_FOUND');
    }

    const newStatus = customer.status === 'active' ? 'inactive' : 'active';
    const updated = db.update('customers', req.params.id, { status: newStatus });

    res.json({
      success: true,
      message: `Customer status changed to ${newStatus}`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
