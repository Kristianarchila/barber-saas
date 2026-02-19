/**
 * IUserRepository Interface
 * Defines the contract for User persistence
 */
class IUserRepository {
    async save(user) { throw new Error('Method not implemented'); }
    async findById(id) { throw new Error('Method not implemented'); }
    async findByEmail(email) { throw new Error('Method not implemented'); }
    async findByRole(role) { throw new Error('Method not implemented'); }
    async update(id, data) { throw new Error('Method not implemented'); }
    async delete(id) { throw new Error('Method not implemented'); }
}

module.exports = IUserRepository;
