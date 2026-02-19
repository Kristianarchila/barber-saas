/**
 * Entidad de Dominio: Barbero
 * 
 * Representa un barbero en el sistema con toda su lógica de negocio.
 */
export class Barbero {
    constructor({
        id,
        nombre,
        email,
        telefono = null,
        especialidad = null,
        descripcion = null,
        imagen = null,
        activo = true,
        horarios = [],
        servicios = [],
        calificacionPromedio = 0,
        totalResenas = 0,
        createdAt = null
    }) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.telefono = telefono;
        this.especialidad = especialidad;
        this.descripcion = descripcion;
        this.imagen = imagen;
        this.activo = activo;
        this.horarios = horarios;
        this.servicios = servicios;
        this.calificacionPromedio = calificacionPromedio;
        this.totalResenas = totalResenas;
        this.createdAt = createdAt;
    }

    /**
     * Regla de negocio: ¿Está activo?
     */
    estaActivo() {
        return this.activo === true;
    }

    /**
     * Regla de negocio: ¿Está disponible en un día específico?
     */
    estaDisponibleEnDia(diaSemana) {
        if (!this.estaActivo()) return false;

        return this.horarios.some(horario =>
            horario.dia === diaSemana && horario.activo
        );
    }

    /**
     * Regla de negocio: ¿Tiene buena calificación?
     */
    tieneBuenaCalificacion() {
        return this.calificacionPromedio >= 4.0;
    }

    /**
     * Regla de negocio: ¿Tiene reseñas?
     */
    tieneResenas() {
        return this.totalResenas > 0;
    }

    /**
     * Regla de negocio: ¿Ofrece un servicio específico?
     */
    ofreceServicio(servicioId) {
        return this.servicios.some(s => s.id === servicioId || s === servicioId);
    }

    /**
     * Obtener horario de un día específico
     */
    getHorarioDia(diaSemana) {
        return this.horarios.find(h => h.dia === diaSemana);
    }

    /**
     * Obtener días disponibles
     */
    getDiasDisponibles() {
        return this.horarios
            .filter(h => h.activo)
            .map(h => h.dia);
    }

    /**
     * Obtener badge de calificación
     */
    getCalificacionBadge() {
        if (this.calificacionPromedio >= 4.5) return { color: 'success', label: 'Excelente' };
        if (this.calificacionPromedio >= 4.0) return { color: 'info', label: 'Muy bueno' };
        if (this.calificacionPromedio >= 3.0) return { color: 'warning', label: 'Bueno' };
        return { color: 'neutral', label: 'Regular' };
    }

    /**
     * Validar que el barbero tenga datos mínimos
     */
    esValido() {
        return !!(this.nombre && this.email);
    }

    /**
     * Obtener iniciales del nombre
     */
    getIniciales() {
        return this.nombre
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }
}
