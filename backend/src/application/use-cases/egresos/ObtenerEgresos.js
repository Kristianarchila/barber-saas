/**
 * ObtenerEgresos Use Case
 */
class ObtenerEgresos {
    constructor(egresoRepository) {
        this.egresoRepository = egresoRepository;
    }

    async execute(barberiaId, filtros = {}) {
        return await this.egresoRepository.findAll({
            barberiaId,
            ...filtros
        });
    }
}

module.exports = ObtenerEgresos;
