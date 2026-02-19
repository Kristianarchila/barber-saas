/**
 * ChangeBarberiaStatus Use Case
 * Changes barberia status (trial, activa, suspendida)
 */
class ChangeBarberiaStatus {
    constructor(barberiaRepository) {
        this.barberiaRepository = barberiaRepository;
    }

    async execute(barberiaId, nuevoEstado, currentUserId, notas = '') {
        // Validate estado
        const estadosValidos = ['trial', 'activa', 'suspendida'];
        if (!estadosValidos.includes(nuevoEstado)) {
            throw new Error('Estado inválido. Debe ser: trial, activa o suspendida');
        }

        // Get barberia
        const barberia = await this.barberiaRepository.findById(barberiaId);
        if (!barberia) {
            throw new Error('Barbería no encontrada');
        }

        const estadoAnterior = barberia.estado;

        // Apply status change using domain logic
        if (nuevoEstado === 'activa') {
            barberia.activate();
        } else if (nuevoEstado === 'suspendida') {
            barberia.suspend();
        } else {
            // Trial
            barberia.estado = 'trial';
            barberia.updatedAt = new Date();
        }

        // Add history entry
        barberia.addHistoryEntry(
            `${estadoAnterior} → ${nuevoEstado}`,
            currentUserId,
            notas || 'Cambio de estado manual desde panel SUPER_ADMIN'
        );

        // Save changes
        const barberiaObj = barberia.toObject();
        const updated = await this.barberiaRepository.update(barberiaId, barberiaObj);

        return updated;
    }
}

module.exports = ChangeBarberiaStatus;
