/**
 * UpdateStock Use Case
 */
class UpdateStock {
    constructor(productoRepository) {
        this.productoRepository = productoRepository;
    }

    async execute(id, barberiaId, cantidad) {
        const producto = await this.productoRepository.findById(id);

        if (!producto || producto.barberiaId !== barberiaId) {
            throw new Error('Producto no encontrado');
        }

        // Apply logic
        producto.actualizarStock(cantidad);

        // Persist
        return await this.productoRepository.update(id, { stock: producto.stock });
    }
}

module.exports = UpdateStock;
