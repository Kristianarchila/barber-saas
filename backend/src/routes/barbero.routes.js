const express = require("express");
const router = express.Router();

const {
  createBarberoConUsuario,
  getBarberos,
  getBarberoById,
  updateBarbero,
  deleteBarbero,
  toggleEstado,
  getBarberosPublicos,
  getMiPerfil,
  getMisCitas,
  getAgenda,
  completarReserva,
  cancelarReserva,
  getEstadisticas
} = require("../controllers/barbero.controller");

const { protect, authorize } = require("../config/middleware/auth.middleware");
const {
  filterByBarberia,
  validateBarberiaOwnership,
  checkBarberiaActiva
} = require("../config/middleware/checkBarberia");
const { checkBarberoLimit } = require("../middleware/planLimits.middleware");
const validateJoi = require("../middleware/joiValidation.middleware");
const { crearBarberoSchema, barberoParamsSchema } = require("../validators/common.joi");

// =========================================================
// RUTAS PÚBLICAS (SIN AUTENTICACIÓN)
// =========================================================
router.get("/publicos", getBarberosPublicos);

// =========================================================
// TODAS LAS DEMÁS RUTAS REQUIEREN AUTENTICACIÓN
// =========================================================
router.use(protect);

// ✅ Verificar que la barbería esté activa (bloquea suspendidas)
router.use(checkBarberiaActiva);

// =========================================================
// RUTAS ESPECÍFICAS DEL BARBERO (ROL BARBERO)
// =========================================================
router.get("/mi-perfil",
  authorize("BARBERO"),
  getMiPerfil
);

router.get("/mis-citas",
  authorize("BARBERO"),
  getMisCitas
);

router.get("/agenda",
  authorize("BARBERO"),
  getAgenda
);

router.get("/estadisticas",
  authorize("BARBERO"),
  getEstadisticas
);

router.patch("/reservas/:id/completar",
  authorize("BARBERO"),
  validateJoi(barberoParamsSchema, 'params'),
  completarReserva
);

router.patch("/reservas/:id/cancelar",
  authorize("BARBERO"),
  validateJoi(barberoParamsSchema, 'params'),
  cancelarReserva
);

// =========================================================
// RUTAS ADMIN (GESTIÓN DE BARBEROS)
// =========================================================

// Listar barberos (filtrado automático por barbería)
router.get("/",
  authorize("BARBERIA_ADMIN", "SUPER_ADMIN"),
  filterByBarberia, // ✅ Inyecta req.barberiaId
  getBarberos
);

// Crear barbero (valida propiedad + límites de plan)
router.post("/",
  authorize("BARBERIA_ADMIN"),
  validateBarberiaOwnership, // ✅ Inyecta req.body.barberiaId PRIMERO
  validateJoi(crearBarberoSchema), // ✅ Valida después de inyectar barberiaId
  checkBarberoLimit, // ✅ Verifica límite del plan
  createBarberoConUsuario
);

// Actualizar barbero
router.put("/:id",
  authorize("BARBERIA_ADMIN", "SUPER_ADMIN"),
  validateJoi(barberoParamsSchema, 'params'),
  filterByBarberia, // ✅ Para validar en el controller
  updateBarbero
);

// Eliminar barbero
router.delete("/:id",
  authorize("BARBERIA_ADMIN", "SUPER_ADMIN"),
  validateJoi(barberoParamsSchema, 'params'),
  filterByBarberia,
  deleteBarbero
);

// Toggle estado
router.patch("/:id/toggle",
  authorize("BARBERIA_ADMIN", "SUPER_ADMIN"),
  validateJoi(barberoParamsSchema, 'params'),
  filterByBarberia,
  toggleEstado
);

// =========================================================
// OBTENER BARBERO POR ID (AL FINAL)
// =========================================================
router.get("/:id",
  validateJoi(barberoParamsSchema, 'params'),
  filterByBarberia, // ✅ Filtra por barbería
  getBarberoById
);

module.exports = router;
