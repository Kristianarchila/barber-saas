/**
 * Plan Limits Middleware
 * 
 * Middleware to enforce plan limits before allowing actions.
 */

const CheckPlanLimits = require('../application/use-cases/subscriptions/CheckPlanLimits');
const MongoSubscriptionRepository = require('../infrastructure/database/mongodb/repositories/MongoSubscriptionRepository');
const MongoBarberiaRepository = require('../infrastructure/database/mongodb/repositories/MongoBarberiaRepository');
const MongoBarberoRepository = require('../infrastructure/database/mongodb/repositories/MongoBarberoRepository');
const MongoServicioRepository = require('../infrastructure/database/mongodb/repositories/MongoServicioRepository');

// Initialize repositories
const subscriptionRepo = new MongoSubscriptionRepository();
const barberiaRepo = new MongoBarberiaRepository();
const barberoRepo = new MongoBarberoRepository();
const servicioRepo = new MongoServicioRepository();

// Initialize use case
const checkPlanLimits = new CheckPlanLimits(
    subscriptionRepo,
    barberiaRepo,
    barberoRepo,
    servicioRepo
);

/**
 * Middleware to check if barberia can add a barbero
 */
const checkBarberoLimit = async (req, res, next) => {
    try {
        let barberiaId = req.body?.barberiaId || req.barberiaId || req.user?.barberiaId;

        if (!barberiaId) {
            return res.status(401).json({
                error: 'No barberiaId found in request'
            });
        }

        // Ensure it's a string for the use case
        barberiaId = barberiaId.toString();

        await checkPlanLimits.canAddBarbero(barberiaId);
        next();
    } catch (error) {
        if (error.code === 'PLAN_LIMIT_EXCEEDED') {
            return res.status(403).json({
                error: error.message,
                code: error.code,
                resource: error.resource,
                currentCount: error.currentCount,
                maxAllowed: error.maxAllowed,
                upgradeRequired: true
            });
        }

        return res.status(500).json({
            error: 'Error checking plan limits',
            details: error.message
        });
    }
};

/**
 * Middleware to check if barberia can add a servicio
 */
const checkServicioLimit = async (req, res, next) => {
    try {
        let barberiaId = req.body?.barberiaId || req.barberiaId || req.user?.barberiaId;

        if (!barberiaId) {
            return res.status(401).json({
                error: 'No barberiaId found in request'
            });
        }

        // Convert to string if it's a Mongoose ObjectId
        barberiaId = barberiaId.toString();

        await checkPlanLimits.canAddServicio(barberiaId);
        next();
    } catch (error) {
        if (error.code === 'PLAN_LIMIT_EXCEEDED') {
            return res.status(403).json({
                error: error.message,
                code: error.code,
                resource: error.resource,
                currentCount: error.currentCount,
                maxAllowed: error.maxAllowed,
                upgradeRequired: true
            });
        }

        return res.status(500).json({
            error: 'Error checking plan limits',
            details: error.message
        });
    }
};

/**
 * Middleware to check if barberia can add a reserva
 */
const checkReservaLimit = async (req, res, next) => {
    try {
        let barberiaId = req.body?.barberiaId || req.barberiaId || req.user?.barberiaId;

        if (!barberiaId) {
            return res.status(401).json({
                error: 'No barberiaId found in request'
            });
        }

        // Convert to string if it's a Mongoose ObjectId
        barberiaId = barberiaId.toString();

        await checkPlanLimits.canAddReserva(barberiaId);
        next();
    } catch (error) {
        if (error.code === 'PLAN_LIMIT_EXCEEDED') {
            return res.status(403).json({
                error: error.message,
                code: error.code,
                resource: error.resource,
                currentCount: error.currentCount,
                maxAllowed: error.maxAllowed,
                upgradeRequired: true
            });
        }

        return res.status(500).json({
            error: 'Error checking plan limits',
            details: error.message
        });
    }
};

module.exports = {
    checkBarberoLimit,
    checkServicioLimit,
    checkReservaLimit
};
