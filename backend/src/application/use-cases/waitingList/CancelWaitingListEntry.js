/**
 * CancelWaitingListEntry Use Case
 * Allows a client or admin to cancel a waiting list entry
 */
class CancelWaitingListEntry {
    constructor(waitingListRepository, emailAdapter) {
        this.waitingListRepository = waitingListRepository;
        this.emailAdapter = emailAdapter;
    }

    async execute(entryId, cancelledBy = 'CLIENT') {
        // 1. Find the entry
        const entry = await this.waitingListRepository.findById(entryId);

        if (!entry) {
            throw new Error('Entrada no encontrada');
        }

        // 2. Verify it can be cancelled
        if (entry.estado === 'CONVERTIDA') {
            throw new Error('Esta entrada ya fue convertida en una reserva');
        }

        if (entry.estado === 'CANCELADA') {
            throw new Error('Esta entrada ya está cancelada');
        }

        // 3. Mark as cancelled
        await this.waitingListRepository.markAsCancelled(entryId);

        // 4. Send cancellation email
        try {
            await this.emailAdapter.send({
                to: entry.clienteEmail,
                subject: 'Lista de espera cancelada',
                html: this._generateCancellationEmail(entry, cancelledBy)
            });
        } catch (emailError) {
            console.error('Error sending cancellation email:', emailError);
        }

        return {
            success: true,
            message: 'Entrada cancelada exitosamente'
        };
    }

    _generateCancellationEmail(entry, cancelledBy) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #6b7280; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Lista de Espera Cancelada</h1>
                    </div>
                    <div class="content">
                        <p>Hola <strong>${entry.clienteNombre}</strong>,</p>
                        
                        <p>Tu entrada en la lista de espera ha sido cancelada.</p>
                        
                        ${cancelledBy === 'ADMIN' ? '<p><em>Esta cancelación fue realizada por un administrador.</em></p>' : ''}
                        
                        <p>Si deseas volver a unirte a la lista de espera, puedes hacerlo en cualquier momento desde nuestra página de reservas.</p>
                        
                        <p>Gracias,</p>
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

module.exports = CancelWaitingListEntry;
