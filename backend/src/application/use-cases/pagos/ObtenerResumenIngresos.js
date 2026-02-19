/**
 * ObtenerResumenIngresos Use Case
 */
class ObtenerResumenIngresos {
    constructor(pagoRepository) {
        this.pagoRepository = pagoRepository;
    }

    async execute(barberiaId, mes) {
        const hoy = new Date().toISOString().slice(0, 10);
        const inicioMes = mes || hoy.slice(0, 7);
        const finMes = `${inicioMes}-31`;

        const pagos = await this.pagoRepository.findAll({
            barberiaId,
            fechaInicio: `${inicioMes}-01`,
            fechaFin: finMes
        });

        // Calcular totales
        let ingresosBrutos = 0;
        let totalEfectivo = 0;
        let totalTarjeta = 0;
        let totalTransferencia = 0;
        let comisionesTotales = 0;
        let ingresosNetos = 0;
        let totalIva = 0;

        pagos.forEach(pago => {
            ingresosBrutos += pago.montoTotal;
            totalEfectivo += pago.totalEfectivo;
            totalTarjeta += pago.totalTarjeta;
            totalTransferencia += pago.totalTransferencia;
            comisionesTotales += pago.comisionTotal;
            ingresosNetos += pago.ingresoNeto;
            totalIva += (pago.iva || 0);
        });

        const ingresosHoy = pagos
            .filter(p => p.fecha === hoy)
            .reduce((sum, p) => sum + p.ingresoNeto, 0);

        return {
            periodo: inicioMes,
            ingresosBrutos,
            desglosePorMetodo: {
                efectivo: {
                    monto: totalEfectivo,
                    porcentaje: ingresosBrutos > 0 ? Math.round((totalEfectivo / ingresosBrutos) * 100) : 0,
                    comision: 0
                },
                tarjeta: {
                    monto: totalTarjeta,
                    porcentaje: ingresosBrutos > 0 ? Math.round((totalTarjeta / ingresosBrutos) * 100) : 0,
                    comision: comisionesTotales
                },
                transferencia: {
                    monto: totalTransferencia,
                    porcentaje: ingresosBrutos > 0 ? Math.round((totalTransferencia / ingresosBrutos) * 100) : 0,
                    comision: 0
                }
            },
            comisionesTotales,
            ingresosNetos,
            ingresosHoy,
            cantidadPagos: pagos.length,
            ivaDebito: totalIva
        };
    }
}

module.exports = ObtenerResumenIngresos;
