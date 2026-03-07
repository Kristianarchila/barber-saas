/**
 * Reminder Scheduler
 * 
 * Runs a daily cron job at 9:00 AM (server local time) to send
 * 24-hour reminder emails to clients with upcoming appointments.
 * 
 * Requires:
 *   EMAIL_USER + EMAIL_PASS in .env for nodemailer
 *   FRONTEND_URL in .env for cancel/reschedule links
 */

const cron = require('node-cron');
const MongoReservaRepository = require('../database/mongodb/repositories/MongoReservaRepository');
const MongoBarberiaRepository = require('../database/mongodb/repositories/MongoBarberiaRepository');
const MongoBarberoRepository = require('../database/mongodb/repositories/MongoBarberoRepository');
const MongoServicioRepository = require('../database/mongodb/repositories/MongoServicioRepository');
const EmailAdapter = require('../external-services/email/EmailAdapter');
const SendReminderEmails = require('../../application/use-cases/notifications/SendReminderEmails');

let isScheduled = false;

function startReminderScheduler() {
    if (isScheduled) return;
    isScheduled = true;

    // Run every day at 9:00 AM server time
    cron.schedule('0 9 * * *', async () => {
        console.log('⏰ [Cron] Running daily reminder job...');

        try {
            const reservaRepo = new MongoReservaRepository();
            const barberiaRepo = new MongoBarberiaRepository();
            const barberoRepo = new MongoBarberoRepository();
            const servicioRepo = new MongoServicioRepository();
            const emailAdapter = new EmailAdapter();

            const sendReminders = new SendReminderEmails(
                reservaRepo,
                barberiaRepo,
                barberoRepo,
                servicioRepo,
                emailAdapter
            );

            const result = await sendReminders.execute({ hoursAhead: 24 });
            console.log(`✅ [Cron] Reminders done — sent: ${result.sent}, failed: ${result.failed}`);
        } catch (err) {
            console.error('❌ [Cron] Reminder job failed:', err.message);
        }
    });

    console.log('🕘 [Scheduler] Daily reminder job registered (runs at 9:00 AM)');
}

module.exports = { startReminderScheduler };
