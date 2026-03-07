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
const validateJoi = require('../middleware/joiValidation.middleware');
const { bloqueoSchema, mongoIdParamsSchema } = require('../validators/common.joi');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('BARBERIA_ADMIN', 'SUPER_ADMIN'));

router.get('/', extractBarberiaId, validateTenantAccess, obtenerBloqueos);
router.get('/rango', extractBarberiaId, validateTenantAccess, obtenerBloqueosPorRango);
router.get('/fecha/:fecha', extractBarberiaId, validateTenantAccess, obtenerBloqueosPorFecha);

// Crear bloqueo — con validación de body
router.post('/', extractBarberiaId, validateTenantAccess, validateJoi(bloqueoSchema), crearBloqueo);

// Eliminar bloqueo — con validación de :id
router.delete('/:id', validateJoi(mongoIdParamsSchema, 'params'), extractBarberiaId, validateTenantAccess, eliminarBloqueo);

module.exports = router;
