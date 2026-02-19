/**
 * RevenueConfig Repository Interface
 */
class IRevenueConfigRepository {
    async findByBarberiaId(barberiaId) {
        throw new Error('Method not implemented');
    }

    async save(revenueConfig) {
        throw new Error('Method not implemented');
    }

    async update(barberiaId, updates) {
        throw new Error('Method not implemented');
    }
}

module.exports = IRevenueConfigRepository;
