/**
 * CancelPedido Use Case
 */
class CancelPedido {
    constructor(pedidoRepository, productoRepository, barberiaRepository, inventarioRepository) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
        this.barberiaRepository = barberiaRepository;
        this.inventarioRepository = inventarioRepository;
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

        // 4. Restore Stock using unified Inventory Logic
        for (const item of pedido.items) {
            try {
                await this.inventarioRepository.registrarMovimientoStock({
                    barberiaId: barberia.id,
                    productoId: item.productoId,
                    tipo: 'DEVOLUCION',
                    cantidad: item.cantidad,
                    motivo: 'CANCELACION_PEDIDO',
                    referenciaId: pedido.id,
                    usuarioId: user.id
                });

                // Update sales metadata in product (stock is already updated by registrarMovimientoStock)
                await this.productoRepository.update(item.productoId, {
                    $inc: { 'metadata.ventas': -item.cantidad }
                });
            } catch (error) {
                console.error(`❌ [CancelPedido] Error restaurando stock para ${item.productoId}:`, error.message);
            }
        }

        return updatedPedido;
    }
}

module.exports = CancelPedido;
