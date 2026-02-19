const cron = require("node-cron");
const Reserva = require("../infrastructure/database/mongodb/models/Reserva");
const Barberia = require("../infrastructure/database/mongodb/models/Barberia");
const { sendNotification } = require("../services/notification.service");

/**
 * Enviar recordatorios de reservas próximas
 * Se ejecuta cada hora para verificar reservas que necesitan recordatorio
 */
const sendUpcomingReservationReminders = async () => {
    try {
        console.log("[CRON] Verificando reservas para enviar recordatorios...");

        // Obtener todas las barberías activas
        const barberias = await Barberia.find({ activa: true });

        for (const barberia of barberias) {
            const config = barberia.configuracion?.notificaciones || {};

            // Si los recordatorios no están habilitados, skip
            if (!config.recordatorioReserva) {
                continue;
            }

            const hoursBefore = config.reminderHoursBefore || 24;

            // Calcular el rango de tiempo
            const now = new Date();
            const reminderTime = new Date(now.getTime() + hoursBefore * 60 * 60 * 1000);
            const endTime = new Date(reminderTime.getTime() + 60 * 60 * 1000); // +1 hora de margen

            // Buscar reservas en el rango de tiempo
            const reservas = await Reserva.find({
                barberiaId: barberia._id,
                fecha: {
                    $gte: reminderTime,
                    $lt: endTime,
                },
                estado: { $nin: ["CANCELADA"] },
                notificacionEnviada: { $ne: true }, // No enviar si ya se envió
            })
                .populate("clienteId", "nombre email")
                .populate("barberoId", "nombre")
                .populate("servicioId", "nombre precio");

            console.log(
                `[CRON] Encontradas ${reservas.length} reservas para recordatorio en ${barberia.nombre}`
            );

            // Enviar notificaciones
            for (const reserva of reservas) {
                try {
                    await sendNotification("reminder", reserva, barberia);

                    // Marcar como notificada
                    reserva.notificacionEnviada = true;
                    await reserva.save();

                    console.log(`[CRON] Recordatorio enviado para reserva ${reserva._id}`);
                } catch (error) {
                    console.error(
                        `[CRON] Error enviando recordatorio para reserva ${reserva._id}:`,
                        error
                    );
                }
            }
        }

        console.log("[CRON] Proceso de recordatorios completado");
    } catch (error) {
        console.error("[CRON] Error en proceso de recordatorios:", error);
    }
};

/**
 * Inicializar cron jobs
 */
const initCronJobs = () => {
    // Ejecutar cada hora
    cron.schedule("0 * * * *", sendUpcomingReservationReminders);

    console.log("✅ Cron jobs de notificaciones iniciados");
    console.log("  - Recordatorios de reservas: cada hora");
};

module.exports = {
    initCronJobs,
    sendUpcomingReservationReminders,
};
