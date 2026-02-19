const crypto = require('crypto');

/**
 * JoinWaitingList Use Case
 * Allows a client to join the waiting list when no slots are available
 */
class JoinWaitingList {
    constructor(waitingListRepository, reservaRepository, emailAdapter) {
        this.waitingListRepository = waitingListRepository;
        this.reservaRepository = reservaRepository;
        this.emailAdapter = emailAdapter;
    }

    async execute(data) {
        const {
            barberiaId,
            barberoId,
            servicioId,
            clienteId,
            clienteEmail,
            clienteTelefono,
            clienteNombre,
            fechaPreferida,
            rangoHorario,
            diasPreferidos = [],
            notas
        } = data;

        // 1. Validate required fields
        if (!barberiaId || !barberoId || !servicioId || !clienteEmail || !clienteNombre) {
            throw new Error('Faltan campos requeridos');
        }

        if (!fechaPreferida || !rangoHorario || !rangoHorario.inicio || !rangoHorario.fin) {
            throw new Error('Debe especificar preferencias de horario');
        }

        // 2. Check if client already has an active entry for this combination
        const existingCount = await this.waitingListRepository.countActiveByClient(
            clienteEmail,
            barberiaId
        );

        if (existingCount >= 3) {
            throw new Error('Ya tienes 3 entradas activas en la lista de espera. Por favor espera a que se procesen.');
        }

        // 3. Verify that there are really no available slots
        // (Optional: could check availability here to prevent abuse)

        // 4. Create waiting list entry
        const entry = await this.waitingListRepository.create({
            barberiaId,
            barberoId,
            servicioId,
            clienteId,
            clienteEmail: clienteEmail.toLowerCase(),
            clienteTelefono,
            clienteNombre,
            fechaPreferida: new Date(fechaPreferida),
            rangoHorario,
            diasPreferidos,
            notas,
            estado: 'ACTIVA',
            prioridad: 0 // Default priority (FIFO)
        });

        // 5. Get position in queue
        const position = await this.waitingListRepository.getPosition(entry._id);

        // 6. Send confirmation email
        try {
            await this.emailAdapter.send({
                to: clienteEmail,
                subject: '✅ Te has unido a la lista de espera',
                html: this._generateConfirmationEmail(entry, position)
            });
        } catch (emailError) {
            console.error('Error sending confirmation email:', emailError);
            // Don't fail the operation if email fails
        }

        return {
            success: true,
            entry: {
                id: entry._id,
                position,
                estado: entry.estado,
                fechaPreferida: entry.fechaPreferida,
                rangoHorario: entry.rangoHorario
            }
        };
    }

    _generateConfirmationEmail(entry, position) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .badge { display: inline-block; background: #667eea; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
                    .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ ¡Estás en la lista de espera!</h1>
                    </div>
                    <div class="content">
                        <p>Hola <strong>${entry.clienteNombre}</strong>,</p>
                        
                        <p>Te has unido exitosamente a la lista de espera. Te notificaremos por email cuando haya un horario disponible que coincida con tus preferencias.</p>
                        
                        <div class="info-box">
                            <p><strong>Tu posición:</strong> <span class="badge">#${position}</span></p>
                            <p><strong>Fecha preferida:</strong> ${new Date(entry.fechaPreferida).toLocaleDateString('es-CL')}</p>
                            <p><strong>Rango horario:</strong> ${entry.rangoHorario.inicio} - ${entry.rangoHorario.fin}</p>
                            ${entry.diasPreferidos.length > 0 ? `<p><strong>Días preferidos:</strong> ${entry.diasPreferidos.join(', ')}</p>` : ''}
                        </div>
                        
                        <p><strong>¿Qué sigue?</strong></p>
                        <ul>
                            <li>Te notificaremos por email cuando se libere un horario</li>
                            <li>Tendrás 48 horas para confirmar la reserva</li>
                            <li>Si no confirmas, pasaremos al siguiente en la lista</li>
                        </ul>
                        
                        <p>Gracias por tu paciencia 🙏</p>
                    </div>
                    <div class="footer">
                        <p>Este es un email automático, por favor no respondas.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }
}

module.exports = JoinWaitingList;
