/**
 * MigrarCarrito Use Case
 */
class MigrarCarrito {
    constructor(carritoRepository, productoRepository) {
        this.carritoRepository = carritoRepository;
        this.productoRepository = productoRepository;
    }

    async execute(barberiaId, sessionId, clienteId) {
        // 1. Find session cart
        const sessionCarrito = await this.carritoRepository.findByClientOrSession(barberiaId, null, sessionId);
        if (!sessionCarrito || sessionCarrito.items.length === 0) return null;

        // 2. Find or Create user cart
        let userCarrito = await this.carritoRepository.findByClientOrSession(barberiaId, clienteId, null);
        if (!userCarrito) {
            const Carrito = require('../../../domain/entities/Carrito');
            userCarrito = new Carrito({ barberiaId, clienteId });
        }

        // 3. Merge items
        for (const item of sessionCarrito.items) {
            const producto = await this.productoRepository.findById(item.productoId);
            if (producto && producto.activo) {
                userCarrito.addItem(producto, item.cantidad);
            }
        }

        // 4. Save user cart and Delete session cart
        const saved = await this.carritoRepository.save(userCarrito);
        await this.carritoRepository.delete(sessionCarrito.id);

        return saved;
    }
}

module.exports = MigrarCarrito;
