/**
 * ListTodosPedidos Use Case
 */
class ListTodosPedidos {
    constructor(pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    async execute(barberiaId, filtros = {}) {
        const limit = parseInt(filtros.limite) || 20;
        const page = parseInt(filtros.pagina) || 1;
        const skip = (page - 1) * limit;

        const repoFilters = {
            ...filtros,
            barberiaId,
            limite: limit,
            saltar: skip
        };

        const pedidos = await this.pedidoRepository.findAll(repoFilters);
        const total = await this.pedidoRepository.count({
            barberiaId,
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

module.exports = ListTodosPedidos;
