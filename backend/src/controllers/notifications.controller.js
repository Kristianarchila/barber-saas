/**
 * Notifications Controller (Hexagonal Architecture Version)
 * Maintains existing push notification functionality
 */
const container = require('../shared/Container');
const { vapidDetails, sendPushNotification } = require("../services/push.service");
const PushSubscription = require("../infrastructure/database/mongodb/models/PushSubscription");
const NotificationLog = require("../infrastructure/database/mongodb/models/NotificationLog");

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

const registerPushSubscription = async (req, res) => {
    try {
        const { barberia } = req;
        const { subscription } = req.body;

        if (!subscription || !subscription.endpoint) {
            return res.status(400).json({ message: "Suscripción inválida" });
        }

        const existingSub = await PushSubscription.findOne({
            endpoint: subscription.endpoint,
        });

        if (existingSub) {
            return res.json({ message: "Suscripción ya existe", subscription: existingSub });
        }

        const newSub = await PushSubscription.create({
            barberia: barberia._id,
            usuario: req.user.id,
            endpoint: subscription.endpoint,
            keys: subscription.keys,
        });

        res.status(201).json({ message: "Suscripción registrada", subscription: newSub });
    } catch (error) {
        console.error("Error registering push subscription:", error);
        res.status(500).json({ message: "Error registrando suscripción" });
    }
};

const unregisterPushSubscription = async (req, res) => {
    try {
        const { endpoint } = req.body;

        await PushSubscription.deleteOne({ endpoint });
        res.json({ message: "Suscripción eliminada" });
    } catch (error) {
        console.error("Error unregistering push subscription:", error);
        res.status(500).json({ message: "Error eliminando suscripción" });
    }
};

const sendTestNotification = async (req, res) => {
    try {
        const { barberia } = req;
        const { title, body } = req.body;

        const subscriptions = await PushSubscription.find({ barberia: barberia._id });

        if (subscriptions.length === 0) {
            return res.status(404).json({ message: "No hay suscripciones registradas" });
        }

        const results = await Promise.allSettled(
            subscriptions.map(sub =>
                sendPushNotification(sub, { title, body })
            )
        );

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        // Log notification
        await NotificationLog.create({
            barberia: barberia._id,
            tipo: 'TEST',
            titulo: title,
            mensaje: body,
            enviadas: successful,
            fallidas: failed
        });

        res.json({
            message: `Notificación enviada a ${successful} dispositivos`,
            successful,
            failed
        });
    } catch (error) {
        console.error("Error sending test notification:", error);
        res.status(500).json({ message: "Error enviando notificación de prueba" });
    }
};

const getNotificationLogs = async (req, res) => {
    try {
        const { barberia } = req;
        const { page = 1, limit = 20 } = req.query;

        const logs = await NotificationLog.find({ barberia: barberia._id })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await NotificationLog.countDocuments({ barberia: barberia._id });

        res.json({
            logs,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        console.error("Error getting notification logs:", error);
        res.status(500).json({ message: "Error obteniendo historial de notificaciones" });
    }
};

const updateNotificationSettings = async (req, res) => {
    try {
        const { barberia } = req;
        const settings = req.body;

        // Update barberia notification settings
        barberia.notificaciones = {
            ...barberia.notificaciones,
            ...settings
        };
        await barberia.save();

        res.json({ message: "Configuración actualizada", settings: barberia.notificaciones });
    } catch (error) {
        console.error("Error updating notification settings:", error);
        res.status(500).json({ message: "Error actualizando configuración" });
    }
};

const getNotificationSettings = async (req, res) => {
    try {
        const { barberia } = req;

        res.json({
            notificaciones: barberia.notificaciones || {
                emailEnabled: true,
                pushEnabled: true,
                whatsappEnabled: false,
                reminderHoursBefore: 24,
                confirmacionReserva: true,
                recordatorioReserva: true,
                cancelacionReserva: true,
            }
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
