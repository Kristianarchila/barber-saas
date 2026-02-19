/**
 * User Domain Entity
 * Represents a user in the system (Admin, Barber, Client)
 */
class User {
    constructor({
        id,
        nombre,
        email,
        password,
        rol,
        barberiaId,
        barberiaIds = [],
        barberoId = null,
        activo = true,
        estadoCuenta = 'ACTIVA',
        fechaAprobacion = null,
        aprobadoPor = null,
        createdAt,
        updatedAt
    }) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.password = password;
        this.rol = rol;
        this.barberiaId = barberiaId;
        this.barberiaIds = barberiaIds;
        this.barberoId = barberoId;
        this.activo = activo;
        this.estadoCuenta = estadoCuenta;
        this.fechaAprobacion = fechaAprobacion;
        this.aprobadoPor = aprobadoPor;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;

        this.validate();
    }

    /**
     * Validate business rules for User
     */
    validate() {
        if (!this.nombre || this.nombre.trim().length === 0) {
            throw new Error('El nombre es requerido');
        }
        if (!this.email) {
            throw new Error('El email es requerido');
        }
        if (!this.rol) {
            throw new Error('El rol es requerido');
        }
    }

    /**
     * Check if user has a specific role
     */
    hasRole(role) {
        return this.rol === role;
    }

    /**
     * Convert to plain object for persistence
     */
    toObject() {
        return {
            id: this.id,
            nombre: this.nombre,
            email: this.email,
            password: this.password,
            rol: this.rol,
            barberiaId: this.barberiaId,
            barberiaIds: this.barberiaIds,
            barberoId: this.barberoId,
            activo: this.activo,
            estadoCuenta: this.estadoCuenta,
            fechaAprobacion: this.fechaAprobacion,
            aprobadoPor: this.aprobadoPor,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = User;
