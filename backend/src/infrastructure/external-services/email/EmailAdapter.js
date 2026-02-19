const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs").promises;
const dayjs = require("dayjs");
require("dayjs/locale/es");

/**
 * EmailAdapter - Hexagonal Architecture
 * 
 * Adapter para abstraer el envío de emails del resto de la aplicación.
 * Permite cambiar el proveedor de email sin afectar la lógica de negocio.
 */
class EmailAdapter {
    constructor() {
        this.defaultConfig = {
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        };
    }

    /**
     * Crea un transportador configurado
     * @param {Object} barberiaConfig - Configuración de email de la barbería
     * @returns {Promise<Object>} - Transportador de nodemailer
     */
    async getTransporter(barberiaConfig = null) {
        let config = { ...this.defaultConfig };

        if (barberiaConfig?.emailNotificaciones && barberiaConfig?.emailPassword) {
            try {
                let decryptedPassword;

                // Desencriptar contraseña si está encriptada
                if (typeof barberiaConfig.emailPassword === 'object' && barberiaConfig.emailPassword.encrypted) {
                    const { decrypt } = require('../../../utils/encryption');
                    decryptedPassword = decrypt(
                        barberiaConfig.emailPassword.encrypted,
                        barberiaConfig.emailPassword.iv,
                        barberiaConfig.emailPassword.authTag
                    );
                } else if (typeof barberiaConfig.emailPassword === 'string') {
                    decryptedPassword = barberiaConfig.emailPassword;
                    console.warn('⚠️ Contraseña de email en texto plano. Considera migrar a formato encriptado.');
                } else {
                    throw new Error('Formato de contraseña inválido');
                }

                // Configurar según el proveedor
                if (barberiaConfig.emailProvider === 'smtp' && barberiaConfig.smtpConfig?.host) {
                    config = {
                        host: barberiaConfig.smtpConfig.host,
                        port: barberiaConfig.smtpConfig.port || 587,
                        secure: barberiaConfig.smtpConfig.secure || false,
                        auth: {
                            user: barberiaConfig.emailNotificaciones,
                            pass: decryptedPassword
                        }
                    };
                } else {
                    config = {
                        service: barberiaConfig.emailProvider || 'gmail',
                        auth: {
                            user: barberiaConfig.emailNotificaciones,
                            pass: decryptedPassword
                        }
                    };
                }

                console.log(`📧 Usando transportador personalizado para barbería`);
            } catch (error) {
                console.error("❌ Error configurando transportador de barbería:", error.message);
                // Fallback a config global
            }
        }

        return nodemailer.createTransport(config);
    }

    /**
     * Lee y procesa un template HTML
     * @param {string} templateName - Nombre del template
     * @param {Object} data - Datos para reemplazar en el template
     * @returns {Promise<string>} - HTML procesado
     */
    async getTemplate(templateName, data) {
        const filePath = path.join(__dirname, "../../../notifications/email/templates", `${templateName}.html`);
        let content = await fs.readFile(filePath, "utf8");

        // Reemplazar variables {{variable}}
        Object.keys(data).forEach((key) => {
            const regex = new RegExp(`{{${key}}}`, "g");
            content = content.replace(regex, data[key]);
        });

        return content;
    }

    /**
     * Envía email de confirmación de reserva
     * @param {Object} reservaData - Datos de la reserva
     * @param {Object} barberiaConfig - Configuración de la barbería
     * @returns {Promise<void>}
     */
    async sendReservationConfirmation(reservaData, barberiaConfig = null) {
        try {
            const transporter = await this.getTransporter(barberiaConfig);

            const nombreBarberia = barberiaConfig?.nombreParaEmails || "Barber Studio";
            const logoUrl = barberiaConfig?.logoUrl || "https://res.cloudinary.com/tu-cloud/image/upload/v1/logos/logo-default.png";
            const colorHeader = barberiaConfig?.colorPrincipal || "#1e40af";

            const fechaFormateada = dayjs(reservaData.fecha).locale("es").format("dddd D [de] MMMM");

            const html = await this.getTemplate("reservaConfirmada", {
                nombreCliente: reservaData.nombreCliente,
                nombreBarberia,
                fecha: fechaFormateada,
                hora: reservaData.hora,
                servicio: reservaData.servicio,
                cancelUrl: reservaData.cancelUrl,
                reagendarUrl: reservaData.reagendarUrl,
                logoUrl,
                colorHeader,
                year: new Date().getFullYear()
            });

            const mailOptions = {
                from: `"${nombreBarberia}" <${transporter.options.auth.user}>`,
                to: reservaData.emailCliente,
                subject: `✅ Cita Confirmada - ${nombreBarberia}`,
                html
            };

            await transporter.sendMail(mailOptions);
            console.log(`📧 Email de confirmación enviado a ${reservaData.emailCliente}`);
        } catch (error) {
            console.error("❌ Error enviando email de confirmación:", error);
            throw error;
        }
    }

