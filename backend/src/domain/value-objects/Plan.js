const { PLAN_LIMITS, normalizePlan } = require('../../constants/PlanLimits');

class Plan {
    static PLANS = PLAN_LIMITS;

    /**
     * Get plan configuration by name
     * @param {string} planName - FREE, basico, pro, premium
     * @returns {Object} Plan configuration
     */
    static getPlan(planName) {
        const key = normalizePlan(planName);
        const plan = this.PLANS[key];
        if (!plan) {
            throw new Error(`Plan inválido: ${planName}`);
        }
        return {
            ...plan,
            // Maintain compatibility with existing code that expects flat limits
            maxBarberos: plan.limites.maxBarberos,
            maxReservasMes: plan.limites.maxReservasMes,
            maxServicios: plan.limites.maxServicios,
            maxFotos: plan.limites.maxFotos
        };
    }

    /**
     * Validate if a plan name is valid
     * @param {string} planName 
     * @returns {boolean}
     */
    static isValid(planName) {
        try {
            normalizePlan(planName);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Get all available plans
     * @returns {Array} Array of plan configurations
     */
    static getAllPlans() {
        return Object.values(this.PLANS);
    }

    /**
     * Check if a plan allows a specific number of barberos
     * @param {string} planName 
     * @param {number} count 
     * @returns {boolean}
     */
    static canAddBarbero(planName, currentCount) {
        const plan = this.getPlan(planName);
        return currentCount < plan.maxBarberos;
    }

    /**
     * Check if a plan allows a specific number of servicios
     * @param {string} planName 
     * @param {number} count 
     * @returns {boolean}
     */
    static canAddServicio(planName, currentCount) {
        const plan = this.getPlan(planName);
        return currentCount < plan.maxServicios;
    }

    /**
     * Check if a plan allows more reservations this month
     * @param {string} planName 
     * @param {number} currentCount 
     * @returns {boolean}
     */
    static canAddReserva(planName, currentCount) {
        const plan = this.getPlan(planName);
        return currentCount < plan.maxReservasMes;
    }

    /**
     * Compare two plans
     * @param {string} plan1 
     * @param {string} plan2 
     * @returns {number} -1 if plan1 < plan2, 0 if equal, 1 if plan1 > plan2
     */
    static compare(plan1, plan2) {
        const p1 = normalizePlan(plan1);
        const p2 = normalizePlan(plan2);

        const order = { 'FREE': 0, 'basico': 1, 'pro': 2, 'premium': 3 };

        if (!(p1 in order) || !(p2 in order)) {
            throw new Error(`Cannot compare plans: ${plan1}, ${plan2}`);
        }

        return order[p1] - order[p2];
    }

    /**
     * Check if upgrade is allowed
     * @param {string} currentPlan 
     * @param {string} newPlan 
     * @returns {boolean}
     */
    static canUpgrade(currentPlan, newPlan) {
        return this.compare(newPlan, currentPlan) > 0;
    }

    /**
     * Check if downgrade is allowed
     * @param {string} currentPlan 
     * @param {string} newPlan 
     * @returns {boolean}
     */
    static canDowngrade(currentPlan, newPlan) {
        return this.compare(newPlan, currentPlan) < 0;
    }

    /**
     * Get usage percentage
     * @param {string} planName 
     * @param {number} current 
     * @param {string} resource - 'barberos', 'reservas', or 'servicios'
     * @returns {number} Percentage (0-100)
     */
    static getUsagePercentage(planName, current, resource) {
        const plan = this.getPlan(planName);
        let max = 0;

        // Map resource names correctly to PlanLimits.limites keys
        const resourceMap = {
            'barberos': 'maxBarberos',
            'reservas': 'maxReservasMes',
            'servicios': 'maxServicios',
            'fotos': 'maxFotos'
        };

        const limitKey = resourceMap[resource];
        if (!limitKey) {
            throw new Error(`Recurso inválido: ${resource}`);
        }

        max = plan.limites[limitKey];

        if (max === -1 || max === Infinity) return 0;
        if (max === 0) return 100;
        return Math.min(100, Math.round((current / max) * 100));
    }

    /**
     * Check if usage is near limit (>80%)
     * @param {string} planName 
     * @param {number} current 
     * @param {string} resource 
     * @returns {boolean}
     */
    static isNearLimit(planName, current, resource) {
        return this.getUsagePercentage(planName, current, resource) >= 80;
    }
}

module.exports = Plan;
