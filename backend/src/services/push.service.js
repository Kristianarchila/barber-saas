const webpush = require("web-push");

// Configurar VAPID keys (deben estar en .env)
const vapidDetails = {
    publicKey: process.env.VAPID_PUBLIC_KEY || "",
    privateKey: process.env.VAPID_PRIVATE_KEY || "",
    subject: process.env.VAPID_SUBJECT || "mailto:admin@barbersaas.com",
};

if (vapidDetails.publicKey && vapidDetails.privateKey) {
    webpush.setVapidDetails(
        vapidDetails.subject,
        vapidDetails.publicKey,
        vapidDetails.privateKey
    );
}

/**
 * Enviar notificación push a un solo destinatario
 * @param {Object} subscription - Suscripción push del usuario
 * @param {Object} payload - Datos de la notificación
 * @returns {Promise}
 */
const sendPushNotification = async (subscription, payload) => {
    try {
        const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            },
        };

        const payloadString = JSON.stringify(payload);

        const result = await webpush.sendNotification(pushSubscription, payloadString);

        return {
            success: true,
            result,
        };
    } catch (error) {
        console.error("Error sending push notification:", error);

        // Si la suscripción expiró o es inválida
        if (error.statusCode === 410 || error.statusCode === 404) {
            return {
                success: false,
                expired: true,
                error: error.message,
            };
        }

        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Enviar notificación push a múltiples destinatarios
 * @param {Array} subscriptions - Array de suscripciones
 * @param {Object} payload - Datos de la notificación
 * @returns {Promise<Object>} Resultados del envío
 */
const sendPushToMultiple = async (subscriptions, payload) => {
    const results = {
        sent: 0,
        failed: 0,
        expired: [],
    };

    const promises = subscriptions.map(async (sub) => {
        const result = await sendPushNotification(sub, payload);

        if (result.success) {
            results.sent++;
        } else {
            results.failed++;
            if (result.expired) {
                results.expired.push(sub._id);
            }
        }
    });

    await Promise.all(promises);

    return results;
};

/**
 * Crear payload para recordatorio de reserva
 * @param {Object} reserva - Datos de la reserva
 * @param {Object} barberia - Datos de la barbería
 * @returns {Object} Payload formateado
 */
const createReminderPayload = (reserva, barberia) => {
    return {
        title: `Recordatorio: ${barberia.nombre}`,
        body: `Tienes una cita mañana a las ${reserva.hora}`,
        icon: barberia.configuracion?.logoUrl || "/icon-192x192.png",
        badge: "/badge-72x72.png",
        tag: `reserva-${reserva._id}`,
        data: {
            url: `/mis-reservas`,
            reservaId: reserva._id,
            type: "reminder",
        },
        actions: [
            {
                action: "view",
                title: "Ver reserva",
            },
            {
                action: "cancel",
                title: "Cancelar",
            },
        ],
    };
};

/**
 * Crear payload para confirmación de reserva
 * @param {Object} reserva - Datos de la reserva
 * @param {Object} barberia - Datos de la barbería
 * @returns {Object} Payload formateado
 */
const createConfirmationPayload = (reserva, barberia) => {
    return {
        title: `¡Reserva confirmada! - ${barberia.nombre}`,
        body: `Tu cita está confirmada para el ${new Date(reserva.fecha).toLocaleDateString()} a las ${reserva.hora}`,
        icon: barberia.configuracion?.logoUrl || "/icon-192x192.png",
        badge: "/badge-72x72.png",
        tag: `reserva-${reserva._id}`,
        data: {
            url: `/mis-reservas`,
            reservaId: reserva._id,
            type: "confirmation",
        },
    };
};

module.exports = {
    sendPushNotification,
    sendPushToMultiple,
    createReminderPayload,
    createConfirmationPayload,
    vapidDetails,
};
