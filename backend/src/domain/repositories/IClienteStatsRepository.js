/**
 * @file IClienteStatsRepository.js
 * @description Repository interface for ClienteStats entity
 */

class IClienteStatsRepository {
    /**
     * Finds client stats by email and barberia
     * @param {string} email
     * @param {string} barberiaId
     * @returns {Promise<ClienteStats|null>}
     */
    async findByEmail(email, barberiaId) {
        throw new Error('Method not implemented');
    }

    /**
     * Finds or creates client stats
     * @param {string} email
     * @param {string} barberiaId
     * @param {string} telefono - Optional
     * @returns {Promise<ClienteStats>}
     */
    async findOrCreate(email, barberiaId, telefono = null) {
        throw new Error('Method not implemented');
    }

    /**
     * Saves a new client stats record
     * @param {ClienteStats} clienteStats
     * @returns {Promise<ClienteStats>}
     */
    async save(clienteStats) {
        throw new Error('Method not implemented');
    }

    /**
     * Updates client stats
     * @param {string} id
     * @param {Object} data
     * @returns {Promise<ClienteStats>}
     */
    async update(id, data) {
        throw new Error('Method not implemented');
    }

    /**
     * Increments reservation counter
     * @param {string} email
     * @param {string} barberiaId
     * @returns {Promise<ClienteStats>}
     */
    async incrementReserva(email, barberiaId) {
        throw new Error('Method not implemented');
    }

    /**
     * Increments cancellation counters
     * @param {string} email
     * @param {string} barberiaId
     * @returns {Promise<ClienteStats>}
     */
    async incrementCancelacion(email, barberiaId) {
        throw new Error('Method not implemented');
    }

    /**
     * Increments completed reservation counter
     * @param {string} email
     * @param {string} barberiaId
     * @returns {Promise<ClienteStats>}
     */
    async incrementCompletada(email, barberiaId) {
        throw new Error('Method not implemented');
    }

    /**
     * Blocks a client
     * @param {string} email
     * @param {string} barberiaId
     * @param {string} motivo
     * @param {number} diasBloqueo
     * @returns {Promise<ClienteStats>}
     */
    async bloquear(email, barberiaId, motivo, diasBloqueo) {
        throw new Error('Method not implemented');
    }

    /**
     * Unblocks a client
     * @param {string} email
     * @param {string} barberiaId
     * @returns {Promise<ClienteStats>}
     */
    async desbloquear(email, barberiaId) {
        throw new Error('Method not implemented');
    }

    /**
     * Resets monthly cancellation counters for all clients
     * @returns {Promise<void>}
     */
    async resetMonthlyCancelaciones() {
        throw new Error('Method not implemented');
    }

    /**
     * Finds all blocked clients for a barberia
     * @param {string} barberiaId
     * @returns {Promise<ClienteStats[]>}
     */
    async findBloqueados(barberiaId) {
        throw new Error('Method not implemented');
    }

    /**
     * Finds all client stats for a barberia
     * @param {string} barberiaId
     * @param {Object} filters - Optional filters
     * @returns {Promise<ClienteStats[]>}
     */
    async findByBarberiaId(barberiaId, filters = {}) {
        throw new Error('Method not implemented');
    }

    /**
     * Counts client stats by barberia
     * @param {string} barberiaId
     * @param {Object} filters - Optional filters
     * @returns {Promise<number>}
     */
    async countByBarberiaId(barberiaId, filters = {}) {
        throw new Error('Method not implemented');
    }

    /**
     * Finds clients that should be automatically unblocked
     * @returns {Promise<ClienteStats[]>}
     */
    async findToUnblock() {
        throw new Error('Method not implemented');
    }
}

module.exports = IClienteStatsRepository;
