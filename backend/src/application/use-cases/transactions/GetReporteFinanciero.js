/**
 * GetReporteFinanciero Use Case
 */
class GetReporteFinanciero {
    constructor(transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    async execute(barberiaId, { desde, hasta, barberoId }) {
        const mongoose = require('mongoose');
        const targetBarberiaId = typeof barberiaId === 'string' ? new mongoose.Types.ObjectId(barberiaId) : barberiaId;

        const match = { barberiaId: targetBarberiaId };

        if (barberoId) match.barberoId = typeof barberoId === 'string' ? new mongoose.Types.ObjectId(barberoId) : barberoId;

        if (desde || hasta) {
            match.fecha = {};
            try {
                if (desde) {
                    const d = new Date(desde);
                    if (!isNaN(d.getTime())) match.fecha.$gte = d;
                }
                if (hasta) {
                    const h = new Date(hasta);
                    if (!isNaN(h.getTime())) match.fecha.$lte = h;
                }
            } catch (e) {
                console.error("Invalid date filter in report", e);
            }
            if (Object.keys(match.fecha).length === 0) delete match.fecha;
        }

        // Match para hoy
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const matchHoy = { barberiaId: targetBarberiaId, fecha: { $gte: hoy } };

        // Match mes anterior
        const inicioMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
        const finMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0, 23, 59, 59);
        const matchMesAnterior = { barberiaId: targetBarberiaId, fecha: { $gte: inicioMesAnterior, $lte: finMesAnterior } };

        // Reporte general
        const [resumen, resumenHoy, resumenMesAnterior] = await Promise.all([
            this.transactionRepository.aggregate([
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
            this.transactionRepository.aggregate([
                { $match: matchHoy },
                {
                    $group: {
                        _id: null,
                        ingresos: { $sum: '$montosFinales.montoTotal' },
                        transacciones: { $sum: 1 }
                    }
                }
            ]),
            this.transactionRepository.aggregate([
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
        const topBarberos = await this.transactionRepository.aggregate([
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

        return {
            resumen: resumen[0] || {},
            resumenHoy: resumenHoy[0] || { ingresos: 0, transacciones: 0 },
            crecimiento: Math.round(crecimiento * 10) / 10,
            topBarberos,
            ingresosPorMes: []
        };
    }
}

module.exports = GetReporteFinanciero;
