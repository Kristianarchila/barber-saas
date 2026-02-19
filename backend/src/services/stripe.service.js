const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/**
 * Crea un Customer en Stripe
 */
exports.crearCustomer = async (email, nombre, barberiaId) => {
    return await stripe.customers.create({
        email,
        name: nombre,
        metadata: { barberiaId: barberiaId.toString() }
    });
};

/**
 * Create Checkout Session for Subscription
 * @param {Object} options - Checkout session options
 * @param {string} options.priceId - Stripe price ID
 * @param {string} options.customerEmail - Customer email
 * @param {Object} options.metadata - Additional metadata
 * @param {string} options.successUrl - Success redirect URL
 * @param {string} options.cancelUrl - Cancel redirect URL
 */
exports.createCheckoutSession = async ({ priceId, customerEmail, metadata, successUrl, cancelUrl }) => {
    return await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                price: priceId,
                quantity: 1
            }
        ],
        mode: "subscription",
        customer_email: customerEmail,
        metadata: metadata || {},
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
        billing_address_collection: 'required'
    });
};

/**
 * Crea una Sesión de Checkout para Suscripción (legacy)
 */
exports.crearCheckoutSession = async (customerId, priceId, successUrl, cancelUrl) => {
    return await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        success_url: successUrl,
        cancel_url: cancelUrl,
    });
};

/**
 * Update Subscription (change plan)
 * @param {string} subscriptionId - Stripe subscription ID
 * @param {string} newPriceId - New price ID
 */
exports.updateSubscription = async (subscriptionId, newPriceId) => {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    return await stripe.subscriptions.update(subscriptionId, {
        items: [{
            id: subscription.items.data[0].id,
            price: newPriceId
        }],
        proration_behavior: 'always_invoice' // Charge/credit immediately
    });
};

/**
 * Cancel Subscription (at period end)
 * @param {string} subscriptionId - Stripe subscription ID
 */
exports.cancelSubscription = async (subscriptionId) => {
    return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
    });
};

/**
 * Reactivate Subscription
 * @param {string} subscriptionId - Stripe subscription ID
 */
exports.reactivateSubscription = async (subscriptionId) => {
    return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false
    });
};

/**
 * Get Customer Invoices
 * @param {string} customerId - Stripe customer ID
 * @param {number} limit - Number of invoices to retrieve
 */
exports.getCustomerInvoices = async (customerId, limit = 12) => {
    const invoices = await stripe.invoices.list({
        customer: customerId,
        limit: limit
    });

    return invoices.data;
};

/**
 * Get Subscription by ID
 * @param {string} subscriptionId - Stripe subscription ID
 */
exports.getSubscription = async (subscriptionId) => {
    return await stripe.subscriptions.retrieve(subscriptionId);
};

/**
 * Crea un PaymentIntent para depósitos de citas
 */
exports.crearPaymentIntent = async (amount, currency = "clp", metadata = {}) => {
    return await stripe.paymentIntents.create({
        amount: amount, // En centavos para otras monedas, pero CLP no tiene decimales
        currency: currency,
        metadata: metadata,
        automatic_payment_methods: { enabled: true },
    });
};

/**
 * Construct Webhook Event
 * Verifies and constructs a Stripe webhook event
 * @param {string} payload - Request body
 * @param {string} signature - Stripe signature header
 */
exports.constructWebhookEvent = (payload, signature) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET not configured');
    }

    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
};
