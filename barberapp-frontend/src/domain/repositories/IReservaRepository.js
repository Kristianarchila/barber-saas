/**
 * Interface: IReservaRepository
 * 
 * Define el contrato que debe cumplir cualquier implementación
 * de repositorio de reservas.
 * 
 * Esta interface pertenece al dominio y NO debe depender de
 * detalles de implementación (HTTP, localStorage, etc.)
 */
export class IReservaRepository {
    /**
     * Obtener todas las reservas con filtros opcionales
     * @param {Object} filters - Filtros (fecha, barberoId, estado, etc.)
     * @returns {Promise<Reserva[]>}
     */
    async getAll(filters = {}) {
        throw new Error('Method getAll() must be implemented');
    }

    /**
     * Obtener una reserva por ID
     * @param {string} id - ID de la reserva
     * @returns {Promise<Reserva>}
     */
    async getById(id) {
        throw new Error('Method getById() must be implemented');
    }

    /**
     * Crear una nueva reserva
     * @param {Reserva} reserva - Entidad de reserva
     * @returns {Promise<Reserva>}
     */
    async create(reserva) {
        throw new Error('Method create() must be implemented');
    }

    /**
     * Actualizar una reserva existente
     * @param {string} id - ID de la reserva
     * @param {Object} data - Datos a actualizar
     * @returns {Promise<Reserva>}
     */
    async update(id, data) {
        throw new Error('Method update() must be implemented');
    }

    /**
     * Cancelar una reserva
     * @param {string} id - ID de la reserva
     * @returns {Promise<Reserva>}
     */
    async cancel(id) {
        throw new Error('Method cancel() must be implemented');
    }

    /**
     * Completar una reserva
     * @param {string} id - ID de la reserva
     * @returns {Promise<Reserva>}
     */
    async complete(id) {
        throw new Error('Method complete() must be implemented');
    }

    /**
     * Eliminar una reserva
     * @param {string} id - ID de la reserva
     * @returns {Promise<void>}
     */
    async delete(id) {
        throw new Error('Method delete() must be implemented');
    }
}
