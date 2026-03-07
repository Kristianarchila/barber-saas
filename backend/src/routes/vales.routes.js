const express = require("express");
const router = express.Router();
const valesController = require("../controllers/vales.controller");

// Auth/tenant middleware is applied at app.js level via tenantAdminMiddleware
// These routes are mounted at /api/barberias/:slug/admin/vales

// Registrar nuevo vale
router.post("/", valesController.registrarVale);

// Listar vales con filtros opcionales
router.get("/", valesController.obtenerVales);

// Actualizar estado de vale (ej: PENDIENTE → DESCONTADO)
router.put("/:id", valesController.actualizarVale);

// Soft delete
router.delete("/:id", valesController.eliminarVale);

module.exports = router;
