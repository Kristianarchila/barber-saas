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

// Aplicar middlewares
router.use(protect);
router.use(getBarberiaBySlug);
router.use(esAdmin);

// CRUD de proveedores
router.get("/", getProveedores);
router.post("/", createProveedor);
router.get("/:id", getProveedor);
router.put("/:id", updateProveedor);
router.delete("/:id", deleteProveedor);

module.exports = router;
