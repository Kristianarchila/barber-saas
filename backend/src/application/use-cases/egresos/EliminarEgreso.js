/**
 * EliminarEgreso Use Case
 */
class EliminarEgreso {
    constructor(egresoRepository) {
        this.egresoRepository = egresoRepository;
    }

    async execute(id, barberiaId) {
        const egreso = await this.egresoRepository.findById(id);
        if (!egreso || egreso.barberiaId !== barberiaId) {
            throw new Error('Egreso no encontrado');
        }

        return await this.egresoRepository.update(id, { activo: false });
    }
}

module.exports = EliminarEgreso;
