const Servicio = require('../../../domain/entities/Servicio');

/**
 * Create Servicio Use Case
 */
class CreateServicio {
    constructor(servicioRepository) {
        this.servicioRepository = servicioRepository;
    }

    /**
     * Execute the use case
     * @param {Object} dto - { nombre, descripcion, duracion, precio, imagen, barberiaId }
     * @returns {Promise<Servicio>}
     */
    async execute(dto) {
        // 1. Create domain entity (validates business rules)
        const servicio = new Servicio({
            nombre: dto.nombre,
            descripcion: dto.descripcion,
            duracion: dto.duracion,
            precio: dto.precio,
            imagen: dto.imagen,
            barberiaId: dto.barberiaId,
            activo: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // 2. Persist
        const savedServicio = await this.servicioRepository.save(servicio);

        return savedServicio;
    }
}

module.exports = CreateServicio;
