/**
 * ListClientes Use Case
 */
class ListClientes {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(barberiaId) {
        return await this.userRepository.findByBarberiaId(barberiaId, { rol: 'CLIENTE' });
    }
}

module.exports = ListClientes;
