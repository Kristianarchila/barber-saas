/**
 * ICarritoRepository Interface
 */
class ICarritoRepository {
    async findByClientOrSession(barberiaId, clienteId, sessionId) { throw new Error('Method not implemented'); }
    async findById(id) { throw new Error('Method not implemented'); }
    async save(carrito) { throw new Error('Method not implemented'); }
    async delete(id) { throw new Error('Method not implemented'); }
}

module.exports = ICarritoRepository;
