const eventBus = require("../events");
const emailService = require("../notifications/email/email.service");

/**
 * Event listener: Enviar email de solicitud de reseña cuando se completa una reserva
 */
eventBus.on("reserva:completada", async (data) => {
    try {
        const { reserva, reviewUrl, barberia } = data;

        await emailService.enviarSolicitudResena({
            email: reserva.emailCliente,
            nombre: reserva.nombreCliente,
            barberia: {
                nombre: barberia.nombre,
                slug: barberia.slug
            },
            servicio: reserva.servicioId?.nombre || "Servicio",
            barbero: reserva.barberoId?.nombre || "Barbero",
            fecha: reserva.fecha,
            reviewUrl,
            barberiaId: barberia._id
        });

        console.log(`📧 Email de solicitud de reseña enviado a ${reserva.emailCliente}`);
    } catch (error) {
        console.error("❌ Error enviando email de solicitud de reseña:", error.message);
    }
});

/**
 * Event listener: Notificar al admin cuando se crea una nueva reseña
 */
eventBus.on("resena:creada", async (data) => {
    try {
        const { resena, barberia } = data;

        // Buscar admin de la barbería
        const User = require("../models/User");
        const admin = await User.findOne({
            barberiaId: barberia._id,
            rol: "BARBERIA_ADMIN"
        });

        if (!admin) {
            console.warn("⚠️ No se encontró admin para notificar nueva reseña");
            return;
        }

        await emailService.notificarNuevaResena({
            admin: {
                email: admin.email,
                nombre: admin.nombre
            },
            resena: {
                nombreCliente: resena.nombreCliente,
                calificacion: resena.calificacionGeneral,
                comentario: resena.comentario
            },
            barberia: {
                nombre: barberia.nombre,
                slug: barberia.slug
            },
            barberiaId: barberia._id
        });

        console.log(`📧 Notificación de nueva reseña enviada al admin ${admin.email}`);
    } catch (error) {
        console.error("❌ Error notificando nueva reseña al admin:", error.message);
    }
});

module.exports = eventBus;
