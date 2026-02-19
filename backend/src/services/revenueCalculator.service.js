const RevenueConfig = require('../models/RevenueConfig');
const Transaction = require('../models/Transaction');

/**
 * Servicio para cálculos de revenue split
 */
class RevenueCalculatorService {

    /**
     * Calcula el porcentaje aplicable según prioridades
     * Prioridad: reserva > servicio > barbero > default
     */
    async calcularPorcentaje(reserva, barberoId, servicioId) {
        // Extraer IDs de forma segura (pueden ser strings o poblados)
        const barberiaId = reserva.barberiaId?._id || reserva.barberiaId;
        const bId = barberoId?._id || barberoId;
        const sId = servicioId?._id || servicioId;

        // 1. Override por reserva (máxima prioridad)
        if (reserva.overridePorcentaje && reserva.overridePorcentaje.barbero) {
            return {
                barbero: reserva.overridePorcentaje.barbero,
                barberia: reserva.overridePorcentaje.barberia,
                origen: 'reserva'
            };
        }

        // Obtener configuración de la barbería
        const config = await RevenueConfig.findOne({ barberiaId });
        if (!config) {
            // Si no hay configuración, usar 50/50 por defecto
            return {
                barbero: 50,
                barberia: 50,
                origen: 'default'
            };
        }

        // 2. Override por servicio
        if (sId) {
            const overrideServicio = config.overridesPorServicio.find(
                o => o.servicioId?.toString() === sId.toString() && o.activo
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
        if (bId) {
            const overrideBarbero = config.overridesPorBarbero.find(
                o => o.barberoId?.toString() === bId.toString() && o.activo
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
     * Calcula impuestos (IVA y retención)
     */
    async calcularImpuestos(barberiaId, montoBarbero) {
        const bId = barberiaId?._id || barberiaId;
        const config = await RevenueConfig.findOne({ barberiaId: bId });

        if (!config || !config.impuestos) {
            return {
                iva: 0,
                retencion: 0,
                montoIVA: 0,
                montoRetencion: 0
            };
        }

        const impuestos = config.impuestos;
        let montoIVA = 0;
        let montoRetencion = 0;

        if (impuestos.aplicarIVA) {
            montoIVA = Math.round((montoBarbero * impuestos.iva) / 100);
        }

        if (impuestos.aplicarRetencion) {
            montoRetencion = Math.round((montoBarbero * impuestos.retencion) / 100);
        }

        return {
            iva: impuestos.iva,
            retencion: impuestos.retencion,
            montoIVA,
            montoRetencion
        };
    }

    /**
     * Genera una transacción al completar una reserva
     */
    async generarTransaccion(reserva, creadoPorId = null, session = null) {
        // Obtener el precio total de la reserva
        const montoTotal = reserva.precioSnapshot?.precioFinal || 0;

        if (montoTotal === 0) {
            throw new Error('No se puede generar transacción sin monto');
        }

        // Calcular porcentaje aplicable
        const porcentaje = await this.calcularPorcentaje(
            reserva,
            reserva.barberoId,
            reserva.servicioId
        );

        // Calcular montos
        const montos = this.calcularMontos(montoTotal, porcentaje);

        // Calcular impuestos
        const impuestos = await this.calcularImpuestos(
            reserva.barberiaId,
            montos.montoBarbero
        );

        // Verificar si requiere aprobación
        const config = await RevenueConfig.findOne({ barberiaId: reserva.barberiaId }).session(session);
        const requiereAprobacion = config?.configuracionGeneral.requiereAprobacion || false;

        // Crear transacción
        const transactionArr = await Transaction.create([{
            barberiaId: reserva.barberiaId,
            barberoId: reserva.barberoId,
            reservaId: reserva._id,
            servicioId: reserva.servicioId,

            montosAutomaticos: {
                montoTotal: montos.montoTotal,
                montoBarbero: montos.montoBarbero,
                montoBarberia: montos.montoBarberia,
                metodoCalculo: 'porcentaje',
                porcentajeAplicado: porcentaje
            },

            montosFinales: {
                montoTotal: montos.montoTotal,
                montoBarbero: montos.montoBarbero,
                montoBarberia: montos.montoBarberia,
                fueAjustado: false
            },

            impuestos,

            estado: requiereAprobacion ? 'pendiente' : 'aprobado',
            fecha: reserva.completadaEn || new Date(),
            creadoPor: creadoPorId
        }], { session });

        const transaction = transactionArr[0];

        // Actualizar reserva con referencia a transacción
        reserva.transactionId = transaction._id;
        await reserva.save({ session });

        return transaction;
    }

    /**
     * Ajusta una transacción manualmente
     */
    async ajustarTransaccion(transactionId, ajuste, adminId) {
        const transaction = await Transaction.findById(transactionId);

        if (!transaction) {
            throw new Error('Transacción no encontrada');
        }

        // Verificar permisos
        const config = await RevenueConfig.findOne({ barberiaId: transaction.barberiaId });
        if (!config?.ajustesPermitidos.adminPuedeEditarMontos) {
            throw new Error('Ajustes manuales no permitidos en esta barbería');
        }

        // Validar estado
        if (transaction.estado === 'pagado') {
            throw new Error('No se puede ajustar una transacción ya pagada');
        }

        // Validar que los montos sumen el total
        const suma = ajuste.montoBarbero + ajuste.montoBarberia;
        if (Math.abs(suma - transaction.montosFinales.montoTotal) > 1) {
            throw new Error('La suma de los montos debe ser igual al total');
        }

        // Guardar en historial
        transaction.historialAjustes.push({
            montoBarberoAnterior: transaction.montosFinales.montoBarbero,
            montoBarberoNuevo: ajuste.montoBarbero,
            montoBarberíaAnterior: transaction.montosFinales.montoBarberia,
            montoBarberiaNuevo: ajuste.montoBarberia,
            razon: ajuste.razon,
            ajustadoPor: adminId,
            fecha: new Date()
        });

        // Actualizar montos finales
        transaction.montosFinales = {
            ...transaction.montosFinales,
            montoBarbero: ajuste.montoBarbero,
            montoBarberia: ajuste.montoBarberia,
            fueAjustado: true,
            ajustadoPor: adminId,
            fechaAjuste: new Date(),
            razonAjuste: ajuste.razon
        };

        // Actualizar extras si se proporcionan
        if (ajuste.extras) {
            transaction.extras = {
                ...transaction.extras,
                ...ajuste.extras
            };
        }

        await transaction.save();

        return transaction;
    }
}

module.exports = new RevenueCalculatorService();
