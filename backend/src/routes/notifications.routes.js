const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParams para heredar :slug
const {
    getVapidPublicKey,
    registerPushSubscription,
    unregisterPushSubscription,
    sendTestNotification,
    getNotificationLogs,
    updateNotificationSettings,
    getNotificationSettings,
} = require("../controllers/notifications.controller");
const { protect, esAdmin } = require("../config/middleware/auth.middleware");
const { getBarberiaBySlug } = require("../config/middleware/barberiaMiddleware");

// Público - Obtener clave VAPID
router.get("/vapid-public-key", getVapidPublicKey);

// Privado - Requiere autenticación
router.use(protect);
router.use(getBarberiaBySlug);

// Registrar/eliminar suscripciones push (cualquier usuario autenticado)
router.post("/subscribe", registerPushSubscription);
router.delete("/unsubscribe", unregisterPushSubscription);

// Solo admins
router.use(esAdmin);

// Configuración de notificaciones
router.get("/settings", getNotificationSettings);
router.put("/settings", updateNotificationSettings);

// Historial y pruebas
router.get("/logs", getNotificationLogs);
router.post("/test", sendTestNotification);

module.exports = router;
