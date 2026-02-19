const Egreso = require('../../../domain/entities/Egreso');

/**
 * RegistrarEgreso Use Case
 */
class RegistrarEgreso {
    constructor(egresoRepository) {
        this.egresoRepository = egresoRepository;
    }

    async execute(barberiaId, data, usuarioNombre) {
        const egreso = new Egreso({
            ...data,
            barberiaId,
            registradoPor: usuarioNombre
        });

        return await this.egresoRepository.save(egreso);
    }
}

module.exports = RegistrarEgreso;
