const nodemailer = require("nodemailer");
const PushSubscription = require("../infrastructure/database/mongodb/models/PushSubscription");
const NotificationLog = require("../infrastructure/database/mongodb/models/NotificationLog");
const { sendPushNotification, createReminderPayload, createConfirmationPayload } = require("./push.service");

/**
 * Crear transporter de nodemailer basado en configuración de barbería
 * @param {Object} barberia - Datos de la barbería
 * @returns {Object} Transporter de nodemailer
 */
const createTransporter = (barberia) => {
    const emailConfig = barberia.configuracion;

    if (!emailConfig?.emailNotificaciones) {
        throw new Error("La barbería no tiene configurado un email para notificaciones");
    }

    // Si tiene configuración SMTP personalizada
    if (emailConfig.emailProvider === 'smtp' && emailConfig.smtpConfig) {
        return nodemailer.createTransporter({
            host: emailConfig.smtpConfig.host,
            port: emailConfig.smtpConfig.port,
            secure: emailConfig.smtpConfig.secure,
            auth: {
                user: emailConfig.emailNotificaciones,
                pass: emailConfig.emailPassword?.encrypted, // Deberías descifrar esto
            },
        });
    }

    // Gmail o Outlook
    return nodemailer.createTransporter({
        service: emailConfig.emailProvider === 'gmail' ? 'gmail' : 'outlook',
        auth: {
            user: emailConfig.emailNotificaciones,
            pass: emailConfig.emailPassword?.encrypted, // Deberías descifrar esto
        },
    });
};

/**
 * Enviar email de recordatorio de reserva
 * @param {Object} reserva - Datos de la reserva (populated)
 * @param {Object} barberia - Datos de la barbería
 * @returns {Promise<Object>} Resultado del envío
 */
const sendReminderEmail = async (reserva, barberia) => {
    try {
        const transporter = createTransporter(barberia);

        const mailOptions = {
            from: `"${barberia.configuracion?.nombreParaEmails || barberia.nombre}" <${barberia.configuracion.emailNotificaciones}>`,
            to: reserva.emailCliente,
            subject: `Recordatorio: Tu cita en ${barberia.nombre}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${barberia.configuracion?.colorPrincipal || '#1e40af'};">
            ${barberia.nombre}
          </h2>
          <p>Hola <strong>${reserva.nombreCliente}</strong>,</p>
          <p>Te recordamos que tienes una cita programada:</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>📅 Fecha:</strong> ${new Date(reserva.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>🕐 Hora:</strong> ${reserva.hora}</p>
            ${reserva.barberoId ? `<p><strong>💈 Barbero:</strong> ${reserva.barberoId.nombre}</p>` : ''}
            ${reserva.servicioId ? `<p><strong>✂️ Servicio:</strong> ${reserva.servicioId.nombre}</p>` : ''}
          </div>
          <p>Si necesitas cancelar o reagendar, puedes hacerlo desde tu cuenta.</p>
          <p>¡Te esperamos!</p>
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">
            ${barberia.nombre}<br>
            ${barberia.direccion || ''}<br>
            ${barberia.telefono || ''}
          </p>
        </div>
      `,
        };

        const result = await transporter.sendMail(mailOptions);

        // Registrar en log
        await NotificationLog.create({
            barberia: barberia._id,
            tipo: "email",
            destinatario: {
                user: reserva.clienteId,
                email: reserva.emailCliente,
            },
            asunto: mailOptions.subject,
            contenido: "Email de recordatorio de reserva",
            estado: "enviado",
            reserva: reserva._id,
        });

        return { success: true, result };
    } catch (error) {
        console.error("Error sending reminder email:", error);

        // Registrar error en log
        await NotificationLog.create({
            barberia: barberia._id,
            tipo: "email",
            destinatario: {
                user: reserva.clienteId,
                email: reserva.emailCliente,
            },
            asunto: `Recordatorio: Tu cita en ${barberia.nombre}`,
            contenido: "Email de recordatorio de reserva",
            estado: "fallido",
            errorMensaje: error.message,
            reserva: reserva._id,
        });

        return { success: false, error: error.message };
    }
};

/**
 * Enviar email de confirmación de reserva
 * @param {Object} reserva - Datos de la reserva (populated)
 * @param {Object} barberia - Datos de la barbería
 * @returns {Promise<Object>} Resultado del envío
 */
