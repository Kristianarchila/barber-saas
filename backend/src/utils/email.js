
throw new Error("❌ EMAIL ANTIGUO EN USO (utils/email.js)");

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.enviarCorreo = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Barber SaaS" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log("📩 Correo enviado a:", to);
  } catch (err) {
    console.error("❌ Error enviando correo:", err.message);
  }
};
