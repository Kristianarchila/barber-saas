const express = require("express");
const router = express.Router();

// Importar controller nuevo
const {
  getBarberiaBySlug,
  getBarberosBySlug,
  getServiciosBySlug,
  getDisponibilidadBySlug,
  crearReservaBySlug
} = require("../controllers/public.controller");

// =========================================================
// RUTAS NUEVAS (Sistema completo por SLUG)
// =========================================================

// Información de la barbería
router.get("/:slug", getBarberiaBySlug);

// Barberos de la barbería
router.get("/:slug/barberos", getBarberosBySlug);

// Servicios de la barbería
router.get("/:slug/servicios", getServiciosBySlug);

// Disponibilidad de un barbero
router.get("/:slug/barberos/:barberoId/disponibilidad", getDisponibilidadBySlug);

// Crear reserva
router.post("/:slug/barberos/:barberoId/reservar", crearReservaBySlug);

module.exports = router;

