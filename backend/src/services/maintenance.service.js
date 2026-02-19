const cron = require('node-cron');
const Barberia = require('../infrastructure/database/mongodb/models/Barberia');

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

        // Run every hour to check for pending payments
        cron.schedule('0 * * * *', () => {
            console.log('⏰ Running hourly subscription status check...');
            this.checkSubscriptionStatus();
        });
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
     * Check for subscriptions and send reminders
     */
    async checkSubscriptionStatus() {
        // Implementation for sending reminders before expiration or payment
        // (Similar logic to checkExpiredTrials but for upcoming payments)
    }
}

module.exports = new TrialMonitor();
