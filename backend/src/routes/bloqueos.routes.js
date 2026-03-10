const express = require('express');
const router = express.Router({ mergeParams: true }); // ← mergeParams so :slug is visible here
const { protect, authorize } = require('../config/middleware/auth.middleware');
const {
    crearBloqueo,
    obtenerBloqueos,
    obtenerBloqueosPorRango,
    obtenerBloqueosPorFecha,
    eliminarBloqueo
} = require('../controllers/bloqueos.controller');
const validateJoi = require('../middleware/joiValidation.middleware');
const { bloqueoSchema, mongoIdParamsSchema } = require('../validators/common.joi');

// Auth + role guard (extractBarberiaId & validateTenantAccess are applied
// globally in app.js before these routes, so we do NOT repeat them here)
router.use(protect);
router.use(authorize('BARBERIA_ADMIN', 'SUPER_ADMIN'));

// ─────────────────────────────────────────── GET routes ──
router.get('/', obtenerBloqueos);
router.get('/rango', obtenerBloqueosPorRango);
router.get('/fecha/:fecha', obtenerBloqueosPorFecha);

// ─────────────────────────────────────────── POST ────────
router.post('/', validateJoi(bloqueoSchema), crearBloqueo);

// ─────────────────────────────────────────── DELETE ──────
router.delete('/:id', validateJoi(mongoIdParamsSchema, 'params'), eliminarBloqueo);

module.exports = router;
