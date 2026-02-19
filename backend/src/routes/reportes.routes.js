const express = require("express");
const router = express.Router();
const reportesController = require("../controllers/reportes.controller");
const { protect, authorize } = require("../config/middleware/auth.middleware");
const {
    filterByBarberia,
    checkBarberiaActiva
} = require("../config/middleware/checkBarberia");

/**
 * Rutas de Reportes
 * Todas las rutas requieren autenticación y rol BARBERIA_ADMIN
 */

// Middleware global
router.use(protect);
router.use(checkBarberiaActiva);
router.use(authorize("BARBERIA_ADMIN"));

// Resumen general del negocio
router.get("/resumen-general",
    filterByBarberia,
    reportesController.obtenerResumenGeneral
);

// Rendimiento por barbero
router.get("/rendimiento-barberos",
    filterByBarberia,
    reportesController.obtenerRendimientoBarberos
);

// Servicios más vendidos
router.get("/servicios-vendidos",
    filterByBarberia,
    reportesController.obtenerServiciosMasVendidos
);

// Análisis de métodos de pago
router.get("/analisis-pagos",
    filterByBarberia,
    reportesController.obtenerAnalisisPagos
);

// Tendencias de ingresos
router.get("/tendencias",
    filterByBarberia,
    reportesController.obtenerTendenciasIngresos
);

module.exports = router;
