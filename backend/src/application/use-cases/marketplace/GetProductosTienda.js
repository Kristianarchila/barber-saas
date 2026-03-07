/**
 * GetProductosTiendaUseCase
 * Returns public marketplace products for a barbería.
 * Validates that the barbería's marketplace is active and scopes
 * the product query strictly to that barbería's _id.
 */
class GetProductosTiendaUseCase {
    /**
     * @param {object} barberiaRepository  IBarberiaRepository
     * @param {object} productoRepository  IProductoRepository
     */
    constructor(barberiaRepository, productoRepository) {
        this.barberiaRepository = barberiaRepository;
        this.productoRepository = productoRepository;
    }

    /**
     * @param {string} slug      Barbería slug from URL
     * @param {object} filtros   { categoria?, destacado? }
     * @returns {{ marketplace, productos, categorias }}
     */
    async execute(slug, filtros = {}) {
        // 1. Find barbería by slug (repository returns domain entity or null)
        const barberia = await this.barberiaRepository.findBySlug(slug);
        if (!barberia) {
            const err = new Error('Barbería no encontrada');
            err.statusCode = 404;
            throw err;
        }

        // 2. Guard: marketplace must be active (reads from domain entity)
        const marketplace = barberia.marketplace || {};
        if (!marketplace.activo) {
            const err = new Error('La tienda de esta barbería no está disponible');
            err.statusCode = 404;
            throw err;
        }

        // 3. Fetch products scoped by barberiaId + disponibleEnTienda
        const queryFiltros = {
            disponibleEnTienda: true,
            ...(filtros.categoria ? { categoria: filtros.categoria } : {}),
            ...(filtros.destacado === 'true' ? { destacado: true } : {}),
            limite: 100,
        };

        const productos = await this.productoRepository.findByBarberiaId(
            barberia.id,
            queryFiltros
        );

        return {
            marketplace,
            productos: productos.map(p => p.toObject ? p.toObject() : p),
            categorias: marketplace.categorias || [],
        };
    }
}

module.exports = GetProductosTiendaUseCase;
