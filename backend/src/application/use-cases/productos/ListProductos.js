/**
 * ListProductos Use Case
 */
class ListProductos {
    constructor(productoRepository, barberiaRepository) {
        this.productoRepository = productoRepository;
        this.barberiaRepository = barberiaRepository;
    }

    async execute(slug, filtros = {}) {
        // 1. Resolve barberiaId from slug
        const barberia = await this.barberiaRepository.findBySlug(slug);
        if (!barberia) throw new Error('Barbería no encontrada');

        // 2. Prepare filtering parameters
        const limit = parseInt(filtros.limite) || 20;
        const page = parseInt(filtros.pagina) || 1;
        const skip = (page - 1) * limit;

        const repoFilters = {
            ...filtros,
            limite: limit,
            saltar: skip
        };

        // 3. Fetch products and total count
        const products = await this.productoRepository.findByBarberiaId(barberia.id, repoFilters);
        const total = await this.productoRepository.count({
            barberiaId: barberia.id,
            categoria: filtros.categoria
        });

        return {
            productos: products,
            paginacion: {
                total,
                pagina: page,
                limite: limit,
                totalPaginas: Math.ceil(total / limit)
            }
        };
    }
}

module.exports = ListProductos;
