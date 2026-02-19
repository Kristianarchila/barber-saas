/**
 * Interface for Cliente Repository
 */
class IClienteRepository {
    /**
     * Save a new client or update existing one
     * @param {Cliente} cliente
     * @returns {Promise<Cliente>}
     */
    async save(cliente) {
        throw new Error('Method save() not implemented');
    }

    /**
     * Find client by ID
     * @param {string} id
     * @param {string} barberiaId - Required for tenant isolation
     * @returns {Promise<Cliente|null>}
     */
    async findById(id, barberiaId) {
        throw new Error('Method findById() not implemented');
    }

    /**
     * Find client by email
     * @param {string} email
     * @param {string} barberiaId
     * @returns {Promise<Cliente|null>}
     */
    async findByEmail(email, barberiaId) {
        throw new Error('Method findByEmail() not implemented');
    }

    /**
     * Find all clients by barberia
     * @param {string} barberiaId
     * @param {Object} filters
     * @returns {Promise<Cliente[]>}
     */
    async findByBarberiaId(barberiaId, filters = {}) {
        throw new Error('Method findByBarberiaId() not implemented');
    }

    /**
     * Update client
     * @param {string} id
     * @param {Object} data
     * @returns {Promise<Cliente>}
     */
    async update(id, data) {
        throw new Error('Method update() not implemented');
    }

    /**
     * Delete client
     * @param {string} id
     * @returns {Promise<void>}
     */
    async delete(id) {
        throw new Error('Method delete() not implemented');
    }

    /**
     * Search clients by name or email
     * @param {string} barberiaId
     * @param {string} searchTerm
     * @returns {Promise<Cliente[]>}
     */
    async search(barberiaId, searchTerm) {
        throw new Error('Method search() not implemented');
    }
}

module.exports = IClienteRepository;
