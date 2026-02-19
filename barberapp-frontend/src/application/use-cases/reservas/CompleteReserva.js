import { BusinessRuleError, NotFoundError } from '../../../shared/errors';

/**
 * Use Case: CompleteReserva
 * 
 * Caso de uso para completar una reserva (marcarla como completada).
 */
export class CompleteReserva {
    constructor(reservaRepository) {
        this.reservaRepository = reservaRepository;
    }

    /**
     * Ejecutar el caso de uso
     * @param {string} id - ID de la reserva a completar
     * @returns {Promise<Reserva>}
     */
    async execute(id) {
        try {
            // 1. Obtener la reserva
            const reserva = await this.reservaRepository.getById(id);

            if (!reserva) {
                throw new NotFoundError('Reserva', id);
            }

            // 2. Validar que puede ser completada
            if (!reserva.puedeSerCompletada()) {
                throw new BusinessRuleError(
                    `No se puede completar una reserva en estado ${reserva.estado}`,
                    'ESTADO_INVALIDO'
                );
            }

            // 3. Completar la reserva
            const reservaCompletada = await this.reservaRepository.complete(id);

            return reservaCompletada;
        } catch (error) {
            console.error('Error en CompleteReserva:', error);
            throw error;
        }
    }
}
