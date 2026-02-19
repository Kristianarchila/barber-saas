/**
 * GetPedidoStats Use Case
 */
class GetPedidoStats {
    constructor(pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    async execute(barberiaId, fechaInicio, fechaFin) {
        // Default to last 30 days if not provided
        const start = fechaInicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = fechaFin || new Date();

        return await this.pedidoRepository.getEstadisticas(barberiaId, start, end);
    }
}

module.exports = GetPedidoStats;
