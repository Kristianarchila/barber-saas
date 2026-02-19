/**
 * Plan Limits and Features Configuration
 * 
 * Centralized source of truth for all subscription plans.
 * Used by domain logic, middleware, and frontend catalog.
 */

const PLAN_LEVELS = {
    FREE: 'FREE',
    BASICO: 'basico',
    PRO: 'pro',
    PREMIUM: 'premium'
};

const PLAN_LIMITS = {
    [PLAN_LEVELS.FREE]: {
        name: 'FREE',
        displayName: 'Plan Gratuito',
        precio: 0,
        limites: {
            maxBarberos: 1,
            maxReservasMes: 50,
            maxServicios: 5,
            maxFotos: 2
        },
        features: {
            reservasOnline: true,
            gestionHorarios: true,
            gestionServicios: true,
            notificacionesEmail: false,
            reportesBasicos: true,
            reportesAvanzados: false,
            integracionWhatsApp: false,
            personalizacion: false,
            soportePrioritario: false,
            multipleAdmins: false
        }
    },
    [PLAN_LEVELS.BASICO]: {
        name: 'BASICO',
        displayName: 'Plan Básico',
        precio: 29990,
        limites: {
            maxBarberos: 3,
            maxReservasMes: 100,
            maxServicios: 10,
            maxFotos: 5
        },
        features: {
            reservasOnline: true,
            gestionHorarios: true,
            gestionServicios: true,
            notificacionesEmail: false,
            reportesBasicos: true,
            reportesAvanzados: false,
            integracionWhatsApp: false,
            personalizacion: false,
            soportePrioritario: false,
            multipleAdmins: false
        }
    },
    [PLAN_LEVELS.PRO]: {
        name: 'PRO',
        displayName: 'Plan Pro',
        precio: 59990,
        limites: {
            maxBarberos: 10,
            maxReservasMes: 500,
            maxServicios: 30,
            maxFotos: 20
        },
        features: {
            reservasOnline: true,
            gestionHorarios: true,
            gestionServicios: true,
            notificacionesEmail: true,
            reportesBasicos: true,
            reportesAvanzados: true,
            integracionWhatsApp: true,
            personalizacion: true,
            soportePrioritario: false,
            multipleAdmins: true
        }
    },
    [PLAN_LEVELS.PREMIUM]: {
        name: 'PREMIUM',
        displayName: 'Plan Premium',
        precio: 99990,
        limites: {
            maxBarberos: -1, // Ilimitado
            maxReservasMes: -1,
            maxServicios: -1,
            maxFotos: -1
        },
        features: {
            reservasOnline: true,
            gestionHorarios: true,
            gestionServicios: true,
            notificacionesEmail: true,
            reportesBasicos: true,
            reportesAvanzados: true,
            integracionWhatsApp: true,
            personalizacion: true,
            soportePrioritario: true,
            multipleAdmins: true
        }
    }
};

/**
 * Normalizes plan name to match defined keys
 * Handles case sensitivity and alias like 'basic' -> 'BASICO'
 */
function normalizePlan(planName) {
    if (!planName) return PLAN_LEVELS.FREE;
    const normalized = planName.toLowerCase();

    if (normalized === 'free' || normalized === 'gratuito') return PLAN_LEVELS.FREE;
    if (normalized === 'basico' || normalized === 'basic') return PLAN_LEVELS.BASICO;
    if (normalized === 'pro' || normalized === 'profesional') return PLAN_LEVELS.PRO;
    if (normalized === 'premium') return PLAN_LEVELS.PREMIUM;

    return PLAN_LEVELS.FREE; // Default
}

/**
 * Get full plan configuration
 */
function getPlanConfig(planName) {
    const key = normalizePlan(planName);
    return PLAN_LIMITS[key];
}

module.exports = {
    PLAN_LEVELS,
    PLAN_LIMITS,
    normalizePlan,
    getPlanConfig
};
