/**
 * DeleteBarbero Use Case
 * Deletes a barber and their associated user
 */
const AuditHelper = require('../../../utils/AuditHelper');

class DeleteBarbero {
    constructor(barberoRepository, userRepository) {
        this.barberoRepository = barberoRepository;
        this.userRepository = userRepository;
    }

    async execute(id, barberiaId, userId = null, request = null) {
        const barbero = await this.barberoRepository.findById(id);
        if (!barbero || barbero.barberiaId !== barberiaId) {
            throw new Error('Barbero no encontrado');
        }

        // Guardar datos para auditoría ANTES de eliminar
        const barberoSnapshot = {
            id: barbero.id,
            nombre: barbero.nombre,
            email: barbero.email,
            telefono: barbero.telefono,
            especialidad: barbero.especialidad,
            usuarioId: barbero.usuarioId
        };

        // 1. Delete associated user if exists
        if (barbero.usuarioId) {
            await this.userRepository.delete(barbero.usuarioId);
        }

        // 2. Delete barbero
        await this.barberoRepository.delete(id);

        // 3. 📝 AUDITAR - Registrar eliminación
        if (userId) {
            await AuditHelper.logDelete({
                userId,
                barberiaId,
                resourceType: 'Barbero',
                resourceId: id,
                resourceData: barberoSnapshot,
                request: request ? AuditHelper.extractRequestInfo(request) : {}
            });
        }
    }
}

module.exports = DeleteBarbero;
