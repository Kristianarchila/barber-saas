import { NotFoundError } from '../../../shared/errors';

/**
 * Use Case: GetBarberoById
 * 
 * Caso de uso para obtener un barbero específico por ID.
 */
export class GetBarberoById {
    constructor(barberoRepository) {
        this.barberoRepository = barberoRepository;
    }

    /**
     * Ejecutar el caso de uso
     * @param {string} id - ID del barbero
     * @returns {Promise<Barbero>}
     */
    async execute(id) {
        try {
            if (!id) {
                throw new NotFoundError('Barbero', 'undefined');
            }

            const barbero = await this.barberoRepository.getById(id);

            if (!barbero) {
                throw new NotFoundError('Barbero', id);
            }

            return barbero;
        } catch (error) {
            console.error('Error en GetBarberoById:', error);
            throw error;
        }
    }
}
