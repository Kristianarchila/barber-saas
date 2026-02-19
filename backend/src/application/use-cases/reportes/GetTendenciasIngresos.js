/**
 * GetTendenciasIngresos Use Case
 * Returns daily revenue trends
 */
class GetTendenciasIngresos {
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
            fechaFin: finMes,
            sort: 'fecha'
        });

        // Group by day
        const ingresosPorDia = {};
        pagos.forEach(pago => {
            const fecha = pago.fecha;
            if (!ingresosPorDia[fecha]) {
                ingresosPorDia[fecha] = 0;
            }
            ingresosPorDia[fecha] += pago.ingresoNeto || 0;
        });

        // Convert to array
        const tendencias = Object.entries(ingresosPorDia).map(([fecha, monto]) => ({
            fecha,
            monto: Math.round(monto)
        }));

        return tendencias;
    }
}

module.exports = GetTendenciasIngresos;
