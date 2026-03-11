const Pedido = require('../../../domain/entities/Pedido');

/**
 * CreatePedido Use Case
 */
class CreatePedido {
    constructor(pedidoRepository, productoRepository, barberiaRepository, inventarioRepository) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
        this.barberiaRepository = barberiaRepository;
        this.inventarioRepository = inventarioRepository;
    }

    async execute(slug, data, user) {
        const { items, datosEntrega, metodoPago, tipoEntrega, notas } = data;

        // 1. Resolve barberia
        const barberia = await this.barberiaRepository.findBySlug(slug);
        if (!barberia) throw new Error('Barbería no encontrada');

        // 2. Process items, verify stock and calculate totals
        let subtotal = 0;
        const itemsProcesados = [];

        for (const item of items) {
            const producto = await this.productoRepository.findById(item.productoId);

            if (!producto || producto.barberiaId !== barberia.id) {
                throw new Error(`Producto ${item.productoId} no encontrado`);
            }

            if (!producto.estaDisponible(item.cantidad)) {
                throw new Error(`Stock insuficiente para ${producto.nombre}`);
            }

            const precioUnitario = producto.precioEfectivo;
            const subtotalItem = precioUnitario * item.cantidad;

            itemsProcesados.push({
                productoId: producto.id,
                nombre: producto.nombre,
                precio: precioUnitario,
                cantidad: item.cantidad,
                subtotal: subtotalItem,
                imagenUrl: producto.imagenes[0]
            });

            subtotal += subtotalItem;
        }

        // 3. Tax calculation (example: 10%)
        const impuestos = subtotal * 0.10;
        const total = subtotal + impuestos;

        // 4. Create Entity
        const pedido = new Pedido({
            barberiaId: barberia.id,
            clienteId: user?.id,
            items: itemsProcesados,
            subtotal,
            impuestos,
            total,
            metodoPago,
            datosEntrega,
            tipoEntrega,
            notas
        });

        // 5. Save Pedido
        const savedPedido = await this.pedidoRepository.save(pedido);

        // 6. Update Stock and Sales Metadata for each product using unified Inventory Logic
        for (const item of itemsProcesados) {
            try {
                await this.inventarioRepository.registrarMovimientoStock({
                    barberiaId: barberia.id,
                    productoId: item.productoId,
                    tipo: 'VENTA',
                    cantidad: item.cantidad,
                    motivo: 'PEDIDO_MARKETPLACE',
                    referenciaId: savedPedido.id,
                    usuarioId: user?.id || null
                });

                // Update sales metadata in product (stock is already updated by registrarMovimientoStock)
                await this.productoRepository.update(item.productoId, {
                    $inc: { 'metadata.ventas': item.cantidad }
                });
            } catch (error) {
                console.error(`❌ [CreatePedido] Error sincronizando stock para ${item.nombre}:`, error.message);
                // We don't throw here to avoid failing the order if stock update has a minor issue, 
                // but since registrarMovimientoStock is transactional, it's safer.
            }
        }

        return savedPedido;
    }
}

module.exports = CreatePedido;
