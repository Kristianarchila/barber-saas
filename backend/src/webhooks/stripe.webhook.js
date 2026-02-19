/**
 * Stripe Webhook Handler
 * 
 * Endpoint to receive and process Stripe webhook events.
 */

const express = require('express');
const router = express.Router();

const HandleStripeWebhook = require('../application/use-cases/subscriptions/HandleStripeWebhook');
const MongoSubscriptionRepository = require('../infrastructure/database/mongodb/repositories/MongoSubscriptionRepository');
const MongoBarberiaRepository = require('../infrastructure/database/mongodb/repositories/MongoBarberiaRepository');
const StripeAdapter = require('../infrastructure/payment/StripeAdapter');

// Initialize dependencies
const subscriptionRepo = new MongoSubscriptionRepository();
const barberiaRepo = new MongoBarberiaRepository();
const stripeAdapter = new StripeAdapter();

// Initialize use case
const handleWebhook = new HandleStripeWebhook(subscriptionRepo, barberiaRepo);

/**
 * Stripe webhook endpoint
 * 
 * IMPORTANT: This endpoint needs raw body parser, not JSON parser.
 * Configure in app.js before other middleware.
 */
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const signature = req.headers['stripe-signature'];

    try {
        // Construct and verify webhook event
        const event = stripeAdapter.constructWebhookEvent(req.body, signature);

        console.log(`Received Stripe webhook: ${event.type}`);

        // Process event
        await handleWebhook.execute(event);

        // Return 200 to acknowledge receipt
        res.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error.message);

        // Return 400 for signature verification failures
        if (error.message.includes('signature')) {
            return res.status(400).json({
                error: 'Webhook signature verification failed'
            });
        }

        // Return 500 for processing errors
        res.status(500).json({
            error: 'Webhook processing failed',
            details: error.message
        });
    }
});

module.exports = router;
