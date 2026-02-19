const express = require('express');
const router = express.Router({ mergeParams: true });
const pedidosController = require('../controllers/pedidos.controller');
const { verificarToken, esAdmin } = require('../config/middleware/auth.middleware');

// Rutas para clientes (requieren autenticación)
router.post('/', verificarToken, pedidosController.crearPedido);
router.get('/mis-pedidos', verificarToken, pedidosController.obtenerMisPedidos);
router.get('/:id', verificarToken, pedidosController.obtenerPedido);
router.post('/:id/cancelar', verificarToken, pedidosController.cancelarPedido);

// Rutas de administración (requieren autenticación y rol admin)
router.get('/', verificarToken, esAdmin, pedidosController.obtenerTodosPedidos);
router.patch('/:id/estado', verificarToken, esAdmin, pedidosController.actualizarEstado);
router.get('/estadisticas/ventas', verificarToken, esAdmin, pedidosController.obtenerEstadisticas);

module.exports = router;
