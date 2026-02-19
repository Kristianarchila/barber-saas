const Caja = require('../../../domain/entities/Caja');

/**
 * AbrirCaja Use Case
 */
class AbrirCaja {
    constructor(cajaRepository) {
        this.cajaRepository = cajaRepository;
    }

    async execute(barberiaId, { montoInicial, turno, responsable }) {
        // 1. Check if already open
        const existing = await this.cajaRepository.findOpenByBarberia(barberiaId);
        if (existing) {
            throw new Error('Ya existe una caja abierta');
        }

        // 2. Create new Caja
        const caja = new Caja({
            barberiaId,
            fecha: new Date().toISOString().slice(0, 10),
            turno: turno || 'COMPLETO',
            responsable,
            montoInicial: montoInicial || 50000,
            horaApertura: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
        });

        return await this.cajaRepository.save(caja);
    }
}

module.exports = AbrirCaja;
