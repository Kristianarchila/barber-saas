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
  cancelarReserva
} = require("../controllers/barbero.controller");

const { protect, authorize } = require("../config/middleware/auth.middleware");

// =========================================================
// RUTAS PÚBLICAS (SIN AUTENTICACIÓN)
// =========================================================
router.get("/publicos", getBarberosPublicos);

// =========================================================
// TODAS LAS DEMÁS RUTAS REQUIEREN AUTENTICACIÓN
// =========================================================
router.use(protect);

// =========================================================
// RUTAS ESPECÍFICAS DEL BARBERO (ROL BARBERO)
// ⚠️ DEBEN IR ANTES DE LAS RUTAS CON PARÁMETROS DINÁMICOS
// =========================================================
router.get("/mi-perfil", authorize("BARBERO"), getMiPerfil);
router.get("/mis-citas", authorize("BARBERO"), getMisCitas);
router.get("/agenda", authorize("BARBERO"), getAgenda);
router.patch("/reservas/:id/completar", completarReserva);
router.patch("/reservas/:id/cancelar", cancelarReserva);

// =========================================================
// RUTAS ADMIN (GESTIÓN DE BARBEROS)
// =========================================================
router.get("/", authorize("BARBERIA_ADMIN", "SUPER_ADMIN"), getBarberos);

router.post(
  "/",
  authorize("BARBERIA_ADMIN"),
  createBarberoConUsuario
);

router.put(
  "/:id",
  authorize("BARBERIA_ADMIN", "SUPER_ADMIN"),
  updateBarbero
);

router.delete(
  "/:id",
  authorize("BARBERIA_ADMIN", "SUPER_ADMIN"),
  deleteBarbero
);

router.patch(
  "/:id/toggle",
  authorize("BARBERIA_ADMIN", "SUPER_ADMIN"),
  toggleEstado
);

// =========================================================
// RUTA CON PARÁMETRO DINÁMICO (SIEMPRE AL FINAL)
// =========================================================
router.get("/:id", getBarberoById);

module.exports = router;