/**
 * ToggleHorario Use Case
 * Toggles the active status of a schedule
 */
class ToggleHorario {
    constructor(horarioRepository, barberoRepository) {
        this.horarioRepository = horarioRepository;
        this.barberoRepository = barberoRepository;
    }

    async execute(horarioId, authenticatedBarberiaId) {
        const horario = await this.horarioRepository.findById(horarioId);
        if (!horario) {
            throw new Error('Horario no encontrado');
        }

        // Verify owner if barberoRepository is available
        if (this.barberoRepository) {
            const barbero = await this.barberoRepository.findById(horario.barberoId);
            if (!barbero || (authenticatedBarberiaId && barbero.barberiaId !== authenticatedBarberiaId)) {
                throw new Error('No autorizado para modificar este horario');
            }
        }

        horario.toggle();
        return await this.horarioRepository.update(horarioId, { activo: horario.activo });
    }
}

module.exports = ToggleHorario;
