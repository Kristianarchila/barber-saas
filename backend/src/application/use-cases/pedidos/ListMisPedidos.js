/**
 * ListMisPedidos Use Case
 */
class ListMisPedidos {
    constructor(pedidoRepository, barberiaRepository) {
        this.pedidoRepository = pedidoRepository;
        this.barberiaRepository = barberiaRepository;
    }

    async execute(slug, userId, filtros = {}) {
        const barberia = await this.barberiaRepository.findBySlug(slug);
        if (!barberia) throw new Error('Barbería no encontrada');

        const limit = parseInt(filtros.limite) || 10;
        const page = parseInt(filtros.pagina) || 1;
        const skip = (page - 1) * limit;

        const repoFilters = {
            ...filtros,
            barberiaId: barberia.id,
            limite: limit,
            saltar: skip
        };

        const pedidos = await this.pedidoRepository.findByClienteId(userId, repoFilters);
        const total = await this.pedidoRepository.count({
            clienteId: userId,
            barberiaId: barberia.id,
            estado: filtros.estado
        });

        return {
            pedidos,
            paginacion: {
                total,
                pagina: page,
                limite: limit,
                totalPaginas: Math.ceil(total / limit)
            }
        };
    }
}

module.exports = ListMisPedidos;
