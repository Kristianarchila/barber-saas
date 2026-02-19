/**
 * Manage Subscription Use Case
 * 
 * Handles manual subscription management operations:
 * - Change plan
 * - Extend period
 * - Activate/Deactivate
 * - Record payment
 */

class ManageSubscription {
    constructor(subscriptionRepository, barberiaRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.barberiaRepository = barberiaRepository;
    }

    /**
     * Change subscription plan manually
     * @param {string} barberiaId 
     * @param {string} newPlan 
     * @param {string} changedBy - User ID
     * @param {string} reason 
     * @returns {Promise<Subscription>}
     */
    async changePlan(barberiaId, newPlan, changedBy, reason = '') {
        // Get subscription
        const subscription = await this.subscriptionRepository.findByBarberiaId(barberiaId);
        if (!subscription) {
            throw new Error('Subscription not found');
        }

        // Change plan
        subscription.changePlanManually(newPlan, changedBy, reason);

        // Save
        const updated = await this.subscriptionRepository.save(subscription);

        // Update barberia plan
        await this.barberiaRepository.updateSubscription(barberiaId, {
            plan: newPlan,
            status: subscription.status
        });

        return updated;
    }

    /**
     * Extend subscription period manually
     * @param {string} barberiaId 
     * @param {number} months 
     * @param {string} extendedBy - User ID
     * @param {string} reason 
     * @returns {Promise<Subscription>}
     */
    async extendPeriod(barberiaId, months, extendedBy, reason = '') {
        // Get subscription
        const subscription = await this.subscriptionRepository.findByBarberiaId(barberiaId);
        if (!subscription) {
            throw new Error('Subscription not found');
        }

        // Extend period
        subscription.extendPeriodManually(months, extendedBy, reason);

        // Save
        const updated = await this.subscriptionRepository.save(subscription);

        // Update barberia
        await this.barberiaRepository.updateSubscription(barberiaId, {
            currentPeriodEnd: subscription.currentPeriodEnd
        });

        return updated;
    }

    /**
     * Activate subscription manually
     * @param {string} barberiaId 
     * @param {string} activatedBy - User ID
     * @param {string} reason 
     * @returns {Promise<Subscription>}
     */
    async activate(barberiaId, activatedBy, reason = '') {
        // Get subscription
        const subscription = await this.subscriptionRepository.findByBarberiaId(barberiaId);
        if (!subscription) {
            throw new Error('Subscription not found');
        }

        // Activate
        subscription.activateManually(activatedBy, reason);

        // Save
        const updated = await this.subscriptionRepository.save(subscription);

        // Update barberia
        await this.barberiaRepository.updateSubscription(barberiaId, {
            status: 'ACTIVE'
        });

        return updated;
    }

    /**
     * Deactivate subscription manually
     * @param {string} barberiaId 
     * @param {string} deactivatedBy - User ID
     * @param {string} reason 
     * @returns {Promise<Subscription>}
     */
    async deactivate(barberiaId, deactivatedBy, reason = '') {
        // Get subscription
        const subscription = await this.subscriptionRepository.findByBarberiaId(barberiaId);
        if (!subscription) {
            throw new Error('Subscription not found');
        }

        // Deactivate
        subscription.deactivateManually(deactivatedBy, reason);

        // Save
        const updated = await this.subscriptionRepository.save(subscription);

        // Update barberia
        await this.barberiaRepository.updateSubscription(barberiaId, {
            status: 'CANCELED'
        });

        return updated;
    }

    /**
     * Record manual payment
     * @param {string} barberiaId 
     * @param {number} amount 
     * @param {string} concept 
     * @param {string} recordedBy - User ID
     * @param {Object} metadata 
     * @returns {Promise<Subscription>}
     */
    async recordPayment(barberiaId, amount, concept, recordedBy, metadata = {}) {
        // Get subscription
        const subscription = await this.subscriptionRepository.findByBarberiaId(barberiaId);
        if (!subscription) {
            throw new Error('Subscription not found');
        }

        // Record payment
        subscription.recordManualPayment(amount, concept, recordedBy, metadata);

        // Save
        return await this.subscriptionRepository.save(subscription);
    }
}

module.exports = ManageSubscription;
