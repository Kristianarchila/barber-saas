/**
 * GetMisCitas Use Case
 * Retrieves appointment history for a barber
 */
class GetMisCitas {
    constructor(barberoRepository, reservaRepository) {
        this.barberoRepository = barberoRepository;
        this.reservaRepository = reservaRepository;
    }

    async execute(usuarioId, barberiaId) {
        // 1. Find barbero by usuarioId - WITH barberiaId for tenant isolation
        const barbero = await this.barberoRepository.findByUsuarioId(usuarioId, barberiaId);
        if (!barbero) {
            throw new Error('Barbero no encontrado');
        }

        // 2. Get reservations - WITH barberiaId for tenant isolation
        return await this.reservaRepository.findByBarberoId(barbero.id, barberiaId);
    }
}

module.exports = GetMisCitas;
