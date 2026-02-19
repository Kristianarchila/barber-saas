/**
 * GetAnalisisPagos Use Case
 * Returns payment method analysis
 */
class GetAnalisisPagos {
    constructor(pagoRepository) {
        this.pagoRepository = pagoRepository;
    }

    async execute(barberiaId, { mes }) {
        const hoy = new Date().toISOString().slice(0, 10);
        const inicioMes = mes || hoy.slice(0, 7);
        const finMes = `${inicioMes}-31`;
        const fechaInicio = `${inicioMes}-01`;

        const pagos = await this.pagoRepository.findAll(barberiaId, {
            fechaInicio,
            fechaFin: finMes
        });

        const analisis = {
            efectivo: { monto: 0, cantidad: 0, porcentaje: 0 },
            tarjeta: { monto: 0, cantidad: 0, porcentaje: 0 },
            transferencia: { monto: 0, cantidad: 0, porcentaje: 0 }
        };

        let totalMonto = 0;

        pagos.forEach(pago => {
            analisis.efectivo.monto += pago.totalEfectivo || 0;
            analisis.tarjeta.monto += pago.totalTarjeta || 0;
            analisis.transferencia.monto += pago.totalTransferencia || 0;
            totalMonto += pago.montoTotal || 0;
        });

        // Calculate percentages
        if (totalMonto > 0) {
            analisis.efectivo.porcentaje = Math.round((analisis.efectivo.monto / totalMonto) * 100);
            analisis.tarjeta.porcentaje = Math.round((analisis.tarjeta.monto / totalMonto) * 100);
            analisis.transferencia.porcentaje = Math.round((analisis.transferencia.monto / totalMonto) * 100);
        }

        return analisis;
    }
}

module.exports = GetAnalisisPagos;
