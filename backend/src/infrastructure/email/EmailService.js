/**
 * EmailService - Infrastructure adapter for sending emails
 * Uses nodemailer with Gmail (already configured in ENV)
 */
const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    async sendPasswordReset(to, resetUrl) {
        const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#3b82f6,#7c3aed);padding:40px 32px;text-align:center;">
      <div style="width:64px;height:64px;background:rgba(255,255,255,0.2);border-radius:16px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:32px;">✂️</span>
      </div>
      <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;">Barber SaaS</h1>
    </div>
    <!-- Body -->
    <div style="padding:40px 32px;">
      <h2 style="color:#111827;font-size:20px;font-weight:700;margin:0 0 12px;">Restablecer contraseña</h2>
      <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 32px;">
        Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón de abajo para continuar. Este enlace expira en <strong>1 hora</strong>.
      </p>
      <div style="text-align:center;margin-bottom:32px;">
        <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#7c3aed);color:#fff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:15px;font-weight:700;">
          Restablecer contraseña →
        </a>
      </div>
      <p style="color:#9ca3af;font-size:13px;line-height:1.5;margin:0;">
        Si no solicitaste esto, ignora este correo. Tu cuenta sigue siendo segura.
      </p>
    </div>
    <!-- Footer -->
    <div style="background:#f9fafb;padding:24px 32px;text-align:center;border-top:1px solid #f3f4f6;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">© 2026 Barber SaaS · Todos los derechos reservados</p>
    </div>
  </div>
</body>
</html>`;

        await this.transporter.sendMail({
            from: `"Barber SaaS" <${process.env.EMAIL_USER}>`,
            to,
            subject: 'Restablecer tu contraseña - Barber SaaS',
            html,
        });
    }
}

module.exports = new EmailService();
