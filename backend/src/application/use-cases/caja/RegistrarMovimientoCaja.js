/**
 * RegistrarMovimientoCaja Use Case
 */
class RegistrarMovimientoCaja {
    constructor(cajaRepository) {
        this.cajaRepository = cajaRepository;
    }

    async execute(barberiaId, { tipoMovimiento, monto, concepto, tipo, comprobante, autorizadoPor }) {
        const caja = await this.cajaRepository.findOpenByBarberia(barberiaId);
        if (!caja) throw new Error('No hay caja abierta');

        if (tipoMovimiento === 'INGRESO') {
            caja.addIngreso({ tipo: tipo || 'OTRO', monto, concepto });
        } else {
            caja.addEgreso({ tipo, monto, concepto, comprobante, autorizadoPor });
        }

        return await this.cajaRepository.save(caja);
    }
}

module.exports = RegistrarMovimientoCaja;
