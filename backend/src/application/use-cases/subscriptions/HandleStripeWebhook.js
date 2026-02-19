/**
 * Handle Stripe Webhook Use Case
 * 
 * Processes Stripe webhook events to keep subscription status in sync.
 */

class HandleStripeWebhook {
    constructor(subscriptionRepository, barberiaRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.barberiaRepository = barberiaRepository;
    }

    /**
     * Execute the use case
     * @param {Object} event - Stripe webhook event
     * @returns {Promise<void>}
     */
    async execute(event) {
        const { type, data } = event;
        const object = data.object;

        switch (type) {
            case 'customer.subscription.created':
                await this.handleSubscriptionCreated(object);
                break;

            case 'customer.subscription.updated':
                await this.handleSubscriptionUpdated(object);
                break;

            case 'customer.subscription.deleted':
                await this.handleSubscriptionDeleted(object);
                break;

            case 'invoice.payment_succeeded':
                await this.handlePaymentSucceeded(object);
                break;

            case 'invoice.payment_failed':
                await this.handlePaymentFailed(object);
                break;

            case 'customer.subscription.trial_will_end':
                await this.handleTrialWillEnd(object);
                break;

            default:
                console.log(`Unhandled webhook event type: ${type}`);
        }
    }

    /**
     * Handle subscription created event
     * @param {Object} subscription - Stripe subscription object
     */
    async handleSubscriptionCreated(subscription) {
        const dbSubscription = await this.subscriptionRepository.findByStripeSubscriptionId(
            subscription.id
        );

        if (dbSubscription) {
            dbSubscription._status = subscription.status.toUpperCase();
            dbSubscription.updatePeriod(
                new Date(subscription.current_period_start * 1000),
                new Date(subscription.current_period_end * 1000)
            );

            await this.subscriptionRepository.save(dbSubscription);
            await this.syncToBarberia(dbSubscription);
        }
    }

    /**
     * Handle subscription updated event
     * @param {Object} subscription - Stripe subscription object
     */
    async handleSubscriptionUpdated(subscription) {
        const dbSubscription = await this.subscriptionRepository.findByStripeSubscriptionId(
            subscription.id
        );

        if (dbSubscription) {
            // Update status
            dbSubscription._status = subscription.status.toUpperCase();

            // Update period
            dbSubscription.updatePeriod(
                new Date(subscription.current_period_start * 1000),
                new Date(subscription.current_period_end * 1000)
            );

            // Update cancellation status
            dbSubscription._cancelAtPeriodEnd = subscription.cancel_at_period_end;

            // Update plan if changed
            const newPriceId = subscription.items.data[0]?.price.id;
            if (newPriceId && newPriceId !== dbSubscription.stripePriceId) {
                // Determine new plan from price ID
                const newPlan = this.getPlanFromPriceId(newPriceId);
                if (newPlan) {
                    dbSubscription.updatePlan(newPlan, newPriceId);
                }
            }

            await this.subscriptionRepository.save(dbSubscription);
            await this.syncToBarberia(dbSubscription);
        }
    }

    /**
     * Handle subscription deleted event
     * @param {Object} subscription - Stripe subscription object
     */
    async handleSubscriptionDeleted(subscription) {
        const dbSubscription = await this.subscriptionRepository.findByStripeSubscriptionId(
            subscription.id
        );

        if (dbSubscription) {
            dbSubscription.cancel(true);
            await this.subscriptionRepository.save(dbSubscription);
            await this.syncToBarberia(dbSubscription);
        }
    }

    /**
     * Handle payment succeeded event
     * @param {Object} invoice - Stripe invoice object
     */
    async handlePaymentSucceeded(invoice) {
        if (!invoice.subscription) return;

        const dbSubscription = await this.subscriptionRepository.findByStripeSubscriptionId(
            invoice.subscription
        );

        if (dbSubscription && dbSubscription.isPastDue()) {
            dbSubscription.activate();
            await this.subscriptionRepository.save(dbSubscription);
            await this.syncToBarberia(dbSubscription);
        }
    }

    /**
     * Handle payment failed event
     * @param {Object} invoice - Stripe invoice object
     */
    async handlePaymentFailed(invoice) {
        if (!invoice.subscription) return;

        const dbSubscription = await this.subscriptionRepository.findByStripeSubscriptionId(
            invoice.subscription
        );

        if (dbSubscription) {
            dbSubscription.markPastDue();
            await this.subscriptionRepository.save(dbSubscription);
            await this.syncToBarberia(dbSubscription);

            // TODO: Send email notification to barberia owner
            console.log(`Payment failed for subscription ${dbSubscription.id}`);
        }
    }

    /**
     * Handle trial will end event
     * @param {Object} subscription - Stripe subscription object
     */
    async handleTrialWillEnd(subscription) {
        const dbSubscription = await this.subscriptionRepository.findByStripeSubscriptionId(
            subscription.id
        );

        if (dbSubscription) {
            // TODO: Send email reminder about trial ending
            console.log(`Trial ending soon for subscription ${dbSubscription.id}`);
        }
    }

    /**
     * Sync subscription data to barberia model
     * @param {Subscription} subscription 
     */
    async syncToBarberia(subscription) {
        await this.barberiaRepository.updateSubscription(subscription.barberiaId, {
            plan: subscription.plan,
            status: subscription.status,
            currentPeriodStart: subscription.currentPeriodStart,
            currentPeriodEnd: subscription.currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
        });
    }

    /**
     * Get plan name from Stripe price ID
     * @param {string} priceId 
     * @returns {string|null}
     */
    getPlanFromPriceId(priceId) {
        if (priceId === process.env.STRIPE_PRICE_BASICO) return 'BASIC';
        if (priceId === process.env.STRIPE_PRICE_PREMIUM) return 'PRO';
        return null;
    }
}

module.exports = HandleStripeWebhook;
