/**
 * DeleteProducto Use Case
 */
class DeleteProducto {
    constructor(productoRepository) {
        this.productoRepository = productoRepository;
    }

    async execute(id, barberiaId) {
        const producto = await this.productoRepository.findById(id);

        if (!producto || producto.barberiaId !== barberiaId) {
            throw new Error('Producto no encontrado');
        }

        producto.desactivar();

        await this.productoRepository.update(id, { activo: false });
        return { success: true };
    }
}

module.exports = DeleteProducto;
