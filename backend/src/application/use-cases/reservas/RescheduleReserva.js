/**
 * Reschedule Reserva Use Case
 * Handles rescheduling a reservation to a new time slot
 */
class RescheduleReserva {
    constructor(reservaRepository, availabilityService, emailService) {
        this.reservaRepository = reservaRepository;
        this.availabilityService = availabilityService;
        this.emailService = emailService;
    }

    /**
     * Execute the use case
     * @param {string} reservaId
     * @param {Object} newTimeSlot - { fecha, hora }
     * @param {string} userId - User requesting the reschedule
     * @param {boolean} isAdmin
     * @returns {Promise<Reserva>}
     */
    async execute(reservaId, newTimeSlot, userId, isAdmin = false) {
        // 1. Find the reservation
        const reserva = await this.reservaRepository.findById(reservaId);

        if (!reserva) {
            throw new Error('Reserva no encontrada');
        }

        // 2. Validate permissions
        if (!isAdmin && reserva.clienteId && reserva.clienteId !== userId) {
            throw new Error('No tienes permisos para reagendar esta reserva');
        }

        // 3. Check if reservation can be rescheduled
        if (!reserva.canBeRescheduled()) {
            throw new Error('Esta reserva no puede ser reagendada');
        }

        // 4. Check availability for new time slot (excluding current reservation)
        const isAvailable = await this.availabilityService.isTimeSlotAvailable(
            reserva.barberoId,
            newTimeSlot.fecha,
            newTimeSlot.hora,
            reserva.timeSlot.durationMinutes,
            reserva.id // Exclude current reservation
        );

        if (!isAvailable) {
            throw new Error('El nuevo horario no está disponible');
        }

        // 5. Reschedule (domain logic)
        reserva.reschedule(
            newTimeSlot.fecha,
            newTimeSlot.hora,
            reserva.timeSlot.durationMinutes
        );

        // 6. Persist changes
        await this.reservaRepository.update(reserva.id, {
            fecha: reserva.timeSlot.date,
            hora: reserva.timeSlot.startTime,
            horaFin: reserva.timeSlot.endTime,
            updatedAt: reserva.updatedAt
        });

        // 7. Send notification
        this.emailService.sendRescheduleConfirmation(reserva).catch(err => {
            console.error('Error sending reschedule confirmation:', err);
        });

        return reserva;
    }

    /**
     * Reschedule by token (public reschedule link)
     * @param {string} cancelToken
     * @param {Object} newTimeSlot
     * @returns {Promise<Reserva>}
     */
    async executeByToken(cancelToken, newTimeSlot) {
        // 1. Find reservation by token
        const reserva = await this.reservaRepository.findByCancelToken(cancelToken);

        if (!reserva) {
            throw new Error('Reserva no encontrada o token inválido');
        }

        // 2. Check if can be rescheduled
        if (!reserva.canBeRescheduled()) {
            throw new Error('Esta reserva no puede ser reagendada');
        }

        // 3. Check availability
        const isAvailable = await this.availabilityService.isTimeSlotAvailable(
            reserva.barberoId,
            newTimeSlot.fecha,
            newTimeSlot.hora,
            reserva.timeSlot.durationMinutes,
            reserva.id
        );

        if (!isAvailable) {
            throw new Error('El nuevo horario no está disponible');
        }

        // 4. Reschedule
        reserva.reschedule(
            newTimeSlot.fecha,
            newTimeSlot.hora,
            reserva.timeSlot.durationMinutes
        );

        // 5. Persist
        await this.reservaRepository.update(reserva.id, {
            fecha: reserva.timeSlot.date,
            hora: reserva.timeSlot.startTime,
            horaFin: reserva.timeSlot.endTime,
            updatedAt: reserva.updatedAt
        });

        // 6. Notify
        this.emailService.sendRescheduleConfirmation(reserva).catch(err => {
            console.error('Error sending reschedule confirmation:', err);
        });

        return reserva;
    }
}

module.exports = RescheduleReserva;
