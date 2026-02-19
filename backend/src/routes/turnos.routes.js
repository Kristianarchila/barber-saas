const express = require("express");
const router = express.Router();
const { getDisponibilidad, getTurnosDia, getTurnosMes } = require("../controllers/turnos.controller");
const { protect, authorize } = require("../config/middleware/auth.middleware");



router.get(
  "/barberos/:barberoId/dia",
  protect,
  authorize("BARBERIA_ADMIN", "BARBERO"),
  getTurnosDia
);

router.get(
  "/barberos/:barberoId/mes",
  protect,
  authorize("BARBERIA_ADMIN", "BARBERO"),
  getTurnosMes
);



module.exports = router;
