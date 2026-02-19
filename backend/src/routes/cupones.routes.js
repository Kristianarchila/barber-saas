const express = require("express");
const router = express.Router({ mergeParams: true });
const {
    getCupones,
    createCupon,
    updateCupon,
    deleteCupon,
    validarCuponEndpoint,
    getCuponStats,
} = require("../controllers/cupones.controller");
const { protect, esAdmin } = require("../config/middleware/auth.middleware");
const { getBarberiaBySlug } = require("../config/middleware/barberiaMiddleware");

// Aplicar middlewares básicos
router.use(protect);
router.use(getBarberiaBySlug);

// Validación de cupón (accesible para todos los usuarios)
router.post("/validar", validarCuponEndpoint);

// Rutas de administración (solo admin)
router.get("/", esAdmin, getCupones);
router.post("/", esAdmin, createCupon);
router.put("/:id", esAdmin, updateCupon);
router.delete("/:id", esAdmin, deleteCupon);
router.get("/:id/estadisticas", esAdmin, getCuponStats);

module.exports = router;
