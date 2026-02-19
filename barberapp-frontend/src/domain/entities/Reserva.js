/**
 * Entidad de Dominio: Reserva
 * 
 * Representa una reserva en el sistema con toda su lógica de negocio.
 * Esta clase NO debe depender de ninguna librería externa ni framework.
 */
export class Reserva {
    constructor({
        id,
        barberoId,
        servicioId,
        clienteNombre,
        clienteEmail,
        clienteTelefono = null,
        fecha,
        hora,
        horaFin = null,
        estado,
        precio = null,
        cancelToken = null,
        createdAt = null
    }) {
        this.id = id;
        this.barberoId = barberoId;
        this.servicioId = servicioId;
        this.clienteNombre = clienteNombre;
        this.clienteEmail = clienteEmail;
        this.clienteTelefono = clienteTelefono;
        this.fecha = fecha;
        this.hora = hora;
        this.horaFin = horaFin;
        this.estado = estado;
        this.precio = precio;
        this.cancelToken = cancelToken;
        this.createdAt = createdAt;
    }

    /**
     * Regla de negocio: ¿Puede ser cancelada?
     */
    puedeSerCancelada() {
        return ['RESERVADA', 'CONFIRMADA'].includes(this.estado);
    }

    /**
     * Regla de negocio: ¿Puede ser completada?
     */
    puedeSerCompletada() {
        return this.estado === 'RESERVADA' || this.estado === 'CONFIRMADA';
    }

    /**
     * Regla de negocio: ¿Está vigente?
     */
    estaVigente() {
        if (this.estado === 'CANCELADA') {
            return false;
        }

        const ahora = new Date();
        const fechaReserva = new Date(`${this.fecha}T${this.hora}`);
        return fechaReserva > ahora;
    }

    /**
     * Regla de negocio: ¿Es del pasado?
     */
    esDelPasado() {
        const ahora = new Date();
        const fechaReserva = new Date(`${this.fecha}T${this.hora}`);
        return fechaReserva < ahora;
    }

    /**
     * Regla de negocio: ¿Es de hoy?
     */
    esDeHoy() {
        const hoy = new Date().toISOString().split('T')[0];
        return this.fecha === hoy;
    }

    /**
     * Obtener color del badge según estado
     */
    getEstadoColor() {
        const colores = {
            RESERVADA: 'info',
            CONFIRMADA: 'success',
            COMPLETADA: 'success',
            CANCELADA: 'error',
            NO_ASISTIO: 'warning'
        };
        return colores[this.estado] || 'neutral';
    }

    /**
     * Obtener label del estado
     */
    getEstadoLabel() {
        const labels = {
            RESERVADA: 'Reservada',
            CONFIRMADA: 'Confirmada',
            COMPLETADA: 'Completada',
            CANCELADA: 'Cancelada',
            NO_ASISTIO: 'No asistió'
        };
        return labels[this.estado] || this.estado;
    }

    /**
     * Validar que la reserva tenga datos mínimos
     */
    esValida() {
        return !!(
            this.barberoId &&
            this.servicioId &&
            this.clienteNombre &&
            this.clienteEmail &&
            this.fecha &&
            this.hora
        );
    }
}
