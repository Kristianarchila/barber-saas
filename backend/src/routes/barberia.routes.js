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
  testConfiguracionEmail,
  actualizarMarketplace,
  asignarTemplate
} = require("../controllers/barberia.controller");

const { protect, authorize } = require("../config/middleware/auth.middleware");
const { requireFeature } = require("../config/middleware/checkPlanLimits");

// 🔐 RUTAS MI BARBERIA
router.get(
  "/me",
  protect,
  authorize("BARBERIA_ADMIN"),
  getMiBarberia
);

// 🛒 MARKETPLACE CONFIG — solo Pro+ (debe ir ANTES de /configuracion)
router.patch(
  "/configuracion/marketplace",
  protect,
  authorize("BARBERIA_ADMIN"),
  requireFeature("marketplace"),
  actualizarMarketplace
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

// 🎨 Asignar template a barbería (SUPER_ADMIN, sin restricción de plan)
router.patch("/:id/template", protect, authorize("SUPER_ADMIN"), asignarTemplate);

// ❗️ ESTA SIEMPRE VA AL FINAL
router.get("/:id", getBarberiaById);

module.exports = router;
