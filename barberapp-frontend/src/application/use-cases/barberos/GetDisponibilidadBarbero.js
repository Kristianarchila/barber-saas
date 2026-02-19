import { ValidationError } from '../../../shared/errors';

/**
 * Use Case: GetDisponibilidadBarbero
 * 
 * Caso de uso para obtener la disponibilidad de un barbero en una fecha.
 */
export class GetDisponibilidadBarbero {
    constructor(barberoRepository) {
        this.barberoRepository = barberoRepository;
    }

    /**
     * Ejecutar el caso de uso
     * @param {string} barberoId - ID del barbero
     * @param {string} fecha - Fecha en formato YYYY-MM-DD
     * @returns {Promise<Object>}
     */
    async execute(barberoId, fecha) {
        try {
            // Validar parámetros
            if (!barberoId) {
                throw new ValidationError('El ID del barbero es obligatorio', 'barberoId');
            }

            if (!fecha) {
                throw new ValidationError('La fecha es obligatoria', 'fecha');
            }

            // Validar formato de fecha
            if (!this.isValidDate(fecha)) {
                throw new ValidationError('Formato de fecha inválido (use YYYY-MM-DD)', 'fecha');
            }

            // Obtener disponibilidad
            const disponibilidad = await this.barberoRepository.getDisponibilidad(barberoId, fecha);

            return disponibilidad;
        } catch (error) {
            console.error('Error en GetDisponibilidadBarbero:', error);
            throw error;
        }
    }

    /**
     * Validar formato de fecha YYYY-MM-DD
     */
    isValidDate(dateString) {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(dateString)) return false;

        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }
}
