const express = require("express");
const router = express.Router();

const Servicio = require("../models/Servicio");
const Barbero = require("../models/Barbero");

/**
 * Servicios públicos (solo activos)
 * ejemplo: corte de cabello, barba, etc.
 */
router.get("/servicios", async (req, res) => {
  const servicios = await Servicio.find({ activo: true });
  res.json(servicios);
});

/**
 * Barberos públicos (solo activos)
 */
router.get("/barberos", async (req, res) => {
  const barberos = await Barbero.find({ activo: true });
  res.json(barberos);
});

module.exports = router;
