const cron = require('node-cron');
const container = require('../shared/Container');

let cronJob = null;

/**
 * Send Reminder Emails Cron Job
 * Runs every hour to send reminder emails for upcoming appointments
 */
async function sendReminders() {
    console.log('🔔 [CRON] Ejecutando job de recordatorios de citas...');

    try {
        const sendReminderEmails = container.get('sendReminderEmails');

        if (!sendReminderEmails) {
            console.error('❌ [CRON] SendReminderEmails use case no encontrado en el contenedor');
            return;
        }

        // Send reminders for appointments 24 hours ahead
        const result = await sendReminderEmails.execute({ hoursAhead: 24 });

        console.log(`✅ [CRON] Job completado: ${result.sent} enviados, ${result.failed} fallidos`);
    } catch (error) {
        console.error('❌ [CRON] Error en job de recordatorios:', error);
    }
}

/**
 * Start the cron job
 * Runs every hour at minute 0
 */
function startSendRemindersJob() {
    if (cronJob) {
        console.log('⚠️ [CRON] Job de recordatorios ya está ejecutándose');
        return;
    }

    // Run every hour at minute 0
    // Format: '0 * * * *' = At minute 0 of every hour
    cronJob = cron.schedule('0 * * * *', sendReminders, {
        scheduled: true,
        timezone: process.env.TZ || 'America/Santiago'
    });

    console.log('✅ [CRON] Job de recordatorios iniciado (cada hora en minuto 0)');
}

/**
 * Stop the cron job
 */
function stopSendRemindersJob() {
    if (cronJob) {
        cronJob.stop();
        cronJob = null;
        console.log('🛑 [CRON] Job de recordatorios detenido');
    }
}

/**
 * Run the job immediately (for testing)
 */
async function runNow() {
    console.log('🚀 [CRON] Ejecutando job de recordatorios manualmente...');
    await sendReminders();
}

module.exports = {
    startSendRemindersJob,
    stopSendRemindersJob,
    runNow
};
