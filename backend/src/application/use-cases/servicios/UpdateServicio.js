/**
 * Update Servicio Use Case
 */
class UpdateServicio {
    constructor(servicioRepository) {
        this.servicioRepository = servicioRepository;
    }

    /**
     * Execute the use case
     * @param {string} servicioId
     * @param {Object} updateData - { nombre, descripcion, duracion, precio, imagen }
     * @param {string} barberiaId - For authorization
     * @returns {Promise<Servicio>}
     */
    async execute(servicioId, updateData, barberiaId) {
        // 1. Find the service
        const servicio = await this.servicioRepository.findById(servicioId);

        if (!servicio) {
            throw new Error('Servicio no encontrado');
        }

        // 2. Validate ownership
        if (servicio.barberiaId !== barberiaId) {
            throw new Error('No tienes permisos para editar este servicio');
        }

        // 3. Update (domain logic validates)
        servicio.update(updateData);

        // 4. Persist
        await this.servicioRepository.update(servicio.id, servicio.toObject());

        return servicio;
    }
}

module.exports = UpdateServicio;
