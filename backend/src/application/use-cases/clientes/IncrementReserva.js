/**
 * @file IncrementReserva.js
 * @description Use case for incrementing reservation counter
 */

class IncrementReserva {
    constructor(clienteStatsRepository) {
        this.clienteStatsRepository = clienteStatsRepository;
    }

    /**
     * Increments reservation counter for a client
     * @param {Object} params
     * @param {string} params.email - Client email
     * @param {string} params.barberiaId - Barberia ID
     * @param {string} params.telefono - Client phone (optional)
     * @returns {Promise<ClienteStats>}
     */
    async execute({ email, barberiaId, telefono = null }) {
        if (!email || !barberiaId) {
            throw new Error('Email y barberiaId son requeridos');
        }

        // Increment reservation counter (will create if doesn't exist)
        const clienteStats = await this.clienteStatsRepository.incrementReserva(
            email,
            barberiaId
        );

        return clienteStats;
    }
}

module.exports = IncrementReserva;
