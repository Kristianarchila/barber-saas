const express = require("express");
const router = express.Router();
const egresosController = require("../controllers/egresos.controller");
const { protect, authorize } = require("../config/middleware/auth.middleware");
const {
    filterByBarberia,
    validateBarberiaOwnership,
    checkBarberiaActiva
} = require("../config/middleware/checkBarberia");
const validateJoi = require("../middleware/joiValidation.middleware");
const { egresoSchema, mongoIdParamsSchema } = require("../validators/common.joi");

// Middleware global
router.use(protect);
router.use(checkBarberiaActiva);
router.use(authorize("BARBERIA_ADMIN"));

// Registrar nuevo egreso
router.post("/",
    validateBarberiaOwnership,
    validateJoi(egresoSchema),
    egresosController.registrarEgreso
);

// Obtener egresos con filtros
router.get("/",
    filterByBarberia,
    egresosController.obtenerEgresos
);

// Obtener resumen de egresos
router.get("/resumen",
    filterByBarberia,
    egresosController.obtenerResumenEgresos
);

// Actualizar egreso
router.put("/:id",
    validateJoi(mongoIdParamsSchema, "params"),
    filterByBarberia,
    validateJoi(egresoSchema),
    egresosController.actualizarEgreso
);

// Eliminar egreso (soft delete)
router.delete("/:id",
    validateJoi(mongoIdParamsSchema, "params"),
    filterByBarberia,
    egresosController.eliminarEgreso
);

module.exports = router;
