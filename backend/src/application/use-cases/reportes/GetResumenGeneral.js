/**
 * GetResumenGeneral Use Case
 * Returns general business summary with financial metrics
 */
class GetResumenGeneral {
    constructor(pagoRepository, egresoRepository, reservaRepository) {
        this.pagoRepository = pagoRepository;
        this.egresoRepository = egresoRepository;
        this.reservaRepository = reservaRepository;
    }

    async execute(barberiaId, { mes, fechaInicio: customInicio, fechaFin: customFin }) {
        let fechaInicio, fechaFin;

        // Determine date range
        if (customInicio && customFin) {
            fechaInicio = customInicio;
            fechaFin = customFin;
        } else {
            const hoy = new Date().toISOString().slice(0, 10);
            const inicioMes = mes || hoy.slice(0, 7);
            fechaInicio = `${inicioMes}-01`;
            fechaFin = `${inicioMes}-31`;
        }

        // Calculate previous period for comparison
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        const diasPeriodo = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));

        const inicioAnterior = new Date(inicio);
        inicioAnterior.setDate(inicioAnterior.getDate() - diasPeriodo);
        const finAnterior = new Date(inicio);
        finAnterior.setDate(finAnterior.getDate() - 1);

        // Get current period data
        const pagos = await this.pagoRepository.findAll(barberiaId, {
            fechaInicio,
            fechaFin
        });

        const ingresosTotales = pagos.reduce((sum, p) => sum + (p.ingresoNeto || 0), 0);
        const comisionesTotales = pagos.reduce((sum, p) => sum + (p.comisionTotal || 0), 0);

        // Get previous period data
        const pagosAnterior = await this.pagoRepository.findAll(barberiaId, {
            fechaInicio: inicioAnterior.toISOString().slice(0, 10),
            fechaFin: finAnterior.toISOString().slice(0, 10)
        });
        const ingresosAnterior = pagosAnterior.reduce((sum, p) => sum + (p.ingresoNeto || 0), 0);

        // Get expenses
        const egresos = await this.egresoRepository.findAll(barberiaId, {
            fechaInicio,
            fechaFin,
            activo: true
        });
        const egresosTotales = egresos.reduce((sum, e) => sum + (e.montoTotal || 0), 0);

        // Calculate net profit
        const utilidadNeta = ingresosTotales - egresosTotales;

        // Get completed reservations
        const reservas = await this.reservaRepository.findAll(barberiaId, {
            fechaInicio,
            fechaFin,
            estado: 'COMPLETADA'
        });
        const clientesAtendidos = reservas.length;

        // Calculate average ticket
        const ticketPromedio = clientesAtendidos > 0
            ? Math.round(ingresosTotales / clientesAtendidos)
            : 0;

        // Calculate variation vs previous period
        const variacionIngresos = ingresosAnterior > 0
            ? Math.round(((ingresosTotales - ingresosAnterior) / ingresosAnterior) * 100)
            : 0;

        return {
            periodo: `${fechaInicio} - ${fechaFin}`,
            fechaInicio,
            fechaFin,
            ingresosTotales,
            egresosTotales,
            utilidadNeta,
            clientesAtendidos,
            ticketPromedio,
            comisionesTotales,
            variacionIngresos,
            ingresosAnterior
        };
    }
}

module.exports = GetResumenGeneral;
