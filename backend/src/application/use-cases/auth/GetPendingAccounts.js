/**
 * Get Pending Accounts Use Case
 * SuperAdmin gets list of pending accounts
 */
class GetPendingAccounts {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute() {
        // Find all users with PENDIENTE status
        const pendingAccounts = await this.userRepository.findByStatus('PENDIENTE');

        return pendingAccounts.map(user => ({
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            rol: user.rol,
            createdAt: user.createdAt,
            estadoCuenta: user.estadoCuenta
        }));
    }
}

module.exports = GetPendingAccounts;
