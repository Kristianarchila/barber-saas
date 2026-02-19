const Pago = require("../models/Pago");
const Reserva = require("../models/Reserva");
const Servicio = require("../models/Servicio");
const Caja = require("../models/Caja");

/**
 * Controller de Pagos
 * Gestiona pagos con métodos mixtos y comisiones
 */

// Registrar nuevo pago
exports.registrarPago = async (req, res, next) => {
    try {
        const { reservaId, detallesPago } = req.body;
        const { barberiaId } = req.user;

        // Validar que la reserva existe y pertenece a la barbería
        const reserva = await Reserva.findOne({
            _id: reservaId,
            barberiaId
        }).populate('servicioId');

        if (!reserva) {
            return res.status(404).json({ message: "Reserva no encontrada" });
        }

        if (reserva.estado === 'COMPLETADA') {
            return res.status(400).json({ message: "Esta reserva ya fue pagada" });
        }

        const montoTotal = reserva.servicioId.precio;

        // Validar que la suma de pagos = total
        const totalPagado = detallesPago.reduce((sum, p) => sum + p.monto, 0);

        if (totalPagado !== montoTotal) {
            return res.status(400).json({
                message: `El total pagado ($${totalPagado}) no coincide con el monto ($${montoTotal})`
            });
        }

        // Calcular comisiones para cada método de pago
        const detallesConComision = detallesPago.map(detalle => {
            const comision = Pago.calcularComision(detalle.metodoPago, detalle.monto);
            return {
                ...detalle,
                comision,
                montoNeto: detalle.monto - comision
            };
        });

        // Crear pago
        const pago = await Pago.create({
            barberiaId,
            reservaId,
            barberoId: reserva.barberoId,
            fecha: new Date().toISOString().slice(0, 10),
            montoTotal,
            detallesPago: detallesConComision,
            registradoPor: req.user.nombre || req.user.email
        });

        // Actualizar estado de reserva
        await Reserva.findByIdAndUpdate(reservaId, {
            estado: 'COMPLETADA',
            pagado: true
        });

        // Si hay efectivo, agregarlo a la caja automáticamente
        const efectivo = detallesConComision.find(p => p.metodoPago === 'EFECTIVO');

        if (efectivo && efectivo.monto > 0) {
            const cajaAbierta = await Caja.obtenerCajaAbierta(barberiaId);

            if (cajaAbierta) {
                await cajaAbierta.agregarIngreso({
                    tipo: 'VENTA',
                    monto: efectivo.monto,
                    concepto: `Reserva #${reservaId.toString().slice(-6)} - ${reserva.nombreCliente}`,
                    hora: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
                    reservaId,
                    pagoId: pago._id
                });
            }
        }

        res.status(201).json({
            message: "Pago registrado correctamente",
            pago
        });

    } catch (error) {
        console.error("Error al registrar pago:", error);
        next(error);
    }
};

// Obtener pagos con filtros
exports.obtenerPagos = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { fechaInicio, fechaFin, barberoId, metodoPago } = req.query;

        const filtro = { barberiaId };

        if (fechaInicio && fechaFin) {
            filtro.fecha = { $gte: fechaInicio, $lte: fechaFin };
        }

        if (barberoId) {
            filtro.barberoId = barberoId;
        }

        const pagos = await Pago.find(filtro)
            .populate('reservaId', 'nombreCliente emailCliente')
            .populate('barberoId', 'nombre')
            .sort({ fecha: -1, createdAt: -1 })
            .limit(100);

        // Filtrar por método de pago si se especifica
        let pagosFiltrados = pagos;
        if (metodoPago) {
            pagosFiltrados = pagos.filter(p =>
                p.detallesPago.some(d => d.metodoPago === metodoPago)
            );
        }

        res.json(pagosFiltrados);

    } catch (error) {
        console.error("Error al obtener pagos:", error);
        next(error);
    }
};

// Obtener resumen de ingresos
exports.obtenerResumenIngresos = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { mes } = req.query; // Formato: YYYY-MM

        const hoy = new Date().toISOString().slice(0, 10);
        const inicioMes = mes || hoy.slice(0, 7);
        const finMes = `${inicioMes}-31`;

        const pagos = await Pago.find({
            barberiaId,
            fecha: { $gte: `${inicioMes}-01`, $lte: finMes }
        });

        // Calcular totales
        let ingresosBrutos = 0;
        let totalEfectivo = 0;
        let totalTarjeta = 0;
        let totalTransferencia = 0;
        let comisionesTotales = 0;
        let ingresosNetos = 0;

        pagos.forEach(pago => {
            ingresosBrutos += pago.montoTotal;
            totalEfectivo += pago.totalEfectivo;
            totalTarjeta += pago.totalTarjeta;
            totalTransferencia += pago.totalTransferencia;
            comisionesTotales += pago.comisionTotal;
            ingresosNetos += pago.ingresoNeto;
        });

        // Ingresos de hoy
        const pagosHoy = pagos.filter(p => p.fecha === hoy);
        const ingresosHoy = pagosHoy.reduce((sum, p) => sum + p.ingresoNeto, 0);

        res.json({
            periodo: inicioMes,
            ingresosBrutos,
            desglosePorMetodo: {
                efectivo: {
                    monto: totalEfectivo,
                    porcentaje: ingresosBrutos > 0 ? Math.round((totalEfectivo / ingresosBrutos) * 100) : 0,
                    comision: 0
                },
                tarjeta: {
                    monto: totalTarjeta,
                    porcentaje: ingresosBrutos > 0 ? Math.round((totalTarjeta / ingresosBrutos) * 100) : 0,
                    comision: comisionesTotales
                },
                transferencia: {
                    monto: totalTransferencia,
                    porcentaje: ingresosBrutos > 0 ? Math.round((totalTransferencia / ingresosBrutos) * 100) : 0,
                    comision: 0
                }
            },
            comisionesTotales,
            ingresosNetos,
            ingresosHoy,
            cantidadPagos: pagos.length,

            // IVA
            ivaDebito: pagos.reduce((sum, p) => sum + p.iva, 0)
        });

    } catch (error) {
        console.error("Error al obtener resumen de ingresos:", error);
        next(error);
    }
};

module.exports = {
    registrarPago: exports.registrarPago,
    obtenerPagos: exports.obtenerPagos,
    obtenerResumenIngresos: exports.obtenerResumenIngresos
};
