const Barbero = require("../models/Barbero");
const RevenueConfig = require("../models/RevenueConfig");

/**
 * Controller de Reportes
 * Genera estadísticas y métricas del negocio
 */

// Obtener resumen general del negocio
exports.obtenerResumenGeneral = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { mes, fechaInicio: customInicio, fechaFin: customFin } = req.query;

        let fechaInicio, fechaFin;

        // Si se proporciona rango personalizado
        if (customInicio && customFin) {
            fechaInicio = customInicio;
            fechaFin = customFin;
        } else {
            // Usar mes (formato YYYY-MM)
            const hoy = new Date().toISOString().slice(0, 10);
            const inicioMes = mes || hoy.slice(0, 7);
            fechaInicio = `${inicioMes}-01`;
            fechaFin = `${inicioMes}-31`;
        }

        // Calcular período anterior para comparación
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        const diasPeriodo = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));

        const inicioAnterior = new Date(inicio);
        inicioAnterior.setDate(inicioAnterior.getDate() - diasPeriodo);
        const finAnterior = new Date(inicio);
        finAnterior.setDate(finAnterior.getDate() - 1);

        // Ingresos del período actual
        const pagos = await Pago.find({
            barberiaId,
            fecha: { $gte: fechaInicio, $lte: fechaFin }
        });

        const ingresosTotales = pagos.reduce((sum, p) => sum + p.ingresoNeto, 0);
        const comisionesTotales = pagos.reduce((sum, p) => sum + p.comisionTotal, 0);

        // Ingresos del período anterior
        const pagosAnterior = await Pago.find({
            barberiaId,
            fecha: {
                $gte: inicioAnterior.toISOString().slice(0, 10),
                $lte: finAnterior.toISOString().slice(0, 10)
            }
        });
        const ingresosAnterior = pagosAnterior.reduce((sum, p) => sum + p.ingresoNeto, 0);

        // Egresos del período
        const egresos = await Egreso.find({
            barberiaId,
            fecha: { $gte: fechaInicio, $lte: fechaFin },
            activo: true
        });
        const egresosTotales = egresos.reduce((sum, e) => sum + e.montoTotal, 0);

        // Utilidad neta
        const utilidadNeta = ingresosTotales - egresosTotales;

        // Clientes atendidos
        const reservas = await Reserva.find({
            barberiaId,
            fecha: { $gte: fechaInicio, $lte: fechaFin },
            estado: 'COMPLETADA'
        });
        const clientesAtendidos = reservas.length;

        // Ticket promedio
        const ticketPromedio = clientesAtendidos > 0 ? Math.round(ingresosTotales / clientesAtendidos) : 0;

        // Variación vs período anterior
        const variacionIngresos = ingresosAnterior > 0
            ? Math.round(((ingresosTotales - ingresosAnterior) / ingresosAnterior) * 100)
            : 0;

        res.json({
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
        });

    } catch (error) {
        console.error("Error al obtener resumen general:", error);
        next(error);
    }
};

