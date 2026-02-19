const Producto = require('../../../domain/entities/Producto');

/**
 * CreateProducto Use Case
 */
class CreateProducto {
    constructor(productoRepository, barberiaRepository) {
        this.productoRepository = productoRepository;
        this.barberiaRepository = barberiaRepository;
    }

    async execute(slug, data, authenticatedBarberiaId) {
        // 1. Verify barberia
        const barberia = await this.barberiaRepository.findBySlug(slug);
        if (!barberia || barberia.id !== authenticatedBarberiaId) {
            throw new Error('Barbería no encontrada o no autorizada');
        }

        // 2. Create Entity
        const producto = new Producto({
            ...data,
            barberiaId: barberia.id
        });

        // 3. Save
        return await this.productoRepository.save(producto);
    }
}

module.exports = CreateProducto;
