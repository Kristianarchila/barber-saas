/**
 * IProductoRepository Interface
 */
class IProductoRepository {
    async save(producto) { throw new Error('Method not implemented'); }
    async findById(id) { throw new Error('Method not implemented'); }
    async findAll(filtros) { throw new Error('Method not implemented'); }
    async findByBarberiaId(barberiaId, filtros) { throw new Error('Method not implemented'); }
    async count(filtros) { throw new Error('Method not implemented'); }
    async update(id, data) { throw new Error('Method not implemented'); }
    async delete(id) { throw new Error('Method not implemented'); }
}

module.exports = IProductoRepository;
