/**
 * Horario Domain Entity
 * Represents working hours for a barber on a specific day
 */
class Horario {
    constructor({
        id,
        barberoId,
        diaSemana,
        horaInicio,
        horaFin,
        duracionTurno = 30,
        activo = true,
        createdAt,
        updatedAt
    }) {
        this.id = id;
        this.barberoId = barberoId;
        this.diaSemana = diaSemana;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
        this.duracionTurno = duracionTurno;
        this.activo = activo;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;

        this.validate();
    }

    /**
     * Validate business rules for Horario
     */
    validate() {
        if (this.diaSemana === undefined || this.diaSemana < 0 || this.diaSemana > 6) {
            throw new Error('Día de la semana inválido (debe ser entre 0 y 6)');
        }
        if (!this.horaInicio || !this.horaFin) {
            throw new Error('Hora de inicio y fin son requeridas');
        }
        if (!this.barberoId) {
            throw new Error('ID de barbero es requerido');
        }
    }

    /**
     * Toggles the active status
     */
    toggle() {
        this.activo = !this.activo;
        this.updatedAt = new Date();
    }

    /**
     * Updates horario data
     */
    update(data) {
        if (data.horaInicio) this.horaInicio = data.horaInicio;
        if (data.horaFin) this.horaFin = data.horaFin;
        if (data.duracionTurno !== undefined) this.duracionTurno = data.duracionTurno;
        if (data.activo !== undefined) this.activo = data.activo;

        this.validate();
        this.updatedAt = new Date();
    }

    /**
     * Convert to plain object for persistence
     */
    toObject() {
        return {
            id: this.id,
            barberoId: this.barberoId,
            diaSemana: this.diaSemana,
            horaInicio: this.horaInicio,
            horaFin: this.horaFin,
            duracionTurno: this.duracionTurno,
            activo: this.activo,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Horario;
