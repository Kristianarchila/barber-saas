/**
 * VaciarCarrito Use Case
 */
class VaciarCarrito {
    constructor(carritoRepository) {
        this.carritoRepository = carritoRepository;
    }

    async execute(barberiaId, { clienteId, sessionId }) {
        const carrito = await this.carritoRepository.findByClientOrSession(barberiaId, clienteId, sessionId);
        if (!carrito) return;

        carrito.clear();
        await this.carritoRepository.save(carrito);
    }
}

module.exports = VaciarCarrito;
