/**
 * GetInventarioItem Use Case
 */
class GetInventarioItem {
    constructor(inventarioRepository) {
        this.inventarioRepository = inventarioRepository;
    }

    async execute(id, barberiaId) {
        const item = await this.inventarioRepository.findById(id);
        if (!item || item.barberiaId !== barberiaId) {
            throw new Error('Item de inventario no encontrado');
        }
        return item;
    }
}

module.exports = GetInventarioItem;
