const express = require("express");
const router = express.Router({ mergeParams: true });
const {
    getInventario,
    getInventarioItem,
    createInventario,
    updateInventario,
    deleteInventario,
    registrarMovimiento,
    getMovimientos,
    getAlertasStock,
} = require("../controllers/inventario.controller");
const { protect, esAdmin } = require("../config/middleware/auth.middleware");
const { getBarberiaBySlug } = require("../config/middleware/barberiaMiddleware");
const validateJoi = require("../middleware/joiValidation.middleware");
const { inventarioSchema, movimientoSchema, mongoIdParamsSchema } = require("../validators/common.joi");

// Aplicar middlewares
router.use(protect);
router.use(getBarberiaBySlug);
router.use(esAdmin);

// Rutas de movimientos (antes de las rutas con :id para evitar conflictos)
router.get("/movimientos", getMovimientos);
router.get("/alertas", getAlertasStock);

// Rutas de inventario
router.get("/", getInventario);
router.post("/", validateJoi(inventarioSchema), createInventario);
router.get("/:id", validateJoi(mongoIdParamsSchema, "params"), getInventarioItem);
router.put("/:id", validateJoi(mongoIdParamsSchema, "params"), validateJoi(inventarioSchema), updateInventario);
router.delete("/:id", validateJoi(mongoIdParamsSchema, "params"), deleteInventario);

// Registrar movimiento de stock
router.post("/:id/movimiento", validateJoi(mongoIdParamsSchema, "params"), validateJoi(movimientoSchema), registrarMovimiento);

module.exports = router;
