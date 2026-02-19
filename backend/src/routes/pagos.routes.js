const express = require("express");
const router = express.Router();
const pagosController = require("../controllers/pagos.controller");
const { protect, authorize } = require("../config/middleware/auth.middleware");
const {
    filterByBarberia,
    validateBarberiaOwnership,
    checkBarberiaActiva
} = require("../config/middleware/checkBarberia");

/**
 * Rutas de Pagos
 * Todas las rutas requieren autenticación y rol BARBERIA_ADMIN
 */

// Middleware global
router.use(protect);
router.use(checkBarberiaActiva);
router.use(authorize("BARBERIA_ADMIN"));

// Registrar nuevo pago
router.post("/",
    validateBarberiaOwnership,
    pagosController.registrarPago
);

// Obtener pagos con filtros
router.get("/",
    filterByBarberia,
    pagosController.obtenerPagos
);

// Obtener resumen de ingresos
router.get("/resumen",
    filterByBarberia,
    pagosController.obtenerResumenIngresos
);

module.exports = router;
