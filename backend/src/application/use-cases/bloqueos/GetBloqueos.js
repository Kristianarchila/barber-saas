/**
 * @file GetBloqueos.js
 * @description Use case for retrieving bloqueos
 */

class GetBloqueos {
    constructor(bloqueoRepository) {
        this.bloqueoRepository = bloqueoRepository;
    }

    /**
     * Gets all bloqueos for a barberia
     * @param {string} barberiaId
     * @param {Object} filters - Optional filters
     * @returns {Promise<Bloqueo[]>}
     */
    async execute(barberiaId, filters = {}) {
        return await this.bloqueoRepository.findByBarberiaId(barberiaId, filters);
    }

    /**
     * Gets bloqueos for a specific date range
     * @param {string} barberiaId
     * @param {Date} fechaInicio
     * @param {Date} fechaFin
     * @param {string} barberoId - Optional
     * @returns {Promise<Bloqueo[]>}
     */
    async getByDateRange(barberiaId, fechaInicio, fechaFin, barberoId = null) {
        return await this.bloqueoRepository.findByDateRange(
            barberiaId,
            fechaInicio,
            fechaFin,
            barberoId
        );
    }

    /**
     * Gets active bloqueos for a specific date
     * @param {string} barberiaId
     * @param {Date} fecha
     * @param {string} barberoId - Optional
     * @returns {Promise<Bloqueo[]>}
     */
    async getByDate(barberiaId, fecha, barberoId = null) {
        return await this.bloqueoRepository.findActiveByDate(barberiaId, fecha, barberoId);
    }
}

module.exports = GetBloqueos;
