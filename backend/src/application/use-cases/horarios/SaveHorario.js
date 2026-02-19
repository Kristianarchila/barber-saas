const Horario = require('../../../domain/entities/Horario');

/**
 * SaveHorario Use Case
 * Creates or updates a barber's schedule for a specific day
 */
class SaveHorario {
    constructor(horarioRepository, barberoRepository) {
        this.horarioRepository = horarioRepository;
        this.barberoRepository = barberoRepository;
    }

    async execute(data, requester) {
        const { barberoId, diaSemana, horaInicio, horaFin, duracionTurno } = data;

        // 1. Verify barbero exists and belongs to the same barberia
        const barbero = await this.barberoRepository.findById(barberoId, requester.barberiaId);
        if (!barbero) {
            throw new Error('Barbero no encontrado');
        }

        if (
            requester.rol !== 'SUPER_ADMIN' &&
            barbero.barberiaId.toString() !== requester.barberiaId.toString()
        ) {
            throw new Error('No puedes modificar barberos de otra barbería');
        }

        // 2. Check if horario already exists for this day
        let horario = await this.horarioRepository.findByBarberoAndDay(barberoId, diaSemana);

        if (horario) {
            // Update existing
            horario.update({ horaInicio, horaFin, duracionTurno, activo: true });
            return await this.horarioRepository.update(horario.id, horario.toObject());
        } else {
            // Create new
            const newHorario = new Horario({
                barberoId,
                diaSemana,
                horaInicio,
                horaFin,
                duracionTurno,
                activo: true
            });
            return await this.horarioRepository.save(newHorario);
        }
    }
}

module.exports = SaveHorario;
