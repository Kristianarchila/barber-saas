const ClienteBloqueadoError = require('../../../shared/errors/ClienteBloqueadoError');

/**
 * @file CheckClienteStatus.js
 * @description Use case for checking if a client can make a reservation
 */

class CheckClienteStatus {
    constructor(clienteStatsRepository) {
        this.clienteStatsRepository = clienteStatsRepository;
    }

    /**
     * Checks if client can make a reservation
     * @param {Object} params
     * @param {string} params.email - Client email
     * @param {string} params.barberiaId - Barberia ID
     * @returns {Promise<ClienteStats>}
     * @throws {ClienteBloqueadoError} If client is blocked
     */
    async execute({ email, barberiaId }) {
        if (!email || !barberiaId) {
            throw new Error('Email y barberiaId son requeridos');
        }

        // Find or create client stats
        const clienteStats = await this.clienteStatsRepository.findOrCreate(
            email,
            barberiaId
        );

        // Check if client should be automatically unblocked
        if (clienteStats.shouldUnblock()) {
            await this.clienteStatsRepository.desbloquear(email, barberiaId);
            // Refresh stats after unblocking
            return await this.clienteStatsRepository.findByEmail(email, barberiaId);
        }

        // Check if client can reserve
        if (!clienteStats.canReservar()) {
            throw new ClienteBloqueadoError(
                `No puedes realizar reservas hasta el ${clienteStats.fechaDesbloqueo.toLocaleDateString('es-AR')}. ${clienteStats.motivoBloqueo}`,
                clienteStats.fechaDesbloqueo
            );
        }

        return clienteStats;
    }

    /**
     * Checks client status without throwing errors
     * @param {Object} params
     * @param {string} params.email - Client email
     * @param {string} params.barberiaId - Barberia ID
     * @returns {Promise<Object>} Status object
     */
    async checkStatus({ email, barberiaId }) {
        try {
            const clienteStats = await this.execute({ email, barberiaId });
            return {
                canReservar: true,
                bloqueado: false,
                stats: clienteStats.getDetails()
            };
        } catch (error) {
            if (error instanceof ClienteBloqueadoError) {
                return {
                    canReservar: false,
                    bloqueado: true,
                    motivo: error.message,
                    fechaDesbloqueo: error.fechaDesbloqueo
                };
            }
            throw error;
        }
    }
}

module.exports = CheckClienteStatus;
