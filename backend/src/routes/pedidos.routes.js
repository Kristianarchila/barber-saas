const express = require('express');
const router = express.Router({ mergeParams: true });
const pedidosController = require('../controllers/pedidos.controller');
const { verificarToken, esAdmin } = require('../config/middleware/auth.middleware');
const validateJoi = require('../middleware/joiValidation.middleware');
const { pedidoSchema, actualizarEstadoPedidoSchema, mongoIdParamsSchema } = require('../validators/common.joi');

// Rutas para clientes (requieren autenticación)
router.post('/', verificarToken, validateJoi(pedidoSchema), pedidosController.crearPedido);
router.get('/mis-pedidos', verificarToken, pedidosController.obtenerMisPedidos);
router.get('/:id', verificarToken, validateJoi(mongoIdParamsSchema, 'params'), pedidosController.obtenerPedido);
router.post('/:id/cancelar', verificarToken, validateJoi(mongoIdParamsSchema, 'params'), pedidosController.cancelarPedido);

// Rutas de administración (requieren autenticación y rol admin)
router.get('/', verificarToken, esAdmin, pedidosController.obtenerTodosPedidos);
router.patch('/:id/estado', verificarToken, esAdmin, validateJoi(mongoIdParamsSchema, 'params'), validateJoi(actualizarEstadoPedidoSchema), pedidosController.actualizarEstado);
router.get('/estadisticas/ventas', verificarToken, esAdmin, pedidosController.obtenerEstadisticas);

module.exports = router;
