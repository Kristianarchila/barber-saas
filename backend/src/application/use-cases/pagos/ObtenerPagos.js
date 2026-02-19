/**
 * ObtenerPagos Use Case
 */
class ObtenerPagos {
    constructor(pagoRepository) {
        this.pagoRepository = pagoRepository;
    }

    async execute(barberiaId, filtros = {}) {
        let pagos = await this.pagoRepository.findAll({
            barberiaId,
            ...filtros
        });

        if (filtros.metodoPago) {
            pagos = pagos.filter(p =>
                p.detallesPago.some(d => d.metodoPago === filtros.metodoPago)
            );
        }

        return pagos;
    }
}

module.exports = ObtenerPagos;
