const express = require("express");
const router = express.Router();

const { createHorario, getHorarios, saveHorario, toggleHorario, getHorariosByBarbero, deleteHorario } = require("../controllers/horario.controller");
const { protect, authorize } = require("../config/middleware/auth.middleware");
const {
  filterByBarberia,
  validateBarberiaOwnership,
  checkBarberiaActiva
} = require("../config/middleware/checkBarberia");
const validateJoi = require("../middleware/joiValidation.middleware");
const { horarioSchema, mongoIdParamsSchema } = require("../validators/common.joi");

// Todas las rutas requieren autenticación y barbería activa
router.use(protect);
router.use(checkBarberiaActiva);
router.use(authorize("BARBERIA_ADMIN"));
router.use(filterByBarberia); // ✅ Filtrado multi-tenant

// Crear horario
router.post("/", validateBarberiaOwnership, validateJoi(horarioSchema), createHorario);

// Obtener horarios de un barbero
router.get("/barberos/:barberoId", getHorarios);

// Guardar/actualizar horario (también usa horarioSchema — mismo shape)
router.post("/barberos/:barberoId", validateJoi(horarioSchema), saveHorario);

// Toggle activar/desactivar horario
router.patch("/:id/activar", validateJoi(mongoIdParamsSchema, "params"), toggleHorario);

// Eliminar horario
router.delete("/:id", validateJoi(mongoIdParamsSchema, "params"), deleteHorario);

module.exports = router;
