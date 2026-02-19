/**
 * GetReporteFinanciero Use Case
 */
class GetReporteFinanciero {
    constructor(transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    async execute(barberiaId, { desde, hasta, barberoId }) {
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
