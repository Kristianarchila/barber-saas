/**
 * EmailServiceWrapper - Adapter Pattern
 * 
 * Wraps the legacy email service to provide a consistent interface
 * for use cases. This allows gradual migration to the new EmailAdapter
 * without breaking existing functionality.
 */
class EmailServiceWrapper {
    constructor(legacyEmailService) {
        this.legacyService = legacyEmailService;
    }

    /**
     * Send reservation confirmation email
     * @param {Object} reserva - Reservation entity
     * @returns {Promise<void>}
     */
    async sendReservaConfirmation(reserva) {
        try {
            // Map to legacy method signature
            return await this.legacyService.reservaConfirmada({
                emailCliente: reserva.emailCliente,
                nombreCliente: reserva.nombreCliente,
                fecha: reserva.fecha,
                hora: reserva.hora,
                servicio: reserva.servicio?.nombre || 'Servicio',
                cancelUrl: `${process.env.FRONTEND_URL}/cancelar/${reserva.cancelToken}`,
                reagendarUrl: `${process.env.FRONTEND_URL}/reagendar/${reserva.cancelToken}`,
                barberiaId: reserva.barberiaId
            });
        } catch (error) {
            // Don't throw - email failures shouldn't break reservation creation
            console.error('❌ Error in sendReservaConfirmation wrapper:', error.message);
        }
    }

    /**
     * Send cancellation notification
     * @param {Object} reserva - Reservation entity
     * @returns {Promise<void>}
     */
    async sendCancellationNotification(reserva) {
        try {
            // Legacy service doesn't have this method yet
            // For now, just log - can implement later
            console.log('📧 Cancellation email would be sent to:', reserva.emailCliente);
        } catch (error) {
            console.error('❌ Error in sendCancellationNotification wrapper:', error.message);
        }
    }

    /**
     * Send reschedule notification
     * @param {Object} reserva - Reservation entity
     * @param {Object} oldData - Previous reservation data
     * @returns {Promise<void>}
     */
    async sendRescheduleNotification(reserva, oldData) {
        try {
            // Legacy service doesn't have this method yet
            // For now, just log - can implement later
            console.log('📧 Reschedule email would be sent to:', reserva.emailCliente);
        } catch (error) {
            console.error('❌ Error in sendRescheduleNotification wrapper:', error.message);
        }
    }

    /**
     * Send completion notification with review request
     * @param {Object} reserva - Reservation entity
     * @param {string} reviewUrl - URL for leaving review
     * @returns {Promise<void>}
     */
    async sendCompletionWithReview(reserva, reviewUrl) {
        try {
            if (this.legacyService.enviarSolicitudResena) {
                return await this.legacyService.enviarSolicitudResena({
                    email: reserva.emailCliente,
                    nombre: reserva.nombreCliente,
                    barberia: reserva.barberia?.nombre || 'Barbería',
                    servicio: reserva.servicio?.nombre || 'Servicio',
                    barbero: reserva.barbero?.nombre || 'Barbero',
                    fecha: reserva.fecha,
                    reviewUrl: reviewUrl,
                    barberiaId: reserva.barberiaId
                });
            }
        } catch (error) {
            console.error('❌ Error in sendCompletionWithReview wrapper:', error.message);
        }
    }
}

module.exports = EmailServiceWrapper;
