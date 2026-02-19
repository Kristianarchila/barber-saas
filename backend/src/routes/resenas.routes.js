const express = require("express");
const router = express.Router();
const resenasController = require("../controllers/resenas.controller");
const { protect, authorize } = require("../config/middleware/auth.middleware");
const { getBarberiaBySlug } = require("../config/middleware/barberiaMiddleware");
const { reviewLimiter } = require("../config/middleware/publicRateLimiter");
const { validateCrearResena } = require("../validators/resena.validator");

/**
 * ========================================
 * RUTAS PÚBLICAS
 * ========================================
 */

// Validar token de reseña
router.get(
    "/:slug/resenas/validar-token",
    getBarberiaBySlug,
    resenasController.validarToken
);

// Crear reseña (con token en query)
// 🔒 SEGURIDAD: Rate limiter para prevenir spam (3 reseñas/día por IP)
// ✅ VALIDACIÓN: Schema Joi para validar inputs
router.post(
    "/:slug/resenas",
    reviewLimiter,
    validateCrearResena,
    getBarberiaBySlug,
    resenasController.crearResena
);

// Obtener reseñas públicas aprobadas
router.get(
    "/:slug/resenas",
    getBarberiaBySlug,
    resenasController.obtenerResenasPublicas
);

// Obtener estadísticas públicas
router.get(
    "/:slug/resenas/stats",
    getBarberiaBySlug,
    resenasController.obtenerEstadisticasPublicas
);

/**
 * ========================================
 * RUTAS ADMIN (requieren autenticación)
 * ========================================
 */

// Obtener reseñas pendientes de moderación
router.get(
    "/admin/resenas/pendientes",
    protect,
    authorize("BARBERIA_ADMIN"),
    resenasController.obtenerResenasPendientes
);

// Obtener reseñas aprobadas
router.get(
    "/admin/resenas/aprobadas",
    protect,
    authorize("BARBERIA_ADMIN"),
    resenasController.obtenerResenasAprobadas
);

// Obtener estadísticas detalladas
router.get(
    "/admin/resenas/estadisticas",
    protect,
    authorize("BARBERIA_ADMIN"),
    resenasController.obtenerEstadisticas
);

// Aprobar reseña
router.patch(
    "/admin/resenas/:id/aprobar",
    protect,
    authorize("BARBERIA_ADMIN"),
    resenasController.aprobarResena
);

// Ocultar reseña
router.patch(
    "/admin/resenas/:id/ocultar",
    protect,
    authorize("BARBERIA_ADMIN"),
    resenasController.ocultarResena
);

// Mostrar reseña
router.patch(
    "/admin/resenas/:id/mostrar",
    protect,
    authorize("BARBERIA_ADMIN"),
    resenasController.mostrarResena
);

// ✅ NUEVO: Responder a reseña
router.patch(
    "/admin/resenas/:id/responder",
    protect,
    authorize("BARBERIA_ADMIN"),
    resenasController.responderResena
);

module.exports = router;
