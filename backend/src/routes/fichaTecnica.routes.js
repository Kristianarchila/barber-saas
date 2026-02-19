const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../config/middleware/auth.middleware");
const fichaTecnicaController = require("../controllers/fichaTecnica.controller");

// Todas las rutas requieren autenticación y rol de Admin o Barbero
router.use(protect);
router.use(authorize("BARBERIA_ADMIN", "BARBERO"));

// Obtener ficha técnica completa de un cliente
router.get("/cliente/:clienteId", fichaTecnicaController.obtenerFichaPorCliente);

// Actualizar notas generales de un cliente
router.put("/cliente/:clienteId/notas", fichaTecnicaController.actualizarNotasGenerales);

// Agregar una nueva entrada al historial técnico (con fotos y notas)
router.post("/cliente/:clienteId/historial", fichaTecnicaController.agregarServicioHistorial);

// Eliminar una foto de una entrada del historial
router.delete("/cliente/:clienteId/historial/:servicioId/foto", fichaTecnicaController.eliminarFotoHistorial);

module.exports = router;
