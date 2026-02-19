/**
 * IHorarioRepository Interface
 * Defines the contract for Horario persistence
 */
class IHorarioRepository {
    /**
     * Save horario
     * @param {Horario} horario
     * @returns {Promise<Horario>}
     */
    async save(horario) {
        throw new Error('Method not implemented');
    }

    /**
     * Find all horarios for a barbero
     * @param {string} barberoId
     * @returns {Promise<Horario[]>}
     */
    async findByBarberoId(barberoId) {
        throw new Error('Method not implemented');
    }

    /**
     * Find horario by ID
     * @param {string} id
     * @param {string} barberiaId - Required for tenant isolation
     * @returns {Promise<Horario|null>}
     */
    async findById(id, barberiaId) {
        throw new Error('Method not implemented');
    }

    /**
     * Find specific day horario for a barbero
     * @param {string} barberoId
     * @param {number} diaSemana
     * @returns {Promise<Horario|null>}
     */
    async findByBarberoAndDay(barberoId, diaSemana) {
        throw new Error('Method not implemented');
    }

    /**
     * Update horario
     * @param {string} id
     * @param {Object} data
     * @returns {Promise<Horario>}
     */
    async update(id, data) {
        throw new Error('Method not implemented');
    }

    /**
     * Delete horario
     * @param {string} id
     * @returns {Promise<void>}
     */
    async delete(id) {
        throw new Error('Method not implemented');
    }
}

module.exports = IHorarioRepository;
