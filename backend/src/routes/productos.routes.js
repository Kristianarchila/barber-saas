const express = require('express');
const router = express.Router({ mergeParams: true });
const productosController = require('../controllers/productos.controller');
const { verificarToken, esAdmin } = require('../config/middleware/auth.middleware');
const validateJoi = require('../middleware/joiValidation.middleware');
const {
    productoSchema,
    productoParamsSchema,
    queryProductosSchema
} = require('../validators/common.joi');

// Rutas públicas - CON VALIDACIÓN DE QUERY JOI
router.get('/',
    validateJoi(queryProductosSchema, 'query'),
    productosController.obtenerProductos
);

router.get('/destacados', productosController.obtenerDestacados);
router.get('/categoria/:categoria', productosController.obtenerPorCategoria);

router.get('/:id',
    validateJoi(productoParamsSchema, 'params'),
    productosController.obtenerProducto
);

// Rutas de administración (requieren autenticación y rol admin)
router.post('/',
    verificarToken,
    esAdmin,
    validateJoi(productoSchema),
    productosController.crearProducto
);

router.put('/:id',
    verificarToken,
    esAdmin,
    validateJoi(productoParamsSchema, 'params'),
    validateJoi(productoSchema),
    productosController.actualizarProducto
);

router.patch('/:id/stock',
    verificarToken,
    esAdmin,
    validateJoi(productoParamsSchema, 'params'),
    productosController.actualizarStock
);

router.delete('/:id',
    verificarToken,
    esAdmin,
    validateJoi(productoParamsSchema, 'params'),
    productosController.eliminarProducto
);

module.exports = router;
