/**
 * Subscription Controller
 * 
 * Handles HTTP requests for subscription management.
 */

const CreateSubscription = require('../application/use-cases/subscriptions/CreateSubscription');
const UpdateSubscription = require('../application/use-cases/subscriptions/UpdateSubscription');
const CancelSubscription = require('../application/use-cases/subscriptions/CancelSubscription');
const CheckPlanLimits = require('../application/use-cases/subscriptions/CheckPlanLimits');
const ManageSubscription = require('../application/use-cases/subscriptions/ManageSubscription');
const GetSubscriptionHistory = require('../application/use-cases/subscriptions/GetSubscriptionHistory');

const MongoSubscriptionRepository = require('../infrastructure/database/mongodb/repositories/MongoSubscriptionRepository');
const MongoBarberiaRepository = require('../infrastructure/database/mongodb/repositories/MongoBarberiaRepository');
const MongoBarberoRepository = require('../infrastructure/database/mongodb/repositories/MongoBarberoRepository');
const MongoServicioRepository = require('../infrastructure/database/mongodb/repositories/MongoServicioRepository');
const StripeAdapter = require('../infrastructure/payment/StripeAdapter');

// Initialize dependencies
const subscriptionRepo = new MongoSubscriptionRepository();
const barberiaRepo = new MongoBarberiaRepository();
const barberoRepo = new MongoBarberoRepository();
const servicioRepo = new MongoServicioRepository();
const stripeAdapter = new StripeAdapter();

// Initialize use cases
const createSubscription = new CreateSubscription(subscriptionRepo, stripeAdapter, barberiaRepo);
const updateSubscription = new UpdateSubscription(subscriptionRepo, stripeAdapter, barberiaRepo);
const cancelSubscription = new CancelSubscription(subscriptionRepo, stripeAdapter, barberiaRepo);
const checkPlanLimits = new CheckPlanLimits(subscriptionRepo, barberiaRepo, barberoRepo, servicioRepo);
const manageSubscription = new ManageSubscription(subscriptionRepo, barberiaRepo);
const getSubscriptionHistory = new GetSubscriptionHistory(subscriptionRepo);

/**
 * Get current subscription for authenticated barberia
 */
exports.getCurrentSubscription = async (req, res) => {
    try {
        const barberiaId = req.user.barberiaId;

        const subscription = await subscriptionRepo.findByBarberiaId(barberiaId);

        if (!subscription) {
            return res.status(404).json({
                error: 'No subscription found'
            });
        }

        res.json({
            subscription: subscription.toObject()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to get subscription',
            details: error.message
        });
    }
};

/**
 * Create a new subscription
 */
exports.createSubscription = async (req, res) => {
    try {
        const { barberiaId, planId, paymentMethodId } = req.body;

        const subscription = await createSubscription.execute(barberiaId, planId, paymentMethodId);

        res.status(201).json({
            message: 'Subscription created successfully',
            subscription: subscription.toObject()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to create subscription',
            details: error.message
        });
    }
};

/**
 * Update subscription (change plan)
 */
exports.updateSubscription = async (req, res) => {
    try {
        const barberiaId = req.user.barberiaId;
        const { newPlanId } = req.body;

        // 📝 Pasar userId y request para auditoría
        const subscription = await updateSubscription.execute({
            barberiaId,
            newPlan: newPlanId,
            userId: req.user._id,  // Para auditoría
            request: req           // Para auditoría
        });

        res.json({
            message: 'Subscription updated successfully',
            subscription: subscription.toObject()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to update subscription',
            details: error.message
        });
    }
};

/**
 * Cancel subscription
 */
exports.cancelSubscription = async (req, res) => {
    try {
        const barberiaId = req.user.barberiaId;
        const { immediately } = req.body;

        const subscription = await cancelSubscription.execute(barberiaId, immediately);

        res.json({
            message: 'Subscription canceled successfully',
            subscription: subscription.toObject()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to cancel subscription',
            details: error.message
        });
    }
};

/**
 * Check plan limits
 */
exports.checkPlanLimits = async (req, res) => {
    try {
        const barberiaId = req.user.barberiaId;

        const limits = await checkPlanLimits.execute(barberiaId);

        res.json(limits);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to check plan limits',
            details: error.message
        });
    }
};

/**
 * Get all available plans
 */
exports.getPlans = async (req, res) => {
    try {
        const Plan = require('../domain/value-objects/Plan');
        const plans = Plan.getAllPlans();

        res.json({
            plans
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to get plans',
            details: error.message
        });
    }
};

/**
 * Get invoices/payment history — now returns USDT manual payments
 */
exports.getInvoices = async (req, res) => {
    try {
        const barberiaId = req.user.barberiaId;
        const subscription = await subscriptionRepo.findByBarberiaId(barberiaId);
        // Return crypto/manual payments as invoice history
        const payments = subscription?.manualPayments || [];
        res.json({ invoices: payments });
    } catch (error) {
        console.error('Error getting invoices:', error);
        res.status(500).json({ message: 'Error al obtener historial de pagos' });
    }
};

/**
 * 💎 Get USDT wallet info and plan pricing
 * GET /api/subscriptions/wallet-info?plan=BASIC
 */
