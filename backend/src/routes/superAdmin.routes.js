// backend/src/routes/superAdmin.routes.js
const express = require("express");
const router = express.Router();
const superAdminController = require("../controllers/superAdmin.controller");
const { protect, authorize } = require("../config/middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");
const {
  createBarberiaSchema,
  updateBarberiaSchema,
  barberiaIdParamsSchema
} = require("../validation/schemas/barberia.schemas");

// Proteger todo
router.use(protect);
router.use(authorize("SUPER_ADMIN"));

router.get("/stats", superAdminController.obtenerEstadisticas);

router
  .route("/barberias")
  .get(superAdminController.obtenerBarberias)
  .post(
    validate(createBarberiaSchema),
    superAdminController.crearBarberia
  );

router
  .route("/barberias/:id")
  .get(
    validate(barberiaIdParamsSchema, 'params'),
    superAdminController.obtenerBarberia
  )
  .put(
    validate(updateBarberiaSchema),
    validate(barberiaIdParamsSchema, 'params'),
    superAdminController.actualizarBarberia
  )
  .delete(
    validate(barberiaIdParamsSchema, 'params'),
    superAdminController.eliminarBarberia
  );

router.patch("/barberias/:id/estado",
  validate(barberiaIdParamsSchema, 'params'),
  superAdminController.cambiarEstado
);

router.patch("/barberias/:id/extender",
  validate(barberiaIdParamsSchema, 'params'),
  superAdminController.extenderPlazo
);

router.get("/barberias/:id/historial",
  validate(barberiaIdParamsSchema, 'params'),
  superAdminController.obtenerHistorial
);

// Gestión de Admins
router.get("/admins", superAdminController.obtenerAdmins);
router.patch("/admins/:id/sedes", superAdminController.actualizarSedesAdmin);

// Gestión de Sucursales (Multi-Location)
router.get("/barberias/:id/sucursales",
  validate(barberiaIdParamsSchema, 'params'),
  superAdminController.obtenerSucursales
);

router.post("/barberias/:id/sucursales",
  validate(barberiaIdParamsSchema, 'params'),
  superAdminController.crearSucursal
);

router.put("/barberias/:id/sucursales/:sucursalId", superAdminController.actualizarSucursal);
router.delete("/barberias/:id/sucursales/:sucursalId", superAdminController.eliminarSucursal);

router.patch("/barberias/:id/matriz",
  validate(barberiaIdParamsSchema, 'params'),
  superAdminController.toggleMatriz
);

// ==========================================
// MANUAL SUBSCRIPTION MANAGEMENT
// ==========================================
const subscriptionController = require("../controllers/subscription.controller");

router.post("/subscriptions/:barberiaId/change-plan", subscriptionController.changePlanManually);
router.post("/subscriptions/:barberiaId/extend", subscriptionController.extendPeriodManually);
router.post("/subscriptions/:barberiaId/activate", subscriptionController.activateManually);
router.post("/subscriptions/:barberiaId/deactivate", subscriptionController.deactivateManually);
router.post("/subscriptions/:barberiaId/record-payment", subscriptionController.recordPaymentManually);
router.get("/subscriptions/:barberiaId/history", subscriptionController.getHistory);

// ==========================================
// PENDING ACCOUNTS MANAGEMENT
// ==========================================
router.get("/pending-accounts", superAdminController.getPendingAccounts);
router.post("/pending-accounts/:id/approve", superAdminController.approveAccount);
router.post("/pending-accounts/:id/reject", superAdminController.rejectAccount);

// AUDIT LOGS
router.get("/audit-logs", superAdminController.getAuditLogs);

module.exports = router;