    /**
     * Envía email de recordatorio de reserva
     * @param {Object} reservaData - Datos de la reserva
     * @param {Object} barberiaConfig - Configuración de la barbería
     * @returns {Promise<void>}
     */
    async sendReminderEmail(reservaData, barberiaConfig = null) {
        try {
            const transporter = await this.getTransporter(barberiaConfig);

            const nombreBarberia = barberiaConfig?.nombreParaEmails || "Barber Studio";
            const logoUrl = barberiaConfig?.logoUrl || "https://res.cloudinary.com/tu-cloud/image/upload/v1/logos/logo-default.png";
            const colorHeader = barberiaConfig?.colorPrincipal || "#1e40af";

            const fechaFormateada = dayjs(reservaData.fecha).locale("es").format("dddd D [de] MMMM");

            const html = await this.getTemplate("recordatorio-reserva", {
                nombreCliente: reservaData.nombreCliente,
                nombreBarberia,
                fecha: fechaFormateada,
                hora: reservaData.hora,
                servicio: reservaData.servicio,
                barbero: reservaData.barbero,
                cancelUrl: reservaData.cancelUrl,
                reagendarUrl: reservaData.reagendarUrl,
                logoUrl,
                colorHeader,
                year: new Date().getFullYear()
            });

            const mailOptions = {
                from: `"${nombreBarberia}" <${transporter.options.auth.user}>`,
                to: reservaData.emailCliente,
                subject: `⏰ Recordatorio: Tu cita es mañana - ${nombreBarberia}`,
                html
            };

            await transporter.sendMail(mailOptions);
            console.log(`📧 Email de recordatorio enviado a ${reservaData.emailCliente}`);
        } catch (error) {
            console.error("❌ Error enviando email de recordatorio:", error);
            throw error;
        }
    }

    /**
     * Envía email de cancelación de reserva
     * @param {Object} reservaData - Datos de la reserva
     * @param {Object} barberiaConfig - Configuración de la barbería
     * @returns {Promise<void>}
     */
    async sendCancellationNotification(reservaData, barberiaConfig = null) {
        try {
            const transporter = await this.getTransporter(barberiaConfig);

            const nombreBarberia = barberiaConfig?.nombreParaEmails || "Barber Studio";
            const fechaFormateada = dayjs(reservaData.fecha).locale("es").format("dddd D [de] MMMM");

            const html = `
                <h2>Reserva Cancelada</h2>
                <p>Hola ${reservaData.nombreCliente},</p>
                <p>Tu reserva para el ${fechaFormateada} a las ${reservaData.hora} ha sido cancelada.</p>
                <p>Esperamos verte pronto en ${nombreBarberia}.</p>
            `;

            const mailOptions = {
                from: `"${nombreBarberia}" <${transporter.options.auth.user}>`,
                to: reservaData.emailCliente,
                subject: `❌ Reserva Cancelada - ${nombreBarberia}`,
                html
            };

            await transporter.sendMail(mailOptions);
            console.log(`📧 Email de cancelación enviado a ${reservaData.emailCliente}`);
        } catch (error) {
            console.error("❌ Error enviando email de cancelación:", error);
            throw error;
        }
    }

    /**
     * Envía email de reagendamiento de reserva
     * @param {Object} reservaData - Datos de la reserva
     * @param {Object} barberiaConfig - Configuración de la barbería
     * @returns {Promise<void>}
     */
    async sendRescheduleNotification(reservaData, barberiaConfig = null) {
        try {
            const transporter = await this.getTransporter(barberiaConfig);

            const nombreBarberia = barberiaConfig?.nombreParaEmails || "Barber Studio";
            const fechaFormateada = dayjs(reservaData.nuevaFecha).locale("es").format("dddd D [de] MMMM");

            const html = `
                <h2>Reserva Reagendada</h2>
                <p>Hola ${reservaData.nombreCliente},</p>
                <p>Tu reserva ha sido reagendada para el ${fechaFormateada} a las ${reservaData.nuevaHora}.</p>
                <p>Te esperamos en ${nombreBarberia}.</p>
            `;

            const mailOptions = {
                from: `"${nombreBarberia}" <${transporter.options.auth.user}>`,
                to: reservaData.emailCliente,
                subject: `🔄 Reserva Reagendada - ${nombreBarberia}`,
                html
            };

            await transporter.sendMail(mailOptions);
            console.log(`📧 Email de reagendamiento enviado a ${reservaData.emailCliente}`);
        } catch (error) {
            console.error("❌ Error enviando email de reagendamiento:", error);
            throw error;
        }
    }

