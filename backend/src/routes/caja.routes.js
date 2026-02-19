const express = require("express");
const router = express.Router();
const cajaController = require("../controllers/caja.controller");
const { protect, authorize } = require("../config/middleware/auth.middleware");
const {
    filterByBarberia,
    validateBarberiaOwnership,
    checkBarberiaActiva
} = require("../config/middleware/checkBarberia");

/**
 * Rutas de Caja
 * Todas las rutas requieren autenticación y rol BARBERIA_ADMIN
 */

// Middleware global
router.use(protect);
router.use(checkBarberiaActiva);
router.use(authorize("BARBERIA_ADMIN"));

// Abrir caja
router.post("/abrir",
    validateBarberiaOwnership,
    cajaController.abrirCaja
);

// Obtener caja actual (abierta)
router.get("/actual",
    filterByBarberia,
    cajaController.obtenerCajaActual
);

// Agregar ingreso manual
router.post("/ingresos",
    filterByBarberia,
    cajaController.agregarIngreso
);

// Agregar egreso
router.post("/egresos",
    filterByBarberia,
    cajaController.agregarEgreso
);

// Cerrar caja
router.post("/cerrar",
    filterByBarberia,
    cajaController.cerrarCaja
);

// Obtener historial de cajas
router.get("/historial",
    filterByBarberia,
    cajaController.obtenerHistorialCajas
);

module.exports = router;
