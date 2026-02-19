/**
 * GetRendimientoBarberos Use Case
 * Returns performance metrics for all barbers
 */
class GetRendimientoBarberos {
    constructor(barberoRepository, reservaRepository, pagoRepository, revenueConfigRepository) {
        this.barberoRepository = barberoRepository;
        this.reservaRepository = reservaRepository;
        this.pagoRepository = pagoRepository;
        this.revenueConfigRepository = revenueConfigRepository;
    }

    async execute(barberiaId, { mes }) {
        const hoy = new Date().toISOString().slice(0, 10);
        const inicioMes = mes || hoy.slice(0, 7);
        const finMes = `${inicioMes}-31`;
        const fechaInicio = `${inicioMes}-01`;

        // Get revenue configuration
        const config = await this.revenueConfigRepository.findByBarberiaId(barberiaId);
        const defaultComision = config?.configuracionGeneral?.porcentajeDefaultBarbero || 50;

        // Get active barbers
        const barberos = await this.barberoRepository.findAll(barberiaId, { activo: true });

        const rendimiento = await Promise.all(barberos.map(async (barbero) => {
            // Get completed reservations
            const reservas = await this.reservaRepository.findAll(barberiaId, {
                barberoId: barbero.id,
                fechaInicio,
                fechaFin: finMes,
                estado: 'COMPLETADA'
            });

            // Get payments
            const pagos = await this.pagoRepository.findAll(barberiaId, {
                barberoId: barbero.id,
                fechaInicio,
                fechaFin: finMes
            });

            const ingresosTotales = pagos.reduce((sum, p) => sum + (p.montoTotal || 0), 0);
            const ingresosNetos = pagos.reduce((sum, p) => sum + (p.ingresoNeto || 0), 0);
            const cortesRealizados = reservas.length;
            const promedioCliente = cortesRealizados > 0
                ? Math.round(ingresosTotales / cortesRealizados)
                : 0;

            // Determine barber commission
            let porcentajeComision = defaultComision;

            // Look for specific override for this barber
            if (config?.overridesPorBarbero) {
                const override = config.overridesPorBarbero.find(
                    ov => ov.barberoId && ov.barberoId.toString() === barbero.id.toString() && ov.activo
                );
                if (override) {
                    porcentajeComision = override.porcentajeBarbero;
                }
            }

            const comision = Math.round(ingresosNetos * (porcentajeComision / 100));

            return {
                barberoId: barbero.id,
                nombre: barbero.nombre,
                cortesRealizados,
                ingresosTotales,
                ingresosNetos,
                porcentajeComision,
                comision,
                promedioCliente,
                clientesAtendidos: cortesRealizados,
                vales: 0
            };
        }));

        // Sort by total revenue
        rendimiento.sort((a, b) => b.ingresosTotales - a.ingresosTotales);

        return rendimiento;
    }
}

module.exports = GetRendimientoBarberos;
