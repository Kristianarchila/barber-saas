/**
 * GetAgenda Use Case
 * Retrieves daily agenda for a barber
 */
class GetAgenda {
    constructor(barberoRepository, reservaRepository) {
        this.barberoRepository = barberoRepository;
        this.reservaRepository = reservaRepository;
    }

    async execute(usuarioId, fecha, barberiaId) {
        if (!fecha) {
            throw new Error('La fecha es obligatoria');
        }

        // 1. Find barbero by usuarioId - WITH barberiaId for tenant isolation
        const barbero = await this.barberoRepository.findByUsuarioId(usuarioId, barberiaId);
        if (!barbero) {
            throw new Error('Barbero no encontrado');
        }

        // 2. Get reservations for that day - WITH barberiaId for tenant isolation
        return await this.reservaRepository.findByBarberoAndDate(barbero.id, fecha, barberiaId);
    }
}

module.exports = GetAgenda;
