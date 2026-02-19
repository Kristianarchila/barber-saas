/**
 * Cancel Subscription Use Case
 * 
 * Handles cancellation of a subscription.
 */

class CancelSubscription {
    constructor(subscriptionRepository, stripeAdapter, barberiaRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.stripeAdapter = stripeAdapter;
        this.barberiaRepository = barberiaRepository;
    }

    /**
     * Execute the use case
     * @param {Object} data 
     * @param {string} data.barberiaId 
     * @param {boolean} data.immediately - Cancel immediately or at period end
     * @returns {Promise<Subscription>}
     */
    async execute(data) {
        const { barberiaId, immediately = false } = data;

        // Get existing subscription
        const subscription = await this.subscriptionRepository.findByBarberiaId(barberiaId);
        if (!subscription) {
            throw new Error('Subscription not found');
        }

        // Check if already canceled
        if (subscription.isCanceled()) {
            throw new Error('Subscription is already canceled');
        }

        try {
            // Cancel in Stripe if it exists
            if (subscription.stripeSubscriptionId) {
                await this.stripeAdapter.cancelSubscription(
                    subscription.stripeSubscriptionId,
                    immediately
                );
            }

            // Update subscription entity
            subscription.cancel(immediately);

            // Save updated subscription
            const saved = await this.subscriptionRepository.save(subscription);

            // Update barberia
            await this.barberiaRepository.updateSubscription(barberiaId, {
                status: saved.status,
                cancelAtPeriodEnd: saved.cancelAtPeriodEnd
            });

            return saved;
        } catch (error) {
            throw new Error(`Failed to cancel subscription: ${error.message}`);
        }
    }
}

module.exports = CancelSubscription;
