/**
 * IEgresoRepository Interface
 */
class IEgresoRepository {
    async findAll(filtros) { throw new Error('Method not implemented'); }
    async findById(id) { throw new Error('Method not implemented'); }
    async save(egreso) { throw new Error('Method not implemented'); }
    async update(id, data) { throw new Error('Method not implemented'); }
    async getResumenPorCategoria(barberiaId, fechaInicio, fechaFin) { throw new Error('Method not implemented'); }
}

module.exports = IEgresoRepository;
