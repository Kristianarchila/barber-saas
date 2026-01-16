const sendEmail = require("./email.provider");

exports.reservaConfirmada = async (reserva) => {
  const html = `
  <!doctype html>
  <html>
    <body style="margin:0;padding:0;background:#f4f4f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
              <tr>
                <td style="background:#111827;color:#fff;padding:18px 22px;">
                  <div style="font-size:18px;font-weight:700;">Barber Studio</div>
                  <div style="font-size:13px;opacity:.85;">Reserva confirmada</div>
                </td>
              </tr>
              <tr>
                <td style="padding:22px;color:#111827;font-family:Arial,Helvetica,sans-serif;">
                  <p style="margin:0 0 14px;">Tu turno ha sido registrado correctamente.</p>
                  <p style="margin:0;"><b>Fecha:</b> ${reserva.fecha}</p>
                  <p style="margin:6px 0 0;"><b>Hora:</b> ${reserva.hora}</p>
                  <p style="margin:6px 0 0;"><b>Servicio:</b> ${reserva.servicioId?.nombre || "Corte"}</p>
                  <div style="margin-top:18px;padding:12px;border-radius:8px;background:#f9fafb;border:1px solid #e5e7eb;">
                    ✅ Si ves este recuadro gris y el header oscuro, el HTML está OK.
                  </div>
                </td>
              </tr>
              <tr>
                <td style="background:#f9fafb;color:#6b7280;font-family:Arial,Helvetica,sans-serif;padding:14px 22px;font-size:12px;">
                  © ${new Date().getFullYear()} Barber Studio · Barber SaaS
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;

  await sendEmail(
    reserva.emailCliente,
    `TEST HTML PRO ${Date.now()}`,
    html
  );
};
