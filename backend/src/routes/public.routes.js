const express = require("express");
const router = express.Router();

// Importar controller nuevo
const {
  getBarberiaBySlug,
  getBarberosBySlug,
  getServiciosBySlug,
  getDisponibilidadBySlug,
  crearReservaBySlug,
  getBarberiaManifest,
  getProductosTienda,
} = require("../controllers/public.controller");
const { publicApiLimiter } = require("../middleware/rateLimit.middleware");
const validateJoi = require("../middleware/joiValidation.middleware");
const { crearReservaSchema } = require("../validators/common.joi");

// Apply limiter to all public routes
router.use(publicApiLimiter);

// =========================================================
// RUTAS NUEVAS (Sistema completo por SLUG)
// =========================================================

// Información de la barbería
router.get("/:slug", getBarberiaBySlug);

// PWA Manifest dinámico (multi-tenant) — ANTES de rutas con parámetros :barberoId
// para evitar que "manifest.json" sea capturado como un barberoId
router.get("/:slug/manifest.json", getBarberiaManifest);

// Barberos de la barbería
router.get("/:slug/barberos", getBarberosBySlug);

// Servicios de la barbería
router.get("/:slug/servicios", getServiciosBySlug);

// Disponibilidad de un barbero
router.get("/:slug/barberos/:barberoId/disponibilidad", getDisponibilidadBySlug);

// Crear reserva
router.post("/:slug/barberos/:barberoId/reservar", validateJoi(crearReservaSchema), crearReservaBySlug);

// 🛒 Marketplace: productos de la tienda pública
router.get("/:slug/tienda/productos", getProductosTienda);

module.exports = router;
