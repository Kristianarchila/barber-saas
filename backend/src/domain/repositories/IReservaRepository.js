/**
 * Interface for Reserva Repository
 * This defines the contract that any repository implementation must follow
 * Following the Dependency Inversion Principle (SOLID)
 */
class IReservaRepository {
    /**
     * Save a new reservation or update existing one
     * @param {Reserva} reserva - Domain entity
     * @returns {Promise<Reserva>}
     */
    async save(reserva) {
        throw new Error('Method save() not implemented');
    }

    /**
     * Find reservation by ID
     * @param {string} id
     * @param {string} barberiaId - Required for tenant isolation
     * @returns {Promise<Reserva|null>}
     */
    async findById(id, barberiaId) {
        throw new Error('Method findById() not implemented');
    }

    /**
     * Find reservations by barbero and date
     * @param {string} barberoId
     * @param {string} fecha - YYYY-MM-DD format
     * @returns {Promise<Reserva[]>}
     */
    async findByBarberoAndDate(barberoId, fecha) {
        throw new Error('Method findByBarberoAndDate() not implemented');
    }

    /**
     * Find reservations by barbero within a date range
     * @param {string} barberoId
     * @param {string} fechaInicio - YYYY-MM-DD format
     * @param {string} fechaFin - YYYY-MM-DD format
     * @param {string} barberiaId - For tenant isolation
     * @returns {Promise<Reserva[]>}
     */
    async findByBarberoAndDateRange(barberoId, fechaInicio, fechaFin, barberiaId) {
        throw new Error('Method findByBarberoAndDateRange() not implemented');
    }

    /**
     * Find reservations by barberoId
     * @param {string} barberoId
     * @param {Object} filters
     * @returns {Promise<Reserva[]>}
     */
    async findByBarberoId(barberoId, filters = {}) {
        throw new Error('Method findByBarberoId() not implemented');
    }

    /**
     * Find reservations by barberia with optional filters
     * @param {string} barberiaId
     * @param {Object} filters - Optional filters (estado, fecha, etc.)
     * @returns {Promise<Reserva[]>}
     */
    async findByBarberiaId(barberiaId, filters = {}) {
        throw new Error('Method findByBarberiaId() not implemented');
    }

    /**
     * Find reservation by cancel token
     * @param {string} token
     * @returns {Promise<Reserva|null>}
     */
    async findByCancelToken(token) {
        throw new Error('Method findByCancelToken() not implemented');
    }

    /**
     * Find reservation by review token
     * @param {string} token
     * @returns {Promise<Reserva|null>}
     */
    async findByReviewToken(token) {
        throw new Error('Method findByReviewToken() not implemented');
    }

    /**
     * Update reservation
     * @param {string} id
     * @param {Object} data
     * @returns {Promise<Reserva>}
     */
    async update(id, data) {
        throw new Error('Method update() not implemented');
    }

    /**
     * Delete reservation
     * @param {string} id
     * @returns {Promise<void>}
     */
    async delete(id) {
        throw new Error('Method delete() not implemented');
    }

    /**
     * Check if a time slot is available
     * @param {string} barberoId
     * @param {string} fecha
     * @param {string} hora
     * @param {string} horaFin
     * @param {string} excludeReservaId - Optional: exclude this reservation from check (for rescheduling)
     * @returns {Promise<boolean>}
     */
    async checkAvailability(barberoId, fecha, hora, horaFin, excludeReservaId = null) {
        throw new Error('Method checkAvailability() not implemented');
    }

    /**
     * Find reservations by client email
     * @param {string} email
     * @returns {Promise<Reserva[]>}
     */
    async findByClientEmail(email) {
        throw new Error('Method findByClientEmail() not implemented');
    }

    /**
     * Get reservations count for a barberia
     * @param {string} barberiaId
     * @param {Object} filters
     * @returns {Promise<number>}
     */
    async count(barberiaId, filters = {}) {
        throw new Error('Method count() not implemented');
    }

    /**
     * Get statistics for a barbero
     * @param {string} barberoId
     * @returns {Promise<Object>}
     */
    async getEstadisticasBarbero(barberoId, barberiaId) {
        throw new Error('Method getEstadisticasBarbero() not implemented');
    }
}

module.exports = IReservaRepository;
