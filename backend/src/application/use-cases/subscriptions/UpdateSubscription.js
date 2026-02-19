/**
 * Update Subscription Use Case
 * 
 * Handles upgrading or downgrading a subscription plan.
 */

const Plan = require('../../../domain/value-objects/Plan');
const AuditHelper = require('../../../utils/AuditHelper');

class UpdateSubscription {
    constructor(subscriptionRepository, stripeAdapter, barberiaRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.stripeAdapter = stripeAdapter;
        this.barberiaRepository = barberiaRepository;
    }

    /**
     * Execute the use case
     * @param {Object} data 
     * @param {string} data.barberiaId 
     * @param {string} data.newPlan - FREE, BASIC, or PRO
     * @param {string} data.userId - User making the change (for audit)
     * @param {Object} data.request - Express request (for audit)
     * @returns {Promise<Subscription>}
     */
    async execute(data) {
        const { barberiaId, newPlan, userId, request } = data;

        // Validate new plan
        if (!Plan.isValid(newPlan)) {
            throw new Error(`Invalid plan: ${newPlan}`);
        }

        // Get existing subscription
        const subscription = await this.subscriptionRepository.findByBarberiaId(barberiaId);
        if (!subscription) {
            throw new Error('Subscription not found');
        }

        // Check if subscription can be updated
        if (!subscription.canAccess()) {
            throw new Error('Cannot update subscription with current status');
        }

        // Check if it's actually a change
        if (subscription.plan === newPlan) {
            throw new Error('Already on this plan');
        }

        // Guardar plan anterior para auditoría
        const oldPlan = subscription.plan;

        const newPlanConfig = Plan.getPlan(newPlan);

        try {
            // Update in Stripe if not FREE plan
            if (newPlan !== 'FREE' && subscription.stripeSubscriptionId) {
                const updated = await this.stripeAdapter.updateSubscription(
                    subscription.stripeSubscriptionId,
                    newPlanConfig.stripePriceId
                );

                subscription.updatePlan(newPlan, newPlanConfig.stripePriceId);
                subscription.updatePeriod(
                    new Date(updated.current_period_start * 1000),
                    new Date(updated.current_period_end * 1000)
                );
            } else if (newPlan === 'FREE') {
                // Downgrading to FREE - cancel Stripe subscription
                if (subscription.stripeSubscriptionId) {
                    await this.stripeAdapter.cancelSubscription(
                        subscription.stripeSubscriptionId,
                        false // Cancel at period end
                    );
                }
                subscription.updatePlan(newPlan, null);
            } else {
                // Upgrading from FREE to paid plan
                const stripeSubscription = await this.stripeAdapter.createSubscription(
                    subscription.stripeCustomerId,
                    newPlanConfig.stripePriceId,
                    0 // No trial for upgrades
                );

                subscription.updatePlan(newPlan, newPlanConfig.stripePriceId);
                subscription._stripeSubscriptionId = stripeSubscription.id;
                subscription.updatePeriod(
                    new Date(stripeSubscription.current_period_start * 1000),
                    new Date(stripeSubscription.current_period_end * 1000)
                );
            }

            // Save updated subscription
            const saved = await this.subscriptionRepository.save(subscription);

            // Update barberia
            await this.barberiaRepository.updateSubscription(barberiaId, {
                plan: saved.plan,
                status: saved.status,
                stripePriceId: saved.stripePriceId,
                currentPeriodStart: saved.currentPeriodStart,
                currentPeriodEnd: saved.currentPeriodEnd
            });

            // 📝 AUDITAR - Registrar cambio de plan
            if (userId) {
                await AuditHelper.logPlanChange({
                    userId,
                    barberiaId,
                    oldPlan,
                    newPlan,
                    request: request ? AuditHelper.extractRequestInfo(request) : {}
                });
            }

            return saved;
        } catch (error) {
            throw new Error(`Failed to update subscription: ${error.message}`);
        }
    }
}

module.exports = UpdateSubscription;
