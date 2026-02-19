const stripeService = require('../services/stripe.service');
const Barberia = require('../infrastructure/database/mongodb/models/Barberia');
const Subscription = require('../infrastructure/database/mongodb/models/Subscription');
const { PLANS_CATALOG } = require('../constants/plansCatalog');

const User = require('../infrastructure/database/mongodb/models/User');

/**
 * Create Stripe Checkout Session
 * Creates a new checkout session and also creates pending Barberia and User
 */
exports.createCheckoutSession = async (req, res, next) => {
    try {
        const { planId, email, nombre, password } = req.body;

        // Validate plan exists
        if (!PLANS_CATALOG[planId]) {
            return res.status(400).json({
                success: false,
                message: 'Plan inválido'
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El correo ya está registrado'
            });
        }

        const plan = PLANS_CATALOG[planId];

        // Generate temporary slug
        const slug = nombre
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        // Create pending Barberia
        const barberia = new Barberia({
            nombre,
            email,
            slug,
            plan: planId,
            estado: 'trial', // Start in trial status
            activa: false,   // But inactive until payment
            fechaFinTrial: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
        });

        await barberia.save();

        // Create pending User (Admin)
        const user = new User({
            nombre: 'Admin ' + nombre,
            email,
            password,
            rol: 'BARBERIA_ADMIN',
            barberiaId: barberia._id,
            barberiaIds: [barberia._id],
            activo: false // Inactive until payment
        });

        await user.save();

        // Get Stripe price ID from environment
        const priceId = process.env[`STRIPE_PRICE_${planId.toUpperCase()}`];

        if (!priceId) {
            return res.status(500).json({
                success: false,
                message: 'Configuración de plan no encontrada'
            });
        }

        // Create checkout session
        const session = await stripeService.createCheckoutSession({
            priceId,
            customerEmail: email,
            metadata: {
                planId,
                nombre,
                email,
                barberiaId: barberia._id.toString(),
                userId: user._id.toString()
            },
            successUrl: `${process.env.FRONTEND_URL}/auth/success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${process.env.FRONTEND_URL}/pricing`
        });

        res.status(200).json({
            success: true,
            sessionId: session.id,
            url: session.url
        });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        next(error);
    }
};

/**
 * Get Current Subscription
 * Returns the current subscription details for the authenticated barbershop
 */
exports.getCurrentSubscription = async (req, res, next) => {
    try {
        const barberiaId = req.user.barberiaId;

        const barberia = await Barberia.findById(barberiaId);

        if (!barberia) {
            return res.status(404).json({
                success: false,
                message: 'Barbería no encontrada'
            });
        }

        // Get subscription from database
        let subscription = null;
        if (barberia.stripeSubscriptionId) {
            subscription = await Subscription.findOne({
                stripeSubscriptionId: barberia.stripeSubscriptionId
            });
        }

        // Calculate trial info
        let trialInfo = null;
        if (barberia.estado === 'trial' && barberia.fechaFinTrial) {
            const now = new Date();
            const daysRemaining = Math.ceil((barberia.fechaFinTrial - now) / (1000 * 60 * 60 * 24));
            trialInfo = {
                daysRemaining: Math.max(0, daysRemaining),
                endDate: barberia.fechaFinTrial,
                isExpired: daysRemaining <= 0
            };
        }

        // Get plan details
        const planDetails = PLANS_CATALOG[barberia.plan] || null;

        res.status(200).json({
            success: true,
            subscription: {
                plan: barberia.plan,
                estado: barberia.estado,
                planDetails,
                trialInfo,
                stripeCustomerId: barberia.stripeCustomerId,
                stripeSubscriptionId: barberia.stripeSubscriptionId,
                proximoPago: barberia.proximoPago,
                subscription: subscription ? {
                    status: subscription.status,
                    currentPeriodEnd: subscription.currentPeriodEnd,
                    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
                } : null
            }
        });
    } catch (error) {
        console.error('Error getting subscription:', error);
        next(error);
    }
};

/**
 * Change Plan
 * Upgrades or downgrades the current subscription plan
 */
