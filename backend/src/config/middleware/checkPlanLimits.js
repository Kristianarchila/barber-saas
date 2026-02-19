/**
 * @fileoverview Middleware for checking plan limits
 * 
 * Validates that barberías don't exceed their plan limits
 * when creating resources (barberos, reservas, servicios, etc)
 */

const Barberia = require("../infrastructure/database/mongodb/models/Barberia");
const Barbero = require("../infrastructure/database/mongodb/models/Barbero");
const Reserva = require("../infrastructure/database/mongodb/models/Reserva");
const Servicio = require("../infrastructure/database/mongodb/models/Servicio");
const { isLimitExceeded, getLimit, getPlan } = require("../constants/plansCatalog");

/**
 * Check if barbería can add more barberos
 * Use before creating a new barbero
 */
exports.checkBarberosLimit = async (req, res, next) => {
    try {
        const barberiaId = req.user.barberiaId;

        const barberia = await Barberia.findById(barberiaId).select("plan");
        if (!barberia) {
            return res.status(404).json({ message: "Barbería no encontrada" });
        }

        const currentCount = await Barbero.countDocuments({
            barberiaId,
            activo: true  // Solo contar barberos activos
        });

        const exceeded = isLimitExceeded(barberia.plan, "maxBarberos", currentCount);

        if (exceeded) {
            const limit = getLimit(barberia.plan, "maxBarberos");
            const plan = getPlan(barberia.plan);

            return res.status(403).json({
                message: `Límite de barberos alcanzado`,
                error: "PLAN_LIMIT_EXCEEDED",
                details: {
                    plan: plan.displayName,
                    limit,
                    current: currentCount,
                    suggestion: "Actualiza tu plan para agregar más barberos"
                }
            });
        }

        // Guardar en req para evitar re-query
        req.planCheck = {
            plan: barberia.plan,
            currentBarberos: currentCount
        };

        next();
    } catch (error) {
        console.error("Error checking barberos limit:", error);
        next(error);
    }
};

/**
 * Check if barbería can create more reservas this month
 * Use before creating a new reserva
 */
exports.checkReservasLimit = async (req, res, next) => {
    try {
        const barberiaId = req.user.barberiaId;

        const barberia = await Barberia.findById(barberiaId).select("plan");
        if (!barberia) {
            return res.status(404).json({ message: "Barbería no encontrada" });
        }

        // Contar reservas del mes actual
        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);

        const currentCount = await Reserva.countDocuments({
            barberiaId,
            createdAt: { $gte: inicioMes }
        });

        const exceeded = isLimitExceeded(barberia.plan, "maxReservasMes", currentCount);

        if (exceeded) {
            const limit = getLimit(barberia.plan, "maxReservasMes");
            const plan = getPlan(barberia.plan);

            return res.status(403).json({
                message: `Límite mensual de reservas alcanzado`,
                error: "PLAN_LIMIT_EXCEEDED",
                details: {
                    plan: plan.displayName,
                    limit,
                    current: currentCount,
                    suggestion: "Actualiza tu plan para más reservas mensuales"
                }
            });
        }

        req.planCheck = {
            plan: barberia.plan,
            currentReservasMes: currentCount
        };

        next();
    } catch (error) {
        console.error("Error checking reservas limit:", error);
        next(error);
    }
};

/**
 * Check if barbería can create more servicios
 * Use before creating a new servicio
 */
exports.checkServiciosLimit = async (req, res, next) => {
    try {
        const barberiaId = req.user.barberiaId;

        const barberia = await Barberia.findById(barberiaId).select("plan");
        if (!barberia) {
            return res.status(404).json({ message: "Barbería no encontrada" });
        }

        const currentCount = await Servicio.countDocuments({
            barberiaId,
            activo: true
        });

        const exceeded = isLimitExceeded(barberia.plan, "maxServicios", currentCount);

        if (exceeded) {
            const limit = getLimit(barberia.plan, "maxServicios");
            const plan = getPlan(barberia.plan);

            return res.status(403).json({
                message: `Límite de servicios alcanzado`,
                error: "PLAN_LIMIT_EXCEEDED",
                details: {
                    plan: plan.displayName,
                    limit,
                    current: currentCount,
                    suggestion: "Actualiza tu plan para agregar más servicios"
                }
            });
        }

        req.planCheck = {
            plan: barberia.plan,
            currentServicios: currentCount
        };

        next();
    } catch (error) {
        console.error("Error checking servicios limit:", error);
        next(error);
    }
};

/**
 * Check if barbería has access to a specific feature
 * Use for feature gating
 */
exports.requireFeature = (featureName) => {
    return async (req, res, next) => {
        try {
            const barberiaId = req.user.barberiaId;

            const barberia = await Barberia.findById(barberiaId).select("plan");
            if (!barberia) {
                return res.status(404).json({ message: "Barbería no encontrada" });
            }

            const { hasFeature: checkFeature } = require("../constants/plansCatalog");
            const hasAccess = checkFeature(barberia.plan, featureName);

            if (!hasAccess) {
                const plan = getPlan(barberia.plan);

                return res.status(403).json({
                    message: `Esta funcionalidad no está disponible en tu plan`,
                    error: "FEATURE_NOT_AVAILABLE",
                    details: {
                        plan: plan.displayName,
                        feature: featureName,
                        suggestion: "Actualiza a un plan superior para acceder a esta funcionalidad"
                    }
                });
            }

            next();
        } catch (error) {
            console.error("Error checking feature access:", error);
            next(error);
        }
    };
};
