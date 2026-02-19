/**
 * GetAgendaBarberoRange Use Case
 * Retrieves barber's agenda for a date range (weekly/monthly views)
 */
class GetAgendaBarberoRange {
    constructor(barberoRepository, reservaRepository) {
        this.barberoRepository = barberoRepository;
        this.reservaRepository = reservaRepository;
    }

    async execute(usuarioId, fechaInicio, fechaFin, barberiaId) {
        // 1. Find barbero by usuarioId - WITH barberiaId for tenant isolation
        const barbero = await this.barberoRepository.findByUsuarioId(usuarioId, barberiaId);
        if (!barbero) {
            throw new Error('Barbero no encontrado');
        }

        // 2. Get reservations for date range - WITH barberiaId for tenant isolation
        return await this.reservaRepository.findByBarberoAndDateRange(
            barbero.id,
            fechaInicio,
            fechaFin,
            barbero.barberiaId
        );
    }
}

module.exports = GetAgendaBarberoRange;
