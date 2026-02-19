/**
 * ITransactionRepository Interface
 */
class ITransactionRepository {
    async findAll(filtros) { throw new Error('Method not implemented'); }
    async findById(id) { throw new Error('Method not implemented'); }
    async findOne(query) { throw new Error('Method not implemented'); }
    async count(query) { throw new Error('Method not implemented'); }
    async save(transaction) { throw new Error('Method not implemented'); }
    async update(id, data) { throw new Error('Method not implemented'); }
    async aggregate(pipeline) { throw new Error('Method not implemented'); }
}

module.exports = ITransactionRepository;