exports.changePlan = async (req, res, next) => {
    try {
        const { newPlanId } = req.body;
        const barberiaId = req.user.barberiaId;

        // Validate new plan
        if (!PLANS_CATALOG[newPlanId]) {
            return res.status(400).json({
                success: false,
                message: 'Plan inválido'
            });
        }

        const barberia = await Barberia.findById(barberiaId);

        if (!barberia) {
            return res.status(404).json({
                success: false,
                message: 'Barbería no encontrada'
            });
        }

        // Check if barberia has an active subscription
        if (!barberia.stripeSubscriptionId) {
            return res.status(400).json({
                success: false,
                message: 'No tienes una suscripción activa'
            });
        }

        // Get new price ID
        const newPriceId = process.env[`STRIPE_PRICE_${newPlanId.toUpperCase()}`];

        if (!newPriceId) {
            return res.status(500).json({
                success: false,
                message: 'Configuración de plan no encontrada'
            });
        }

        // Update subscription in Stripe
        const updatedSubscription = await stripeService.updateSubscription(
            barberia.stripeSubscriptionId,
            newPriceId
        );

        // Update in database (will be confirmed by webhook)
        barberia.plan = newPlanId;
        await barberia.save();

        res.status(200).json({
            success: true,
            message: 'Plan actualizado exitosamente',
            subscription: updatedSubscription
        });
    } catch (error) {
        console.error('Error changing plan:', error);
        next(error);
    }
};

/**
 * Cancel Subscription
 * Cancels the current subscription (at period end)
 */
exports.cancelSubscription = async (req, res, next) => {
    try {
        const barberiaId = req.user.barberiaId;

        const barberia = await Barberia.findById(barberiaId);

        if (!barberia) {
            return res.status(404).json({
                success: false,
                message: 'Barbería no encontrada'
            });
        }

        if (!barberia.stripeSubscriptionId) {
            return res.status(400).json({
                success: false,
                message: 'No tienes una suscripción activa'
            });
        }

        // Cancel subscription in Stripe (at period end)
        const canceledSubscription = await stripeService.cancelSubscription(
            barberia.stripeSubscriptionId
        );

        // Update subscription in database
        await Subscription.findOneAndUpdate(
            { stripeSubscriptionId: barberia.stripeSubscriptionId },
            { cancelAtPeriodEnd: true }
        );

        res.status(200).json({
            success: true,
            message: 'Suscripción cancelada. Tendrás acceso hasta el final del período actual.',
            subscription: canceledSubscription
        });
    } catch (error) {
        console.error('Error canceling subscription:', error);
        next(error);
    }
};

/**
 * Get Payment History
 * Returns the list of invoices for the barbershop
 */
exports.getInvoices = async (req, res, next) => {
    try {
        const barberiaId = req.user.barberiaId;

        const barberia = await Barberia.findById(barberiaId);

        if (!barberia) {
            return res.status(404).json({
                success: false,
                message: 'Barbería no encontrada'
            });
        }

        if (!barberia.stripeCustomerId) {
            return res.status(200).json({
                success: true,
                invoices: []
            });
        }

        // Get invoices from Stripe
        const invoices = await stripeService.getCustomerInvoices(barberia.stripeCustomerId);

        res.status(200).json({
            success: true,
            invoices: invoices.map(invoice => ({
                id: invoice.id,
                amount: invoice.amount_paid / 100, // Convert from cents
                currency: invoice.currency,
                status: invoice.status,
                date: new Date(invoice.created * 1000),
                invoicePdf: invoice.invoice_pdf,
                hostedInvoiceUrl: invoice.hosted_invoice_url
            }))
        });
    } catch (error) {
        console.error('Error getting invoices:', error);
        next(error);
    }
};

/**
 * Reactivate Subscription
 * Reactivates a canceled subscription before period end
 */
exports.reactivateSubscription = async (req, res, next) => {
    try {
        const barberiaId = req.user.barberiaId;

        const barberia = await Barberia.findById(barberiaId);

        if (!barberia || !barberia.stripeSubscriptionId) {
            return res.status(400).json({
                success: false,
                message: 'No se encontró una suscripción'
            });
        }

        // Reactivate in Stripe
        const reactivatedSubscription = await stripeService.reactivateSubscription(
            barberia.stripeSubscriptionId
        );

        // Update in database
        await Subscription.findOneAndUpdate(
            { stripeSubscriptionId: barberia.stripeSubscriptionId },
            { cancelAtPeriodEnd: false }
        );

        res.status(200).json({
            success: true,
            message: 'Suscripción reactivada exitosamente',
            subscription: reactivatedSubscription
        });
    } catch (error) {
        console.error('Error reactivating subscription:', error);
        next(error);
    }
};
