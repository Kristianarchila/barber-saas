const express = require('express');
const router = express.Router({ mergeParams: true });
const revenueConfigController = require('../controllers/revenueConfig.controller');
const { protect, authorize } = require('../config/middleware/auth.middleware');
const { extractBarberiaId } = require('../config/middleware/extractBarberiaId');

// Todas las rutas requieren autenticación y rol BARBERIA_ADMIN
router.use(protect);
router.use(authorize('BARBERIA_ADMIN'));
router.use(extractBarberiaId);

// Configuración general
router.get('/', revenueConfigController.getConfig);
router.put('/', revenueConfigController.updateConfig);

// Overrides por barbero
router.get('/barberos/:barberoId', revenueConfigController.getOverrideBarbero);
router.put('/barberos/:barberoId', revenueConfigController.setOverrideBarbero);

// Overrides por servicio
router.put('/servicios/:servicioId', revenueConfigController.setOverrideServicio);

// Eliminar overrides
router.delete('/overrides/:tipo/:id', revenueConfigController.deleteOverride);

module.exports = router;
