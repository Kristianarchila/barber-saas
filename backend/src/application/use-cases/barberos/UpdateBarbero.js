/**
 * UpdateBarbero Use Case
 * Updates an existing barber's information
 */
class UpdateBarbero {
    constructor(barberoRepository, userRepository) {
        this.barberoRepository = barberoRepository;
        this.userRepository = userRepository;
    }

    async execute(id, data, requester) {
        // SECURITY: Prevent barberos from modifying their own commission
        if (requester.rol === 'BARBERO' && data.comision !== undefined) {
            throw new Error('No tienes permiso para modificar la comisión');
        }

        // 1. Find existing barbero
        const barbero = await this.barberoRepository.findById(id);
        if (!barbero) {
            throw new Error('Barbero no encontrado');
        }

        // 2. Auth check (simplified, usually handled in middleware or controller, 
        // but can be here for extra safety)
        if (
            requester.rol !== 'SUPER_ADMIN' &&
            barbero.barberiaId.toString() !== requester.barberiaId.toString()
        ) {
            throw new Error('No autorizado');
        }

        // 3. Update Domain Entity
        barbero.update(data);

        // 4. Persistence
        const updatedBarbero = await this.barberoRepository.update(id, barbero.toObject());

        // 5. Cross-update User if name changed
        if (data.nombre && barbero.usuarioId) {
            await this.userRepository.update(barbero.usuarioId, { nombre: data.nombre });
        }

        return updatedBarbero;
    }
}

module.exports = UpdateBarbero;
