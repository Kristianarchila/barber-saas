/**
 * GetProductoById Use Case
 */
class GetProductoById {
    constructor(productoRepository, barberiaRepository) {
        this.productoRepository = productoRepository;
        this.barberiaRepository = barberiaRepository;
    }

    async execute(slug, id) {
        const barberia = await this.barberiaRepository.findBySlug(slug);
        if (!barberia) throw new Error('Barbería no encontrada');

        const producto = await this.productoRepository.findById(id);

        if (!producto || producto.barberiaId !== barberia.id) {
            throw new Error('Producto no encontrado');
        }

        return producto;
    }
}

module.exports = GetProductoById;
