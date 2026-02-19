/**
 * Barbero Domain Entity
 * Contains all business logic related to barbers
 */
class Barbero {
    constructor({
        id,
        usuarioId,
        nombre,
        barberiaId,
        sucursalId = null,
        foto = '',
        descripcion = '',
        especialidades = [],
        experiencia = 0,
        activo = true,
        createdAt,
        updatedAt
    }) {
        this.id = id;
        this.usuarioId = usuarioId;
        this.nombre = nombre;
        this.barberiaId = barberiaId;
        this.sucursalId = sucursalId;
        this.foto = foto;
        this.descripcion = descripcion;
        this.especialidades = especialidades;
        this.experiencia = experiencia;
        this.activo = activo;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;

        this.validate();
    }

    /**
     * Validate business rules for Barbero
     */
    validate() {
        if (!this.nombre || this.nombre.trim().length === 0) {
            throw new Error('El nombre del barbero es requerido');
        }
        if (!this.barberiaId) {
            throw new Error('La barbería es requerida');
        }
    }

    /**
     * Toggles the active status of the barbero
     */
    toggleStatus() {
        this.activo = !this.activo;
        this.updatedAt = new Date();
    }

    /**
     * Updates barbero data
     */
    update(data) {
        if (data.nombre) this.nombre = data.nombre;
        if (data.foto !== undefined) this.foto = data.foto;
        if (data.descripcion !== undefined) this.descripcion = data.descripcion;
        if (data.especialidades) this.especialidades = data.especialidades;
        if (data.experiencia !== undefined) this.experiencia = data.experiencia;
        if (data.sucursalId !== undefined) this.sucursalId = data.sucursalId;

        this.validate();
        this.updatedAt = new Date();
    }

    /**
     * Check if barbero is available on a specific date
     * @param {string} date - Date in YYYY-MM-DD format
     * @param {Array} horarios - Array of schedule objects with {dia, activo}
     * @returns {boolean}
     */
    isAvailableOn(date, horarios) {
        if (!this.activo) return false;

        // Check if barbero works on this day
        const dayOfWeek = new Date(date).getDay();
        const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        const dayName = dayNames[dayOfWeek];

        const horario = horarios.find(h => h.dia === dayName);
        return horario && horario.activo;
    }

    /**
     * Check if barbero has capacity to handle a specific service
     * @param {Servicio} service - Service entity
     * @returns {boolean}
     */
    hasCapacityFor(service) {
        if (!this.activo) return false;

        // If barbero has specialties, check if service matches
        if (this.especialidades.length > 0) {
            return this.especialidades.some(esp =>
                service.nombre.toLowerCase().includes(esp.toLowerCase())
            );
        }

        // If no specialties defined, can handle any service
        return true;
    }

    /**
     * Add a specialty to the barbero
     * @param {string} especialidad
     */
    addEspecialidad(especialidad) {
        if (!this.especialidades.includes(especialidad)) {
            this.especialidades.push(especialidad);
            this.updatedAt = new Date();
        }
    }

    /**
     * Remove a specialty from the barbero
     * @param {string} especialidad
     */
    removeEspecialidad(especialidad) {
        this.especialidades = this.especialidades.filter(e => e !== especialidad);
        this.updatedAt = new Date();
    }

    /**
     * Get details for display
     */
    getDetails() {
        return {
            id: this.id,
            nombre: this.nombre,
            foto: this.foto,
            descripcion: this.descripcion,
            especialidades: this.especialidades,
            experiencia: this.experiencia,
            activo: this.activo
        };
    }

    /**
     * Convert to plain object for persistence
     */
    toObject() {
        return {
            id: this.id,
            usuarioId: this.usuarioId,
            nombre: this.nombre,
            barberiaId: this.barberiaId,
            sucursalId: this.sucursalId,
            foto: this.foto,
            descripcion: this.descripcion,
            especialidades: this.especialidades,
            experiencia: this.experiencia,
            activo: this.activo,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Barbero;
