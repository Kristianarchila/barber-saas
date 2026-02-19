/**
 * CancelPedido Use Case
 */
class CancelPedido {
    constructor(pedidoRepository, productoRepository, barberiaRepository) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
        this.barberiaRepository = barberiaRepository;
    }

    async execute(slug, id, user) {
        const barberia = await this.barberiaRepository.findBySlug(slug);
        if (!barberia) throw new Error('Barbería no encontrada');

        const pedido = await this.pedidoRepository.findById(id);
        if (!pedido || pedido.barberiaId !== barberia.id) {
            throw new Error('Pedido no encontrado');
        }

        // 1. Permissions check
        const isOwner = pedido.clienteId === user.id;
        const isAdmin = user.rol === 'BARBERIA_ADMIN' && user.barberiaId === barberia.id;
        if (!isOwner && !isAdmin) throw new Error('No autorizado');

        // 2. State restriction
        if (!['pendiente', 'confirmado'].includes(pedido.estado)) {
            throw new Error('No se puede cancelar un pedido en este estado');
        }

        // 3. Update Order State
        pedido.cambiarEstado('cancelado');
        const updatedPedido = await this.pedidoRepository.update(id, {
            estado: pedido.estado,
            tracking: pedido.tracking
        });

        // 4. Restore Stock
        for (const item of pedido.items) {
            const updateData = {
                $inc: {
                    stock: item.cantidad,
                    'metadata.ventas': -item.cantidad
                }
            };
            await this.productoRepository.update(item.productoId, updateData);
        }

        return updatedPedido;
    }
}

module.exports = CancelPedido;
