/**
 * @fileoverview Plan Catalog for SaaS Multi-Tenant System
 * 
 * Defines all available subscription plans with their limits and features.
 * Used for validation, billing, and feature gating across the platform.
 */

/**
 * Available subscription plans
 */
const { PLAN_LIMITS, PLAN_LEVELS } = require('./PlanLimits');

/**
 * Available subscription plans
 */
const PLAN_NAMES = {
    BASICO: PLAN_LEVELS.BASICO,
    PRO: PLAN_LEVELS.PRO,
    PREMIUM: PLAN_LEVELS.PREMIUM
};

/**
 * Plan catalog for frontend and display
 * Derived from PlanLimits to ensure consistency
 */
const PLANS_CATALOG = {
    [PLAN_LEVELS.BASICO]: {
        ...PLAN_LIMITS[PLAN_LEVELS.BASICO],
        descripcion: 'Ideal para barberías pequeñas empezando'
    },
    [PLAN_LEVELS.PRO]: {
        ...PLAN_LIMITS[PLAN_LEVELS.PRO],
        descripcion: 'Para barberías en crecimiento'
    },
    [PLAN_LEVELS.PREMIUM]: {
        ...PLAN_LIMITS[PLAN_LEVELS.PREMIUM],
        descripcion: 'Sin límites para grandes operaciones'
    }
};

/**
 * Get plan configuration by name
 * @param {string} planName - Plan name (basico, pro, premium)
 * @returns {Object|null} Plan configuration or null if not found
 */
function getPlan(planName) {
    if (!planName) return null;
    return PLANS_CATALOG[planName.toLowerCase()] || null;
}

/**
 * Check if a plan exists
 * @param {string} planName - Plan name to check
 * @returns {boolean}
 */
function isValidPlan(planName) {
    return Object.keys(PLANS_CATALOG).includes(planName?.toLowerCase());
}

/**
 * Get limit value for a specific resource
 * @param {string} planName - Plan name
 * @param {string} resource - Resource name (maxBarberos, maxReservasMes, etc)
 * @returns {number} Limit value (-1 for unlimited)
 */
function getLimit(planName, resource) {
    const plan = getPlan(planName);
    if (!plan) return 0;
    return plan.limites[resource] ?? 0;
}

/**
 * Check if a plan has a specific feature
 * @param {string} planName - Plan name
 * @param {string} featureName - Feature name
 * @returns {boolean}
 */
function hasFeature(planName, featureName) {
    const plan = getPlan(planName);
    if (!plan) return false;
    return plan.features[featureName] === true;
}

/**
 * Check if current usage exceeds plan limit
 * @param {string} planName - Plan name
 * @param {string} resource - Resource name
 * @param {number} currentUsage - Current usage count
 * @returns {boolean} True if limit exceeded
 */
function isLimitExceeded(planName, resource, currentUsage) {
    const limit = getLimit(planName, resource);

    // -1 means unlimited
    if (limit === -1) return false;

    return currentUsage >= limit;
}

/**
 * Calculate usage percentage of a limit
 * @param {string} planName - Plan name
 * @param {string} resource - Resource name
 * @param {number} currentUsage - Current usage count
 * @returns {number} Percentage (0-100, or -1 for unlimited)
 */
function getUsagePercentage(planName, resource, currentUsage) {
    const limit = getLimit(planName, resource);

    // -1 means unlimited
    if (limit === -1) return -1;
    if (limit === 0) return 100;

    return Math.min(100, Math.round((currentUsage / limit) * 100));
}

/**
 * Get all available plans
 * @returns {Array} Array of plan names
 */
function getAllPlans() {
    return Object.keys(PLANS_CATALOG);
}

/**
 * Get plan comparison data
 * @returns {Object} Plan catalog
 */
function getPlanCatalog() {
    return PLANS_CATALOG;
}

module.exports = {
    PLAN_NAMES,
    PLANS_CATALOG,
    getPlan,
    isValidPlan,
    getLimit,
    hasFeature,
    isLimitExceeded,
    getUsagePercentage,
    getAllPlans,
    getPlanCatalog
};
