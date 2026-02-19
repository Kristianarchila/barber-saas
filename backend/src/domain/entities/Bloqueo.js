/**
 * @file Bloqueo.js
 * @description Domain entity for date/time blocking
 * Represents a blocked period where reservations cannot be made
 */

class Bloqueo {
    constructor({
        id,
        barberiaId,
        barberoId = null,
        tipo,
        fechaInicio,
        fechaFin,
        horaInicio = null,
        horaFin = null,
        motivo,
        todoElDia = true,
        activo = true,
        creadoPor,
        createdAt,
        updatedAt
    }) {
        this.id = id;
        this.barberiaId = barberiaId;
        this.barberoId = barberoId;
        this.tipo = tipo;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
        this.motivo = motivo;
        this.todoElDia = todoElDia;
        this.activo = activo;
        this.creadoPor = creadoPor;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    /**
     * Validates if the blocking is valid
     * @returns {boolean}
     */
    isValid() {
        if (!this.barberiaId) return false;
        if (!this.tipo || !this.isValidTipo()) return false;
        if (!this.fechaInicio || !this.fechaFin) return false;
        if (!this.motivo) return false;

        // Validate date range
        if (new Date(this.fechaFin) < new Date(this.fechaInicio)) {
            return false;
        }

        // If partial blocking, validate hours
        if (!this.todoElDia) {
            if (!this.horaInicio || !this.horaFin) return false;
            if (!this.isValidTimeFormat(this.horaInicio) || !this.isValidTimeFormat(this.horaFin)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Validates if tipo is valid
     * @returns {boolean}
     */
    isValidTipo() {
        const validTipos = ['VACACIONES', 'FERIADO', 'EMERGENCIA', 'OTRO'];
        return validTipos.includes(this.tipo);
    }

    /**
     * Validates time format (HH:MM)
     * @param {string} time
     * @returns {boolean}
     */
    isValidTimeFormat(time) {
        const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    }

    /**
     * Checks if a specific date/time falls within this blocking
     * @param {Date} fecha
     * @param {string} hora - Optional, format HH:MM
     * @returns {boolean}
     */
    blocksDateTime(fecha, hora = null) {
        if (!this.activo) return false;

        const fechaCheck = new Date(fecha);
        fechaCheck.setHours(0, 0, 0, 0);

        const inicio = new Date(this.fechaInicio);
        inicio.setHours(0, 0, 0, 0);

        const fin = new Date(this.fechaFin);
        fin.setHours(23, 59, 59, 999);

        // Check if date is within range
        if (fechaCheck < inicio || fechaCheck > fin) {
            return false;
        }

        // If it's a full day blocking, it blocks
        if (this.todoElDia) {
            return true;
        }

        // If partial blocking and no hour provided, assume it might block
        if (!hora) {
            return true;
        }

        // Check if hour is within blocked range
        return this.blocksHour(hora);
    }

    /**
     * Checks if a specific hour is blocked
     * @param {string} hora - Format HH:MM
     * @returns {boolean}
     */
    blocksHour(hora) {
        if (this.todoElDia) return true;
        if (!this.horaInicio || !this.horaFin) return false;

        const [horaNum, minNum] = hora.split(':').map(Number);
        const [inicioHora, inicioMin] = this.horaInicio.split(':').map(Number);
        const [finHora, finMin] = this.horaFin.split(':').map(Number);

        const horaMinutos = horaNum * 60 + minNum;
        const inicioMinutos = inicioHora * 60 + inicioMin;
        const finMinutos = finHora * 60 + finMin;

        return horaMinutos >= inicioMinutos && horaMinutos < finMinutos;
    }

    /**
     * Checks if this blocking applies to a specific barbero
     * @param {string} barberoId
     * @returns {boolean}
     */
    appliesToBarbero(barberoId) {
        // If barberoId is null, it applies to all barberos
        if (!this.barberoId) return true;

        // Otherwise, check if it matches
        return this.barberoId === barberoId;
    }

    /**
     * Activates the blocking
     */
    activate() {
        this.activo = true;
    }

    /**
     * Deactivates the blocking
     */
    deactivate() {
        this.activo = false;
    }

    /**
     * Gets a human-readable description
     * @returns {string}
     */
    getDescription() {
        const tipoLabel = {
            'VACACIONES': 'Vacaciones',
            'FERIADO': 'Feriado',
            'EMERGENCIA': 'Emergencia',
            'OTRO': 'Otro'
        };

        const scope = this.barberoId ? 'Barbero específico' : 'Toda la barbería';
        const period = this.todoElDia
            ? 'Todo el día'
            : `${this.horaInicio} - ${this.horaFin}`;

        return `${tipoLabel[this.tipo]} - ${scope} - ${period}: ${this.motivo}`;
    }
}

module.exports = Bloqueo;
