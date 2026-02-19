const { DomainError } = require('./DomainErrors');

/**
 * Plan Limit Exceeded Error
 * 
 * Thrown when a barberia tries to exceed their plan limits.
 */
class PlanLimitExceededError extends DomainError {
    constructor(message = 'Límite del plan alcanzado', resource = null, currentCount = null, maxAllowed = null) {
        super('PLAN_LIMIT_EXCEEDED', message, 403);
        this.resource = resource;
        this.currentCount = currentCount;
        this.maxAllowed = maxAllowed;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            resource: this.resource,
            currentCount: this.currentCount,
            maxAllowed: this.maxAllowed
        };
    }
}

module.exports = PlanLimitExceededError;
