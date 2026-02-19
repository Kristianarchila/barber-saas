/**
 * GetServiciosMasVendidos Use Case
 * Returns top selling services statistics
 */
class GetServiciosMasVendidos {
    constructor(reservaRepository) {
        this.reservaRepository = reservaRepository;
    }

    async execute(barberiaId, { mes }) {
        const hoy = new Date().toISOString().slice(0, 10);
        const inicioMes = mes || hoy.slice(0, 7);
        const finMes = `${inicioMes}-31`;
        const fechaInicio = `${inicioMes}-01`;

        const reservas = await this.reservaRepository.findAll(barberiaId, {
            fechaInicio,
            fechaFin: finMes,
            estado: 'COMPLETADA'
        });

        // Group by service
        const serviciosMap = {};
        let totalServicios = 0;

        reservas.forEach(reserva => {
            const nombre = reserva.servicioNombre;
            if (nombre) {
                if (!serviciosMap[nombre]) {
                    serviciosMap[nombre] = {
                        nombre,
                        cantidad: 0,
                        ingresos: 0
                    };
                }
                serviciosMap[nombre].cantidad++;
                serviciosMap[nombre].ingresos += reserva.precio || 0;
                totalServicios++;
            }
        });

        // Convert to array and calculate percentages
        const servicios = Object.values(serviciosMap).map(servicio => ({
            ...servicio,
            porcentaje: totalServicios > 0
                ? Math.round((servicio.cantidad / totalServicios) * 100)
                : 0
        }));

        // Sort by quantity
        servicios.sort((a, b) => b.cantidad - a.cantidad);

        return {
            servicios,
            totalServicios
        };
    }
}

module.exports = GetServiciosMasVendidos;
