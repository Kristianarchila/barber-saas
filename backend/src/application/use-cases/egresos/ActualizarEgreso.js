/**
 * ActualizarEgreso Use Case
 */
class ActualizarEgreso {
    constructor(egresoRepository) {
        this.egresoRepository = egresoRepository;
    }

    async execute(id, barberiaId, data) {
        const egreso = await this.egresoRepository.findById(id);
        if (!egreso || egreso.barberiaId !== barberiaId) {
            throw new Error('Egreso no encontrado');
        }

        return await this.egresoRepository.update(id, data);
    }
}

module.exports = ActualizarEgreso;
