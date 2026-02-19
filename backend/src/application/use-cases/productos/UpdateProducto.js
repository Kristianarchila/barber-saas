/**
 * UpdateProducto Use Case
 */
class UpdateProducto {
    constructor(productoRepository) {
        this.productoRepository = productoRepository;
    }

    async execute(id, barberiaId, data) {
        // 1. Fetch current entity
        const producto = await this.productoRepository.findById(id);

        if (!producto || producto.barberiaId !== barberiaId) {
            throw new Error('Producto no encontrado');
        }

        // 2. Apply updates through entity method (logic)
        producto.update(data);

        // 3. Persist
        return await this.productoRepository.update(id, producto.toObject());
    }
}

module.exports = UpdateProducto;
