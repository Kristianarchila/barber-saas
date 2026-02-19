const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../config/middleware/auth.middleware');
const { extractBarberiaId, validateTenantAccess } = require('../middleware/tenantValidation.middleware');
const {
    crearBloqueo,
    obtenerBloqueos,
    obtenerBloqueosPorRango,
    obtenerBloqueosPorFecha,
    eliminarBloqueo
} = require('../controllers/bloqueos.controller');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('BARBERIA_ADMIN', 'SUPER_ADMIN'));

/**
 * @route   GET /api/barberias/:slug/admin/bloqueos
 * @desc    Get all bloqueos for a barberia
 * @access  Private (Admin)
 */
router.get('/', extractBarberiaId, validateTenantAccess, obtenerBloqueos);

/**
 * @route   GET /api/barberias/:slug/admin/bloqueos/rango
 * @desc    Get bloqueos for a date range
 * @access  Private (Admin)
 * @query   fechaInicio, fechaFin, barberoId (optional)
 */
router.get('/rango', extractBarberiaId, validateTenantAccess, obtenerBloqueosPorRango);

/**
 * @route   GET /api/barberias/:slug/admin/bloqueos/fecha/:fecha
 * @desc    Get bloqueos for a specific date
 * @access  Private (Admin)
 * @query   barberoId (optional)
 */
router.get('/fecha/:fecha', extractBarberiaId, validateTenantAccess, obtenerBloqueosPorFecha);

/**
 * @route   POST /api/barberias/:slug/admin/bloqueos
 * @desc    Create a new bloqueo
 * @access  Private (Admin)
 */
router.post('/', extractBarberiaId, validateTenantAccess, crearBloqueo);

/**
 * @route   DELETE /api/barberias/:slug/admin/bloqueos/:id
 * @desc    Delete (deactivate) a bloqueo
 * @access  Private (Admin)
 */
router.delete('/:id', extractBarberiaId, validateTenantAccess, eliminarBloqueo);

module.exports = router;
