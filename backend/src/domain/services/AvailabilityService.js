const TimeSlot = require('../value-objects/TimeSlot');

/**
 * Availability Domain Service
 * Handles business logic for checking and generating available time slots
 */
class AvailabilityService {
    constructor(reservaRepository) {
        this.reservaRepository = reservaRepository;
    }

    /**
     * Get available time slots for a barbero on a specific date
     * @param {string} barberoId
     * @param {string} fecha - YYYY-MM-DD
     * @param {number} duracion - Duration in minutes
     * @param {Object} horario - Working hours { horaInicio, horaFin, activo }
     * @returns {Promise<string[]>} Array of available time slots
     */
    async getAvailableSlots(barberoId, fecha, duracion, horario, barberiaId) {
        // 1. Check if barbero works on this day
        if (!horario || !horario.activo) {
            return [];
        }

        // 2. Get existing reservations for this barbero on this date
        const reservasExistentes = await this.reservaRepository.findByBarberoAndDate(barberoId, fecha, barberiaId);

        // 3. Generate all possible time slots based on working hours
        const allSlots = this.generateTimeSlots(horario.horaInicio, horario.horaFin, duracion);

        // 4. Filter out occupied slots
        const availableSlots = allSlots.filter(slot => {
            const timeSlot = new TimeSlot(fecha, slot, duracion);
            return !this.isSlotOccupied(timeSlot, reservasExistentes);
        });

        return availableSlots;
    }

    /**
     * Check if a specific time slot is available
     * @param {string} barberoId
     * @param {string} fecha
     * @param {string} hora
     * @param {number} duracion
     * @param {string} excludeReservaId - Optional: exclude this reservation (for rescheduling)
     * @returns {Promise<boolean>}
     */
    async isTimeSlotAvailable(barberoId, fecha, hora, duracion, barberiaId, excludeReservaId = null) {
        const timeSlot = new TimeSlot(fecha, hora, duracion);

        // Check if slot is in the past
        if (timeSlot.isPast()) {
            return false;
        }

        // Get existing reservations
        const reservas = await this.reservaRepository.findByBarberoAndDate(barberoId, fecha, barberiaId);

        // Filter out the excluded reservation if provided
        const relevantReservas = excludeReservaId
            ? reservas.filter(r => r.id !== excludeReservaId)
            : reservas;

        return !this.isSlotOccupied(timeSlot, relevantReservas);
    }

    /**
     * Generate all possible time slots within working hours
     * @param {string} horaInicio - HH:MM
     * @param {string} horaFin - HH:MM
     * @param {number} duracion - Duration in minutes
     * @returns {string[]} Array of time slots in HH:MM format
     */
    generateTimeSlots(horaInicio, horaFin, duracion) {
        const slots = [];
        let currentTime = this.timeToMinutes(horaInicio);
        const endTime = this.timeToMinutes(horaFin);

        while (currentTime + duracion <= endTime) {
            slots.push(this.minutesToTime(currentTime));
            currentTime += duracion;
        }

        return slots;
    }

    /**
     * Check if a time slot overlaps with existing reservations
     * @param {TimeSlot} timeSlot
     * @param {Reserva[]} reservas
     * @returns {boolean}
     */
    isSlotOccupied(timeSlot, reservas) {
        return reservas.some(reserva => {
            // Cancelled reservations don't occupy slots
            if (reserva.isCancelled()) {
                return false;
            }

            // Check if the time slots overlap
            return timeSlot.overlaps(reserva.timeSlot);
        });
    }

    /**
     * Convert time string to minutes since midnight
     * @param {string} timeStr - HH:MM
     * @returns {number}
     */
    timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    /**
     * Convert minutes since midnight to time string
     * @param {number} minutes
     * @returns {string} HH:MM
     */
    minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    }

    /**
     * Calculate end time given start time and duration
     * @param {string} startTime - HH:MM
     * @param {number} durationMinutes
     * @returns {string} HH:MM
     */
    calculateEndTime(startTime, durationMinutes) {
        const startMinutes = this.timeToMinutes(startTime);
        const endMinutes = startMinutes + durationMinutes;
        return this.minutesToTime(endMinutes);
    }

    /**
     * Check if two time ranges overlap
     * @param {string} start1
     * @param {string} end1
     * @param {string} start2
     * @param {string} end2
     * @returns {boolean}
     */
    timeRangesOverlap(start1, end1, start2, end2) {
        const start1Min = this.timeToMinutes(start1);
        const end1Min = this.timeToMinutes(end1);
        const start2Min = this.timeToMinutes(start2);
        const end2Min = this.timeToMinutes(end2);

        return start1Min < end2Min && start2Min < end1Min;
    }
}

module.exports = AvailabilityService;
