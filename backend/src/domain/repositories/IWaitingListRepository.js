/**
 * IWaitingListRepository
 * Interface for WaitingList repository
 */
class IWaitingListRepository {
    /**
     * Create a new waiting list entry
     */
    async create(data) {
        throw new Error('Method not implemented');
    }

    /**
     * Find waiting list entry by ID
     */
    async findById(id) {
        throw new Error('Method not implemented');
    }

    /**
     * Find waiting list entry by token
     */
    async findByToken(token) {
        throw new Error('Method not implemented');
    }

    /**
     * Find all active waiting list entries for a barberia
     */
    async findActiveByBarberia(barberiaId, filters = {}) {
        throw new Error('Method not implemented');
    }

    /**
     * Find matching entries for a specific slot
     */
    async findMatchingEntries(barberiaId, barberoId, servicioId, fecha, hora) {
        throw new Error('Method not implemented');
    }

    /**
     * Update waiting list entry
     */
    async update(id, data) {
        throw new Error('Method not implemented');
    }

    /**
     * Mark as notified
     */
    async markAsNotified(id, token, expiresInHours = 48) {
        throw new Error('Method not implemented');
    }

    /**
     * Mark as converted
     */
    async markAsConverted(id, reservaId) {
        throw new Error('Method not implemented');
    }

    /**
     * Mark as expired
     */
    async markAsExpired(id) {
        throw new Error('Method not implemented');
    }

    /**
     * Mark as cancelled
     */
    async markAsCancelled(id) {
        throw new Error('Method not implemented');
    }

    /**
     * Find expired notifications
     */
    async findExpiredNotifications() {
        throw new Error('Method not implemented');
    }

    /**
     * Get position in queue
     */
    async getPosition(id) {
        throw new Error('Method not implemented');
    }

    /**
     * Count active entries for a client
     */
    async countActiveByClient(clienteEmail, barberiaId) {
        throw new Error('Method not implemented');
    }

    /**
     * Delete entry
     */
    async delete(id) {
        throw new Error('Method not implemented');
    }
}

module.exports = IWaitingListRepository;
