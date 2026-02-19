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
     * @param {Object} query - { barberoId, fecha, duracion, barberiaId }
     * @returns {Promise<string[]>} Array of available time slots
     */
    async execute(query) {
        const { barberoId, fecha, duracion, barberiaId } = query;

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

        // 3. Get available slots using domain service
        let availableSlots = await this.availabilityService.getAvailableSlots(
            barberoId,
            fecha,
            duracion,
            horario
        );

        // 4. Filter out blocked time slots
        if (this.checkBloqueos && barberiaId) {
            const filteredSlots = [];

            for (const slot of availableSlots) {
                try {
                    const result = await this.checkBloqueos.execute({
                        barberiaId,
                        fecha,
                        hora: slot,
                        barberoId
                    });

                    // Only include slot if it's not blocked
                    if (!result.bloqueado) {
                        filteredSlots.push(slot);
                    }
                } catch (error) {
                    console.error(`Error checking bloqueo for slot ${slot}:`, error);
                    // On error, exclude the slot to be safe
                }
            }

            availableSlots = filteredSlots;
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
