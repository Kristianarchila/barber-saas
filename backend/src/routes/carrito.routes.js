const express = require('express');
const router = express.Router({ mergeParams: true });
const carritoController = require('../controllers/carrito.controller');
const { verificarTokenOpcional } = require('../config/middleware/auth.middleware');

// Todas las rutas del carrito permiten usuarios autenticados o anónimos
router.get('/', verificarTokenOpcional, carritoController.obtenerCarrito);
router.post('/agregar', verificarTokenOpcional, carritoController.agregarProducto);
router.put('/item/:itemId', verificarTokenOpcional, carritoController.actualizarCantidad);
router.delete('/item/:itemId', verificarTokenOpcional, carritoController.removerProducto);
router.delete('/vaciar', verificarTokenOpcional, carritoController.vaciarCarrito);
router.post('/migrar', verificarTokenOpcional, carritoController.migrarCarrito);

module.exports = router;
