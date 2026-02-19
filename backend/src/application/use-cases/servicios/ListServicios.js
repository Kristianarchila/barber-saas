/**
 * List Servicios Use Case
 */
class ListServicios {
    constructor(servicioRepository) {
        this.servicioRepository = servicioRepository;
    }

    /**
     * Execute the use case
     * @param {string} barberiaId
     * @param {boolean} onlyActive - Filter only active services
     * @returns {Promise<Servicio[]>}
     */
    async execute(barberiaId, onlyActive = false) {
        const servicios = await this.servicioRepository.findByBarberiaId(barberiaId, onlyActive);
        return servicios;
    }
}

module.exports = ListServicios;
