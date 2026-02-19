/**
 * GetBalanceBarbero Use Case
 */
class GetBalanceBarbero {
    constructor(transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    async execute(barberoId, barberiaId) {
        // Balance pendiente
        const pendienteResult = await this.transactionRepository.aggregate([
            { $match: { barberoId, barberiaId, estado: 'aprobado' } },
            {
                $group: {
                    _id: null,
                    totalTransacciones: { $sum: 1 },
                    totalMontoBarbero: { $sum: '$montosFinales.montoBarbero' },
                    totalMontoBarberia: { $sum: '$montosFinales.montoBarberia' },
                    totalImpuestos: { $sum: { $add: ['$impuestos.montoIVA', '$impuestos.montoRetencion'] } }
                }
            }
        ]);

        // Balance pagado
        const pagadoResult = await this.transactionRepository.aggregate([
            { $match: { barberoId, barberiaId, estado: 'pagado' } },
            {
                $group: {
                    _id: null,
                    totalTransacciones: { $sum: 1 },
                    totalMontoBarbero: { $sum: '$montosFinales.montoBarbero' },
                    totalMontoBarberia: { $sum: '$montosFinales.montoBarberia' },
                    totalImpuestos: { $sum: { $add: ['$impuestos.montoIVA', '$impuestos.montoRetencion'] } }
                }
            }
        ]);

        // Total general
        const totalResult = await this.transactionRepository.aggregate([
            { $match: { barberoId, barberiaId } },
            {
                $group: {
                    _id: null,
                    totalTransacciones: { $sum: 1 },
                    totalMontoBarbero: { $sum: '$montosFinales.montoBarbero' },
                    totalMontoBarberia: { $sum: '$montosFinales.montoBarberia' },
                    totalImpuestos: { $sum: { $add: ['$impuestos.montoIVA', '$impuestos.montoRetencion'] } }
                }
            }
        ]);

        const defaultBalance = {
            totalTransacciones: 0,
            totalMontoBarbero: 0,
            totalMontoBarberia: 0,
            totalImpuestos: 0
        };

        return {
            pendiente: pendienteResult[0] || defaultBalance,
            pagado: pagadoResult[0] || defaultBalance,
            total: totalResult[0] || defaultBalance
        };
    }
}

module.exports = GetBalanceBarbero;
