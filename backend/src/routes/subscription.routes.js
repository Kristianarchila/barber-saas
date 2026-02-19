/**
 * Subscription Routes
 * 
 * Routes for subscription management.
 */

const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const authMiddleware = require('../config/middleware/auth.middleware');

// All routes require authentication
router.use(authMiddleware.protect);

// Get current subscription
router.get('/current', subscriptionController.getCurrentSubscription);

// Get available plans
router.get('/plans', subscriptionController.getPlans);

// Create subscription
router.post('/create', subscriptionController.createSubscription);

// Update subscription (change plan)
router.post('/update', subscriptionController.updateSubscription);

// Cancel subscription
router.post('/cancel', subscriptionController.cancelSubscription);

// Check plan limits
router.get('/limits', subscriptionController.checkPlanLimits);

// Get invoices/payment history
router.get('/invoices', subscriptionController.getInvoices);

module.exports = router;