exports.getWalletInfo = async (req, res) => {
    const { getPlanConfig, normalizePlan } = require('../constants/PlanLimits');
    const requestedPlan = req.query.plan || 'BASIC';
    const normalizedPlan = normalizePlan(requestedPlan);
    const planConfig = getPlanConfig(normalizedPlan);

    if (!process.env.USDT_WALLET_ADDRESS || process.env.USDT_WALLET_ADDRESS === 'TU_WALLET_USDT_TRC20_AQUI') {
        return res.status(503).json({ message: 'Wallet address not configured. Contact support.' });
    }

    res.json({
        walletAddress: process.env.USDT_WALLET_ADDRESS,
        network: process.env.USDT_NETWORK || 'TRC20',
        plan: normalizedPlan,
        planDisplayName: planConfig?.displayName || requestedPlan,
        amountUsdt: planConfig?.precioUsdt || 0,
        contactWhatsApp: process.env.USDT_CONTACT_WHATSAPP || null,
        instructions: [
            `Envía exactamente ${planConfig?.precioUsdt} USDT a la dirección TRC-20`,
            'Guarda el screenshot o hash de la transacción',
            'Haz clic en "Ya Pagué" y notifica al soporte',
            'Tu plan se activará en menos de 24 horas'
        ]
    });
};

/**
 * 💎 Request payment — barbería notifies they sent USDT
 * POST /api/subscriptions/request-payment
 */
exports.requestPayment = async (req, res) => {
    try {
        const barberiaId = req.user.barberiaId;
        const { plan, txHash, notes } = req.body;

        if (!plan) return res.status(400).json({ message: 'plan requerido' });

        // Upsert subscription in INCOMPLETE state (pending verification)
        let subscription = await subscriptionRepo.findByBarberiaId(barberiaId);

        if (!subscription) {
            // Create new pending subscription
            const { normalizePlan } = require('../constants/PlanLimits');
            const Subscription = require('../domain/entities/Subscription');
            subscription = new Subscription({
                barberiaId,
                plan: normalizePlan(plan),
                status: 'INCOMPLETE',
                paymentMethod: 'CRYPTO',
                stripeCustomerId: null,
                metadata: { txHash, notes, requestedAt: new Date() }
            });
        } else {
            subscription._status = 'INCOMPLETE';
            subscription._plan = plan;
            subscription._paymentMethod = 'CRYPTO';
            subscription._metadata = { ...subscription._metadata, txHash, notes, requestedAt: new Date() };
        }

        await subscriptionRepo.save(subscription);

        // Log for SuperAdmin visibility
        console.log(`[CRYPTO PAYMENT] Barbería ${barberiaId} reported USDT payment for plan ${plan}. TxHash: ${txHash || 'not provided'}`);

        res.json({
            message: '¡Pago notificado! Tu plan se activará en menos de 24 horas una vez verfiquemos la transacción.',
            status: 'PENDING_VERIFICATION'
        });
    } catch (error) {
        console.error('[Crypto] Error requesting payment:', error);
        res.status(500).json({ message: 'Error al registrar solicitud de pago', details: error.message });
    }
};

// ==========================================
// MANUAL SUBSCRIPTION MANAGEMENT (SuperAdmin only)
// ==========================================

/**
 * Change subscription plan manually
 * @route POST /api/superadmin/subscriptions/:barberiaId/change-plan
 */
exports.changePlanManually = async (req, res) => {
    try {
        const { barberiaId } = req.params;
        const { newPlan, reason } = req.body;
        const changedBy = req.user.id;

        const subscription = await manageSubscription.changePlan(barberiaId, newPlan, changedBy, reason);

        res.json({
            message: 'Plan changed successfully',
            subscription: subscription.toObject()
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

/**
 * Extend subscription period manually
 * @route POST /api/superadmin/subscriptions/:barberiaId/extend
 */
exports.extendPeriodManually = async (req, res) => {
    try {
        const { barberiaId } = req.params;
        const { months, reason } = req.body;
        const extendedBy = req.user.id;

        const subscription = await manageSubscription.extendPeriod(barberiaId, months, extendedBy, reason);

        res.json({
            message: `Period extended by ${months} month(s)`,
            subscription: subscription.toObject()
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

/**
 * Activate subscription manually
 * @route POST /api/superadmin/subscriptions/:barberiaId/activate
 */
exports.activateManually = async (req, res) => {
    try {
        const { barberiaId } = req.params;
        const { reason } = req.body;
        const activatedBy = req.user.id;

        const subscription = await manageSubscription.activate(barberiaId, activatedBy, reason);

        res.json({
            message: 'Subscription activated successfully',
            subscription: subscription.toObject()
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

/**
 * Deactivate subscription manually
 * @route POST /api/superadmin/subscriptions/:barberiaId/deactivate
 */
exports.deactivateManually = async (req, res) => {
    try {
        const { barberiaId } = req.params;
        const { reason } = req.body;
        const deactivatedBy = req.user.id;

        const subscription = await manageSubscription.deactivate(barberiaId, deactivatedBy, reason);

        res.json({
            message: 'Subscription deactivated successfully',
            subscription: subscription.toObject()
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

/**
 * Record manual payment
 * @route POST /api/superadmin/subscriptions/:barberiaId/record-payment
 */
exports.recordPaymentManually = async (req, res) => {
    try {
        const { barberiaId } = req.params;
        const { amount, concept, metadata } = req.body;
        const recordedBy = req.user.id;

        const subscription = await manageSubscription.recordPayment(
            barberiaId,
            amount,
            concept,
            recordedBy,
            metadata
        );

        res.json({
            message: 'Payment recorded successfully',
            subscription: subscription.toObject()
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

/**
 * Get subscription history
 * @route GET /api/superadmin/subscriptions/:barberiaId/history
 */
exports.getHistory = async (req, res) => {
    try {
        const { barberiaId } = req.params;

        const history = await getSubscriptionHistory.execute(barberiaId);

        res.json(history);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};
