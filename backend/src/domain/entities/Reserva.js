const TimeSlot = require('../value-objects/TimeSlot');
const Email = require('../value-objects/Email');
const Money = require('../value-objects/Money');

/**
 * Reserva Domain Entity
 * Contains all business logic related to reservations
 */
class Reserva {
    constructor({
        id,
        barberoId,
        clienteId,
        nombreCliente,
        emailCliente,
        telefonoCliente,  // ⬅️ NUEVO
        barberiaId,
        servicioId,
        fecha,
        hora,
        duracion,
        precio,
        estado = 'RESERVADA',
        cancelToken,
        reviewToken,
        depositoPagado = false,
        montoDeposito = 0,
        precioSnapshot = null,
        createdAt,
        updatedAt
    }) {
        this.id = id;
        this.barberoId = barberoId;
        this.clienteId = clienteId;
        this.nombreCliente = nombreCliente;
        this.emailCliente = emailCliente instanceof Email ? emailCliente : new Email(emailCliente);
        this.telefonoCliente = telefonoCliente;  // ⬅️ NUEVO
        this.barberiaId = barberiaId;
        this.servicioId = servicioId;
        this.timeSlot = new TimeSlot(fecha, hora, duracion);
        this.precio = precio instanceof Money ? precio : new Money(precio);
        this.estado = estado;
        this.cancelToken = cancelToken;
        this.reviewToken = reviewToken;
        this.depositoPagado = depositoPagado;
        this.montoDeposito = montoDeposito instanceof Money ? montoDeposito : new Money(montoDeposito);
        this.precioSnapshot = precioSnapshot;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;

        this.validateBusinessRules();
    }

    /**
     * Validate business rules
     */
    validateBusinessRules() {
        // No permitir reservas en el pasado
        if (this.timeSlot.isPast() && !this.id) {
            throw new Error('No se pueden crear reservas en fechas pasadas');
        }

        // Validar estados permitidos
        const estadosValidos = ['RESERVADA', 'CANCELADA', 'COMPLETADA'];
        if (!estadosValidos.includes(this.estado)) {
            throw new Error(`Estado inválido: ${this.estado}`);
        }

        // Validar nombre del cliente
        if (!this.nombreCliente || this.nombreCliente.trim().length === 0) {
            throw new Error('El nombre del cliente es requerido');
        }
    }

    /**
     * Cancel the reservation
     */
    cancel() {
        if (this.estado === 'COMPLETADA') {
            throw new Error('No se puede cancelar una reserva completada');
        }
        if (this.estado === 'CANCELADA') {
            throw new Error('La reserva ya está cancelada');
        }
        this.estado = 'CANCELADA';
        this.updatedAt = new Date();
    }

    /**
     * Complete the reservation
     */
    complete() {
        if (this.estado !== 'RESERVADA') {
            throw new Error('Solo se pueden completar reservas en estado RESERVADA');
        }
        this.estado = 'COMPLETADA';
        this.updatedAt = new Date();
    }

    /**
     * Check if reservation can be rescheduled
     */
    canBeRescheduled() {
        return this.estado === 'RESERVADA' && this.timeSlot.isFuture();
    }

    /**
     * Reschedule to a new time slot
     */
    reschedule(newFecha, newHora, newDuracion) {
        if (!this.canBeRescheduled()) {
            throw new Error('Esta reserva no puede ser reagendada');
        }

        const newTimeSlot = new TimeSlot(newFecha, newHora, newDuracion);

        if (newTimeSlot.isPast()) {
            throw new Error('No se puede reagendar a una fecha pasada');
        }

        this.timeSlot = newTimeSlot;
        this.updatedAt = new Date();
    }

    /**
     * Apply discount to the reservation
     */
    applyDiscount(percentage) {
        if (this.estado !== 'RESERVADA') {
            throw new Error('Solo se puede aplicar descuento a reservas activas');
        }

        this.precio = this.precio.applyDiscount(percentage);
        this.updatedAt = new Date();
    }

    /**
     * Mark deposit as paid
     */
    markDepositAsPaid(amount, paymentIntentId) {
        if (this.depositoPagado) {
            throw new Error('El depósito ya fue pagado');
        }

        this.depositoPagado = true;
        this.montoDeposito = amount instanceof Money ? amount : new Money(amount);
        this.stripePaymentIntentId = paymentIntentId;
        this.updatedAt = new Date();
    }

    /**
     * Check if reservation is active
     */
    isActive() {
        return this.estado === 'RESERVADA';
    }

    /**
     * Check if reservation is completed
     */
    isCompleted() {
        return this.estado === 'COMPLETADA';
    }

    /**
     * Check if reservation is cancelled
     */
    isCancelled() {
        return this.estado === 'CANCELADA';
    }

    /**
     * Check if reservation can be cancelled
     * @returns {boolean}
     */
    canBeCancelled() {
        return this.estado !== 'COMPLETADA' && this.estado !== 'CANCELADA';
    }

    /**
     * Check if reservation is upcoming (active and in the future)
     * @returns {boolean}
     */
    isUpcoming() {
        return this.isActive() && this.timeSlot.isFuture();
    }

    /**
     * Check if reservation requires a deposit
     * Business rule: reservations over $50 require deposit
     * @returns {boolean}
     */
    requiresDeposit() {
        return this.precio.amount > 50;
    }

    /**
     * Get reservation details for display
     */
    getDetails() {
        return {
            id: this.id,
            nombreCliente: this.nombreCliente,
            emailCliente: this.emailCliente.value,
            telefonoCliente: this.telefonoCliente,  // ⬅️ NUEVO
            fecha: this.timeSlot.date,
            hora: this.timeSlot.startTime,
            horaFin: this.timeSlot.endTime,
            duracion: this.timeSlot.durationMinutes,
            precio: this.precio.amount,
            estado: this.estado,
            depositoPagado: this.depositoPagado
        };
    }

    /**
     * Convert to plain object for persistence
     */
    toObject() {
        return {
            id: this.id,
            barberoId: this.barberoId,
            clienteId: this.clienteId,
            nombreCliente: this.nombreCliente,
            emailCliente: this.emailCliente.value,
            telefonoCliente: this.telefonoCliente,
            barberiaId: this.barberiaId,
            servicioId: this.servicioId,
            fecha: this.timeSlot.date,
            hora: this.timeSlot.startTime,
            horaFin: this.timeSlot.endTime,
            duracion: this.timeSlot.durationMinutes,
            precio: this.precio.amount,
            estado: this.estado,
            cancelToken: this.cancelToken,
            reviewToken: this.reviewToken,
            depositoPagado: this.depositoPagado,
            montoDeposito: this.montoDeposito.amount,
            precioSnapshot: this.precioSnapshot || {
                precioBase: this.precio.amount,
                precioFinal: this.precio.amount,
                fechaSnapshot: new Date()
            },
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Reserva;
