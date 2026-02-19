const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs").promises;
const dayjs = require("dayjs");
require("dayjs/locale/es");
const Barberia = require("../../infrastructure/database/mongodb/models/Barberia");

/**
 * Crea un transportador configurado
 * Si la barbería tiene config propia, la usa. Si no, usa la global.
 */
const getTransporter = async (barberiaId = null) => {
  let config = {
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  };

  // 1. Intentar obtener config de la barbería
  if (barberiaId) {
    try {
      const barberia = await Barberia.findById(barberiaId);
      if (barberia?.configuracion?.emailNotificaciones && barberia?.configuracion?.emailPassword) {

        const { emailProvider, emailNotificaciones, emailPassword, smtpConfig } = barberia.configuracion;

        // Desencriptar contraseña si está encriptada
        let decryptedPassword;

        if (typeof emailPassword === 'object' && emailPassword.encrypted) {
          // Formato nuevo: encriptado
          const { decrypt } = require('../../utils/encryption');
          decryptedPassword = decrypt(
            emailPassword.encrypted,
            emailPassword.iv,
            emailPassword.authTag
          );
        } else if (typeof emailPassword === 'string') {
          // Formato legacy: texto plano (para compatibilidad)
          decryptedPassword = emailPassword;
          console.warn('⚠️ Contraseña de email en texto plano. Considera migrar a formato encriptado.');
        } else {
          throw new Error('Formato de contraseña inválido');
        }

        if (emailProvider === 'smtp' && smtpConfig?.host) {
          config = {
            host: smtpConfig.host,
            port: smtpConfig.port || 587,
            secure: smtpConfig.secure || false,
            auth: {
              user: emailNotificaciones,
              pass: decryptedPassword
            }
          };
        } else {
          config = {
            service: emailProvider || 'gmail',
            auth: {
              user: emailNotificaciones,
              pass: decryptedPassword
            }
          };
        }

        console.log(`📧 Usando transportador personalizado para barbería: ${barberia.nombre}`);
      } else {
        console.log(`📧 Barbería sin config de email, usando global`);
      }
    } catch (error) {
      console.error("❌ Error configurando transportador de barbería:", error.message);
      // Fallback a config global
    }
  }

  return nodemailer.createTransport(config);
};

/**
 * Lee y procesa un template HTML
 */
const getTemplate = async (templateName, data) => {
  const filePath = path.join(__dirname, "templates", `${templateName}.html`);
  let content = await fs.readFile(filePath, "utf8");

  // Reemplazar variables {{variable}}
  Object.keys(data).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    content = content.replace(regex, data[key]);
  });

  return content;
};

/**
 * ENVÍO DE EMAIL DE CONFIRMACIÓN DE RESERVA
 */
exports.reservaConfirmada = async ({
  emailCliente,
  nombreCliente,
  fecha,
  hora,
  servicio,
  cancelUrl,
  reagendarUrl,
  barberiaId
}) => {
  try {
    const transporter = await getTransporter(barberiaId);

    const barberia = await Barberia.findById(barberiaId);
    const nombreBarberia = barberia?.configuracion?.nombreParaEmails || barberia?.nombre || "Barber Studio";
    const logoUrl = barberia?.configuracion?.logoUrl || "https://res.cloudinary.com/tu-cloud/image/upload/v1/logos/logo-default.png";
    const colorHeader = barberia?.configuracion?.colorPrincipal || "#1e40af";

    const fechaFormateada = dayjs(fecha).locale("es").format("dddd D [de] MMMM");

    const html = await getTemplate("reservaConfirmada", {
      nombreCliente,
      nombreBarberia,
      fecha: fechaFormateada,
      hora,
      servicio,
      cancelUrl,
      reagendarUrl,
      logoUrl,
      colorHeader,
      year: new Date().getFullYear()
    });

    const mailOptions = {
      from: `"${nombreBarberia}" <${transporter.options.auth.user}>`,
      to: emailCliente,
      subject: `✅ Cita Confirmada - ${nombreBarberia}`,
      html
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email de confirmación enviado a ${emailCliente}`);
  } catch (error) {
    console.error("❌ Error enviando email:", error);
    throw error;
  }
};

/**
 * ENVÍO DE EMAIL DE SOLICITUD DE RESEÑA
 */
exports.enviarSolicitudResena = async ({
  email,
  nombre,
  barberia,
  servicio,
  barbero,
  fecha,
  reviewUrl,
  barberiaId
}) => {
  try {
    const transporter = await getTransporter(barberiaId);

    const barberiaData = await Barberia.findById(barberiaId);
    const nombreBarberia = barberiaData?.configuracion?.nombreParaEmails || barberiaData?.nombre || "Barber Studio";
    const logoUrl = barberiaData?.configuracion?.logoUrl || "https://res.cloudinary.com/tu-cloud/image/upload/v1/logos/logo-default.png";
    const colorHeader = barberiaData?.configuracion?.colorPrincipal || "#1e40af";

    const fechaFormateada = dayjs(fecha).locale("es").format("dddd D [de] MMMM");

    const html = await getTemplate("solicitud-resena", {
      nombreCliente: nombre,
      nombreBarberia,
      servicio,
      barbero,
      fecha: fechaFormateada,
      reviewUrl,
      logoUrl,
      colorHeader,
      year: new Date().getFullYear()
    });

    const mailOptions = {
      from: `"${nombreBarberia}" <${transporter.options.auth.user}>`,
      to: email,
      subject: `⭐ ¿Cómo fue tu experiencia en ${nombreBarberia}?`,
      html
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email de solicitud de reseña enviado a ${email}`);
  } catch (error) {
    console.error("❌ Error enviando email de solicitud de reseña:", error);
    throw error;
  }
};

