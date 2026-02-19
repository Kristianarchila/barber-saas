/**
 * GetPedido Use Case
 */
class GetPedido {
    constructor(pedidoRepository, barberiaRepository) {
        this.pedidoRepository = pedidoRepository;
        this.barberiaRepository = barberiaRepository;
    }

    async execute(slug, id, user) {
        const barberia = await this.barberiaRepository.findBySlug(slug);
        if (!barberia) throw new Error('Barbería no encontrada');

        const pedido = await this.pedidoRepository.findById(id);

        if (!pedido || pedido.barberiaId !== barberia.id) {
            throw new Error('Pedido no encontrado');
        }

        // 🔐 Permissions check
        const isOwner = pedido.clienteId === user.id;
        const isAdmin = user.rol === 'BARBERIA_ADMIN' && user.barberiaId === barberia.id;

        if (!isOwner && !isAdmin) {
            throw new Error('No autorizado');
        }

        return pedido;
    }
}

module.exports = GetPedido;
