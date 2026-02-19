const PushSubscription = require("../models/PushSubscription");
const NotificationLog = require("../models/NotificationLog");
const Barberia = require("../models/Barberia");
const { sendPushNotification } = require("../services/push.service");
const { vapidDetails } = require("../services/push.service");

/**
 * @desc    Obtener la clave pública VAPID para el cliente
 * @route   GET /api/barberias/:slug/notifications/vapid-public-key
 * @access  Public
 */
const getVapidPublicKey = async (req, res) => {
    try {
        if (!vapidDetails.publicKey) {
            return res.status(500).json({
                message: "Las notificaciones push no están configuradas en el servidor",
            });
        }

        res.json({ publicKey: vapidDetails.publicKey });
    } catch (error) {
        console.error("Error getting VAPID public key:", error);
        res.status(500).json({ message: "Error obteniendo clave VAPID" });
    }
};

/**
 * @desc    Registrar suscripción push de un usuario
 * @route   POST /api/barberias/:slug/notifications/subscribe
 * @access  Private
 */
const registerPushSubscription = async (req, res) => {
    try {
        const { endpoint, keys, userAgent } = req.body;
        const barberia = req.barberia;
        const userId = req.user.id;

        if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
            return res.status(400).json({
                message: "Datos de suscripción incompletos",
            });
        }

        // Buscar si ya existe una suscripción con este endpoint
        let subscription = await PushSubscription.findOne({
            user: userId,
            endpoint: endpoint,
        });

        if (subscription) {
            // Actualizar suscripción existente
            subscription.keys = keys;
            subscription.userAgent = userAgent;
            subscription.activo = true;
            subscription.barberia = barberia._id;
            await subscription.save();
        } else {
            // Crear nueva suscripción
            subscription = await PushSubscription.create({
                user: userId,
                barberia: barberia._id,
                endpoint,
                keys,
                userAgent,
            });
        }

        res.status(201).json({
            message: "Suscripción registrada exitosamente",
            subscription,
        });
    } catch (error) {
        console.error("Error registering push subscription:", error);
        res.status(500).json({ message: "Error registrando suscripción" });
    }
};

/**
 * @desc    Eliminar suscripción push
 * @route   DELETE /api/barberias/:slug/notifications/unsubscribe
 * @access  Private
 */
const unregisterPushSubscription = async (req, res) => {
    try {
        const { endpoint } = req.body;
        const userId = req.user.id;

        if (!endpoint) {
            return res.status(400).json({ message: "Endpoint requerido" });
        }

        const subscription = await PushSubscription.findOne({
            user: userId,
            endpoint: endpoint,
        });

        if (!subscription) {
            return res.status(404).json({ message: "Suscripción no encontrada" });
        }

        subscription.activo = false;
        await subscription.save();

        res.json({ message: "Suscripción eliminada exitosamente" });
    } catch (error) {
        console.error("Error unregistering push subscription:", error);
        res.status(500).json({ message: "Error eliminando suscripción" });
    }
};

/**
 * @desc    Enviar notificación de prueba
 * @route   POST /api/barberias/:slug/notifications/test
 * @access  Private (Admin)
 */
const sendTestNotification = async (req, res) => {
    try {
        const userId = req.user.id;
        const barberia = req.barberia;

        const subscriptions = await PushSubscription.find({
            user: userId,
            barberia: barberia._id,
            activo: true,
        });

        if (subscriptions.length === 0) {
            return res.status(404).json({
                message: "No tienes suscripciones activas para esta barbería",
            });
        }

        const payload = {
            title: "Notificación de Prueba",
            body: `Las notificaciones están funcionando correctamente en ${barberia.nombre}`,
            icon: barberia.configuracion?.logoUrl || "/icon-192x192.png",
            badge: "/badge-72x72.png",
            tag: "test-notification",
            data: {
                url: "/admin",
                type: "test",
            },
        };

        let sent = 0;
        let failed = 0;

        for (const sub of subscriptions) {
            const result = await sendPushNotification(sub, payload);

            if (result.success) {
                sent++;

                // Registrar en log
                await NotificationLog.create({
                    barberia: barberia._id,
                    tipo: "push",
                    destinatario: { user: userId },
                    asunto: payload.title,
                    contenido: payload.body,
                    estado: "enviado",
                });
            } else {
                failed++;

                // Si expiró, desactivar
                if (result.expired) {
                    sub.activo = false;
                    await sub.save();
                }
            }
        }

        res.json({
            message: "Notificación de prueba enviada",
            sent,
            failed,
        });
    } catch (error) {
        console.error("Error sending test notification:", error);
        res.status(500).json({ message: "Error enviando notificación de prueba" });
    }
};

/**
 * @desc    Obtener historial de notificaciones
 * @route   GET /api/barberias/:slug/notifications/logs
 * @access  Private (Admin)
 */
const getNotificationLogs = async (req, res) => {
    try {
        const barberia = req.barberia;
        const { page = 1, limit = 20, tipo, estado } = req.query;

        const query = { barberia: barberia._id };

        if (tipo) query.tipo = tipo;
        if (estado) query.estado = estado;

        const logs = await NotificationLog.find(query)
            .populate("destinatario.user", "nombre email")
            .populate("reserva", "fecha horario")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await NotificationLog.countDocuments(query);

        res.json({
            logs,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
        });
    } catch (error) {
        console.error("Error getting notification logs:", error);
        res.status(500).json({ message: "Error obteniendo historial de notificaciones" });
    }
};

/**
 * @desc    Actualizar configuración de notificaciones
 * @route   PUT /api/barberias/:slug/notifications/settings
 * @access  Private (Admin)
 */
const updateNotificationSettings = async (req, res) => {
    try {
        const barberia = req.barberia;
        const settings = req.body;

        // Validar que los campos sean booleanos o números según corresponda
        const allowedSettings = [
            "emailEnabled",
            "pushEnabled",
            "whatsappEnabled",
            "reminderHoursBefore",
            "confirmacionReserva",
            "recordatorioReserva",
            "cancelacionReserva",
        ];

        const updates = {};
        for (const key of allowedSettings) {
            if (settings[key] !== undefined) {
                updates[`configuracion.notificaciones.${key}`] = settings[key];
            }
        }

        const updatedBarberia = await Barberia.findByIdAndUpdate(
            barberia._id,
            { $set: updates },
            { new: true }
        );

        res.json({
            message: "Configuración actualizada exitosamente",
            notificaciones: updatedBarberia.configuracion.notificaciones,
        });
    } catch (error) {
        console.error("Error updating notification settings:", error);
        res.status(500).json({ message: "Error actualizando configuración" });
    }
};

/**
 * @desc    Obtener configuración actual de notificaciones
 * @route   GET /api/barberias/:slug/notifications/settings
 * @access  Private (Admin)
 */
const getNotificationSettings = async (req, res) => {
    try {
        const barberia = req.barberia;

        res.json({
            notificaciones: barberia.configuracion?.notificaciones || {
                emailEnabled: true,
                pushEnabled: true,
                whatsappEnabled: false,
                reminderHoursBefore: 24,
                confirmacionReserva: true,
                recordatorioReserva: true,
                cancelacionReserva: true,
            },
        });
    } catch (error) {
        console.error("Error getting notification settings:", error);
        res.status(500).json({ message: "Error obteniendo configuración" });
    }
};

module.exports = {
    getVapidPublicKey,
    registerPushSubscription,
    unregisterPushSubscription,
    sendTestNotification,
    getNotificationLogs,
    updateNotificationSettings,
    getNotificationSettings,
};