    /**
     * Envía email de bienvenida
     * @param {Object} userData - Datos del usuario
     * @param {Object} barberiaConfig - Configuración de la barbería
     * @returns {Promise<void>}
     */
    async sendWelcomeEmail(userData, barberiaConfig = null) {
        try {
            const transporter = await this.getTransporter(barberiaConfig);

            const nombreBarberia = barberiaConfig?.nombreParaEmails || "Barber Studio";

            const html = `
                <h2>¡Bienvenido a ${nombreBarberia}!</h2>
                <p>Hola ${userData.nombre},</p>
                <p>Gracias por registrarte en nuestra plataforma.</p>
                <p>Estamos emocionados de tenerte con nosotros.</p>
            `;

            const mailOptions = {
                from: `"${nombreBarberia}" <${transporter.options.auth.user}>`,
                to: userData.email,
                subject: `👋 Bienvenido a ${nombreBarberia}`,
                html
            };

            await transporter.sendMail(mailOptions);
            console.log(`📧 Email de bienvenida enviado a ${userData.email}`);
        } catch (error) {
            console.error("❌ Error enviando email de bienvenida:", error);
            throw error;
        }
    }

    /**
     * Envía solicitud de reseña
     * @param {Object} reviewData - Datos para la solicitud de reseña
     * @param {Object} barberiaConfig - Configuración de la barbería
     * @returns {Promise<void>}
     */
    async sendReviewRequest(reviewData, barberiaConfig = null) {
        try {
            const transporter = await this.getTransporter(barberiaConfig);

            const nombreBarberia = barberiaConfig?.nombreParaEmails || "Barber Studio";
            const logoUrl = barberiaConfig?.logoUrl || "https://res.cloudinary.com/tu-cloud/image/upload/v1/logos/logo-default.png";
            const colorHeader = barberiaConfig?.colorPrincipal || "#1e40af";

            const fechaFormateada = dayjs(reviewData.fecha).locale("es").format("dddd D [de] MMMM");

            const html = await this.getTemplate("solicitud-resena", {
                nombreCliente: reviewData.nombre,
                nombreBarberia,
                servicio: reviewData.servicio,
                barbero: reviewData.barbero,
                fecha: fechaFormateada,
                reviewUrl: reviewData.reviewUrl,
                logoUrl,
                colorHeader,
                year: new Date().getFullYear()
            });

            const mailOptions = {
                from: `"${nombreBarberia}" <${transporter.options.auth.user}>`,
                to: reviewData.email,
                subject: `⭐ ¿Cómo fue tu experiencia en ${nombreBarberia}?`,
                html
            };

            await transporter.sendMail(mailOptions);
            console.log(`📧 Email de solicitud de reseña enviado a ${reviewData.email}`);
        } catch (error) {
            console.error("❌ Error enviando email de solicitud de reseña:", error);
            throw error;
        }
    }

    /**
     * Notifica al admin sobre nueva reseña
     * @param {Object} adminData - Datos del admin
     * @param {Object} reviewData - Datos de la reseña
     * @param {Object} barberiaConfig - Configuración de la barbería
     * @returns {Promise<void>}
     */
    async notifyAdminNewReview(adminData, reviewData, barberiaConfig = null) {
        try {
            const transporter = await this.getTransporter(barberiaConfig);

            const nombreBarberia = barberiaConfig?.nombreParaEmails || "Barber Studio";
            const logoUrl = barberiaConfig?.logoUrl || "https://res.cloudinary.com/tu-cloud/image/upload/v1/logos/logo-default.png";
            const colorHeader = barberiaConfig?.colorPrincipal || "#1e40af";

            const estrellas = "⭐".repeat(reviewData.calificacion);
            const comentarioTruncado = reviewData.comentario?.substring(0, 100) || "Sin comentario";

            const dashboardUrl = `${process.env.FRONTEND_URL}/admin/resenas`;

            const html = await this.getTemplate("nueva-resena-admin", {
                nombreAdmin: adminData.nombre,
                nombreBarberia,
                nombreCliente: reviewData.nombreCliente,
                estrellas,
                calificacion: reviewData.calificacion,
                comentario: comentarioTruncado,
                dashboardUrl,
                logoUrl,
                colorHeader,
                year: new Date().getFullYear()
            });

            const mailOptions = {
                from: `"${nombreBarberia}" <${transporter.options.auth.user}>`,
                to: adminData.email,
                subject: `🔔 Nueva reseña pendiente de moderación - ${nombreBarberia}`,
                html
            };

            await transporter.sendMail(mailOptions);
            console.log(`📧 Notificación de nueva reseña enviada a ${adminData.email}`);
        } catch (error) {
            console.error("❌ Error enviando notificación de nueva reseña:", error);
            throw error;
        }
    }

    /**
     * Envía email genérico
     * @param {Object} emailOptions - Opciones del email
     * @param {Object} barberiaConfig - Configuración de la barbería
     * @returns {Promise<void>}
     */
    async sendEmail(emailOptions, barberiaConfig = null) {
        try {
            const transporter = await this.getTransporter(barberiaConfig);

            const nombreBarberia = barberiaConfig?.nombreParaEmails || "Barber Studio";

            const mailOptions = {
                from: `"${nombreBarberia}" <${transporter.options.auth.user}>`,
                ...emailOptions
            };

            await transporter.sendMail(mailOptions);
            console.log(`📧 Email enviado a ${emailOptions.to}`);
        } catch (error) {
            console.error("❌ Error enviando email:", error);
            throw error;
        }
    }
}

module.exports = EmailAdapter;
