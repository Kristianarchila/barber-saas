const express = require("express");
const router = express.Router();
const egresosController = require("../controllers/egresos.controller");
const { protect, authorize } = require("../config/middleware/auth.middleware");
const {
    filterByBarberia,
    validateBarberiaOwnership,
    checkBarberiaActiva
} = require("../config/middleware/checkBarberia");

/**
 * Rutas de Egresos
 * Todas las rutas requieren autenticación y rol BARBERIA_ADMIN
 */

// Middleware global
router.use(protect);
router.use(checkBarberiaActiva);
router.use(authorize("BARBERIA_ADMIN"));

// Registrar nuevo egreso
router.post("/",
    validateBarberiaOwnership,
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
    filterByBarberia,
    egresosController.actualizarEgreso
);

// Eliminar egreso (soft delete)
router.delete("/:id",
    filterByBarberia,
    egresosController.eliminarEgreso
);

module.exports = router;
