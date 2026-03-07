const express = require("express");
const router = express.Router({ mergeParams: true });
const {
    getProveedores,
    getProveedor,
    createProveedor,
    updateProveedor,
    deleteProveedor,
} = require("../controllers/proveedores.controller");
const { protect, esAdmin } = require("../config/middleware/auth.middleware");
const { getBarberiaBySlug } = require("../config/middleware/barberiaMiddleware");
const validateJoi = require("../middleware/joiValidation.middleware");
const { proveedorSchema, mongoIdParamsSchema } = require("../validators/common.joi");

// Aplicar middlewares
router.use(protect);
router.use(getBarberiaBySlug);
router.use(esAdmin);

// CRUD de proveedores
router.get("/", getProveedores);
router.post("/", validateJoi(proveedorSchema), createProveedor);
router.get("/:id", validateJoi(mongoIdParamsSchema, "params"), getProveedor);
router.put("/:id", validateJoi(mongoIdParamsSchema, "params"), validateJoi(proveedorSchema), updateProveedor);
router.delete("/:id", validateJoi(mongoIdParamsSchema, "params"), deleteProveedor);

module.exports = router;
