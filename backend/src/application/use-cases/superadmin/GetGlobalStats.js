/**
 * GetGlobalStats Use Case
 * Returns global statistics for SuperAdmin dashboard
 */
class GetGlobalStats {
    constructor(barberiaRepository) {
        this.barberiaRepository = barberiaRepository;
    }

    async execute() {
        // Get current stats
        const stats = await this.barberiaRepository.getGlobalStats();

        // Get previous month stats for comparison
        const previousStats = await this.barberiaRepository.getHistoricalStats(1);

        // Calculate MRR
        const mrrData = await this.barberiaRepository.getMRRByPlan();

        // Calculate previous month MRR (simplified - assumes same plan distribution)
        // In production, you'd want to track historical MRR in a separate collection
        const previousMRR = mrrData.total > 0
            ? Math.round(mrrData.total * (previousStats.activas / (stats.activas || 1)))
            : 0;

        const mrrGrowth = previousMRR > 0
            ? Math.round(((mrrData.total - previousMRR) / previousMRR) * 100 * 10) / 10
            : 0;

        // Calculate trends (month-over-month changes)
        const trends = {
            activas: stats.activas - previousStats.activas,
            trial: stats.trial - previousStats.trial,
            suspendidas: stats.suspendidas - previousStats.suspendidas,
            nuevas: stats.nuevasEsteMes
        };

        // Calculate churn rate
        const churnedThisMonth = await this.barberiaRepository.getChurnedThisMonth();
        const startOfMonthActive = previousStats.activas || 1;
        const churnRate = Math.round((churnedThisMonth / startOfMonthActive) * 100 * 10) / 10;

        // Get barberias expiring soon (next 5 days)
        const proximasVencer = await this.barberiaRepository.getExpiringSoon(5);

        // Calculate days remaining for each
        const today = new Date();
        const proximasVencerConDias = proximasVencer.map(barberia => {
            const obj = barberia.toObject();
            const diasRestantes = obj.proximoPago
                ? Math.ceil((new Date(obj.proximoPago) - today) / (1000 * 60 * 60 * 24))
                : null;

            return {
                id: obj.id,
                nombre: obj.nombre,
                email: obj.email,
                estado: obj.estado,
                proximoPago: obj.proximoPago,
                diasRestantes
            };
        });

        return {
            ...stats,
            mrr: {
                total: mrrData.total,
                previous: previousMRR,
                growth: mrrGrowth,
                arr: mrrData.arr,
                byPlan: mrrData.byPlan
            },
            trends,
            churnRate,
            proximasVencer: proximasVencerConDias
        };
    }
}

module.exports = GetGlobalStats;
