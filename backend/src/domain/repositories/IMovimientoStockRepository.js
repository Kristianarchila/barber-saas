/**
 * IMovimientoStockRepository Interface
 */
class IMovimientoStockRepository {
    async save(movimiento) { throw new Error('Method not implemented'); }
    async findAll(filtros) { throw new Error('Method not implemented'); }
    async count(filtros) { throw new Error('Method not implemented'); }
}

module.exports = IMovimientoStockRepository;
