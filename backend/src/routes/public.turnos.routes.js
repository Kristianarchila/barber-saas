const express = require("express");
const router = express.Router();

const { getDisponibilidad } = require("../controllers/turnos.controller");

// ⚠️ RUTA MULTI-TENANT CON SLUG
router.get(
  "/:slug/barberos/:barberoId/disponibilidad",
  getDisponibilidad
);

module.exports = router;
