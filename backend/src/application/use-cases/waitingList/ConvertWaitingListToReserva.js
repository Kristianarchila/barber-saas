/**
 * ConvertWaitingListToReserva Use Case
 * Converts a waiting list entry into an actual reservation
 */
class ConvertWaitingListToReserva {
    constructor(
        waitingListRepository,
        reservaRepository,
        createReservaUseCase,
        emailAdapter
    ) {
        this.waitingListRepository = waitingListRepository;
        this.reservaRepository = reservaRepository;
        this.createReservaUseCase = createReservaUseCase;
        this.emailAdapter = emailAdapter;
    }

    async execute(token) {
        // 1. Find waiting list entry by token
        const entry = await this.waitingListRepository.findByToken(token);

        if (!entry) {
            throw new Error('Token inválido o entrada no encontrada');
        }

        // 2. Verify it's in NOTIFICADA state
        if (entry.estado !== 'NOTIFICADA') {
            throw new Error('Esta entrada ya no está disponible para conversión');
        }

        // 3. Check if it has expired
        if (entry.isExpired()) {
            await this.waitingListRepository.markAsExpired(entry._id);
            throw new Error('El tiempo para confirmar esta reserva ha expirado');
        }

        // 4. Calculate the slot details from the original cancelled reservation
        // For now, we'll use the preferred date/time from the entry
        // In a production system, you'd want to pass the exact slot details
        const fechaReserva = entry.fechaPreferida;
        const horaReserva = entry.rangoHorario.inicio;

        // 5. Verify the slot is still available
        const existingReserva = await this.reservaRepository.findBySlot(
            entry.barberiaId,
            entry.barberoId,
            fechaReserva,
            horaReserva
        );

        if (existingReserva && existingReserva.estado !== 'CANCELADA') {
            // Slot was taken by someone else
            await this.waitingListRepository.markAsExpired(entry._id);
            throw new Error('Lo sentimos, este horario ya fue tomado por otro cliente');
        }

        // 6. Create the reservation
        try {
            const reserva = await this.createReservaUseCase.execute({
                barberiaId: entry.barberiaId,
                barberoId: entry.barberoId,
                servicioId: entry.servicioId,
                clienteId: entry.clienteId,
                clienteEmail: entry.clienteEmail,
                clienteTelefono: entry.clienteTelefono,
                clienteNombre: entry.clienteNombre,
                fecha: fechaReserva,
                hora: horaReserva,
                notas: entry.notas || 'Reserva confirmada desde lista de espera',
                origen: 'LISTA_ESPERA'
            });

            // 7. Mark waiting list entry as converted
            await this.waitingListRepository.markAsConverted(entry._id, reserva.id);

            // 8. Send confirmation email
            try {
                await this.emailAdapter.send({
                    to: entry.clienteEmail,
                    subject: '✅ Reserva confirmada desde lista de espera',
                    html: this._generateConfirmationEmail(entry, reserva)
                });
            } catch (emailError) {
                console.error('Error sending confirmation email:', emailError);
                // Don't fail the operation if email fails
            }

            return {
                success: true,
                reserva: {
                    id: reserva.id,
                    fecha: reserva.fecha,
                    hora: reserva.hora,
                    barbero: reserva.barberoNombre,
                    servicio: reserva.servicioNombre
                }
            };

        } catch (error) {
            console.error('Error creating reservation from waiting list:', error);
            throw new Error(`No se pudo crear la reserva: ${error.message}`);
        }
    }

    _generateConfirmationEmail(entry, reserva) {
        const dayjs = require('dayjs');
        require('dayjs/locale/es');
        dayjs.locale('es');

        const fechaFormateada = dayjs(reserva.fecha).format('dddd, D [de] MMMM [de] YYYY');

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .reservation-card { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
                    .reservation-card h3 { margin-top: 0; color: #10b981; }
                    .success-badge { display: inline-block; background: #10b981; color: white; padding: 8px 20px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ ¡Reserva Confirmada!</h1>
                        <div class="success-badge">Desde Lista de Espera</div>
                    </div>
                    <div class="content">
                        <p>Hola <strong>${entry.clienteNombre}</strong>,</p>
                        
                        <p>¡Excelente! Tu reserva ha sido confirmada exitosamente.</p>
                        
                        <div class="reservation-card">
                            <h3>📋 Detalles de tu Reserva</h3>
                            <p><strong>📅 Fecha:</strong> ${fechaFormateada}</p>
                            <p><strong>🕐 Hora:</strong> ${reserva.hora}</p>
                            <p><strong>💈 Barbero:</strong> ${entry.barberoId.nombre}</p>
                            <p><strong>✂️ Servicio:</strong> ${entry.servicioId.nombre}</p>
                            <p><strong>⏱️ Duración:</strong> ${entry.servicioId.duracion} minutos</p>
                            <p><strong>💰 Precio:</strong> $${entry.servicioId.precio.toLocaleString('es-CL')}</p>
                        </div>
                        
                        <p><strong>¿Qué sigue?</strong></p>
                        <ul>
                            <li>Recibirás un recordatorio 24 horas antes de tu cita</li>
                            <li>Si necesitas cancelar o reprogramar, hazlo con al menos 24 horas de anticipación</li>
                            <li>Llega 5 minutos antes de tu hora programada</li>
                        </ul>
                        
                        <p>¡Nos vemos pronto! 💈</p>
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

module.exports = ConvertWaitingListToReserva;
