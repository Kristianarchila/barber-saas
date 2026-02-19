/**
 * @file DeleteBloqueo.js
 * @description Use case for deleting (deactivating) a bloqueo
 */

class DeleteBloqueo {
    constructor(bloqueoRepository) {
        this.bloqueoRepository = bloqueoRepository;
    }

    /**
     * Deletes (deactivates) a bloqueo
     * @param {string} id
     * @param {string} barberiaId
     * @returns {Promise<void>}
     */
    async execute(id, barberiaId) {
        // Verify bloqueo exists and belongs to barberia
        const bloqueo = await this.bloqueoRepository.findById(id, barberiaId);

        if (!bloqueo) {
            throw new Error('Bloqueo no encontrado');
        }

        // Soft delete
        await this.bloqueoRepository.delete(id, barberiaId);
    }
}

module.exports = DeleteBloqueo;
