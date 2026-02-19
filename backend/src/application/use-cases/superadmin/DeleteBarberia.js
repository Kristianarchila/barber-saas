const TransactionManager = require('../../../utils/TransactionManager');

/**
 * DeleteBarberia Use Case
 * Soft deletes a barberia and deactivates all its users
 */
class DeleteBarberia {
    constructor(barberiaRepository, userRepository) {
        this.barberiaRepository = barberiaRepository;
        this.userRepository = userRepository;
    }

    async execute(barberiaId, currentUserId, confirmar = false) {
        // Require confirmation
        if (!confirmar) {
            throw new Error('Debes confirmar la eliminación enviando { confirmar: true }');
        }

        // Get barberia
        const barberia = await this.barberiaRepository.findById(barberiaId);
        if (!barberia) {
            throw new Error('Barbería no encontrada');
        }

        // Execute in transaction
        return await TransactionManager.executeInTransaction(
            async (session) => {
                // Suspend barberia using domain logic
                barberia.suspend();

                // Add history entry
                barberia.addHistoryEntry(
                    'eliminada',
                    currentUserId,
                    'Barbería suspendida desde panel SUPER_ADMIN'
                );

                // Save barberia changes
                const barberiaObj = barberia.toObject();
                await this.barberiaRepository.update(barberiaId, barberiaObj, session);

                // Deactivate all users
                await this.userRepository.updateMany(
                    { barberiaId },
                    { activo: false },
                    session
                );

                return {
                    message: 'Barbería suspendida exitosamente',
                    barberiaId,
                    nombre: barberia.nombre
                };
            },
            { operationName: 'DeleteBarberia' }
        );
    }
}

module.exports = DeleteBarberia;
