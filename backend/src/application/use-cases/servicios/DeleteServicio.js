/**
 * Delete Servicio Use Case
 */
class DeleteServicio {
    constructor(servicioRepository, reservaRepository) {
        this.servicioRepository = servicioRepository;
        this.reservaRepository = reservaRepository;
    }

    /**
     * Execute the use case
     * @param {string} servicioId
     * @param {string} barberiaId - For authorization
     * @param {boolean} force - Force delete even with reservations
     * @returns {Promise<void>}
     */
    async execute(servicioId, barberiaId, force = false) {
        // 1. Find the service
        const servicio = await this.servicioRepository.findById(servicioId);

        if (!servicio) {
            throw new Error('Servicio no encontrado');
        }

        // 2. Validate ownership
        if (servicio.barberiaId !== barberiaId) {
            throw new Error('No tienes permisos para eliminar este servicio');
        }

        // 3. Check if service has active reservations
        if (!force) {
            const activeReservations = await this.reservaRepository.findByBarberiaId(barberiaId, {
                servicioId: servicioId,
                estado: 'RESERVADA'
            });

            if (activeReservations.length > 0) {
                throw new Error('No se puede eliminar un servicio con reservas activas. Desactívalo en su lugar.');
            }
        }

        // 4. Delete
        await this.servicioRepository.delete(servicioId);
    }
}

module.exports = DeleteServicio;
