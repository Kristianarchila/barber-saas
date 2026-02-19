const express = require("express");
const router = express.Router();

const { createHorario, getHorarios, saveHorario, toggleHorario, getHorariosByBarbero } = require("../controllers/horario.controller");
const { protect, authorize } = require("../config/middleware/auth.middleware");
const {
  filterByBarberia,
  validateBarberiaOwnership,
  checkBarberiaActiva
} = require("../config/middleware/checkBarberia");

// Todas las rutas requieren autenticación y barbería activa
router.use(protect);
router.use(checkBarberiaActiva);
router.use(authorize("BARBERIA_ADMIN"));
router.use(filterByBarberia); // ✅ Filtrado multi-tenant

// Crear horario
router.post("/", validateBarberiaOwnership, createHorario);

// Obtener horarios de un barbero
router.get("/barberos/:barberoId", getHorarios);

// Guardar/actualizar horario
router.post("/barberos/:barberoId", saveHorario);

// Toggle activar/desactivar horario
router.patch("/:id/activar", toggleHorario);

module.exports = router;
