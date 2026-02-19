const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/venta.controller');
const { protect, authorize } = require('../config/middleware/auth.middleware');
const { validateBarberiaOwnership } = require('../config/middleware/checkBarberia');

/**
 * Rutas de Ventas (POS)
 */

router.use(protect);
router.use(authorize('BARBERIA_ADMIN', 'BARBERO')); // Ambos pueden registrar ventas? (Admin usualmente, pero barbero puede en apps pequeñas)

// Registrar una nueva venta
router.post('/', ventaController.registrarVenta);

// Obtener historial de ventas
router.get('/historial', ventaController.obtenerHistorialVentas);

module.exports = router;
