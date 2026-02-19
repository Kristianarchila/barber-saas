/**
 * Use Case: GetReservas
 * 
 * Caso de uso para obtener reservas con filtros opcionales.
 */
export class GetReservas {
    constructor(reservaRepository) {
        this.reservaRepository = reservaRepository;
    }

    /**
     * Ejecutar el caso de uso
     * @param {Object} filters - Filtros opcionales (fecha, barberoId, estado, etc.)
     * @returns {Promise<Reserva[]>}
     */
    async execute(filters = {}) {
        try {
            const reservas = await this.reservaRepository.getAll(filters);

            // Ordenar por fecha y hora (más recientes primero)
            return this.sortReservas(reservas);
        } catch (error) {
            console.error('Error en GetReservas:', error);
            throw error;
        }
    }

    /**
     * Ordenar reservas por fecha y hora
     */
    sortReservas(reservas) {
        return reservas.sort((a, b) => {
            const fechaA = new Date(`${a.fecha}T${a.hora}`);
            const fechaB = new Date(`${b.fecha}T${b.hora}`);
            return fechaB - fechaA; // Más recientes primero
        });
    }
}
