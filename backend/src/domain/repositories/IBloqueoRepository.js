/**
 * @file IBloqueoRepository.js
 * @description Repository interface for Bloqueo entity
 * Defines the contract for data access operations
 */

class IBloqueoRepository {
    /**
     * Saves a new bloqueo
     * @param {Bloqueo} bloqueo
     * @returns {Promise<Bloqueo>}
     */
    async save(bloqueo) {
        throw new Error('Method not implemented');
    }

    /**
     * Finds a bloqueo by ID
     * @param {string} id
     * @param {string} barberiaId - For multi-tenant isolation
     * @returns {Promise<Bloqueo|null>}
     */
    async findById(id, barberiaId) {
        throw new Error('Method not implemented');
    }

    /**
     * Finds all bloqueos for a barberia
     * @param {string} barberiaId
     * @param {Object} filters - Optional filters (activo, tipo, barberoId)
     * @returns {Promise<Bloqueo[]>}
     */
    async findByBarberiaId(barberiaId, filters = {}) {
        throw new Error('Method not implemented');
    }

    /**
     * Finds bloqueos that affect a specific date range
     * @param {string} barberiaId
     * @param {Date} fechaInicio
     * @param {Date} fechaFin
     * @param {string} barberoId - Optional, filter by barbero
     * @returns {Promise<Bloqueo[]>}
     */
    async findByDateRange(barberiaId, fechaInicio, fechaFin, barberoId = null) {
        throw new Error('Method not implemented');
    }

    /**
     * Finds active bloqueos for a specific date
     * @param {string} barberiaId
     * @param {Date} fecha
     * @param {string} barberoId - Optional, filter by barbero
     * @returns {Promise<Bloqueo[]>}
     */
    async findActiveByDate(barberiaId, fecha, barberoId = null) {
        throw new Error('Method not implemented');
    }

    /**
     * Updates a bloqueo
     * @param {string} id
     * @param {Object} data
     * @param {string} barberiaId - For multi-tenant isolation
     * @returns {Promise<Bloqueo>}
     */
    async update(id, data, barberiaId) {
        throw new Error('Method not implemented');
    }

    /**
     * Deletes a bloqueo (soft delete by setting activo = false)
     * @param {string} id
     * @param {string} barberiaId - For multi-tenant isolation
     * @returns {Promise<void>}
     */
    async delete(id, barberiaId) {
        throw new Error('Method not implemented');
    }

    /**
     * Counts bloqueos by barberia
     * @param {string} barberiaId
     * @param {Object} filters - Optional filters
     * @returns {Promise<number>}
     */
    async countByBarberiaId(barberiaId, filters = {}) {
        throw new Error('Method not implemented');
    }
}

module.exports = IBloqueoRepository;
