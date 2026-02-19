const { DomainError } = require('./DomainErrors');

/**
 * Subscription Blocked Error
 * 
 * Thrown when access is blocked due to subscription status.
 */
class SubscriptionBlockedError extends DomainError {
    constructor(message = 'Acceso bloqueado por estado de suscripción', status = null, reason = null) {
        super('SUBSCRIPTION_BLOCKED', message, 403);
        this.subscriptionStatus = status;
        this.reason = reason;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            subscriptionStatus: this.subscriptionStatus,
            reason: this.reason
        };
    }
}

module.exports = SubscriptionBlockedError;
