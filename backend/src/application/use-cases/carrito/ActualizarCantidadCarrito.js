/**
 * ActualizarCantidadCarrito Use Case
 */
class ActualizarCantidadCarrito {
    constructor(carritoRepository, productoRepository) {
        this.carritoRepository = carritoRepository;
        this.productoRepository = productoRepository;
    }

    async execute(barberiaId, { clienteId, sessionId, productoId, cantidad }) {
        const carrito = await this.carritoRepository.findByClientOrSession(barberiaId, clienteId, sessionId);
        if (!carrito) throw new Error('Carrito no encontrado');

        const producto = await this.productoRepository.findById(productoId);
        if (!producto) throw new Error('Producto no encontrado');

        if (!producto.estaDisponible(cantidad)) {
            throw new Error('Stock insuficiente');
        }

        carrito.updateItemQuantity(productoId, cantidad);
        return await this.carritoRepository.save(carrito);
    }
}

module.exports = ActualizarCantidadCarrito;
