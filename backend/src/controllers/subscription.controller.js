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
 * Get invoices/payment history
 */
exports.getInvoices = async (req, res) => {
    try {
        // TODO: Implement Stripe invoice fetching
        // For now, return empty array to prevent 404 errors
        res.json({ invoices: [] });
    } catch (error) {
        console.error('Error getting invoices:', error);
        res.status(500).json({ message: 'Error al obtener facturas' });
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
