/**
 * Subscription Status Middleware
 * 
 * Blocks access if subscription is not in good standing.
 */

const MongoSubscriptionRepository = require('../infrastructure/database/mongodb/repositories/MongoSubscriptionRepository');
const SubscriptionBlockedError = require('../shared/errors/SubscriptionBlockedError');

const subscriptionRepo = new MongoSubscriptionRepository();

/**
 * Middleware to check if subscription allows access
 */
const checkSubscriptionStatus = async (req, res, next) => {
    try {
        const barberiaId = req.barberiaId || req.user?.barberiaId;

        if (!barberiaId) {
            return res.status(401).json({
                error: 'No barberiaId found in request'
            });
        }

        const subscription = await subscriptionRepo.findByBarberiaId(barberiaId);

        if (!subscription) {
            return res.status(403).json({
                error: 'No subscription found',
                code: 'NO_SUBSCRIPTION'
            });
        }

        // Check if subscription allows access
        if (!subscription.canAccess()) {
            const error = new SubscriptionBlockedError(
                'Acceso bloqueado. Por favor actualiza tu método de pago.',
                subscription.status,
                getBlockReason(subscription.status)
            );

            return res.status(403).json({
                error: error.message,
                code: error.code,
                subscriptionStatus: error.subscriptionStatus,
                reason: error.reason,
                updatePaymentRequired: subscription.isPastDue()
            });
        }

        // Attach subscription to request for later use
        req.subscription = subscription;
        next();
    } catch (error) {
        return res.status(500).json({
            error: 'Error checking subscription status',
            details: error.message
        });
    }
};

/**
 * Get human-readable block reason
 * @param {string} status 
 * @returns {string}
 */
function getBlockReason(status) {
    switch (status) {
        case 'PAST_DUE':
            return 'Pago vencido. Actualiza tu método de pago para continuar.';
        case 'CANCELED':
            return 'Suscripción cancelada. Reactiva tu plan para continuar.';
        case 'INCOMPLETE':
            return 'Pago incompleto. Completa el proceso de pago.';
        default:
            return 'Estado de suscripción inválido.';
    }
}

module.exports = {
    checkSubscriptionStatus
};
