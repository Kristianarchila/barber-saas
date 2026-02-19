/**
 * IBarberiaRepository Interface
 * Defines the contract for Barberia persistence
 */
class IBarberiaRepository {
    async save(barberia, session = null) { throw new Error('Method not implemented'); }
    async findById(id) { throw new Error('Method not implemented'); }
    async findBySlug(slug) { throw new Error('Method not implemented'); }
    async findByEmail(email) { throw new Error('Method not implemented'); }
    async findAll(filters = {}, pagination = {}) { throw new Error('Method not implemented'); }
    async update(id, data, session = null) { throw new Error('Method not implemented'); }
    async delete(id, session = null) { throw new Error('Method not implemented'); }
    async exists(query) { throw new Error('Method not implemented'); }
    async count(filters = {}) { throw new Error('Method not implemented'); }
    async getGlobalStats() { throw new Error('Method not implemented'); }
    async getExpiringSoon(days = 5) { throw new Error('Method not implemented'); }
}

module.exports = IBarberiaRepository;
