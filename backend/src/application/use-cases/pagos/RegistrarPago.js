const Pago = require('../../../domain/entities/Pago');
const RevenueConfig = require('../../../infrastructure/database/mongodb/models/RevenueConfig');

/**
 * RegistrarPago Use Case
 * Looks up barberia tax config from RevenueConfig for IVA calculation.
 */
class RegistrarPago {
    constructor(pagoRepository, reservaRepository, cajaRepository) {
        this.pagoRepository = pagoRepository;
        this.reservaRepository = reservaRepository;
        this.cajaRepository = cajaRepository;
    }

    async execute(barberiaId, { reservaId, detallesPago, registradoPor }) {
        // 1. Validate Reserva
        const reserva = await this.reservaRepository.findById(reservaId);
        if (!reserva || reserva.barberiaId !== barberiaId) {
            throw new Error('Reserva no encontrada');
        }

        if (reserva.estado === 'COMPLETADA') {
            throw new Error('Esta reserva ya fue pagada');
        }

        const montoTotal = detallesPago.reduce((sum, p) => sum + p.monto, 0);

        // 2. Calculate commissions
        const detallesConComision = detallesPago.map(detalle => {
            const comision = Pago.calcularComision(detalle.metodoPago, detalle.monto);
            return {
                ...detalle,
                comision,
                montoNeto: detalle.monto - comision
            };
        });

        // 3. Look up barberia's IVA config
        let tasaIva = 0;
        try {
            const config = await RevenueConfig.findOne({ barberiaId });
            if (config && config.impuestos && config.impuestos.aplicarIVA) {
                tasaIva = config.impuestos.iva || 0;
            }
        } catch (err) {
            console.warn('[RegistrarPago] Could not load RevenueConfig, defaulting to 0% IVA:', err.message);
        }

        // 4. Create Pago with configurable IVA
        const pago = new Pago({
            barberiaId,
            reservaId,
            barberoId: reserva.barberoId,
            fecha: new Date().toISOString().slice(0, 10),
            montoTotal,
            detallesPago: detallesConComision,
            registradoPor,
            tasaIva // Pago entity auto-calculates iva from this rate
        });

        const savedPago = await this.pagoRepository.save(pago);

        // 5. Update Reserva
        await this.reservaRepository.update(reservaId, {
            estado: 'COMPLETADA',
            pagado: true
        });

        // 6. Sync with Caja if Cash
        const efectivo = detallesConComision.find(p => p.metodoPago === 'EFECTIVO');
        if (efectivo && efectivo.monto > 0) {
            const cajaAbierta = await this.cajaRepository.findOpenByBarberia(barberiaId);
            if (cajaAbierta) {
                cajaAbierta.addIngreso({
                    tipo: 'VENTA',
                    monto: efectivo.monto,
                    concepto: `Reserva #${reservaId.toString().slice(-6)} - ${reserva.clienteNombre || 'S/N'}`,
                    reservaId,
                    pagoId: savedPago.id
                });
                await this.cajaRepository.save(cajaAbierta);
            }
        }

        return savedPago;
    }
}

module.exports = RegistrarPago;
