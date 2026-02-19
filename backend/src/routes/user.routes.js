const express = require("express");
const router = express.Router();

const { createBarberiaAdmin, createUsuarioBarbero, getMyBarberias, obtenerClientesByBarberia, createCliente } = require("../controllers/user.controller");
const { protect, authorize } = require("../config/middleware/auth.middleware");

// Crear BARBERIA_ADMIN
router.post(
  "/barberia-admin",
  protect,
  authorize("SUPER_ADMIN"),
  createBarberiaAdmin
);

// Crear BARBERO
router.post(
  "/barbero",
  protect,
  authorize("BARBERIA_ADMIN"),
  createUsuarioBarbero
);

// Obtener mis barberías
router.get(
  "/me/barberias",
  protect,
  getMyBarberias
);

// Obtener clientes de la barbería
router.get(
  "/admin/clientes",
  protect,
  authorize("BARBERIA_ADMIN", "BARBERO"),
  obtenerClientesByBarberia
);

// Crear nuevo cliente
router.post(
  "/admin/clientes",
  protect,
  authorize("BARBERIA_ADMIN", "BARBERO"),
  createCliente
);

module.exports = router;
