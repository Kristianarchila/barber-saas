/**
 * Get Available Slots Use Case
 * Returns available time slots for a barbero on a specific date
 */
class GetAvailableSlots {
    constructor(availabilityService, barberoRepository, horarioRepository, checkBloqueos = null) {
        this.availabilityService = availabilityService;
        this.barberoRepository = barberoRepository;
        this.horarioRepository = horarioRepository;
        this.checkBloqueos = checkBloqueos;
    }

    /**
     * Execute the use case
     * @param {Object} query - { barberoId, fecha, duracion, barberiaId, timezone? }
     * @returns {Promise<string[]>} Array of available time slots
     */
    async execute(query) {
        const { barberoId, fecha, duracion, barberiaId, timezone = 'America/Santiago' } = query;

        // 1. Validate barbero exists
        const barbero = await this.barberoRepository.findById(barberoId, barberiaId);
        if (!barbero) {
            throw new Error('Barbero no encontrado');
        }

        // 2. Get barbero's schedule for the requested date
        const dayOfWeek = this.getDayOfWeek(fecha);
        const horario = await this.horarioRepository.findByBarberoAndDay(barberoId, dayOfWeek);

        if (!horario || !horario.activo) {
            return []; // Barbero doesn't work on this day
        }

        // 3. Get available slots — pass timezone so past-slot filtering uses barbería's local time
        let availableSlots = await this.availabilityService.getAvailableSlots(
            barberoId,
            fecha,
            duracion,
            horario,
            barberiaId,
            timezone
        );

        // 4. Filter out blocked time slots
        // PERF FIX: Fetch ALL bloqueos for this date in a SINGLE DB query,
        // then filter in-memory — avoids the previous N+1 query pattern
        // where one DB call was made per slot.
        if (this.checkBloqueos && barberiaId) {
            try {
                const bloqueoRepository = this.checkBloqueos.bloqueoRepository;
                const bloqueos = await bloqueoRepository.findActiveByDate(barberiaId, fecha, barberoId);

                if (bloqueos.length > 0) {
                    availableSlots = availableSlots.filter(slot => {
                        const bloqueado = bloqueos.some(bloqueo => {
                            if (!bloqueo.appliesToBarbero(barberoId)) return false;
                            return bloqueo.blocksDateTime(fecha, slot);
                        });
                        return !bloqueado;
                    });
                }
                // If no bloqueos for the date, skip filtering entirely (fast path)
            } catch (error) {
                console.error('Error fetching bloqueos for slot filtering:', error);
                // On error, return slots unfiltered (fail-open) rather than blocking all slots
            }
        }

        return availableSlots;
    }

    /**
     * Get day of week from date
     * @param {string} fecha - YYYY-MM-DD
     * @returns {number} Day index (0 = Domingo, 6 = Sábado)
     */
    getDayOfWeek(fecha) {
        const date = new Date(fecha + 'T00:00:00');
        return date.getDay();
    }
}

module.exports = GetAvailableSlots;
