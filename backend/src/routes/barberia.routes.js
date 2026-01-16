const express = require("express");
const router = express.Router();

const { createBarberia, getBarberias } = require("../controllers/barberia.controller");
const { protect, authorize } = require("../config/middleware/auth.middleware");

// Crear barbería (solo SUPER_ADMIN)
router.post(
  "/",
  protect,
  authorize("SUPER_ADMIN"),
  createBarberia
);

// Listar barberías (solo SUPER_ADMIN)
router.get(
  "/",
  protect,
  authorize("SUPER_ADMIN"),
  getBarberias
);

module.exports = router;
