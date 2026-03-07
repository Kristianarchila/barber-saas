/**
 * GetDashboardStats Use Case
 * Returns aggregated statistics for the dashboard
 * Accepts optional fechaInicio / fechaFin to support date-range filtering
 * from the admin Dashboard date picker.
 *
 * PERF: Previously called reservaRepository.findAll() twice, loading ALL
 * reservation documents into Node.js memory for JS-side filtering — this
 * caused p99=3654ms under concurrency. Now delegates to getDashboardStats()
 * which uses a server-side $group aggregation pipeline.
 */
class GetDashboardStats {
    constructor(barberoRepository, servicioRepository, reservaRepository) {
        this.barberoRepository = barberoRepository;
        this.servicioRepository = servicioRepository;
        this.reservaRepository = reservaRepository;
    }

    /**
     * @param {string} barberiaId
     * @param {Object} [opts]
     * @param {string} [opts.fechaInicio]  YYYY-MM-DD — defaults to start of current month
     * @param {string} [opts.fechaFin]    YYYY-MM-DD — defaults to end of current month
     */
    async execute(barberiaId, opts = {}) {
        const dayjs = require('dayjs');

        const fechaInicio = opts.fechaInicio || dayjs().startOf('month').format('YYYY-MM-DD');
        const fechaFin = opts.fechaFin || dayjs().endOf('month').format('YYYY-MM-DD');

        // All three calls run in parallel.
        // getDashboardStats uses a server-side $group pipeline — no documents
        // are loaded into Node.js memory, only the computed result set.
        const [barberos, servicios, stats] = await Promise.all([
            this.barberoRepository.findAll(barberiaId, { onlyActive: true }),
            this.servicioRepository.findAll(barberiaId),
            this.reservaRepository.getDashboardStats(barberiaId, fechaInicio, fechaFin),
        ]);

        return {
            // Conteos generales
            totalBarberos: barberos.length,
            totalServicios: servicios.length,
            totalReservas: stats.totalReservas,

            // Desglose del período
            turnosCompletados: stats.turnosCompletados,
            turnosCancelados: stats.turnosCancelados,
            turnosPendientes: stats.turnosPendientes,

            // KPIs reales
            ingresosPeriodo: stats.ingresosPeriodo,
            nuevosClientes: stats.nuevosClientes,
            tasaConversion: stats.tasaConversion,

            // Período consultado (para debug / info)
            periodoConsultado: { fechaInicio, fechaFin },

            // Tabla de últimas reservas (raw .lean() docs from aggregation repo)
            ultimasReservas: stats.ultimasReservas.map(r => ({
                _id: r._id,
                fecha: r.fecha,
                hora: r.hora,
                estado: r.estado,
                clienteNombre: r.nombreCliente || r.clienteNombre,
                barberoId: r.barberoId ? { nombre: r.barberoId.nombre } : null,
                servicioId: r.servicioId ? { nombre: r.servicioId.nombre, duracion: r.servicioId.duracion } : null,
                precioTotal: r.precioTotal || r.precio || 0
            }))
        };
    }
}

module.exports = GetDashboardStats;
