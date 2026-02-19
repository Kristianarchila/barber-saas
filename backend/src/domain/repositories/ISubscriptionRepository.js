/**
 * Subscription Repository Interface
 * 
 * Defines the contract for subscription data access.
 * Implementations must provide these methods.
 */

class ISubscriptionRepository {
    /**
     * Save a subscription (create or update)
     * @param {Subscription} subscription 
     * @returns {Promise<Subscription>}
     */
    async save(subscription) {
        throw new Error('Method not implemented');
    }

    /**
     * Find subscription by ID
     * @param {string} id 
     * @returns {Promise<Subscription|null>}
     */
    async findById(id) {
        throw new Error('Method not implemented');
    }

    /**
     * Find subscription by barberia ID
     * @param {string} barberiaId 
     * @returns {Promise<Subscription|null>}
     */
    async findByBarberiaId(barberiaId) {
        throw new Error('Method not implemented');
    }

    /**
     * Find subscription by Stripe customer ID
     * @param {string} stripeCustomerId 
     * @returns {Promise<Subscription|null>}
     */
    async findByStripeCustomerId(stripeCustomerId) {
        throw new Error('Method not implemented');
    }

    /**
     * Find subscription by Stripe subscription ID
     * @param {string} stripeSubscriptionId 
     * @returns {Promise<Subscription|null>}
     */
    async findByStripeSubscriptionId(stripeSubscriptionId) {
        throw new Error('Method not implemented');
    }

    /**
     * Find all subscriptions by status
     * @param {string} status 
     * @returns {Promise<Subscription[]>}
     */
    async findByStatus(status) {
        throw new Error('Method not implemented');
    }

    /**
     * Find all subscriptions by plan
     * @param {string} plan 
     * @returns {Promise<Subscription[]>}
     */
    async findByPlan(plan) {
        throw new Error('Method not implemented');
    }

    /**
     * Find subscriptions with trial ending soon
     * @param {number} daysThreshold - Number of days before trial ends
     * @returns {Promise<Subscription[]>}
     */
    async findTrialsEndingSoon(daysThreshold) {
        throw new Error('Method not implemented');
    }

    /**
     * Find subscriptions scheduled for cancellation
     * @returns {Promise<Subscription[]>}
     */
    async findScheduledForCancellation() {
        throw new Error('Method not implemented');
    }

    /**
     * Delete subscription by ID
     * @param {string} id 
     * @returns {Promise<boolean>}
     */
    async delete(id) {
        throw new Error('Method not implemented');
    }

    /**
     * Count subscriptions by plan
     * @returns {Promise<Object>} Object with plan counts
     */
    async countByPlan() {
        throw new Error('Method not implemented');
    }

    /**
     * Count subscriptions by status
     * @returns {Promise<Object>} Object with status counts
     */
    async countByStatus() {
        throw new Error('Method not implemented');
    }
}

module.exports = ISubscriptionRepository;
