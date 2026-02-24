/**
 * DeleteHorario Use Case
 * Deletes a barber's schedule — multi-tenant isolation enforced
 */
class DeleteHorario {
    constructor(horarioRepository, barberoRepository) {
        this.horarioRepository = horarioRepository;
        this.barberoRepository = barberoRepository;
    }

    async execute(horarioId, barberiaId) {
        if (!barberiaId) {
            throw new Error('barberiaId es requerido');
        }

        // 1. Find the horario
        const horario = await this.horarioRepository.findById(horarioId);
        if (!horario) {
            throw new Error('Horario no encontrado');
        }

        // 2. Tenant isolation: verify barbero belongs to the authenticated barberia
        await this.barberoRepository.findById(horario.barberoId, barberiaId);

        // 3. Delete
        await this.horarioRepository.delete(horarioId);
    }
}

module.exports = DeleteHorario;
