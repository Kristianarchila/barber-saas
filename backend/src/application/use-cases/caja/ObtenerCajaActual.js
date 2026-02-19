/**
 * ObtenerCajaActual Use Case
 */
class ObtenerCajaActual {
    constructor(cajaRepository) {
        this.cajaRepository = cajaRepository;
    }

    async execute(barberiaId) {
        return await this.cajaRepository.findOpenByBarberia(barberiaId);
    }
}

module.exports = ObtenerCajaActual;
