/**
 * GetDashboardStats Use Case
 * Returns aggregated statistics for the dashboard
 */
class GetDashboardStats {
    constructor(barberoRepository, servicioRepository, reservaRepository) {
        this.barberoRepository = barberoRepository;
        this.servicioRepository = servicioRepository;
        this.reservaRepository = reservaRepository;
    }

    async execute(barberiaId) {
        const dayjs = require('dayjs');
        const inicioMes = dayjs().startOf("month").format("YYYY-MM-DD");
        const finMes = dayjs().endOf("month").format("YYYY-MM-DD");

        // Get counts
        const barberos = await this.barberoRepository.findAll(barberiaId, { onlyActive: true });
        const servicios = await this.servicioRepository.findAll(barberiaId);

        // Get reservations for the month
        const reservasMes = await this.reservaRepository.findAll(barberiaId, {
            fechaInicio: inicioMes,
            fechaFin: finMes
        });

        // Get latest reservations
        const ultimasReservas = await this.reservaRepository.findAll(barberiaId, {
            limit: 5,
            sort: '-createdAt'
        });

        // Calculate statistics
        const stats = {
            totalBarberos: barberos.length,
            totalServicios: servicios.length,
            turnosMes: reservasMes.length,
            turnosCompletados: reservasMes.filter(r => r.estado === 'COMPLETADA').length,
            turnosCancelados: reservasMes.filter(r => r.estado === 'CANCELADA').length,
            turnosPendientes: reservasMes.filter(r => r.estado === 'RESERVADA').length,
            ultimasReservas: ultimasReservas.map(r => ({
                id: r.id,
                fecha: r.fecha,
                hora: r.hora,
                estado: r.estado,
                nombreCliente: r.nombreCliente,
                barberoNombre: r.barberoNombre,
                servicioNombre: r.servicioNombre,
                precio: r.precio
            }))
        };

        return stats;
    }
}

module.exports = GetDashboardStats;
