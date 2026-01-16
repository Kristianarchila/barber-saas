const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

module.exports = async function sendEmail(to, subject, html) {
  const textFallback = "Reserva confirmada. Si no ves el diseño, tu cliente de correo solo muestra texto.";

  return transporter.sendMail({
    from: `"Barber SaaS" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    // 🔥 IMPORTANTE: Gmail decide render según MIME; nodemailer lo arma mejor si das ambos
    text: textFallback,
    html,
    headers: {
      "X-Entity-Ref-ID": String(Date.now())
    },
    encoding: "utf-8"
  });
};
