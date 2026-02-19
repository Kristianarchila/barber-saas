/**
 * GetEstadisticasBarbero Use Case
 * Retrieves statistics for a barber's dashboard
 */
class GetEstadisticasBarbero {
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

        // 2. Get stats from repository - WITH barberiaId for tenant isolation
        return await this.reservaRepository.getEstadisticasBarbero(barbero.id, barbero.barberiaId);
    }
}

module.exports = GetEstadisticasBarbero;
