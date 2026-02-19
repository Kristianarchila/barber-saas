/**
 * CerrarCaja Use Case
 */
class CerrarCaja {
    constructor(cajaRepository) {
        this.cajaRepository = cajaRepository;
    }

    async execute(barberiaId, { montoReal, arqueo, observaciones }) {
        const caja = await this.cajaRepository.findOpenByBarberia(barberiaId);
        if (!caja) throw new Error('No hay caja abierta');

        caja.cerrar(montoReal, arqueo, observaciones);

        return await this.cajaRepository.save(caja);
    }
}

module.exports = CerrarCaja;
