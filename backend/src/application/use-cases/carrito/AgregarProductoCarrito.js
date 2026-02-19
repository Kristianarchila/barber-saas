/**
 * AgregarProductoCarrito Use Case
 */
class AgregarProductoCarrito {
    constructor(carritoRepository, productoRepository) {
        this.carritoRepository = carritoRepository;
        this.productoRepository = productoRepository;
    }

    async execute(barberiaId, { clienteId, sessionId, productoId, cantidad }) {
        // 1. Validate Product
        const producto = await this.productoRepository.findById(productoId);
        if (!producto || producto.barberiaId !== barberiaId) {
            throw new Error('Producto no encontrado');
        }

        if (!producto.estaDisponible(cantidad)) {
            throw new Error('Stock insuficiente');
        }

        // 2. Get or Create Cart
        let carrito = await this.carritoRepository.findByClientOrSession(barberiaId, clienteId, sessionId);
        if (!carrito) {
            const Carrito = require('../../../domain/entities/Carrito');
            carrito = new Carrito({ barberiaId, clienteId, sessionId });
        }

        // 3. Add Item
        carrito.addItem(producto, cantidad);

        // 4. Save
        return await this.carritoRepository.save(carrito);
    }
}

module.exports = AgregarProductoCarrito;
