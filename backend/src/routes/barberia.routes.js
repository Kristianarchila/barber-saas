const express = require("express");
const router = express.Router();

const {
  createBarberia,
  getBarberias,
  getBarberiaById,
  getMiBarberia,
  actualizarConfiguracionGeneral,
  actualizarConfiguracionEmail,
  getConfiguracionEmail,
  testConfiguracionEmail
} = require("../controllers/barberia.controller");

const { protect, authorize } = require("../config/middleware/auth.middleware");

// 🔐 RUTAS MI BARBERIA
router.get(
  "/me",
  protect,
  authorize("BARBERIA_ADMIN"),
  getMiBarberia
);

router.patch(
  "/configuracion",
  protect,
  authorize("BARBERIA_ADMIN"),
  actualizarConfiguracionGeneral
);

// 🔐 RUTAS ESPECÍFICAS PRIMERO
router.get(
  "/configuracion/email",
  protect,
  authorize("BARBERIA_ADMIN"),
  getConfiguracionEmail
);

router.patch(
  "/configuracion/email",
  protect,
  authorize("BARBERIA_ADMIN"),
  actualizarConfiguracionEmail
);

// ✅ Test de configuración de email
router.post(
  "/configuracion/email/test",
  protect,
  authorize("BARBERIA_ADMIN"),
  testConfiguracionEmail
);

// SUPER ADMIN
router.post("/", protect, authorize("SUPER_ADMIN"), createBarberia);
router.get("/", protect, authorize("SUPER_ADMIN"), getBarberias);

// ❗️ ESTA SIEMPRE VA AL FINAL
router.get("/:id", getBarberiaById);

module.exports = router;
