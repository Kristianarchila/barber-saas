/**
 * GetMovimientos Use Case
 */
class GetMovimientos {
    constructor(movimientoRepository) {
        this.movimientoRepository = movimientoRepository;
    }

    async execute(barberiaId, filtros = {}) {
        const limit = parseInt(filtros.limit) || 50;
        const page = parseInt(filtros.page) || 1;
        const skip = (page - 1) * limit;

        const repoFilters = {
            ...filtros,
            barberiaId,
            limite: limit,
            saltar: skip
        };

        const movimientos = await this.movimientoRepository.findAll(repoFilters);
        const total = await this.movimientoRepository.count({ barberiaId, ...filtros });

        return {
            movimientos,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        };
    }
}

module.exports = GetMovimientos;