/**
 * ENVÍO DE EMAIL DE NOTIFICACIÓN DE NUEVA RESEÑA AL ADMIN
 */
exports.notificarNuevaResena = async ({
  admin,
  resena,
  barberia,
  barberiaId
}) => {
  try {
    const transporter = await getTransporter(barberiaId);

    const barberiaData = await Barberia.findById(barberiaId);
    const nombreBarberia = barberiaData?.configuracion?.nombreParaEmails || barberiaData?.nombre || "Barber Studio";
    const logoUrl = barberiaData?.configuracion?.logoUrl || "https://res.cloudinary.com/tu-cloud/image/upload/v1/logos/logo-default.png";
    const colorHeader = barberiaData?.configuracion?.colorPrincipal || "#1e40af";

    const estrellas = "⭐".repeat(resena.calificacion);
    const comentarioTruncado = resena.comentario?.substring(0, 100) || "Sin comentario";

    const dashboardUrl = `${process.env.FRONTEND_URL}/admin/resenas`;

    const html = await getTemplate("nueva-resena-admin", {
      nombreAdmin: admin.nombre,
      nombreBarberia,
      nombreCliente: resena.nombreCliente,
      estrellas,
      calificacion: resena.calificacion,
      comentario: comentarioTruncado,
      dashboardUrl,
      logoUrl,
      colorHeader,
      year: new Date().getFullYear()
    });

    const mailOptions = {
      from: `"${nombreBarberia}" <${transporter.options.auth.user}>`,
      to: admin.email,
      subject: `🔔 Nueva reseña pendiente de moderación - ${nombreBarberia}`,
      html
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Notificación de nueva reseña enviada a ${admin.email}`);
  } catch (error) {
    console.error("❌ Error enviando notificación de nueva reseña:", error);
    throw error;
  }
};

/**
 * ENVÍO DE EMAIL DE BIENVENIDA (CUENTA PENDIENTE)
 */
exports.sendWelcomePendingEmail = async ({ email, nombre }) => {
  try {
    const transporter = await getTransporter(); // Sin barberiaId, usa config global

    const templatePath = path.join(__dirname, "../../templates/emails/welcome-pending.html");
    let html = await fs.readFile(templatePath, "utf8");

    // Reemplazar variables
    html = html.replace(/{{nombre}}/g, nombre);
    html = html.replace(/{{email}}/g, email);
    html = html.replace(/{{fecha}}/g, dayjs().locale("es").format("D [de] MMMM [de] YYYY"));

    const mailOptions = {
      from: `"Barber SaaS" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🎉 ¡Bienvenido a Barber SaaS! - Solicitud Recibida",
      html
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email de bienvenida (pendiente) enviado a ${email}`);
  } catch (error) {
    console.error("❌ Error enviando email de bienvenida:", error);
    throw error;
  }
};

/**
 * ENVÍO DE EMAIL DE CUENTA APROBADA
 */
exports.sendAccountApprovedEmail = async ({ email, nombre, slug }) => {
  try {
    const transporter = await getTransporter(); // Sin barberiaId, usa config global

    const templatePath = path.join(__dirname, "../../templates/emails/account-approved.html");
    let html = await fs.readFile(templatePath, "utf8");

    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
    const publicUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/${slug}`;

    // Reemplazar variables
    html = html.replace(/{{nombre}}/g, nombre);
    html = html.replace(/{{email}}/g, email);
    html = html.replace(/{{loginUrl}}/g, loginUrl);
    html = html.replace(/{{publicUrl}}/g, publicUrl);

    const mailOptions = {
      from: `"Barber SaaS" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "✅ ¡Tu cuenta ha sido aprobada! - Comienza ahora",
      html
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email de cuenta aprobada enviado a ${email}`);
  } catch (error) {
    console.error("❌ Error enviando email de aprobación:", error);
    throw error;
  }
};
