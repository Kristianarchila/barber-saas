/**
 * ExtendPaymentDeadline Use Case
 * Extends payment deadline for a barberia
 */
class ExtendPaymentDeadline {
    constructor(barberiaRepository) {
        this.barberiaRepository = barberiaRepository;
    }

    async execute(barberiaId, dias, currentUserId, notas = '') {
        // Validate days
        const diasNum = Number(dias);
        if (isNaN(diasNum) || diasNum <= 0) {
            throw new Error('Los días deben ser un número mayor a 0');
        }

        // Get barberia
        const barberia = await this.barberiaRepository.findById(barberiaId);
        if (!barberia) {
            throw new Error('Barbería no encontrada');
        }

        // Extend deadline using domain logic
        const nuevaFecha = barberia.extendPaymentDeadline(diasNum);

        // Add history entry
        const fechaFormateada = nuevaFecha.toISOString().split('T')[0];
        barberia.addHistoryEntry(
            'plazo_extendido',
            currentUserId,
            notas || `Plazo extendido ${diasNum} días hasta ${fechaFormateada}`
        );

        // Save changes
        const barberiaObj = barberia.toObject();
        const updated = await this.barberiaRepository.update(barberiaId, barberiaObj);

        return {
            barberia: updated,
            diasExtendidos: diasNum,
            nuevaFecha
        };
    }
}

module.exports = ExtendPaymentDeadline;
