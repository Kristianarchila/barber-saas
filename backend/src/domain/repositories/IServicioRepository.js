/**
 * Interface for Servicio Repository
 */
class IServicioRepository {
    /**
     * Save a new service or update existing one
     * @param {Servicio} servicio
     * @returns {Promise<Servicio>}
     */
    async save(servicio) {
        throw new Error('Method save() not implemented');
    }

    /**
     * Find service by ID
     * @param {string} id
     * @param {string} barberiaId - Required for tenant isolation
     * @returns {Promise<Servicio|null>}
     */
    async findById(id, barberiaId) {
        throw new Error('Method findById() not implemented');
    }

    /**
     * Find all services by barberia
     * @param {string} barberiaId
     * @param {boolean} onlyActive - Filter only active services
     * @returns {Promise<Servicio[]>}
     */
    async findByBarberiaId(barberiaId, onlyActive = false) {
        throw new Error('Method findByBarberiaId() not implemented');
    }

    /**
     * Update service
     * @param {string} id
     * @param {Object} data
     * @returns {Promise<Servicio>}
     */
    async update(id, data) {
        throw new Error('Method update() not implemented');
    }

    /**
     * Delete service
     * @param {string} id
     * @returns {Promise<void>}
     */
    async delete(id) {
        throw new Error('Method delete() not implemented');
    }

    /**
     * Check if service exists
     * @param {string} id
     * @returns {Promise<boolean>}
     */
    async exists(id) {
        throw new Error('Method exists() not implemented');
    }
}

module.exports = IServicioRepository;
