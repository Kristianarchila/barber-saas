/**
 * Create Subscription Use Case
 * 
 * Handles the creation of a new subscription for a barberia.
 * Creates Stripe customer and subscription, then persists to database.
 */

const Plan = require('../../../domain/value-objects/Plan');
const Subscription = require('../../../domain/entities/Subscription');

class CreateSubscription {
    constructor(subscriptionRepository, stripeAdapter, barberiaRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.stripeAdapter = stripeAdapter;
        this.barberiaRepository = barberiaRepository;
    }

    /**
     * Execute the use case
     * @param {Object} data 
     * @param {string} data.barberiaId 
     * @param {string} data.plan - FREE, BASIC, or PRO
     * @param {string} data.email 
     * @returns {Promise<Subscription>}
     */
    async execute(data) {
        const { barberiaId, plan, email } = data;

        // Validate plan
        if (!Plan.isValid(plan)) {
            throw new Error(`Invalid plan: ${plan}`);
        }

        // Check if subscription already exists
        const existing = await this.subscriptionRepository.findByBarberiaId(barberiaId);
        if (existing) {
            throw new Error('Subscription already exists for this barberia');
        }

        // Get plan configuration
        const planConfig = Plan.getPlan(plan);

        try {
            // Create Stripe customer
            const customer = await this.stripeAdapter.createCustomer(email, {
                barberiaId: barberiaId.toString()
            });

            // Create subscription entity
            let subscription;

            if (plan === 'FREE') {
                // FREE plan - no Stripe subscription needed
                const trialEndsAt = new Date();
                trialEndsAt.setDate(trialEndsAt.getDate() + planConfig.trialDays);

                subscription = new Subscription({
                    barberiaId,
                    plan,
                    status: 'TRIALING',
                    stripeCustomerId: customer.id,
                    stripeSubscriptionId: null,
                    stripePriceId: null,
                    trialEndsAt,
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: trialEndsAt
                });
            } else {
                // BASIC or PRO plan - create Stripe subscription
                const stripeSubscription = await this.stripeAdapter.createSubscription(
                    customer.id,
                    planConfig.stripePriceId,
                    planConfig.trialDays
                );

                subscription = new Subscription({
                    barberiaId,
                    plan,
                    status: stripeSubscription.status.toUpperCase(),
                    stripeCustomerId: customer.id,
                    stripeSubscriptionId: stripeSubscription.id,
                    stripePriceId: planConfig.stripePriceId,
                    currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
                    currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
                    trialEndsAt: stripeSubscription.trial_end
                        ? new Date(stripeSubscription.trial_end * 1000)
                        : null
                });
            }

            // Save subscription
            const saved = await this.subscriptionRepository.save(subscription);

            // Update barberia with subscription info
            await this.barberiaRepository.updateSubscription(barberiaId, {
                plan: saved.plan,
                status: saved.status,
                stripeCustomerId: saved.stripeCustomerId,
                stripeSubscriptionId: saved.stripeSubscriptionId,
                currentPeriodStart: saved.currentPeriodStart,
                currentPeriodEnd: saved.currentPeriodEnd,
                trialEndsAt: saved.trialEndsAt
            });

            return saved;
        } catch (error) {
            throw new Error(`Failed to create subscription: ${error.message}`);
        }
    }
}

module.exports = CreateSubscription;
