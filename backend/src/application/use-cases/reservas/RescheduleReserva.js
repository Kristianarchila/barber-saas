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
        // barberiaId must come from the DTO so we can enforce tenant isolation
        const barberiaId = newTimeSlot.barberiaId;

        // 1. Find the reservation (scoped to tenant)
        const reserva = barberiaId
            ? await this.reservaRepository.findById(reservaId, barberiaId)
            : await this.reservaRepository.findById(reservaId);

        if (!reserva) {
            const err = new Error('Reserva no encontrada');
            err.code = 'RESERVATION_NOT_FOUND';
            err.statusCode = 404;
            throw err;
        }

        // 2. Validate permissions
        if (!isAdmin && reserva.clienteId && reserva.clienteId !== userId) {
            const err = new Error('No tienes permisos para reagendar esta reserva');
            err.code = 'RESERVATION_FORBIDDEN';
            err.statusCode = 403;
            throw err;
        }

        // 3. Check if reservation can be rescheduled
        if (!reserva.canBeRescheduled()) {
            const err = new Error('Esta reserva no puede ser reagendada');
            err.code = 'RESERVATION_NOT_RESCHEDULABLE';
            err.statusCode = 409;
            throw err;
        }

        // 4. Check availability for new time slot (excluding current reservation)
        const isAvailable = await this.availabilityService.isTimeSlotAvailable(
            reserva.barberoId,
            newTimeSlot.fecha,
            newTimeSlot.hora,
            reserva.timeSlot.durationMinutes,
            reserva.barberiaId,
            reserva.id
        );

        if (!isAvailable) {
            const err = new Error('El nuevo horario no está disponible');
            err.code = 'SLOT_UNAVAILABLE';
            err.statusCode = 409;
            throw err;
        }

        // 5. Reschedule (domain logic)
        reserva.reschedule(
            newTimeSlot.fecha,
            newTimeSlot.hora,
            reserva.timeSlot.durationMinutes
        );

        // 6. Persist changes — must pass barberiaId for tenant-safe update
        await this.reservaRepository.update(reserva.id, {
            fecha: reserva.timeSlot.date,
            hora: reserva.timeSlot.startTime,
            horaFin: reserva.timeSlot.endTime,
            updatedAt: reserva.updatedAt
        }, reserva.barberiaId);

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

        // 3. Check availability (scoped to the same barbería — prevents cross-tenant slot probing)
        const isAvailable = await this.availabilityService.isTimeSlotAvailable(
            reserva.barberoId,
            newTimeSlot.fecha,
            newTimeSlot.hora,
            reserva.timeSlot.durationMinutes,
            reserva.barberiaId, // tenant scope — replaces the old excludeReservaId positional arg
            reserva.id          // exclude current reservation from conflict check
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

        // 5. Persist — must pass barberiaId for tenant-safe update
        await this.reservaRepository.update(reserva.id, {
            fecha: reserva.timeSlot.date,
            hora: reserva.timeSlot.startTime,
            horaFin: reserva.timeSlot.endTime,
            updatedAt: reserva.updatedAt
        }, reserva.barberiaId);

        // 6. Notify
        this.emailService.sendRescheduleConfirmation(reserva).catch(err => {
            console.error('Error sending reschedule confirmation:', err);
        });

        return reserva;
    }
}

module.exports = RescheduleReserva;
