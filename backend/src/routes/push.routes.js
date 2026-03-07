/**
 * @file push.routes.js
 * @description Routes for managing Web Push subscriptions and VAPID public key
 */
const express = require('express');
const router = express.Router();
const { protect } = require('../config/middleware/auth.middleware');
const pushService = require('../notifications/push/pushService');

/**
 * GET /api/push/vapid-public-key
 * Returns the VAPID public key so the frontend can create a subscription
 * Public — no auth required
 */
router.get('/vapid-public-key', (req, res) => {
    if (!process.env.VAPID_PUBLIC_KEY) {
        return res.status(503).json({ message: 'Push notifications not configured' });
    }
    res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

/**
 * POST /api/push/subscribe
 * Save a push subscription for the current user
 */
router.post('/subscribe', protect, async (req, res) => {
    try {
        const { subscription } = req.body;
        if (!subscription?.endpoint || !subscription?.keys) {
            return res.status(400).json({ message: 'Suscripción inválida' });
        }
        await pushService.saveSubscription(req.user.id, subscription);
        res.status(201).json({ message: 'Suscripción guardada' });
    } catch (error) {
        console.error('[Push] Error saving subscription:', error.message);
        res.status(500).json({ message: 'Error al guardar suscripción' });
    }
});

/**
 * DELETE /api/push/subscribe
 * Remove a push subscription (user unsubscribed or changed device)
 */
router.delete('/subscribe', protect, async (req, res) => {
    try {
        const { endpoint } = req.body;
        if (!endpoint) return res.status(400).json({ message: 'endpoint requerido' });
        await pushService.removeSubscription(req.user.id, endpoint);
        res.json({ message: 'Suscripción eliminada' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar suscripción' });
    }
});

module.exports = router;
