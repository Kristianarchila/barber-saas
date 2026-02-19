const crypto = require('crypto');

/**
 * NotifyWaitingList Use Case
 * Notifies clients in the waiting list when a slot becomes available
 */
class NotifyWaitingList {
    constructor(waitingListRepository, emailAdapter, whatsappAdapter = null) {
        this.waitingListRepository = waitingListRepository;
        this.emailAdapter = emailAdapter;
        this.whatsappAdapter = whatsappAdapter;
    }

    async execute(reservaCancelada) {
        const {
            barberiaId,
            barberoId,
            servicioId,
            fecha,
            hora
        } = reservaCancelada;

        // 1. Find matching entries in the waiting list
        const matchingEntries = await this.waitingListRepository.findMatchingEntries(
            barberiaId,
            barberoId,
            servicioId,
            fecha,
            hora
        );

        if (matchingEntries.length === 0) {
            console.log('No matching waiting list entries found');
            return {
                success: true,
                notified: 0,
                message: 'No hay clientes en lista de espera para este horario'
            };
        }

        // 2. Get the first entry (highest priority / oldest)
        const firstEntry = matchingEntries[0];

        // 3. Generate unique token for conversion
        const token = crypto.randomBytes(32).toString('hex');

        // 4. Mark as notified with expiration (48 hours)
        await this.waitingListRepository.markAsNotified(firstEntry._id, token, 48);

        // 5. Send notification email
        const emailSent = await this._sendNotificationEmail(
            firstEntry,
            token,
            fecha,
            hora
        );

        // 6. Send WhatsApp notification if available
        if (this.whatsappAdapter && firstEntry.clienteTelefono) {
            try {
                await this._sendWhatsAppNotification(
                    firstEntry,
                    token,
                    fecha,
                    hora
                );
            } catch (error) {
                console.error('Error sending WhatsApp notification:', error);
                // Don't fail if WhatsApp fails
            }
        }

        return {
            success: true,
            notified: 1,
            entry: {
                id: firstEntry._id,
                clienteNombre: firstEntry.clienteNombre,
                clienteEmail: firstEntry.clienteEmail,
                emailSent
            }
        };
    }

    async _sendNotificationEmail(entry, token, fecha, hora) {
        const confirmUrl = `${process.env.FRONTEND_URL}/confirmar-lista-espera/${token}`;

        try {
            await this.emailAdapter.send({
                to: entry.clienteEmail,
                subject: '🎉 ¡Hay un horario disponible para ti!',
                html: this._generateNotificationEmail(entry, fecha, hora, confirmUrl)
            });
            return true;
        } catch (error) {
            console.error('Error sending notification email:', error);
            return false;
        }
    }

    async _sendWhatsAppNotification(entry, token, fecha, hora) {
        const confirmUrl = `${process.env.FRONTEND_URL}/confirmar-lista-espera/${token}`;
        const message = `
🎉 ¡Hola ${entry.clienteNombre}!

Hay un horario disponible que coincide con tus preferencias:

📅 Fecha: ${new Date(fecha).toLocaleDateString('es-CL')}
🕐 Hora: ${hora}
💈 Barbero: ${entry.barberoId.nombre}
✂️ Servicio: ${entry.servicioId.nombre}

Tienes 48 horas para confirmar tu reserva:
${confirmUrl}

Si no confirmas, pasaremos al siguiente en la lista.

¡Gracias!
        `.trim();

        await this.whatsappAdapter.send({
            to: entry.clienteTelefono,
            message
        });
    }

    _generateNotificationEmail(entry, fecha, hora, confirmUrl) {
        const dayjs = require('dayjs');
        require('dayjs/locale/es');
        dayjs.locale('es');

        const fechaFormateada = dayjs(fecha).format('dddd, D [de] MMMM [de] YYYY');

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .slot-info { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
                    .slot-info h3 { margin-top: 0; color: #10b981; }
                    .btn { display: inline-block; background: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
                    .btn:hover { background: #059669; }
                    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 ¡Hay un horario disponible!</h1>
                    </div>
                    <div class="content">
                        <p>Hola <strong>${entry.clienteNombre}</strong>,</p>
                        
                        <p>¡Buenas noticias! Se ha liberado un horario que coincide con tus preferencias:</p>
                        
                        <div class="slot-info">
                            <h3>Detalles de la reserva</h3>
                            <p><strong>📅 Fecha:</strong> ${fechaFormateada}</p>
                            <p><strong>🕐 Hora:</strong> ${hora}</p>
                            <p><strong>💈 Barbero:</strong> ${entry.barberoId.nombre}</p>
                            <p><strong>✂️ Servicio:</strong> ${entry.servicioId.nombre}</p>
                            <p><strong>💰 Precio:</strong> $${entry.servicioId.precio.toLocaleString('es-CL')}</p>
                        </div>
                        
                        <div class="warning">
                            <p><strong>⏰ Importante:</strong> Tienes <strong>48 horas</strong> para confirmar esta reserva. Si no confirmas, pasaremos al siguiente cliente en la lista de espera.</p>
                        </div>
                        
                        <center>
                            <a href="${confirmUrl}" class="btn">✅ Confirmar Reserva</a>
                        </center>
                        
                        <p style="margin-top: 30px;">Si no puedes asistir, simplemente ignora este email y pasaremos al siguiente en la lista.</p>
                        
                        <p>¡Gracias por tu paciencia! 🙏</p>
                    </div>
                    <div class="footer">
                        <p>Este es un email automático, por favor no respondas.</p>
                        <p>Si tienes preguntas, contáctanos directamente.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }
}

module.exports = NotifyWaitingList;
