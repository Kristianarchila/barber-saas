const LimiteCancelacionError = require('../../../shared/errors/LimiteCancelacionError');

/**
 * @file ValidarCancelacion.js
 * @description Use case for validating if a reservation can be canceled based on time limits
 */

class ValidarCancelacion {
    constructor() { }

    /**
     * Validates if a reservation can be canceled
     * @param {Object} params
     * @param {Object} params.reserva - Reservation object
     * @param {Object} params.politicas - Cancellation policies
     * @param {boolean} params.isAdmin - Whether user is admin (admins bypass limits)
     * @returns {Promise<Object>} Validation result
     * @throws {LimiteCancelacionError} If cancellation is not allowed
     */
    async execute({ reserva, politicas, isAdmin = false }) {
        if (!reserva) {
            throw new Error('Reserva es requerida');
        }

        // Admins can always cancel
        if (isAdmin) {
            return {
                canCancel: true,
                reason: 'Admin bypass',
                horasRestantes: null
            };
        }

        // If policies are disabled, allow cancellation
        if (!politicas || !politicas.enabled) {
            return {
                canCancel: true,
                reason: 'Políticas deshabilitadas',
                horasRestantes: null
            };
        }

        // Calculate hours until reservation
        const horasHasta = this._calcularHorasHasta(reserva.fecha, reserva.hora);

        // Check if meets minimum cancellation time
        if (horasHasta < politicas.horasMinCancelacion) {
            throw new LimiteCancelacionError(
                `No puedes cancelar con menos de ${politicas.horasMinCancelacion} horas de anticipación. Faltan ${horasHasta.toFixed(1)} horas para tu reserva.`,
                politicas.horasMinCancelacion
            );
        }

        return {
            canCancel: true,
            horasRestantes: horasHasta,
            horasMinimas: politicas.horasMinCancelacion
        };
    }

    /**
     * Calculates hours until reservation
     * @private
     * @param {Date|string} fecha - Reservation date
     * @param {string} hora - Reservation time (HH:MM)
     * @returns {number} Hours until reservation
     */
    _calcularHorasHasta(fecha, hora) {
        // Parse reservation date and time
        const reservaDate = new Date(fecha);
        const [hours, minutes] = hora.split(':').map(Number);

        reservaDate.setHours(hours, minutes, 0, 0);

        // Calculate difference in milliseconds
        const now = new Date();
        const diffMs = reservaDate - now;

        // Convert to hours
        const diffHours = diffMs / (1000 * 60 * 60);

        return Math.max(0, diffHours);
    }

    /**
     * Checks if cancellation is allowed without throwing errors
     * @param {Object} params
     * @returns {Promise<Object>} Status object
     */
    async checkCanCancel(params) {
        try {
            const result = await this.execute(params);
            return {
                ...result,
                allowed: true
            };
        } catch (error) {
            if (error instanceof LimiteCancelacionError) {
                return {
                    allowed: false,
                    reason: error.message,
                    horasRequeridas: error.horasRequeridas
                };
            }
            throw error;
        }
    }
}

module.exports = ValidarCancelacion;
