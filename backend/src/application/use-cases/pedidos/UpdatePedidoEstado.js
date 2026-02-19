/**
 * UpdatePedidoEstado Use Case
 */
class UpdatePedidoEstado {
    constructor(pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    async execute(id, barberiaId, nuevoEstado) {
        // 1. Fetch current entity
        const pedido = await this.pedidoRepository.findById(id);

        if (!pedido || pedido.barberiaId !== barberiaId) {
            throw new Error('Pedido no encontrado');
        }

        // 2. Apply state logic (validates transitions)
        pedido.cambiarEstado(nuevoEstado);

        // 3. Persist
        return await this.pedidoRepository.update(id, {
            estado: pedido.estado,
            tracking: pedido.tracking
        });
    }
}

module.exports = UpdatePedidoEstado;
