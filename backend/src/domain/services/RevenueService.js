/**
 * RevenueService - Domain Service
 */
class RevenueService {
    constructor(revenueConfigRepository) {
        this.revenueConfigRepository = revenueConfigRepository;
    }

    /**
     * Calcula el porcentaje aplicable según prioridades
     */
    async calcularPorcentaje(reserva, barberoId, servicioId, barberiaId) {
        // 1. Override por reserva
        if (reserva.overridePorcentaje && reserva.overridePorcentaje.barbero) {
            return {
                barbero: reserva.overridePorcentaje.barbero,
                barberia: reserva.overridePorcentaje.barberia,
                origen: 'reserva'
            };
        }

        // Obtener configuración
        const config = await this.revenueConfigRepository.findByBarberiaId(barberiaId);
        if (!config) {
            return { barbero: 50, barberia: 50, origen: 'default' };
        }

        // 2. Override por servicio
        if (servicioId) {
            const overrideServicio = config.overridesPorServicio.find(
                o => o.servicioId?.toString() === servicioId.toString() && o.activo
            );
            if (overrideServicio) {
                return {
                    barbero: overrideServicio.porcentajeBarbero,
                    barberia: overrideServicio.porcentajeBarberia,
                    origen: 'servicio'
                };
            }
        }

        // 3. Override por barbero
        if (barberoId) {
            const overrideBarbero = config.overridesPorBarbero.find(
                o => o.barberoId?.toString() === barberoId.toString() && o.activo
            );
            if (overrideBarbero) {
                return {
                    barbero: overrideBarbero.porcentajeBarbero,
                    barberia: overrideBarbero.porcentajeBarberia,
                    origen: 'barbero'
                };
            }
        }

        // 4. Porcentaje por defecto
        return {
            barbero: config.configuracionGeneral.porcentajeDefaultBarbero,
            barberia: config.configuracionGeneral.porcentajeDefaultBarberia,
            origen: 'default'
        };
    }

    /**
     * Calcula la distribución de montos
     */
    calcularMontos(montoTotal, porcentaje) {
        const montoBarbero = Math.round((montoTotal * porcentaje.barbero) / 100);
        const montoBarberia = Math.round((montoTotal * porcentaje.barberia) / 100);

        return {
            montoTotal,
            montoBarbero,
            montoBarberia
        };
    }

    /**
     * Calcula impuestos
     */
    async calcularImpuestos(barberiaId, montoBarbero) {
        const config = await this.revenueConfigRepository.findByBarberiaId(barberiaId);

        if (!config || !config.impuestos) {
            return { iva: 0, retencion: 0, montoIVA: 0, montoRetencion: 0 };
        }

        const taxes = config.impuestos;
        let montoIVA = 0;
        let montoRetencion = 0;

        if (taxes.aplicarIVA) {
            montoIVA = Math.round((montoBarbero * taxes.iva) / 100);
        }

        if (taxes.aplicarRetencion) {
            montoRetencion = Math.round((montoBarbero * taxes.retencion) / 100);
        }

        return {
            iva: taxes.iva,
            retencion: taxes.retencion,
            montoIVA,
            montoRetencion
        };
    }
}

module.exports = RevenueService;
