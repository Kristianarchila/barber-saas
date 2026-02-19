/**
 * RemoverProductoCarrito Use Case
 */
class RemoverProductoCarrito {
    constructor(carritoRepository) {
        this.carritoRepository = carritoRepository;
    }

    async execute(barberiaId, { clienteId, sessionId, productoId }) {
        const carrito = await this.carritoRepository.findByClientOrSession(barberiaId, clienteId, sessionId);
        if (!carrito) throw new Error('Carrito no encontrado');

        carrito.removeItem(productoId);
        return await this.carritoRepository.save(carrito);
    }
}

module.exports = RemoverProductoCarrito;
