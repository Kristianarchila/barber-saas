const cron = require('node-cron');
const SendReminderEmails = require('../../application/use-cases/notifications/SendReminderEmails');
const MongoReservaRepository = require('../database/mongodb/repositories/MongoReservaRepository');
const MongoBarberiaRepository = require('../database/mongodb/repositories/MongoBarberiaRepository');
const MongoBarberoRepository = require('../database/mongodb/repositories/MongoBarberoRepository');
const MongoServicioRepository = require('../database/mongodb/repositories/MongoServicioRepository');
const EmailAdapter = require('../external-services/email/EmailAdapter');

/**
 * Reminder Scheduler
 * Ejecuta el envío de recordatorios automáticos cada hora
 */

let schedulerInitialized = false;

function initializeReminderScheduler() {
    if (schedulerInitialized) {
        console.log('⚠️ Scheduler de recordatorios ya está inicializado');
        return;
    }

    // Crear instancias de repositorios y servicios
    const reservaRepository = new MongoReservaRepository();
    const barberiaRepository = new MongoBarberiaRepository();
    const barberoRepository = new MongoBarberoRepository();
    const servicioRepository = new MongoServicioRepository();
    const emailAdapter = new EmailAdapter();

    // Crear use case
    const sendReminderEmails = new SendReminderEmails(
        reservaRepository,
        barberiaRepository,
        barberoRepository,
        servicioRepository,
        emailAdapter
    );

    // Ejecutar cada hora (minuto 0 de cada hora)
    // Formato: '0 * * * *' = minuto 0, cada hora, todos los días
    cron.schedule('0 * * * *', async () => {
        const now = new Date();
        console.log(`\n🕐 [${now.toLocaleString('es-ES')}] Ejecutando job de recordatorios automáticos...`);

        try {
            const result = await sendReminderEmails.execute({ hoursAhead: 24 });
            console.log(`✅ Job completado: ${result.sent} enviados, ${result.failed} fallidos\n`);
        } catch (error) {
            console.error('❌ Error en job de recordatorios:', error.message);
        }
    });

    schedulerInitialized = true;
    console.log('✅ Scheduler de recordatorios inicializado correctamente');
    console.log('📅 Los recordatorios se enviarán cada hora (minuto 0)');
}

// Función para ejecutar manualmente (útil para testing)
async function runReminderJobManually(hoursAhead = 24) {
    console.log(`\n🔧 Ejecutando job de recordatorios manualmente (${hoursAhead}h antes)...`);

    const reservaRepository = new MongoReservaRepository();
    const barberiaRepository = new MongoBarberiaRepository();
    const barberoRepository = new MongoBarberoRepository();
    const servicioRepository = new MongoServicioRepository();
    const emailAdapter = new EmailAdapter();

    const sendReminderEmails = new SendReminderEmails(
        reservaRepository,
        barberiaRepository,
        barberoRepository,
        servicioRepository,
        emailAdapter
    );

    try {
        const result = await sendReminderEmails.execute({ hoursAhead });
        console.log(`✅ Job manual completado: ${result.sent} enviados, ${result.failed} fallidos\n`);
        return result;
    } catch (error) {
        console.error('❌ Error en job manual de recordatorios:', error.message);
        throw error;
    }
}

module.exports = {
    initializeReminderScheduler,
    runReminderJobManually
};
