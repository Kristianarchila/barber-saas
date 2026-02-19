const Transaction = require('../models/Transaction');
const revenueCalculator = require('../services/revenueCalculator.service');

/**
 * Obtener todas las transacciones con filtros
 */
exports.getTransactions = async (req, res) => {
    try {
        const { barberiaId } = req;
        const { barberoId, estado, desde, hasta, page = 1, limit = 50 } = req.query;

        const query = { barberiaId };

        if (barberoId) query.barberoId = barberoId;
        if (estado) query.estado = estado;
        if (desde || hasta) {
            query.fecha = {};
            if (desde) query.fecha.$gte = new Date(desde);
            if (hasta) query.fecha.$lte = new Date(hasta);
        }

        const skip = (page - 1) * limit;

        const [transactions, total] = await Promise.all([
            Transaction.find(query)
                .populate('barberoId', 'nombre email foto')
                .populate('servicioId', 'nombre precio')
                .populate('reservaId', 'fecha hora nombreCliente')
                .sort({ fecha: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Transaction.countDocuments(query)
        ]);

        res.json({
            transactions,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('❌ Error obteniendo transacciones:', error);
        res.status(500).json({ message: 'Error al obtener transacciones' });
    }
};

/**
 * Obtener detalle de una transacción
 */
exports.getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;
        const { barberiaId } = req;

        const transaction = await Transaction.findOne({ _id: id, barberiaId })
            .populate('barberoId', 'nombre email foto')
            .populate('servicioId', 'nombre precio duracion')
            .populate('reservaId', 'fecha hora nombreCliente emailCliente')
            .populate('historialAjustes.ajustadoPor', 'nombre email');

        if (!transaction) {
            return res.status(404).json({ message: 'Transacción no encontrada' });
        }

        res.json(transaction);
    } catch (error) {
        console.error('❌ Error obteniendo transacción:', error);
        res.status(500).json({ message: 'Error al obtener transacción' });
    }
};

/**
 * Ajustar transacción manualmente
 */
exports.ajustarTransaccion = async (req, res) => {
    try {
        const { id } = req.params;
        const { montoBarbero, montoBarberia, razon, extras } = req.body;
        const adminId = req.user._id;

        if (!razon) {
            return res.status(400).json({ message: 'Debe proporcionar una razón para el ajuste' });
        }

        const transaction = await revenueCalculator.ajustarTransaccion(
            id,
            { montoBarbero, montoBarberia, razon, extras },
            adminId
        );

        res.json(transaction);
    } catch (error) {
        console.error('❌ Error ajustando transacción:', error);
        res.status(400).json({ message: error.message || 'Error al ajustar transacción' });
    }
};

/**
 * Marcar transacción como pagada
 */
exports.marcarComoPagado = async (req, res) => {
    try {
        const { id } = req.params;
        const { barberiaId } = req;
        const adminId = req.user._id;
        const { metodoPago, notas } = req.body;

        const transaction = await Transaction.findOne({ _id: id, barberiaId });

        if (!transaction) {
            return res.status(404).json({ message: 'Transacción no encontrada' });
        }

        if (transaction.estado === 'pagado') {
            return res.status(400).json({ message: 'La transacción ya está marcada como pagada' });
        }

        transaction.estado = 'pagado';
        transaction.fechaPago = new Date();
        if (metodoPago) transaction.metodoPago = metodoPago;
        if (notas) transaction.notas = notas;
        transaction.aprobaciones.adminAprobo = true;
        transaction.aprobaciones.fechaAprobacionAdmin = new Date();

        await transaction.save();

        res.json(transaction);
    } catch (error) {
        console.error('❌ Error marcando como pagado:', error);
        res.status(500).json({ message: 'Error al marcar como pagado' });
    }
};

/**
 * Obtener balance de un barbero
 */
exports.getBalanceBarbero = async (req, res) => {
    try {
        const { barberoId } = req.params;
        const { barberiaId } = req;

        // Balance pendiente
        const pendiente = await Transaction.calcularBalance(barberoId, 'aprobado');

        // Balance pagado
        const pagado = await Transaction.calcularBalance(barberoId, 'pagado');

        // Total general
        const total = await Transaction.calcularBalance(barberoId);

        res.json({
            pendiente,
            pagado,
            total
        });
    } catch (error) {
        console.error('❌ Error obteniendo balance:', error);
        res.status(500).json({ message: 'Error al obtener balance' });
    }
};

/**
 * Generar reporte financiero
 */
exports.getReporte = async (req, res) => {
    try {
        const { barberiaId } = req;
        const { desde, hasta, barberoId, tipo = 'general' } = req.query;

        const match = { barberiaId };

        if (barberoId) match.barberoId = barberoId;
        if (desde || hasta) {
            match.fecha = {};
            if (desde) match.fecha.$gte = new Date(desde);
            if (hasta) match.fecha.$lte = new Date(hasta);
        }

        // Match para hoy
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const matchHoy = { barberiaId, fecha: { $gte: hoy } };

        // Match mes anterior
        const inicioMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
        const finMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0, 23, 59, 59);
        const matchMesAnterior = { barberiaId, fecha: { $gte: inicioMesAnterior, $lte: finMesAnterior } };

        // Reporte general
        const [resumen, resumenHoy, resumenMesAnterior] = await Promise.all([
            Transaction.aggregate([
                { $match: match },
                {
                    $group: {
                        _id: null,
                        totalTransacciones: { $sum: 1 },
                        totalIngresos: { $sum: '$montosFinales.montoTotal' },
                        totalBarberos: { $sum: '$montosFinales.montoBarbero' },
                        totalBarberia: { $sum: '$montosFinales.montoBarberia' },
                        totalImpuestos: {
                            $sum: {
                                $add: ['$impuestos.montoIVA', '$impuestos.montoRetencion']
                            }
                        },
                        transaccionesPendientes: {
                            $sum: { $cond: [{ $eq: ['$estado', 'pendiente'] }, 1, 0] }
                        },
                        transaccionesAprobadas: {
                            $sum: { $cond: [{ $eq: ['$estado', 'aprobado'] }, 1, 0] }
                        },
                        transaccionesPagadas: {
                            $sum: { $cond: [{ $eq: ['$estado', 'pagado'] }, 1, 0] }
                        }
                    }
                }
            ]),
            Transaction.aggregate([
                { $match: matchHoy },
                {
                    $group: {
                        _id: null,
                        ingresos: { $sum: '$montosFinales.montoTotal' },
                        transacciones: { $sum: 1 }
                    }
                }
            ]),
            Transaction.aggregate([
                { $match: matchMesAnterior },
                {
                    $group: {
                        _id: null,
                        ingresos: { $sum: '$montosFinales.montoTotal' }
                    }
                }
            ])
        ]);

        // Top barberos
        const topBarberos = await Transaction.aggregate([
            { $match: match },
            {
                $group: {
                    _id: '$barberoId',
                    totalIngresos: { $sum: '$montosFinales.montoBarbero' },
                    totalTransacciones: { $sum: 1 }
                }
            },
            { $sort: { totalIngresos: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'barbero'
                }
            },
            { $unwind: { path: '$barbero', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    nombre: { $ifNull: ['$barbero.nombre', 'Barbero Retirado'] },
                    foto: '$barbero.foto',
                    totalIngresos: 1,
                    totalTransacciones: 1
                }
            }
        ]);

        // Calcular Crecimiento
        const ingresosMesActual = resumen[0]?.totalIngresos || 0;
        const ingresosMesAnterior = resumenMesAnterior[0]?.ingresos || 0;
        let crecimiento = 0;
        if (ingresosMesAnterior > 0) {
            crecimiento = ((ingresosMesActual - ingresosMesAnterior) / ingresosMesAnterior) * 100;
        } else if (ingresosMesActual > 0) {
            crecimiento = 100;
        }

        res.json({
            resumen: resumen[0] || {},
            resumenHoy: resumenHoy[0] || { ingresos: 0, transacciones: 0 },
            crecimiento: Math.round(crecimiento * 10) / 10,
            topBarberos,
            ingresosPorMes: [] // Lo mantengo vacío o simplificado por ahora
        });
    } catch (error) {
        console.error('❌ Error generando reporte:', error);
        res.status(500).json({ message: 'Error al generar reporte' });
    }
};

/**
 * Obtener transacciones del barbero (para vista de barbero)
 */
exports.getMisTransacciones = async (req, res) => {
    try {
        const barberoId = req.user._id;
        const { estado, desde, hasta, page = 1, limit = 20 } = req.query;

        const query = { barberoId };

        if (estado) query.estado = estado;
        if (desde || hasta) {
            query.fecha = {};
            if (desde) query.fecha.$gte = new Date(desde);
            if (hasta) query.fecha.$lte = new Date(hasta);
        }

        const skip = (page - 1) * limit;

        const [transactions, total] = await Promise.all([
            Transaction.find(query)
                .populate('servicioId', 'nombre')
                .populate('reservaId', 'fecha hora nombreCliente')
                .sort({ fecha: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Transaction.countDocuments(query)
        ]);

        res.json({
            transactions,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('❌ Error obteniendo mis transacciones:', error);
        res.status(500).json({ message: 'Error al obtener transacciones' });
    }
};

/**
 * Obtener mi balance (para vista de barbero)
 */
exports.getMiBalance = async (req, res) => {
    try {
        const barberoId = req.user._id;

        const balance = await Transaction.calcularBalance(barberoId);
        const pendiente = await Transaction.calcularBalance(barberoId, 'aprobado');
        const pagado = await Transaction.calcularBalance(barberoId, 'pagado');

        res.json({
            total: balance,
            pendiente,
            pagado
        });
    } catch (error) {
        console.error('❌ Error obteniendo mi balance:', error);
        res.status(500).json({ message: 'Error al obtener balance' });
    }
};
