/**
 * ToggleBarberoStatus Use Case
 * Toggles active status for barbero and user
 */
class ToggleBarberoStatus {
    constructor(barberoRepository, userRepository) {
        this.barberoRepository = barberoRepository;
        this.userRepository = userRepository;
    }

    async execute(id, barberiaId) {
        const barbero = await this.barberoRepository.findById(id);
        if (!barbero || barbero.barberiaId !== barberiaId) {
            throw new Error('Barbero no encontrado');
        }

        // 1. Toggle in Entity
        barbero.toggleStatus();

        // 2. Persistence
        await this.barberoRepository.update(id, { activo: barbero.activo });

        // 3. Update User status
        if (barbero.usuarioId) {
            await this.userRepository.update(barbero.usuarioId, { activo: barbero.activo });
        }

        return barbero.activo;
    }
}

module.exports = ToggleBarberoStatus;
