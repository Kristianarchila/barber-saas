/**
 * @file ClienteStats.js
 * @description Domain entity for tracking client statistics and cancellation limits
 */

class ClienteStats {
    constructor({
        id,
        email,
        telefono,
        barberiaId,
        totalReservas = 0,
        reservasCompletadas = 0,
        reservasCanceladas = 0,
        cancelacionesEsteMes = 0,
        ultimaCancelacion,
        ultimaReserva,
        bloqueado = false,
        motivoBloqueo,
        fechaBloqueo,
        fechaDesbloqueo,
        createdAt,
        updatedAt
    }) {
        this.id = id;
        this.email = email ? email.toLowerCase() : null;
        this.telefono = telefono;
        this.barberiaId = barberiaId;
        this.totalReservas = totalReservas;
        this.reservasCompletadas = reservasCompletadas;
        this.reservasCanceladas = reservasCanceladas;
        this.cancelacionesEsteMes = cancelacionesEsteMes;
        this.ultimaCancelacion = ultimaCancelacion;
        this.ultimaReserva = ultimaReserva;
        this.bloqueado = bloqueado;
        this.motivoBloqueo = motivoBloqueo;
        this.fechaBloqueo = fechaBloqueo;
        this.fechaDesbloqueo = fechaDesbloqueo;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    /**
     * Validates if entity data is valid
     * @returns {boolean}
     */
    isValid() {
        if (!this.email || !this.barberiaId) {
            return false;
        }

        if (this.totalReservas < 0 || this.reservasCompletadas < 0 || this.reservasCanceladas < 0) {
            return false;
        }

        if (this.cancelacionesEsteMes < 0) {
            return false;
        }

        return true;
    }

    /**
     * Checks if client can make a reservation
     * @returns {boolean}
     */
    canReservar() {
        if (!this.bloqueado) {
            return true;
        }

        // If blocked but no unblock date, cannot reserve
        if (!this.fechaDesbloqueo) {
            return false;
        }

        // Check if unblock date has passed
        return new Date() > this.fechaDesbloqueo;
    }

    /**
     * Checks if client should be automatically unblocked
     * @returns {boolean}
     */
    shouldUnblock() {
        if (!this.bloqueado) {
            return false;
        }

        if (!this.fechaDesbloqueo) {
            return false;
        }

        return new Date() > this.fechaDesbloqueo;
    }

    /**
     * Increments reservation counter
     */
    incrementReserva() {
        this.totalReservas++;
        this.ultimaReserva = new Date();
        this.updatedAt = new Date();
    }

    /**
     * Increments cancellation counters
     */
    incrementCancelacion() {
        this.reservasCanceladas++;
        this.cancelacionesEsteMes++;
        this.ultimaCancelacion = new Date();
        this.updatedAt = new Date();
    }

    /**
     * Increments completed reservation counter
     */
    incrementCompletada() {
        this.reservasCompletadas++;
        this.updatedAt = new Date();
    }

    /**
     * Blocks the client
     * @param {string} motivo - Reason for blocking
     * @param {number} diasBloqueo - Number of days to block
     */
    bloquear(motivo, diasBloqueo) {
        this.bloqueado = true;
        this.motivoBloqueo = motivo;
        this.fechaBloqueo = new Date();
        this.fechaDesbloqueo = new Date(Date.now() + diasBloqueo * 24 * 60 * 60 * 1000);
        this.updatedAt = new Date();
    }

    /**
     * Unblocks the client
     */
    desbloquear() {
        this.bloqueado = false;
        this.motivoBloqueo = null;
        this.fechaBloqueo = null;
        this.fechaDesbloqueo = null;
        this.updatedAt = new Date();
    }

    /**
     * Resets monthly cancellation counter
     */
    resetMensual() {
        this.cancelacionesEsteMes = 0;
        this.updatedAt = new Date();
    }

    /**
     * Checks if client is approaching cancellation limit
     * @param {number} maxCancelaciones - Maximum allowed cancellations
     * @returns {boolean}
     */
    isApproachingLimit(maxCancelaciones) {
        return this.cancelacionesEsteMes >= maxCancelaciones - 1;
    }

    /**
     * Checks if client has exceeded cancellation limit
     * @param {number} maxCancelaciones - Maximum allowed cancellations
     * @returns {boolean}
     */
    hasExceededLimit(maxCancelaciones) {
        return this.cancelacionesEsteMes >= maxCancelaciones;
    }

    /**
     * Gets completion rate
     * @returns {number} - Percentage (0-100)
     */
    getCompletionRate() {
        if (this.totalReservas === 0) {
            return 0;
        }
        return Math.round((this.reservasCompletadas / this.totalReservas) * 100);
    }

    /**
     * Gets cancellation rate
     * @returns {number} - Percentage (0-100)
     */
    getCancellationRate() {
        if (this.totalReservas === 0) {
            return 0;
        }
        return Math.round((this.reservasCanceladas / this.totalReservas) * 100);
    }

    /**
     * Returns entity details for API responses
     * @returns {Object}
     */
    getDetails() {
        return {
            id: this.id,
            email: this.email,
            telefono: this.telefono,
            barberiaId: this.barberiaId,
            totalReservas: this.totalReservas,
            reservasCompletadas: this.reservasCompletadas,
            reservasCanceladas: this.reservasCanceladas,
            cancelacionesEsteMes: this.cancelacionesEsteMes,
            ultimaCancelacion: this.ultimaCancelacion,
            ultimaReserva: this.ultimaReserva,
            bloqueado: this.bloqueado,
            motivoBloqueo: this.motivoBloqueo,
            fechaBloqueo: this.fechaBloqueo,
            fechaDesbloqueo: this.fechaDesbloqueo,
            completionRate: this.getCompletionRate(),
            cancellationRate: this.getCancellationRate(),
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = ClienteStats;
