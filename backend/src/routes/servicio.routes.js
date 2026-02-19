const express = require("express");
const router = express.Router({ mergeParams: true });
// 🏗️ ARQUITECTURA HEXAGONAL - Controlador actualizado
const {
  crearServicio,
  obtenerServicios,
  cambiarEstadoServicio,
  editarServicio
} = require("../controllers/servicios.controller");
const { protect, authorize } = require("../config/middleware/auth.middleware");
const {
  filterByBarberia,
  validateBarberiaOwnership,
  checkBarberiaActiva
} = require("../config/middleware/checkBarberia");
const { validateTenantAccess, extractBarberiaId } = require("../middleware/tenantValidation.middleware");
const { checkServicioLimit } = require("../middleware/planLimits.middleware");
const validateJoi = require("../middleware/joiValidation.middleware");
const { servicioSchema, servicioParamsSchema } = require("../validators/common.joi");


// Listar servicios
router.get("/",
  extractBarberiaId,
  protect,
  checkBarberiaActiva,
  authorize("BARBERIA_ADMIN", "SUPER_ADMIN"),
  validateTenantAccess,
  filterByBarberia, // ✅ Filtra automáticamente
  obtenerServicios
);

// Crear servicio - VALIDACIÓN JOI PRIMERO
router.post("/",
  validateJoi(servicioSchema),  // ✅ Reemplazado Zod por Joi
  extractBarberiaId,
  protect,
  checkBarberiaActiva,
  authorize("BARBERIA_ADMIN", "SUPER_ADMIN"),
  validateTenantAccess,
  validateBarberiaOwnership,
  checkServicioLimit,
  crearServicio
);

// Editar servicio - VALIDACIÓN JOI PRIMERO
router.put("/:id",
  validateJoi(servicioSchema),  // ✅ Reemplazado Zod por Joi
  extractBarberiaId,
  protect,
  checkBarberiaActiva,
  authorize("BARBERIA_ADMIN", "SUPER_ADMIN"),
  validateTenantAccess,
  filterByBarberia,
  editarServicio
);

// Cambiar estado - VALIDACIÓN JOI PRIMERO
router.patch("/:id",
  validateJoi(servicioParamsSchema, 'params'),  // ✅ Reemplazado Zod por Joi
  extractBarberiaId,  // ✅ Then extract barberia
  protect,
  checkBarberiaActiva,
  authorize("BARBERIA_ADMIN", "SUPER_ADMIN"),
  validateTenantAccess,
  filterByBarberia,
  cambiarEstadoServicio
);


module.exports = router;
