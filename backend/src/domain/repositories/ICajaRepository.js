/**
 * ICajaRepository Interface
 */
class ICajaRepository {
    async findOpenByBarberia(barberiaId) { throw new Error('Method not implemented'); }
    async findById(id) { throw new Error('Method not implemented'); }
    async findAll(filtros) { throw new Error('Method not implemented'); }
    async save(caja) { throw new Error('Method not implemented'); }
    async update(id, data) { throw new Error('Method not implemented'); }
}

module.exports = ICajaRepository;
