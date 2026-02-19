const express = require('express');
const router = express.Router({ mergeParams: true });
const clienteStatsController = require('../controllers/clienteStats.controller');
const authMiddleware = require('../config/middleware/auth.middleware');

/**
 * @file clienteStats.routes.js
 * @description Routes for client statistics and cancellation limits management
 * All routes require admin authentication
 */

// Apply authentication and admin authorization to all routes
router.use(authMiddleware.protect);
router.use(authMiddleware.esAdmin);

/**
 * GET /api/:slug/admin/cliente-stats/summary
 * Get statistics summary (total clients, blocked, active)
 */
router.get('/summary', clienteStatsController.getSummary);

/**
 * GET /api/:slug/admin/cliente-stats/bloqueados
 * Get all blocked clients
 */
router.get('/bloqueados', clienteStatsController.getBloqueados);

/**
 * GET /api/:slug/admin/cliente-stats/politicas
 * Get current cancellation policies
 */
router.get('/politicas', clienteStatsController.getPoliticas);

/**
 * PUT /api/:slug/admin/cliente-stats/politicas
 * Update cancellation policies
 */
router.put('/politicas', clienteStatsController.updatePoliticas);

/**
 * POST /api/:slug/admin/cliente-stats/reset-monthly
 * Manually trigger monthly reset (for testing)
 */
router.post('/reset-monthly', clienteStatsController.resetMonthly);

/**
 * GET /api/:slug/admin/cliente-stats/:email
 * Get stats for a specific client by email
 */
router.get('/:email', clienteStatsController.getClienteStatsByEmail);

/**
 * POST /api/:slug/admin/cliente-stats/:email/bloquear
 * Manually block a client
 */
router.post('/:email/bloquear', clienteStatsController.bloquearCliente);

/**
 * POST /api/:slug/admin/cliente-stats/:email/desbloquear
 * Manually unblock a client
 */
router.post('/:email/desbloquear', clienteStatsController.desbloquearCliente);

/**
 * GET /api/:slug/admin/cliente-stats
 * Get all client stats (with optional filters)
 * Query params: bloqueado (true/false), email (search), limit (default 100)
 */
router.get('/', clienteStatsController.getClienteStats);

module.exports = router;
