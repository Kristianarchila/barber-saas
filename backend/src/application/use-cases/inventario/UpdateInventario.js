/**
 * UpdateInventario Use Case
 */
class UpdateInventario {
    constructor(inventarioRepository) {
        this.inventarioRepository = inventarioRepository;
    }

    async execute(id, barberiaId, data) {
        const item = await this.inventarioRepository.findById(id);
        if (!item || item.barberiaId !== barberiaId) {
            throw new Error('Inventario no encontrado');
        }

        // Apply updates
        const allowedFields = ['stockMinimo', 'stockMaximo', 'ubicacion', 'unidadMedida', 'activo'];
        const updateData = {};
        allowedFields.forEach(f => {
            if (data[f] !== undefined) updateData[f] = data[f];
        });

        return await this.inventarioRepository.update(id, updateData);
    }
}

module.exports = UpdateInventario;
