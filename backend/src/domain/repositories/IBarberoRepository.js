/**
 * IBarberoRepository Interface
 * Defines the contract for Barbero persistence
 */
class IBarberoRepository {
    /**
     * Save a barbero
     * @param {Barbero} barbero
     * @returns {Promise<Barbero>}
     */
    async save(barbero) {
        throw new Error('Method not implemented');
    }

    /**
     * Find barbero by ID
     * @param {string} id
     * @returns {Promise<Barbero|null>}
     */
    async findById(id) {
        throw new Error('Method not implemented');
    }

    /**
     * Find barbero by Usuario ID
     * @param {string} usuarioId
     * @param {string} barberiaId
     * @returns {Promise<Barbero|null>}
     */
    async findByUsuarioId(usuarioId, barberiaId) {
        throw new Error('Method not implemented');
    }

    /**
     * Find all barberos for a barberia
     * @param {string} barberiaId
     * @param {Object} options { onlyActive: boolean, populateUser: boolean }
     * @returns {Promise<Barbero[]>}
     */
    async findByBarberiaId(barberiaId, options = {}) {
        throw new Error('Method not implemented');
    }

    /**
     * Update a barbero
     * @param {string} id
     * @param {Object} data
     * @returns {Promise<Barbero>}
     */
    async update(id, data) {
        throw new Error('Method not implemented');
    }

    /**
     * Delete a barbero
     * @param {string} id
     * @returns {Promise<void>}
     */
    async delete(id) {
        throw new Error('Method not implemented');
    }
}

module.exports = IBarberoRepository;
