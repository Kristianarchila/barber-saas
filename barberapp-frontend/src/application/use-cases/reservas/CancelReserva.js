import { BusinessRuleError, NotFoundError } from '../../../shared/errors';

/**
 * Use Case: CancelReserva
 * 
 * Caso de uso para cancelar una reserva existente.
 */
export class CancelReserva {
    constructor(reservaRepository) {
        this.reservaRepository = reservaRepository;
    }

    /**
     * Ejecutar el caso de uso
     * @param {string} id - ID de la reserva a cancelar
     * @returns {Promise<Reserva>}
     */
    async execute(id) {
        try {
            // 1. Obtener la reserva
            const reserva = await this.reservaRepository.getById(id);

            if (!reserva) {
                throw new NotFoundError('Reserva', id);
            }

            // 2. Validar que puede ser cancelada
            if (!reserva.puedeSerCancelada()) {
                throw new BusinessRuleError(
                    `No se puede cancelar una reserva en estado ${reserva.estado}`,
                    'ESTADO_INVALIDO'
                );
            }

            // 3. Cancelar la reserva
            const reservaCancelada = await this.reservaRepository.cancel(id);

            return reservaCancelada;
        } catch (error) {
            console.error('Error en CancelReserva:', error);
            throw error;
        }
    }
}
