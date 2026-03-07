'use strict';

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

const TimeSlot = require('../value-objects/TimeSlot');

const DEFAULT_TIMEZONE = 'America/Santiago';

/**
 * Availability Domain Service
 *
 * Handles business logic for checking and generating available time slots.
 *
 * MULTITENANT: All time comparisons are performed in the barbería's own IANA
 * timezone. Never fall back to server TZ — each tenant has their own location.
 * The `tzName` parameter MUST always come from the barbería document.
 */
class AvailabilityService {
    constructor(reservaRepository) {
        this.reservaRepository = reservaRepository;
    }

    /**
     * Get available time slots for a barbero on a specific date.
     *
     * @param {string} barberoId
     * @param {string} fecha       - 'YYYY-MM-DD' in barbería's local date
     * @param {number} duracion    - Service duration in minutes
     * @param {Object} horario     - { horaInicio, horaFin, activo, duracionTurno? }
     * @param {string} barberiaId
     * @param {string} [tzName]   - IANA timezone of the barbería
     * @returns {Promise<string[]>} Array of available 'HH:MM' time strings
     */
    async getAvailableSlots(barberoId, fecha, duracion, horario, barberiaId, tzName = DEFAULT_TIMEZONE) {
        // 1. Check if barbero works on this day
        if (!horario || !horario.activo) {
            return [];
        }

        // 2. Get existing reservations for this barbero on this date
        const reservasExistentes = await this.reservaRepository.findByBarberoAndDate(
            barberoId,
            fecha,
            barberiaId
        );

        // 3. Generate all possible time slots based on working hours.
        //    Use horario.duracionTurno as the step, not service duration.
        const slotStep = horario.duracionTurno || duracion;
        const allSlots = this.generateTimeSlots(horario.horaInicio, horario.horaFin, slotStep);

        // 4 & 5. Filter occupied AND past slots in a single pass.
        //    isPast() is evaluated in barbería's own timezone via TimeSlot.
        const availableSlots = allSlots.filter(slot => {
            const timeSlot = new TimeSlot(fecha, slot, duracion, tzName);
            if (timeSlot.isPast()) return false;
            return !this.isSlotOccupied(timeSlot, reservasExistentes);
        });

        return availableSlots;
    }

    /**
     * Check if a specific time slot is available for booking.
     *
     * @param {string}  barberoId
     * @param {string}  fecha
     * @param {string}  hora
     * @param {number}  duracion
     * @param {string}  barberiaId
     * @param {string|null} [excludeReservaId] - Exclude this reservation (for rescheduling)
     * @param {string}  [tzName]               - IANA timezone of the barbería
     * @returns {Promise<boolean>}
     */
    async isTimeSlotAvailable(
        barberoId,
        fecha,
        hora,
        duracion,
        barberiaId,
        excludeReservaId = null,
        tzName = DEFAULT_TIMEZONE
    ) {
        const timeSlot = new TimeSlot(fecha, hora, duracion, tzName);

        // Slot in the past is never available — evaluated in barbería's own TZ
        if (timeSlot.isPast()) {
            return false;
        }

        // Get existing reservations
        const reservas = await this.reservaRepository.findByBarberoAndDate(
            barberoId,
            fecha,
            barberiaId
        );

        // Exclude one reservation for rescheduling flows
        const relevantReservas = excludeReservaId
            ? reservas.filter(r => r.id !== excludeReservaId)
            : reservas;

        return !this.isSlotOccupied(timeSlot, relevantReservas);
    }

    /**
     * Generate all possible time slots within working hours.
     *
     * @param {string} horaInicio - 'HH:MM'
     * @param {string} horaFin    - 'HH:MM'
     * @param {number} duracion   - Slot step in minutes
     * @returns {string[]} Array of 'HH:MM' strings
     */
    generateTimeSlots(horaInicio, horaFin, duracion) {
        const slots = [];
        let current = this.#timeToMinutes(horaInicio);
        const end = this.#timeToMinutes(horaFin);

        while (current + duracion <= end) {
            slots.push(this.#minutesToTime(current));
            current += duracion;
        }

        return slots;
    }

    /**
     * Returns true if `timeSlot` overlaps with any non-cancelled reservation.
     *
     * @param {TimeSlot}  timeSlot
     * @param {Reserva[]} reservas
     * @returns {boolean}
     */
    isSlotOccupied(timeSlot, reservas) {
        return reservas.some(reserva => {
            if (reserva.isCancelled()) return false;
            return timeSlot.overlaps(reserva.timeSlot);
        });
    }

    /**
     * Returns true if two 'HH:MM' time ranges overlap.
     * Utility for simple string-based checks outside of domain entities.
     *
     * @param {string} start1 @param {string} end1
     * @param {string} start2 @param {string} end2
     * @returns {boolean}
     */
    timeRangesOverlap(start1, end1, start2, end2) {
        return (
            this.#timeToMinutes(start1) < this.#timeToMinutes(end2) &&
            this.#timeToMinutes(start2) < this.#timeToMinutes(end1)
        );
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    /** @param {string} timeStr @returns {number} */
    #timeToMinutes(timeStr) {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    }

    /** @param {number} minutes @returns {string} */
    #minutesToTime(minutes) {
        const hh = Math.floor(minutes / 60);
        const mm = minutes % 60;
        return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    }
}

module.exports = AvailabilityService;
