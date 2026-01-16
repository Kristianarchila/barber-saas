const express = require("express");
const router = express.Router();
const { protect } = require("../config/middleware/auth.middleware");

// 👇 IMPORTAR TODO EL CONTROLLER COMO OBJETO
const reservasController = require("../controllers/reservas.controller");

// ===============================
// RUTAS FIJAS (PRIMERO)
// ===============================
router.get(
  "/ultimas",
  protect,
  reservasController.listarUltimasReservas
);

router.get(
  "/",
  protect,
  reservasController.listarReservas
);

router.post(
  "/barberos/:barberoId/reservar",
  reservasController.crearReserva
);

router.get(
  "/barberos/:barberoId",
  protect,
  reservasController.listarPorBarbero
);

// ===============================
// RUTAS DINÁMICAS (AL FINAL)
// ===============================
router.patch(
  "/:id/completar",
  protect,
  reservasController.completarReserva
);

router.patch(
  "/:id/cancelar",
  protect,
  reservasController.cancelarReserva
);

router.get(
  "/:id",
  protect,
  reservasController.obtenerReserva
);

module.exports = router;
