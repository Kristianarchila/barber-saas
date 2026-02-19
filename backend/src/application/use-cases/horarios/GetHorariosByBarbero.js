/**
 * GetHorariosByBarbero Use Case
 * Retrieves all schedules for a specific barber
 */
class GetHorariosByBarbero {
    constructor(horarioRepository, barberoRepository) {
        this.horarioRepository = horarioRepository;
        this.barberoRepository = barberoRepository;
    }

    async execute(barberoId, authenticatedBarberiaId) {
        // 1. Verify owner
        const barbero = await this.barberoRepository.findById(barberoId, authenticatedBarberiaId);
        if (!barbero || (authenticatedBarberiaId && barbero.barberiaId.toString() !== authenticatedBarberiaId.toString())) {
            throw new Error('Barbero no encontrado o no autorizado');
        }


        return await this.horarioRepository.findByBarberoId(barberoId);
    }
}

module.exports = GetHorariosByBarbero;
