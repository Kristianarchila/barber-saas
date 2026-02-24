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

        // Verify owner — findById already enforces barberiaId isolation (throws if mismatch)
        if (this.barberoRepository) {
            await this.barberoRepository.findById(horario.barberoId, authenticatedBarberiaId);
        }

        horario.toggle();
        return await this.horarioRepository.update(horarioId, { activo: horario.activo });
    }
}

module.exports = ToggleHorario;
