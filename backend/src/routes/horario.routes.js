const express = require("express");
const router = express.Router();

const { createHorario,getHorarios, saveHorario, toggleHorario,getHorariosByBarbero } = require("../controllers/horario.controller");
const { protect, authorize } = require("../config/middleware/auth.middleware");


router.post(
  "/",
  protect,
  authorize("BARBERIA_ADMIN"),
  createHorario
);

router.get(
  "/barberos/:barberoId",
  protect,
  authorize("BARBERIA_ADMIN"),
  getHorarios
);

router.post(
  "/barberos/:barberoId",
  protect,
  authorize("BARBERIA_ADMIN"),
  saveHorario
);

router.patch(
  "/:id/activar",
  protect,
  authorize("BARBERIA_ADMIN"),
  toggleHorario
);
router.get(
  "/barberos/:barberoId",
  protect,
  authorize("BARBERIA_ADMIN"),
  getHorariosByBarbero
);




module.exports = router;
