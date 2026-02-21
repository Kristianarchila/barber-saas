// Stripe initialization moved into class to prevent startup crash if key is missing
let stripe;

/**
 * StripeAdapter - Hexagonal Architecture
 * 
 * Adapter para abstraer las operaciones de Stripe del resto de la aplicación.
 * Permite cambiar el proveedor de pagos sin afectar la lógica de negocio.
 */
class StripeAdapter {
    constructor() {
        if (!process.env.STRIPE_SECRET_KEY) {
            console.warn('⚠️ STRIPE_SECRET_KEY no configurada. Las operaciones de pago fallarán.');
        } else if (!stripe) {
            // Initialize stripe instance once
            stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
        }
    }

    /**
     * Crea un Customer en Stripe
     * @param {string} email - Email del cliente
     * @param {string} nombre - Nombre del cliente
     * @param {string} barberiaId - ID de la barbería
     * @returns {Promise<Object>} - Customer creado
     */
    async createCustomer(email, nombre, barberiaId) {
        try {
            const customer = await stripe.customers.create({
                email,
                name: nombre,
                metadata: { barberiaId: barberiaId.toString() }
            });

            return {
                customerId: customer.id,
                email: customer.email,
                name: customer.name
            };
        } catch (error) {
            console.error('❌ Error creating Stripe customer:', error);
            throw new Error(`Failed to create customer: ${error.message}`);
        }
    }

    /**
     * Crea una Sesión de Checkout para Suscripción
     * @param {string} customerId - ID del customer en Stripe
     * @param {string} priceId - ID del precio en Stripe
     * @param {string} successUrl - URL de éxito
     * @param {string} cancelUrl - URL de cancelación
     * @returns {Promise<Object>} - Sesión de checkout
     */
    async createCheckoutSession(customerId, priceId, successUrl, cancelUrl) {
        try {
            const session = await stripe.checkout.sessions.create({
                customer: customerId,
                payment_method_types: ["card"],
                line_items: [{ price: priceId, quantity: 1 }],
                mode: "subscription",
                success_url: successUrl,
                cancel_url: cancelUrl,
            });

            return {
                sessionId: session.id,
                url: session.url,
                status: session.status
            };
        } catch (error) {
            console.error('❌ Error creating checkout session:', error);
            throw new Error(`Failed to create checkout session: ${error.message}`);
        }
    }

    /**
     * Crea un PaymentIntent para depósitos de citas
     * @param {number} amount - Monto en centavos (o unidad mínima de la moneda)
     * @param {string} currency - Código de moneda (ej: 'clp', 'usd')
     * @param {Object} metadata - Metadata adicional
     * @returns {Promise<Object>} - PaymentIntent creado
     */
    async createPaymentIntent(amount, currency = "clp", metadata = {}) {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: currency,
                metadata: metadata,
                automatic_payment_methods: { enabled: true },
            });

            return {
                paymentIntentId: paymentIntent.id,
                clientSecret: paymentIntent.client_secret,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: paymentIntent.status
            };
        } catch (error) {
            console.error('❌ Error creating payment intent:', error);
            throw new Error(`Failed to create payment intent: ${error.message}`);
        }
    }

    /**
     * Confirma un PaymentIntent
     * @param {string} paymentIntentId - ID del PaymentIntent
     * @param {string} paymentMethodId - ID del método de pago (opcional)
     * @returns {Promise<Object>} - PaymentIntent confirmado
     */
    async confirmPayment(paymentIntentId, paymentMethodId = null) {
        try {
            const params = {};
            if (paymentMethodId) {
                params.payment_method = paymentMethodId;
            }

            const paymentIntent = await stripe.paymentIntents.confirm(
                paymentIntentId,
                params
            );

            return {
                paymentIntentId: paymentIntent.id,
                status: paymentIntent.status,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency
            };
        } catch (error) {
            console.error('❌ Error confirming payment:', error);
            throw new Error(`Failed to confirm payment: ${error.message}`);
        }
    }

    /**
     * Realiza un reembolso
     * @param {string} paymentIntentId - ID del PaymentIntent
     * @param {number} amount - Monto a reembolsar (opcional, si no se especifica reembolsa todo)
     * @returns {Promise<Object>} - Reembolso creado
     */
    async refundPayment(paymentIntentId, amount = null) {
        try {
            const params = {
                payment_intent: paymentIntentId
            };

            if (amount) {
                params.amount = amount;
            }

            const refund = await stripe.refunds.create(params);

            return {
                refundId: refund.id,
                amount: refund.amount,
                currency: refund.currency,
                status: refund.status,
                reason: refund.reason
            };
        } catch (error) {
            console.error('❌ Error refunding payment:', error);
            throw new Error(`Failed to refund payment: ${error.message}`);
        }
    }

    /**
     * Obtiene información de un PaymentIntent
     * @param {string} paymentIntentId - ID del PaymentIntent
     * @returns {Promise<Object>} - Información del PaymentIntent
     */
    async getPaymentIntent(paymentIntentId) {
        try {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

            return {
                paymentIntentId: paymentIntent.id,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: paymentIntent.status,
                metadata: paymentIntent.metadata,
                created: paymentIntent.created
            };
        } catch (error) {
            console.error('❌ Error retrieving payment intent:', error);
            throw new Error(`Failed to retrieve payment intent: ${error.message}`);
        }
    }

    /**
     * Cancela un PaymentIntent
     * @param {string} paymentIntentId - ID del PaymentIntent
     * @returns {Promise<Object>} - PaymentIntent cancelado
     */
    async cancelPayment(paymentIntentId) {
        try {
            const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);

            return {
                paymentIntentId: paymentIntent.id,
                status: paymentIntent.status,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency
            };
        } catch (error) {
            console.error('❌ Error canceling payment:', error);
            throw new Error(`Failed to cancel payment: ${error.message}`);
        }
    }

    /**
     * Obtiene información de un Customer
     * @param {string} customerId - ID del customer
     * @returns {Promise<Object>} - Información del customer
     */
    async getCustomer(customerId) {
        try {
            const customer = await stripe.customers.retrieve(customerId);

            return {
                customerId: customer.id,
                email: customer.email,
                name: customer.name,
                metadata: customer.metadata,
                created: customer.created
            };
        } catch (error) {
            console.error('❌ Error retrieving customer:', error);
            throw new Error(`Failed to retrieve customer: ${error.message}`);
        }
    }

    /**
     * Actualiza un Customer
     * @param {string} customerId - ID del customer
     * @param {Object} updates - Datos a actualizar
     * @returns {Promise<Object>} - Customer actualizado
     */
    async updateCustomer(customerId, updates) {
        try {
            const customer = await stripe.customers.update(customerId, updates);

            return {
                customerId: customer.id,
                email: customer.email,
                name: customer.name,
                metadata: customer.metadata
            };
        } catch (error) {
            console.error('❌ Error updating customer:', error);
            throw new Error(`Failed to update customer: ${error.message}`);
        }
    }

    /**
     * Elimina un Customer
     * @param {string} customerId - ID del customer
     * @returns {Promise<Object>} - Resultado de la eliminación
     */
    async deleteCustomer(customerId) {
        try {
            const deleted = await stripe.customers.del(customerId);

            return {
                customerId: deleted.id,
                deleted: deleted.deleted
            };
        } catch (error) {
            console.error('❌ Error deleting customer:', error);
            throw new Error(`Failed to delete customer: ${error.message}`);
        }
    }
}

module.exports = StripeAdapter;
