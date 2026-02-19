/**
 * Stripe Payment Adapter
 * 
 * Handles all interactions with Stripe API for subscription management.
 * Follows hexagonal architecture - this is an infrastructure adapter.
 */

const Stripe = require('stripe');

class StripeAdapter {
    constructor() {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error('STRIPE_SECRET_KEY is not configured');
        }

        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16'
        });
    }

    /**
     * Create a Stripe customer
     * @param {string} email 
     * @param {Object} metadata 
     * @returns {Promise<Object>} Stripe customer object
     */
    async createCustomer(email, metadata = {}) {
        try {
            const customer = await this.stripe.customers.create({
                email,
                metadata
            });

            return customer;
        } catch (error) {
            throw new Error(`Stripe createCustomer failed: ${error.message}`);
        }
    }

    /**
     * Create a subscription
     * @param {string} customerId - Stripe customer ID
     * @param {string} priceId - Stripe price ID
     * @param {number} trialDays - Number of trial days (optional)
     * @returns {Promise<Object>} Stripe subscription object
     */
    async createSubscription(customerId, priceId, trialDays = 0) {
        try {
            const subscriptionData = {
                customer: customerId,
                items: [{ price: priceId }],
                payment_behavior: 'default_incomplete',
                payment_settings: {
                    save_default_payment_method: 'on_subscription'
                },
                expand: ['latest_invoice.payment_intent']
            };

            if (trialDays > 0) {
                subscriptionData.trial_period_days = trialDays;
            }

            const subscription = await this.stripe.subscriptions.create(subscriptionData);

            return subscription;
        } catch (error) {
            throw new Error(`Stripe createSubscription failed: ${error.message}`);
        }
    }

    /**
     * Create a checkout session for subscription
     * @param {string} customerId 
     * @param {string} priceId 
     * @param {string} successUrl 
     * @param {string} cancelUrl 
     * @returns {Promise<Object>} Checkout session object
     */
    async createCheckoutSession(customerId, priceId, successUrl, cancelUrl) {
        try {
            const session = await this.stripe.checkout.sessions.create({
                customer: customerId,
                mode: 'subscription',
                line_items: [{
                    price: priceId,
                    quantity: 1
                }],
                success_url: successUrl,
                cancel_url: cancelUrl,
                allow_promotion_codes: true
            });

            return session;
        } catch (error) {
            throw new Error(`Stripe createCheckoutSession failed: ${error.message}`);
        }
    }

    /**
     * Update a subscription (change plan)
     * @param {string} subscriptionId 
     * @param {string} newPriceId 
     * @returns {Promise<Object>} Updated subscription object
     */
    async updateSubscription(subscriptionId, newPriceId) {
        try {
            const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);

            const updated = await this.stripe.subscriptions.update(subscriptionId, {
                items: [{
                    id: subscription.items.data[0].id,
                    price: newPriceId
                }],
                proration_behavior: 'create_prorations'
            });

            return updated;
        } catch (error) {
            throw new Error(`Stripe updateSubscription failed: ${error.message}`);
        }
    }

    /**
     * Cancel a subscription
     * @param {string} subscriptionId 
     * @param {boolean} immediately - Cancel immediately or at period end
     * @returns {Promise<Object>} Canceled subscription object
     */
    async cancelSubscription(subscriptionId, immediately = false) {
        try {
            if (immediately) {
                const canceled = await this.stripe.subscriptions.cancel(subscriptionId);
                return canceled;
            } else {
                const updated = await this.stripe.subscriptions.update(subscriptionId, {
                    cancel_at_period_end: true
                });
                return updated;
            }
        } catch (error) {
            throw new Error(`Stripe cancelSubscription failed: ${error.message}`);
        }
    }

    /**
     * Reactivate a subscription scheduled for cancellation
     * @param {string} subscriptionId 
     * @returns {Promise<Object>} Reactivated subscription object
     */
    async reactivateSubscription(subscriptionId) {
        try {
            const updated = await this.stripe.subscriptions.update(subscriptionId, {
                cancel_at_period_end: false
            });
            return updated;
        } catch (error) {
            throw new Error(`Stripe reactivateSubscription failed: ${error.message}`);
        }
    }

    /**
     * Retrieve a subscription
     * @param {string} subscriptionId 
     * @returns {Promise<Object>} Subscription object
     */
    async getSubscription(subscriptionId) {
        try {
            const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
            return subscription;
        } catch (error) {
            throw new Error(`Stripe getSubscription failed: ${error.message}`);
        }
    }

    /**
     * Retrieve a customer
     * @param {string} customerId 
     * @returns {Promise<Object>} Customer object
     */
    async getCustomer(customerId) {
        try {
            const customer = await this.stripe.customers.retrieve(customerId);
            return customer;
        } catch (error) {
            throw new Error(`Stripe getCustomer failed: ${error.message}`);
        }
    }

    /**
     * List all invoices for a customer
     * @param {string} customerId 
     * @param {number} limit 
     * @returns {Promise<Array>} Array of invoice objects
     */
    async listInvoices(customerId, limit = 10) {
        try {
            const invoices = await this.stripe.invoices.list({
                customer: customerId,
                limit
            });
            return invoices.data;
        } catch (error) {
            throw new Error(`Stripe listInvoices failed: ${error.message}`);
        }
    }

    /**
     * Construct webhook event from request
     * @param {Buffer} payload - Raw request body
     * @param {string} signature - Stripe signature header
     * @returns {Object} Stripe event object
     */
    constructWebhookEvent(payload, signature) {
        try {
            const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

            if (!webhookSecret) {
                throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
            }

            const event = this.stripe.webhooks.constructEvent(
                payload,
                signature,
                webhookSecret
            );

            return event;
        } catch (error) {
            throw new Error(`Webhook signature verification failed: ${error.message}`);
        }
    }

    /**
     * Create a billing portal session
     * @param {string} customerId 
     * @param {string} returnUrl 
     * @returns {Promise<Object>} Portal session object
     */
    async createBillingPortalSession(customerId, returnUrl) {
        try {
            const session = await this.stripe.billingPortal.sessions.create({
                customer: customerId,
                return_url: returnUrl
            });
            return session;
        } catch (error) {
            throw new Error(`Stripe createBillingPortalSession failed: ${error.message}`);
        }
    }
}

module.exports = StripeAdapter;
