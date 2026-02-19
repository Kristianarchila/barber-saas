const express = require("express");
const router = express.Router({ mergeParams: true });
const {
    getInventario,
    getInventarioItem,
    createInventario,
    updateInventario,
    registrarMovimiento,
    getMovimientos,
    getAlertasStock,
} = require("../controllers/inventario.controller");
const { protect, esAdmin } = require("../config/middleware/auth.middleware");
const { getBarberiaBySlug } = require("../config/middleware/barberiaMiddleware");

// Aplicar middlewares
router.use(protect);
router.use(getBarberiaBySlug);
router.use(esAdmin);

// Rutas de movimientos (antes de las rutas con :id para evitar conflictos)
router.get("/movimientos", getMovimientos);
router.get("/alertas", getAlertasStock);

// Rutas de inventario
router.get("/", getInventario);
router.post("/", createInventario);
router.get("/:id", getInventarioItem);
router.put("/:id", updateInventario);

// Registrar movimiento de stock
router.post("/:id/movimiento", registrarMovimiento);

module.exports = router;
