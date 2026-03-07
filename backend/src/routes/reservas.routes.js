const express = require("express");
const router = express.Router();
const { protect } = require("../config/middleware/auth.middleware");
const { reservaLimiter, cancelLimiter } = require("../config/middleware/publicRateLimiter");
const { publicApiLimiter } = require("../middleware/rateLimit.middleware");
const validateJoi = require("../middleware/joiValidation.middleware");
const {
  crearReservaSchema,
  updateReservaSchema,
  reservaParamsSchema,
  cancelTokenSchema,
  queryReservasSchema
} = require("../validators/common.joi");

//👇 ARQUITECTURA HEXAGONAL - Controlador actualizado
const reservasController = require("../controllers/reservas.controller");

// ===============================
// RUTAS FIJAS (PRIMERO)
// ===============================
router.get(
  "/calendario",
  protect,
  reservasController.obtenerCalendario
);

router.get(
  "/ultimas",
  protect,
  reservasController.listarUltimasReservas
);

router.get(
  "/",
  protect,
  validateJoi(queryReservasSchema, 'query'),
  reservasController.listarReservas
);

// Crear reserva - CON VALIDACIÓN JOI Y RATE LIMITING
router.post(
  "/barberos/:barberoId/reservar",
  reservaLimiter, // Prevent spam
  validateJoi(crearReservaSchema), // ✅ Validación Joi recomendada
  reservasController.crearReserva
);

router.get(
  "/barberos/:barberoId",
  protect,
  validateJoi(reservaParamsSchema, 'params'), // Validar barberoId como mongoId (id en params)
  reservasController.listarPorBarbero
);

// ===============================
// RUTAS DINÁMICAS (AL FINAL)
// ===============================

// Completar reserva - CON VALIDACIÓN DE PARAMS JOI
router.patch(
  "/:id/completar",
  protect,
  validateJoi(reservaParamsSchema, 'params'),
  reservasController.completarReserva
);

// Cancelar reserva - CON VALIDACIÓN DE PARAMS JOI
router.patch(
  "/:id/cancelar",
  protect,
  validateJoi(reservaParamsSchema, 'params'),
  reservasController.cancelarReserva
);

// Reagendar reserva (Admin) - mover a nueva fecha/hora
router.patch(
  "/:id/reagendar",
  protect,
  validateJoi(reservaParamsSchema, 'params'),
  reservasController.reagendarReserva
);

// --- RUTAS PÚBLICAS POR TOKEN (SIN AUTH) ---
router.get("/token/:token", reservasController.obtenerIdDeToken);
router.get("/token/:token/data", reservasController.getReservaParaReagendar);

// Cancelar por token - CON VALIDACIÓN JOI Y RATE LIMITING
router.post(
  "/token/:token/cancelar",
  cancelLimiter, // Prevent malicious mass cancellations
  validateJoi(cancelTokenSchema, 'params'),
  reservasController.cancelarPorToken
);

router.post("/token/:token/reagendar", reservasController.confirmarReagendado);

// Obtener reserva - CON VALIDACIÓN DE PARAMS JOI
router.get(
  "/:id",
  protect,
  validateJoi(reservaParamsSchema, 'params'),
  reservasController.obtenerReserva
);

router.post("/ai-suggestions", publicApiLimiter, reservasController.getAISuggestions);

module.exports = router;
