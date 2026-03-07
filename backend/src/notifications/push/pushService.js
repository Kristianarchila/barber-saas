/**
 * @file pushService.js
 * @description Web Push Notification Service
 * Sends push notifications to barbers (and admins) via the Web Push Protocol.
 *
 * VAPID keys should be set in .env:
 *   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL
 *
 * Usage:
 *   const pushService = require('./pushService');
 *   await pushService.sendToUser(userId, { title, body, data });
 */

const webpush = require('web-push');
const User = require('../../infrastructure/database/mongodb/models/User');

// Configure VAPID keys — only if both keys are present (optional feature)
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    try {
        webpush.setVapidDetails(
            process.env.VAPID_EMAIL || 'mailto:admin@barbersaas.com',
            process.env.VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
        );
    } catch (e) {
        console.warn('[Push] Invalid VAPID keys in .env — push notifications disabled:', e.message);
    }
} else {
    console.warn('[Push] VAPID keys not set — push notifications disabled.');
}

/**
 * Send a push notification to a specific user by their userId
 * @param {string} userId - MongoDB User _id
 * @param {Object} payload - { title, body, icon, badge, data }
 */
async function sendToUser(userId, payload) {
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
        console.warn('[Push] VAPID keys not configured — skipping push notification');
        return;
    }

    try {
        const user = await User.findById(userId).select('pushSubscriptions');
        if (!user || !user.pushSubscriptions?.length) return;

        const notification = JSON.stringify({
            title: payload.title || 'Barber SaaS',
            body: payload.body || '',
            icon: payload.icon || '/icon-192.png',
            badge: '/icon-192.png',
            data: payload.data || {},
            timestamp: Date.now()
        });

        const results = await Promise.allSettled(
            user.pushSubscriptions.map(sub =>
                webpush.sendNotification(sub, notification)
            )
        );

        // Remove expired/invalid subscriptions
        const invalidIndexes = results
            .map((r, i) => (r.status === 'rejected' ? i : null))
            .filter(i => i !== null);

        if (invalidIndexes.length > 0) {
            const validSubs = user.pushSubscriptions.filter((_, i) => !invalidIndexes.includes(i));
            await User.findByIdAndUpdate(userId, { pushSubscriptions: validSubs });
            console.log(`[Push] Removed ${invalidIndexes.length} expired subscriptions for user ${userId}`);
        }
    } catch (error) {
        console.error('[Push] Error sending notification:', error.message);
    }
}

/**
 * Save a push subscription for a user (allows multiple devices)
 * @param {string} userId
 * @param {Object} subscription - Browser PushSubscription object
 */
async function saveSubscription(userId, subscription) {
    await User.findByIdAndUpdate(
        userId,
        {
            $addToSet: {
                pushSubscriptions: {
                    endpoint: subscription.endpoint,
                    keys: subscription.keys
                }
            }
        },
        { new: true }
    );
}

/**
 * Remove a push subscription for a user
 * @param {string} userId
 * @param {string} endpoint - The subscription endpoint URL
 */
async function removeSubscription(userId, endpoint) {
    await User.findByIdAndUpdate(
        userId,
        { $pull: { pushSubscriptions: { endpoint } } }
    );
}

module.exports = { sendToUser, saveSubscription, removeSubscription };
