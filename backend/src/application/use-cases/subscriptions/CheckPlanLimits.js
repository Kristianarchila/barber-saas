/**
 * Check Plan Limits Use Case
 * 
 * Validates if a barberia can perform an action based on their plan limits.
 */

const Plan = require('../../../domain/value-objects/Plan');
const PlanLimitExceededError = require('../../../shared/errors/PlanLimitExceededError');

class CheckPlanLimits {
    constructor(subscriptionRepository, barberiaRepository, barberoRepository, servicioRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.barberiaRepository = barberiaRepository;
        this.barberoRepository = barberoRepository;
        this.servicioRepository = servicioRepository;
    }

    /**
     * Check if barberia can add a barbero
     * @param {string} barberiaId 
     * @returns {Promise<boolean>}
     * @throws {PlanLimitExceededError}
     */
    async canAddBarbero(barberiaId) {
        const subscription = await this.subscriptionRepository.findByBarberiaId(barberiaId);

        // TEMP FIX: If no subscription exists, assume PRO plan (unlimited)
        // This handles legacy barberias that don't have subscriptions yet
        if (!subscription) {
            console.warn(`⚠️  No subscription found for barberia ${barberiaId}, assuming PRO plan`);
            return true; // Allow the operation
        }

        const plan = Plan.getPlan(subscription.plan);
        const currentCount = await this.barberoRepository.countByBarberiaId(barberiaId);

        // Check limit (handle -1 as unlimited)
        if (plan.maxBarberos !== -1 && currentCount >= plan.maxBarberos) {
            throw new PlanLimitExceededError(
                `Límite de barberos alcanzado para el plan ${subscription.plan}`,
                'barberos',
                currentCount,
                plan.maxBarberos
            );
        }

        return true;
    }

    /**
     * Check if barberia can add a servicio
     * @param {string} barberiaId 
     * @returns {Promise<boolean>}
     * @throws {PlanLimitExceededError}
     */
    async canAddServicio(barberiaId) {
        const subscription = await this.subscriptionRepository.findByBarberiaId(barberiaId);

        // TEMP FIX: If no subscription exists, assume PRO plan (unlimited)
        if (!subscription) {
            console.warn(`⚠️  No subscription found for barberia ${barberiaId}, assuming PRO plan`);
            return true;
        }

        const plan = Plan.getPlan(subscription.plan);
        const currentCount = await this.servicioRepository.countByBarberiaId(barberiaId);

        // Check limit (handle -1 as unlimited)
        if (plan.maxServicios !== -1 && currentCount >= plan.maxServicios) {
            throw new PlanLimitExceededError(
                `Límite de servicios alcanzado para el plan ${subscription.plan}`,
                'servicios',
                currentCount,
                plan.maxServicios
            );
        }

        return true;
    }

    /**
     * Check if barberia can add a reserva this month
     * @param {string} barberiaId 
     * @returns {Promise<boolean>}
     * @throws {PlanLimitExceededError}
     */
    async canAddReserva(barberiaId) {
        const subscription = await this.subscriptionRepository.findByBarberiaId(barberiaId);

        // TEMP FIX: If no subscription exists, assume PRO plan (unlimited)
        if (!subscription) {
            console.warn(`⚠️  No subscription found for barberia ${barberiaId}, assuming PRO plan`);
            return true;
        }

        const plan = Plan.getPlan(subscription.plan);
        const barberia = await this.barberiaRepository.findById(barberiaId);

        // Check if we need to reset monthly counter
        const now = new Date();
        const lastReset = barberia.usage?.lastResetDate || new Date(0);
        const shouldReset = now.getMonth() !== lastReset.getMonth() ||
            now.getFullYear() !== lastReset.getFullYear();

        let currentCount = barberia.usage?.reservasThisMonth || 0;
        if (shouldReset) {
            currentCount = 0;
        }

        if (plan.maxReservasMes !== -1 && currentCount >= plan.maxReservasMes) {
            throw new PlanLimitExceededError(
                `Límite de reservas mensuales alcanzado para el plan ${subscription.plan}`,
                'reservas',
                currentCount,
                plan.maxReservasMes
            );
        }

        return true;
    }

    /**
     * Get usage statistics for a barberia
     * @param {string} barberiaId 
     * @returns {Promise<Object>}
     */
    async getUsageStats(barberiaId) {
        const subscription = await this.subscriptionRepository.findByBarberiaId(barberiaId);
        if (!subscription) {
            throw new Error('Subscription not found');
        }

        const plan = Plan.getPlan(subscription.plan);
        const barberia = await this.barberiaRepository.findById(barberiaId);

        const barberosCount = await this.barberoRepository.countByBarberiaId(barberiaId);
        const serviciosCount = await this.servicioRepository.countByBarberiaId(barberiaId);

        // Check if we need to reset monthly counter
        const now = new Date();
        const lastReset = barberia.usage?.lastResetDate || new Date(0);
        const shouldReset = now.getMonth() !== lastReset.getMonth() ||
            now.getFullYear() !== lastReset.getFullYear();

        const reservasCount = shouldReset ? 0 : (barberia.usage?.reservasThisMonth || 0);

        return {
            plan: subscription.plan,
            usage: {
                barberos: {
                    current: barberosCount,
                    max: plan.maxBarberos,
                    percentage: Plan.getUsagePercentage(subscription.plan, barberosCount, 'barberos')
                },
                servicios: {
                    current: serviciosCount,
                    max: plan.maxServicios,
                    percentage: Plan.getUsagePercentage(subscription.plan, serviciosCount, 'servicios')
                },
                reservas: {
                    current: reservasCount,
                    max: plan.maxReservasMes,
                    percentage: Plan.getUsagePercentage(subscription.plan, reservasCount, 'reservas')
                }
            }
        };
    }
}

module.exports = CheckPlanLimits;
