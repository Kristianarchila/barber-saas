const Carrito = require('../../../domain/entities/Carrito');

/**
 * ObtenerCarrito Use Case
 */
class ObtenerCarrito {
    constructor(carritoRepository, productoRepository) {
        this.carritoRepository = carritoRepository;
        this.productoRepository = productoRepository;
    }

    async execute(barberiaId, clienteId, sessionId) {
        let carrito = await this.carritoRepository.findByClientOrSession(barberiaId, clienteId, sessionId);

        if (!carrito) {
            carrito = new Carrito({ barberiaId, clienteId, sessionId });
            carrito = await this.carritoRepository.save(carrito);
        }

        // Verify items availability and stock
        let modified = false;
        const validItems = [];

        for (const item of carrito.items) {
            const producto = await this.productoRepository.findById(item.productoId);

            if (!producto || !producto.activo) {
                modified = true;
                continue;
            }

            if (producto.stock < item.cantidad) {
                item.cantidad = producto.stock;
                modified = true;
            }

            if (producto.stock > 0) {
                // Populate name and images for display
                item.nombre = producto.nombre;
                item.imagen = producto.imagenes?.[0] || '';
                item.precio = producto.precioEfectivo;
                validItems.push(item);
            } else {
                modified = true;
            }
        }

        if (modified) {
            carrito.items = validItems;
            carrito.recalculateTotals();
            await this.carritoRepository.save(carrito);
        }

        return carrito;
    }
}

module.exports = ObtenerCarrito;
