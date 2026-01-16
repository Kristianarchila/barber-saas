const express = require("express");
const router = express.Router();

const { createBarberiaAdmin,createUsuarioBarbero } = require("../controllers/user.controller");
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

module.exports = router;