const sendConfirmationEmail = async (reserva, barberia) => {
    try {
        const transporter = createTransporter(barberia);

        const mailOptions = {
            from: `"${barberia.configuracion?.nombreParaEmails || barberia.nombre}" <${barberia.configuracion.emailNotificaciones}>`,
            to: reserva.emailCliente,
            subject: `¡Reserva confirmada! - ${barberia.nombre}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${barberia.configuracion?.colorPrincipal || '#1e40af'};">
            ✅ ¡Reserva Confirmada!
          </h2>
          <p>Hola <strong>${reserva.nombreCliente}</strong>,</p>
          <p>Tu reserva ha sido confirmada exitosamente:</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>📅 Fecha:</strong> ${new Date(reserva.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>🕐 Hora:</strong> ${reserva.hora}</p>
            ${reserva.barberoId ? `<p><strong>💈 Barbero:</strong> ${reserva.barberoId.nombre}</p>` : ''}
            ${reserva.servicioId ? `<p><strong>✂️ Servicio:</strong> ${reserva.servicioId.nombre} - $${reserva.servicioId.precio}</p>` : ''}
          </div>
          <p>Te enviaremos un recordatorio antes de tu cita.</p>
          <p>¡Gracias por preferir ${barberia.nombre}!</p>
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">
            ${barberia.nombre}<br>
            ${barberia.direccion || ''}<br>
            ${barberia.telefono || ''}
          </p>
        </div>
      `,
        };

        const result = await transporter.sendMail(mailOptions);

        // Registrar en log
        await NotificationLog.create({
            barberia: barberia._id,
            tipo: "email",
            destinatario: {
                user: reserva.clienteId,
                email: reserva.emailCliente,
            },
            asunto: mailOptions.subject,
            contenido: "Email de confirmación de reserva",
            estado: "enviado",
            reserva: reserva._id,
        });

        return { success: true, result };
    } catch (error) {
        console.error("Error sending confirmation email:", error);

        await NotificationLog.create({
            barberia: barberia._id,
            tipo: "email",
            destinatario: {
                user: reserva.clienteId,
                email: reserva.emailCliente,
            },
            asunto: `¡Reserva confirmada! - ${barberia.nombre}`,
            contenido: "Email de confirmación de reserva",
            estado: "fallido",
            errorMensaje: error.message,
            reserva: reserva._id,
        });

        return { success: false, error: error.message };
    }
};

/**
 * Enviar notificación completa (Push + Email)
 * @param {String} type - Tipo: 'confirmation' o 'reminder'
 * @param {Object} reserva - Datos de la reserva
 * @param {Object} barberia - Datos de la barbería
 * @returns {Promise<Object>} Resultados del envío
 */
const sendNotification = async (type, reserva, barberia) => {
    const results = {
        email: { sent: false },
        push: { sent: false },
    };

    const config = barberia.configuracion?.notificaciones || {};

    // Enviar Email
    if (config.emailEnabled) {
        if (type === "confirmation" && config.confirmacionReserva) {
            results.email = await sendConfirmationEmail(reserva, barberia);
        } else if (type === "reminder" && config.recordatorioReserva) {
            results.email = await sendReminderEmail(reserva, barberia);
        }
    }

    // Enviar Push
    if (config.pushEnabled && reserva.clienteId) {
        const subscriptions = await PushSubscription.find({
            user: reserva.clienteId,
            barberia: barberia._id,
            activo: true,
        });

        if (subscriptions.length > 0) {
            const payload = type === "confirmation"
                ? createConfirmationPayload(reserva, barberia)
                : createReminderPayload(reserva, barberia);

            for (const sub of subscriptions) {
                const pushResult = await sendPushNotification(sub, payload);

                // Registrar en log
                await NotificationLog.create({
                    barberia: barberia._id,
                    tipo: "push",
                    destinatario: {
                        user: reserva.clienteId,
                    },
                    asunto: payload.title,
                    contenido: payload.body,
                    estado: pushResult.success ? "enviado" : "fallido",
                    errorMensaje: pushResult.error,
                    reserva: reserva._id,
                });

                // Si la suscripción expiró, desactivarla
                if (pushResult.expired) {
                    sub.activo = false;
                    await sub.save();
                } else if (pushResult.success) {
                    results.push.sent = true;
                }
            }
        }
    }

    return results;
};

module.exports = {
    sendReminderEmail,
    sendConfirmationEmail,
    sendNotification,
};
