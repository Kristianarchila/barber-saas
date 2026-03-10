/**
 * EmailService - Infrastructure adapter for sending emails
 * Uses nodemailer with Gmail (already configured in ENV)
 */
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendPasswordReset(to, resetUrl, barberiaConfig = null) {
    const design = barberiaConfig?.design || 'modern';
    const barberName = barberiaConfig?.nombre || 'Barber SaaS';
    const bannerUrl = barberiaConfig?.bannerUrl;
    const primaryColor = barberiaConfig?.primaryColor || '#3b82f6';

    let html = '';

    if (design === 'vintage') {
      html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f5f1e9;font-family:'Georgia', serif;-webkit-font-smoothing:antialiased;">
  <div style="max-width:600px;margin:40px auto;background-color:#ffffff;border:4px double #d4af37;overflow:hidden;box-shadow:0 15px 30px rgba(0,0,0,0.1);">
    <div style="padding:48px 40px;text-align:center;">
      ${bannerUrl ? `<img src="${bannerUrl}" style="max-width:140px;margin-bottom:24px;">` : `<div style="font-size:48px;margin-bottom:16px;">💈</div>`}
      <h1 style="color:#1a1a1a;font-size:32px;font-weight:bold;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.1em;">${barberName}</h1>
      <div style="height:2px;width:60px;background-color:#d4af37;margin:0 auto 32px;"></div>
      
      <h2 style="color:#1a1a1a;font-size:20px;margin:0 0 20px;font-style:italic;">Restablecimiento de Contraseña</h2>
      <p style="color:#4a4a4a;font-size:16px;line-height:1.8;margin:0 0 40px;">
        Estimado cliente, hemos recibido una solicitud para cambiar el acceso a su cuenta en nuestra barbería. Si desea proceder, haga clic en el sello de abajo.
      </p>

      <a href="${resetUrl}" style="display:inline-block;background-color:#1a1a1a;color:#d4af37;text-decoration:none;padding:18px 44px;border:2px solid #d4af37;font-size:14px;font-weight:bold;text-transform:uppercase;letter-spacing:0.2em;">
        Cambiar Contraseña
      </a>

      <p style="color:#888;font-size:12px;margin-top:48px;">
        Nota: Este enlace es válido por 60 minutos. Si no solicitó este cambio, ignore este mensaje.
      </p>
    </div>
    <div style="background-color:#1a1a1a;color:#d4af37;padding:24px;text-align:center;font-size:11px;letter-spacing:0.1em;">
      EST. ${new Date().getFullYear()} · CALIDAD Y TRADICIÓN
    </div>
  </div>
</body>
</html>`;
    } else if (design === 'luxury') {
      html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#050505;font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="max-width:600px;margin:0 auto;background-color:#000000;color:#ffffff;text-align:center;">
    <div style="padding:80px 40px;">
      ${bannerUrl ? `<img src="${bannerUrl}" style="max-width:120px;margin-bottom:40px;filter:brightness(1.2);">` : `<div style="font-size:32px;letter-spacing:0.3em;font-weight:200;margin-bottom:40px;">LUXE</div>`}
      
      <h1 style="font-size:13px;font-weight:200;letter-spacing:0.4em;text-transform:uppercase;color:#c5a059;margin-bottom:60px;">Security Authentication</h1>
      
      <div style="height:1px;width:30px;background-color:#c5a059;margin:0 auto 40px;"></div>
      
      <p style="font-size:16px;font-weight:200;line-height:2;color:#a0a0a0;margin-bottom:60px;max-width:400px;margin-left:auto;margin-right:auto;">
        Hemos habilitado el protocolo de restablecimiento de contraseña para su cuenta de <strong>${barberName}</strong>. 
      </p>

      <a href="${resetUrl}" style="display:inline-block;border:1px solid #c5a059;color:#c5a059;text-decoration:none;padding:20px 50px;font-size:12px;text-transform:uppercase;letter-spacing:0.3em;transition:all 0.3s;">
        Access Reset Flow
      </a>

      <p style="color:#4a4a4a;font-size:10px;margin-top:100px;letter-spacing:0.1em;">
        ELITE ACCESS · UNIFIED VERSION 2026
      </p>
    </div>
  </div>
</body>
</html>`;
    } else {
      // Modern (Default)
      html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#020617;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="max-width:600px;margin:40px auto;background-color:#0f172a;border-radius:24px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
    <div style="height:4px;background:linear-gradient(90deg, ${primaryColor}, #8b5cf6, #d946ef);"></div>
    <div style="padding:48px 40px;">
      <div style="text-align:center;margin-bottom:32px;">
        <div style="display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;background:linear-gradient(135deg, ${primaryColor} 0%, #7c3aed 100%);border-radius:18px;">
          ${bannerUrl ? `<img src="${bannerUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:18px;">` : `<span style="font-size:32px;line-height:64px;">✂️</span>`}
        </div>
        <h1 style="color:#ffffff;font-size:28px;font-weight:900;margin:24px 0 8px;letter-spacing:-0.025em;">${barberName}</h1>
      </div>
      <div style="text-align:left;">
        <h2 style="color:#ffffff;font-size:20px;font-weight:700;margin:0 0 16px;">¿Olvidaste tu contraseña?</h2>
        <p style="color:#94a3b8;font-size:16px;line-height:1.6;margin:0 0 32px;">
          Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>${barberName}</strong>. Haz clic abajo para continuar.
        </p>
        <div style="text-align:center;margin-bottom:32px;">
          <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg, ${primaryColor} 0%, #7c3aed 100%);color:#ffffff;text-decoration:none;padding:18px 44px;border-radius:16px;font-size:16px;font-weight:700;">
            Restablecer Contraseña
          </a>
        </div>
      </div>
    </div>
    <div style="background-color:rgba(0,0,0,0.2);padding:32px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
      <p style="color:#475569;font-size:12px;margin:0;">© ${new Date().getFullYear()} ${barberName}</p>
    </div>
  </div>
</body>
</html>`;
    }

    await this.transporter.sendMail({
      from: `"${barberName}" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Restablecer tu contraseña - ${barberName}`,
      html,
    });
  }
}

module.exports = new EmailService();
