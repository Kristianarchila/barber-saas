/**
 * Interface: IBarberoRepository
 * 
 * Define el contrato que debe cumplir cualquier implementación
 * de repositorio de barberos.
 */
export class IBarberoRepository {
    /**
     * Obtener todos los barberos con filtros opcionales
     * @param {Object} filters - Filtros (activo, especialidad, etc.)
     * @returns {Promise<Barbero[]>}
     */
    async getAll(filters = {}) {
        throw new Error('Method getAll() must be implemented');
    }

    /**
     * Obtener un barbero por ID
     * @param {string} id - ID del barbero
     * @returns {Promise<Barbero>}
     */
    async getById(id) {
        throw new Error('Method getById() must be implemented');
    }

    /**
     * Obtener disponibilidad de un barbero
     * @param {string} id - ID del barbero
     * @param {string} fecha - Fecha en formato YYYY-MM-DD
     * @returns {Promise<Object>}
     */
    async getDisponibilidad(id, fecha) {
        throw new Error('Method getDisponibilidad() must be implemented');
    }

    /**
     * Crear un nuevo barbero
     * @param {Barbero} barbero - Entidad de barbero
     * @returns {Promise<Barbero>}
     */
    async create(barbero) {
        throw new Error('Method create() must be implemented');
    }

    /**
     * Actualizar un barbero existente
     * @param {string} id - ID del barbero
     * @param {Object} data - Datos a actualizar
     * @returns {Promise<Barbero>}
     */
    async update(id, data) {
        throw new Error('Method update() must be implemented');
    }

    /**
     * Eliminar un barbero
     * @param {string} id - ID del barbero
     * @returns {Promise<void>}
     */
    async delete(id) {
        throw new Error('Method delete() must be implemented');
    }

    /**
     * Activar/Desactivar un barbero
     * @param {string} id - ID del barbero
     * @param {boolean} activo - Estado activo
     * @returns {Promise<Barbero>}
     */
    async toggleStatus(id, activo) {
        throw new Error('Method toggleStatus() must be implemented');
    }
}