// Obtener rendimiento por barbero
exports.obtenerRendimientoBarberos = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { mes } = req.query;

        const hoy = new Date().toISOString().slice(0, 10);
        const inicioMes = mes || hoy.slice(0, 7);
        const finMes = `${inicioMes}-31`;
        const fechaInicio = `${inicioMes}-01`;

        // Obtener configuración de ingresos de la barbería
        const config = await RevenueConfig.findOne({ barberiaId });
        const defaultComision = config?.configuracionGeneral?.porcentajeDefaultBarbero || 50;

        const barberos = await Barbero.find({ barberiaId, activo: true });

        const rendimiento = await Promise.all(barberos.map(async (barbero) => {
            // Reservas completadas
            const reservas = await Reserva.find({
                barberiaId,
                barberoId: barbero._id,
                fecha: { $gte: fechaInicio, $lte: finMes },
                estado: 'COMPLETADA'
            });

            // Pagos del barbero
            const pagos = await Pago.find({
                barberiaId,
                barberoId: barbero._id,
                fecha: { $gte: fechaInicio, $lte: finMes }
            });

            const ingresosTotales = pagos.reduce((sum, p) => sum + (p.montoTotal || 0), 0);
            const ingresosNetos = pagos.reduce((sum, p) => sum + (p.ingresoNeto || 0), 0);
            const cortesRealizados = reservas.length;
            const promedioCliente = cortesRealizados > 0 ? Math.round(ingresosTotales / cortesRealizados) : 0;

            // Determinar comisión del barbero
            let porcentajeComision = defaultComision;

            // Buscar override específico para este barbero
            if (config?.overridesPorBarbero) {
                const override = config.overridesPorBarbero.find(
                    ov => ov.barberoId.toString() === barbero.usuario?.toString() || ov.barberoId.toString() === barbero._id.toString()
                );
                if (override && override.activo) {
                    porcentajeComision = override.porcentajeBarbero;
                }
            }

            const comision = Math.round(ingresosNetos * (porcentajeComision / 100));

            return {
                barberoId: barbero._id,
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

        // Ordenar por ingresos
        rendimiento.sort((a, b) => b.ingresosTotales - a.ingresosTotales);

        res.json(rendimiento);

    } catch (error) {
        console.error("Error al obtener rendimiento de barberos:", error);
        next(error);
    }
};

// Obtener servicios más vendidos
exports.obtenerServiciosMasVendidos = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { mes } = req.query;

        const hoy = new Date().toISOString().slice(0, 10);
        const inicioMes = mes || hoy.slice(0, 7);
        const finMes = `${inicioMes}-31`;
        const fechaInicio = `${inicioMes}-01`;

        const reservas = await Reserva.find({
            barberiaId,
            fecha: { $gte: fechaInicio, $lte: finMes },
            estado: 'COMPLETADA'
        }).populate('servicioId');

        // Agrupar por servicio
        const serviciosMap = {};
        let totalServicios = 0;

        reservas.forEach(reserva => {
            if (reserva.servicioId) {
                const nombre = reserva.servicioId.nombre;
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

        // Convertir a array y calcular porcentajes
        const servicios = Object.values(serviciosMap).map(servicio => ({
            ...servicio,
            porcentaje: totalServicios > 0 ? Math.round((servicio.cantidad / totalServicios) * 100) : 0
        }));

        // Ordenar por cantidad
        servicios.sort((a, b) => b.cantidad - a.cantidad);

        res.json({
            servicios,
            totalServicios
        });

    } catch (error) {
        console.error("Error al obtener servicios más vendidos:", error);
        next(error);
    }
};

// Obtener análisis de métodos de pago
exports.obtenerAnalisisPagos = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { mes } = req.query;

        const hoy = new Date().toISOString().slice(0, 10);
        const inicioMes = mes || hoy.slice(0, 7);
        const finMes = `${inicioMes}-31`;
        const fechaInicio = `${inicioMes}-01`;

        const pagos = await Pago.find({
            barberiaId,
            fecha: { $gte: fechaInicio, $lte: finMes }
        });

        const analisis = {
            efectivo: { monto: 0, cantidad: 0, porcentaje: 0 },
            tarjeta: { monto: 0, cantidad: 0, porcentaje: 0 },
            transferencia: { monto: 0, cantidad: 0, porcentaje: 0 }
        };

        let totalMonto = 0;

        pagos.forEach(pago => {
            analisis.efectivo.monto += pago.totalEfectivo || 0;
            analisis.tarjeta.monto += pago.totalTarjeta || 0;
            analisis.transferencia.monto += pago.totalTransferencia || 0;
            totalMonto += pago.montoTotal;
        });

        // Calcular porcentajes
        if (totalMonto > 0) {
            analisis.efectivo.porcentaje = Math.round((analisis.efectivo.monto / totalMonto) * 100);
            analisis.tarjeta.porcentaje = Math.round((analisis.tarjeta.monto / totalMonto) * 100);
            analisis.transferencia.porcentaje = Math.round((analisis.transferencia.monto / totalMonto) * 100);
        }

        res.json(analisis);

    } catch (error) {
        console.error("Error al obtener análisis de pagos:", error);
        next(error);
    }
};

// Obtener tendencias de ingresos (por día)
exports.obtenerTendenciasIngresos = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { mes } = req.query;

        const hoy = new Date().toISOString().slice(0, 10);
        const inicioMes = mes || hoy.slice(0, 7);
        const finMes = `${inicioMes}-31`;
        const fechaInicio = `${inicioMes}-01`;

        const pagos = await Pago.find({
            barberiaId,
            fecha: { $gte: fechaInicio, $lte: finMes }
        }).sort({ fecha: 1 });

        // Agrupar por día
        const ingresosPorDia = {};
        pagos.forEach(pago => {
            if (!ingresosPorDia[pago.fecha]) {
                ingresosPorDia[pago.fecha] = 0;
            }
            ingresosPorDia[pago.fecha] += pago.ingresoNeto;
        });

        // Convertir a array
        const tendencias = Object.entries(ingresosPorDia).map(([fecha, monto]) => ({
            fecha,
            monto: Math.round(monto)
        }));

        res.json(tendencias);

    } catch (error) {
        console.error("Error al obtener tendencias:", error);
        next(error);
    }
};

module.exports = {
    obtenerResumenGeneral: exports.obtenerResumenGeneral,
    obtenerRendimientoBarberos: exports.obtenerRendimientoBarberos,
    obtenerServiciosMasVendidos: exports.obtenerServiciosMasVendidos,
    obtenerAnalisisPagos: exports.obtenerAnalisisPagos,
    obtenerTendenciasIngresos: exports.obtenerTendenciasIngresos
};
