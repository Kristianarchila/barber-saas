const dayjs = require('dayjs');
require('dayjs/locale/es');

/**
 * Send Reminder Emails Use Case
 * Sends reminder emails for upcoming appointments
 */
class SendReminderEmails {
    constructor(reservaRepository, barberiaRepository, barberoRepository, servicioRepository, emailAdapter) {
        this.reservaRepository = reservaRepository;
        this.barberiaRepository = barberiaRepository;
        this.barberoRepository = barberoRepository;
        this.servicioRepository = servicioRepository;
        this.emailAdapter = emailAdapter;
    }

    /**
     * Execute the use case
     * @param {Object} options - { hoursAhead: number }
     * @returns {Promise<{ sent: number, failed: number }>}
     */
    async execute(options = {}) {
        const { hoursAhead = 24 } = options;

        try {
            // Calculate the target date/time for reminders
            const targetDate = dayjs().add(hoursAhead, 'hours');
            const targetDateStr = targetDate.format('YYYY-MM-DD');

            console.log(`📧 Buscando reservas para enviar recordatorios (${hoursAhead}h antes)...`);
            console.log(`📅 Fecha objetivo: ${targetDateStr}`);

            // Get all upcoming reservations for the target date
            const reservas = await this.reservaRepository.findByDateRange(
                targetDateStr,
                targetDateStr,
                { estado: 'RESERVADA' }
            );

            if (!reservas || reservas.length === 0) {
                console.log('✅ No hay reservas para enviar recordatorios');
                return { sent: 0, failed: 0 };
            }

            console.log(`📋 Encontradas ${reservas.length} reservas para procesar`);

            let sent = 0;
            let failed = 0;

            // Process each reservation
            for (const reserva of reservas) {
                try {
                    // Check if reminder was already sent (to avoid duplicates)
                    if (reserva.reminderSent) {
                        console.log(`⏭️ Recordatorio ya enviado para reserva ${reserva.id}`);
                        continue;
                    }

                    // Get barberia configuration
                    const barberia = await this.barberiaRepository.findById(reserva.barberiaId);
                    if (!barberia) {
                        console.error(`❌ Barbería no encontrada: ${reserva.barberiaId}`);
                        failed++;
                        continue;
                    }

                    // Check if email notifications are enabled
                    if (!barberia.configuracion?.emailNotificaciones) {
                        console.log(`⏭️ Emails deshabilitados para barbería ${barberia.nombre}`);
                        continue;
                    }

                    // Get barbero details
                    const barbero = await this.barberoRepository.findById(reserva.barberoId);
                    const barberoNombre = barbero ? barbero.nombre : 'Tu barbero';

                    // Get servicio details
                    const servicio = await this.servicioRepository.findById(reserva.servicioId, reserva.barberiaId);
                    const servicioNombre = servicio ? servicio.nombre : 'Servicio';

                    // Prepare email data
                    const fechaFormateada = dayjs(reserva.fecha).locale('es').format('dddd D [de] MMMM');

                    const emailData = {
                        nombreCliente: reserva.nombreCliente,
                        emailCliente: reserva.emailCliente,
                        fecha: fechaFormateada,
                        hora: reserva.hora,
                        servicio: servicioNombre,
                        barbero: barberoNombre,
                        cancelUrl: `${process.env.FRONTEND_URL}/cancelar/${reserva.cancelToken}`,
                        reagendarUrl: `${process.env.FRONTEND_URL}/reagendar/${reserva.cancelToken}`
                    };

                    const barberiaConfig = {
                        nombreParaEmails: barberia.configuracion?.nombreParaEmails || barberia.nombre,
                        logoUrl: barberia.configuracion?.logoUrl,
                        colorPrincipal: barberia.configuracion?.colorPrincipal || '#1e40af',
                        emailNotificaciones: barberia.configuracion?.emailNotificaciones,
                        emailPassword: barberia.configuracion?.emailPassword,
                        emailProvider: barberia.configuracion?.emailProvider
                    };

                    // Send reminder email
                    await this.emailAdapter.sendReminderEmail(emailData, barberiaConfig);

                    // Mark reminder as sent
                    await this.reservaRepository.update(
                        reserva.id,
                        { reminderSent: true, reminderSentAt: new Date() },
                        reserva.barberiaId
                    );

                    sent++;
                    console.log(`✅ Recordatorio enviado a ${reserva.emailCliente} para reserva ${reserva.id}`);

                } catch (error) {
                    failed++;
                    console.error(`❌ Error enviando recordatorio para reserva ${reserva.id}:`, error.message);
                }
            }

            console.log(`📊 Resumen: ${sent} enviados, ${failed} fallidos`);
            return { sent, failed };

        } catch (error) {
            console.error('❌ Error en SendReminderEmails:', error);
            throw error;
        }
    }
}

module.exports = SendReminderEmails;
