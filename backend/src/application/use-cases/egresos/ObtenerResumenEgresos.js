/**
 * ObtenerResumenEgresos Use Case
 */
class ObtenerResumenEgresos {
    constructor(egresoRepository) {
        this.egresoRepository = egresoRepository;
    }

    async execute(barberiaId, mes) {
        const hoy = new Date().toISOString().slice(0, 10);
        const inicioMes = mes || hoy.slice(0, 7);
        const finMes = `${inicioMes}-31`;
        const fechaInicio = `${inicioMes}-01`;

        const egresos = await this.egresoRepository.findAll({
            barberiaId,
            fechaInicio,
            fechaFin: finMes
        });

        // Calcular totales
        const totalEgresos = egresos.reduce((sum, e) => sum + e.montoTotal, 0);
        const totalIvaCredito = egresos.reduce((sum, e) => sum + e.iva, 0);

        // Resumen por categoría
        const porCategoria = await this.egresoRepository.getResumenPorCategoria(
            barberiaId,
            fechaInicio,
            finMes
        );

        // Egresos de hoy
        const totalHoy = egresos
            .filter(e => e.fecha === hoy)
            .reduce((sum, e) => sum + e.montoTotal, 0);

        return {
            periodo: inicioMes,
            totalEgresos,
            totalIvaCredito,
            egresosHoy: totalHoy,
            cantidadEgresos: egresos.length,
            porCategoria: porCategoria.map(cat => ({
                categoria: cat._id,
                total: cat.total,
                cantidad: cat.cantidad,
                porcentaje: totalEgresos > 0 ? Math.round((cat.total / totalEgresos) * 100) : 0
            }))
        };
    }
}

module.exports = ObtenerResumenEgresos;
