/**
 * DeleteInventarioUseCase
 * Removes an inventory item, scoped to the barbería that owns it.
 * Replaces the direct model access that was in inventario.controller.js.
 */
class DeleteInventarioUseCase {
    constructor(inventarioRepository) {
        this.inventarioRepository = inventarioRepository;
    }

    /**
     * @param {string} id         Inventario document _id
     * @param {string} barberiaId ObjectId string of the barbería (from req.user.barberiaId)
     * @throws {Error} if not found or barberiaId mismatch
     */
    async execute(id, barberiaId) {
        if (!id) throw new Error('ID de inventario requerido');
        if (!barberiaId) throw new Error('barberiaId requerido para eliminar');

        // Repository scopes the delete to the barbería — no cross-tenant leak
        await this.inventarioRepository.delete(id, barberiaId);
    }
}

module.exports = DeleteInventarioUseCase;
