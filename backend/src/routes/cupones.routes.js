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
const validateJoi = require("../middleware/joiValidation.middleware");
const { cuponSchema, validarCuponSchema, mongoIdParamsSchema } = require("../validators/common.joi");

// Aplicar middlewares básicos
router.use(protect);
router.use(getBarberiaBySlug);

// Validación de cupón (accesible para todos los usuarios autenticados)
router.post("/validar", validateJoi(validarCuponSchema), validarCuponEndpoint);

// Rutas de administración (solo admin)
router.get("/", esAdmin, getCupones);
router.post("/", esAdmin, validateJoi(cuponSchema), createCupon);
router.put("/:id", esAdmin, validateJoi(mongoIdParamsSchema, "params"), validateJoi(cuponSchema), updateCupon);
router.delete("/:id", esAdmin, validateJoi(mongoIdParamsSchema, "params"), deleteCupon);
router.get("/:id/estadisticas", esAdmin, getCuponStats);

module.exports = router;
