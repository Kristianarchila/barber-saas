/**
 * GetWaitingListByBarberia Use Case
 * Retrieves all waiting list entries for a barberia with filters
 */
class GetWaitingListByBarberia {
    constructor(waitingListRepository) {
        this.waitingListRepository = waitingListRepository;
    }

    async execute(barberiaId, filters = {}) {
        // Validate barberiaId
        if (!barberiaId) {
            throw new Error('barberiaId es requerido');
        }

        // Get entries with filters
        const entries = await this.waitingListRepository.findActiveByBarberia(
            barberiaId,
            filters
        );

        // Group by status for better organization
        const grouped = {
            activas: entries.filter(e => e.estado === 'ACTIVA'),
            notificadas: entries.filter(e => e.estado === 'NOTIFICADA'),
            convertidas: entries.filter(e => e.estado === 'CONVERTIDA'),
            expiradas: entries.filter(e => e.estado === 'EXPIRADA'),
            canceladas: entries.filter(e => e.estado === 'CANCELADA')
        };

        // Calculate statistics
        const stats = {
            total: entries.length,
            activas: grouped.activas.length,
            notificadas: grouped.notificadas.length,
            convertidas: grouped.convertidas.length,
            conversionRate: entries.length > 0
                ? ((grouped.convertidas.length / entries.length) * 100).toFixed(1)
                : 0
        };

        return {
            entries,
            grouped,
            stats
        };
    }
}

module.exports = GetWaitingListByBarberia;
