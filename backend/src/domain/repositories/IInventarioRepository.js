/**
 * IInventarioRepository Interface
 */
class IInventarioRepository {
    async findByBarberiaId(barberiaId, filtros) { throw new Error('Method not implemented'); }
    async findById(id) { throw new Error('Method not implemented'); }
    async findByProductoId(productoId, barberiaId) { throw new Error('Method not implemented'); }
    async save(inventario) { throw new Error('Method not implemented'); }
    async update(id, data) { throw new Error('Method not implemented'); }
}

module.exports = IInventarioRepository;
