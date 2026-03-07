const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/venta.controller');
const { protect, authorize } = require('../config/middleware/auth.middleware');
const { validateBarberiaOwnership } = require('../config/middleware/checkBarberia');
const validateJoi = require('../middleware/joiValidation.middleware');
const { ventaSchema } = require('../validators/common.joi');

router.use(protect);
router.use(authorize('BARBERIA_ADMIN', 'BARBERO'));

// Registrar una nueva venta
router.post('/', validateJoi(ventaSchema), ventaController.registrarVenta);

// Obtener historial de ventas
router.get('/historial', ventaController.obtenerHistorialVentas);

// Top productos más vendidos del mes
router.get('/top-productos', ventaController.getTopProductos);

module.exports = router;
