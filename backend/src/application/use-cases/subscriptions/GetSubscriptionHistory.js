/**
 * Get Subscription History Use Case
 * 
 * Retrieves subscription change history and manual payments
 */

class GetSubscriptionHistory {
    constructor(subscriptionRepository) {
        this.subscriptionRepository = subscriptionRepository;
    }

    /**
     * Get subscription history for a barberia
     * @param {string} barberiaId 
     * @returns {Promise<Object>}
     */
    async execute(barberiaId) {
        // Get subscription
        const subscription = await this.subscriptionRepository.findByBarberiaId(barberiaId);
        if (!subscription) {
            throw new Error('Subscription not found');
        }

        return {
            subscription: {
                id: subscription.id,
                barberiaId: subscription.barberiaId,
                plan: subscription.plan,
                status: subscription.status,
                paymentMethod: subscription.paymentMethod,
                currentPeriodStart: subscription.currentPeriodStart,
                currentPeriodEnd: subscription.currentPeriodEnd,
                createdAt: subscription.createdAt,
                updatedAt: subscription.updatedAt
            },
            changeHistory: subscription.changeHistory || [],
            manualPayments: subscription.manualPayments || [],
            summary: {
                totalChanges: (subscription.changeHistory || []).length,
                totalManualPayments: (subscription.manualPayments || []).length,
                totalManualPaymentAmount: (subscription.manualPayments || []).reduce((sum, p) => sum + p.amount, 0),
                isManagedManually: subscription.isManagedManually()
            }
        };
    }
}

module.exports = GetSubscriptionHistory;
