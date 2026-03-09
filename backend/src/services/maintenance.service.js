const cron = require('node-cron');
const Barberia = require('../infrastructure/database/mongodb/models/Barberia');
const Subscription = require('../infrastructure/database/mongodb/models/Subscription');

/**
 * Trial Monitor Service
 * Runs daily tasks to check for trial and subscription expirations
 */
class TrialMonitor {
    constructor() {
        this.init();
    }

    init() {
        // Run every day at 00:00
        cron.schedule('0 0 * * *', () => {
            console.log('⏰ Running daily trial expiration check...');
            this.checkExpiredTrials();
        });

        // Run every hour to check for expired paid subscriptions
        cron.schedule('0 * * * *', () => {
            console.log('⏰ Running hourly subscription status check...');
            this.checkSubscriptionStatus();
        });

        // Run once on startup (after 5s delay so DB is connected)
        setTimeout(() => {
            console.log('🚀 Running startup subscription expiration check...');
            this.checkExpiredTrials();
            this.checkSubscriptionStatus();
        }, 5000);
    }

    /**
     * Check for trials that have expired and suspend them if they haven't upgraded
     */
    async checkExpiredTrials() {
        try {
            const now = new Date();

            // Find active trials that have expired
            const expiredTrials = await Barberia.find({
                plan: 'trial',
                estado: 'trial',
                fechaFinTrial: { $lt: now },
                activa: true
            });

            console.log(`🔍 Found ${expiredTrials.length} expired trials`);

            for (const barberia of expiredTrials) {
                // Suspend the barbershop
                barberia.estado = 'suspendida';
                barberia.activa = false;
                barberia.historial.push({
                    accion: 'EXPIRACION_TRIAL',
                    notas: 'El período de prueba ha finalizado sin una suscripción activa.'
                });

                await barberia.save();
                console.log(`❌ Suspended expired trial: ${barberia.nombre}`);

                // TODO: Send trial expired notification email
            }
        } catch (error) {
            console.error('Error in checkExpiredTrials:', error);
        }
    }

    /**
     * Check ACTIVE subscriptions whose currentPeriodEnd has passed
     * and mark them as PAST_DUE automatically.
     */
    async checkSubscriptionStatus() {
        try {
            const now = new Date();

            // Find ACTIVE subscriptions whose period has ended
            const expired = await Subscription.find({
                status: 'ACTIVE',
                currentPeriodEnd: { $lt: now }
            });

            console.log(`🔍 Found ${expired.length} expired ACTIVE subscriptions`);

            for (const sub of expired) {
                sub.status = 'PAST_DUE';
                await sub.save();
                console.log(`⚠️  Marked subscription as PAST_DUE: barberiaId=${sub.barberiaId} | expired=${sub.currentPeriodEnd}`);
            }
        } catch (error) {
            console.error('Error in checkSubscriptionStatus:', error);
        }
    }
}

module.exports = new TrialMonitor();

