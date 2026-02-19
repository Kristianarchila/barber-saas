/**
 * @file ResetMonthlyCancelaciones.js
 * @description Use case for resetting monthly cancellation counters (cron job)
 */

class ResetMonthlyCancelaciones {
    constructor(clienteStatsRepository) {
        this.clienteStatsRepository = clienteStatsRepository;
    }

    /**
     * Resets monthly cancellation counters for all clients
     * @returns {Promise<Object>} Result with count of reset records
     */
    async execute() {
        console.log('[ResetMonthlyCancelaciones] Iniciando reset mensual de cancelaciones...');

        try {
            await this.clienteStatsRepository.resetMonthlyCancelaciones();

            console.log('[ResetMonthlyCancelaciones] Reset completado exitosamente');

            return {
                success: true,
                message: 'Contadores de cancelaciones mensuales reseteados exitosamente',
                timestamp: new Date()
            };
        } catch (error) {
            console.error('[ResetMonthlyCancelaciones] Error:', error);
            throw error;
        }
    }
}

module.exports = ResetMonthlyCancelaciones;
