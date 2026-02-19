/**
 * IVentaRepository Interface
 */
class IVentaRepository {
    async save(venta) {
        throw new Error('Method not implemented');
    }

    async findById(id, barberiaId) {
        throw new Error('Method not implemented');
    }

    async findAll(filtros) {
        throw new Error('Method not implemented');
    }

    async delete(id, barberiaId) {
        throw new Error('Method not implemented');
    }
}

module.exports = IVentaRepository;
