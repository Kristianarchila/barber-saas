const Money = require('../value-objects/Money');

/**
 * Servicio Domain Entity
 * Represents a service offered by the barbershop
 */
class Servicio {
    constructor({
        id,
        nombre,
        descripcion,
        duracion,
        precio,
        imagen,
        barberiaId,
        activo = true,
        createdAt,
        updatedAt
    }) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.duracion = duracion; // in minutes
        this.precio = precio instanceof Money ? precio : new Money(precio);
        this.imagen = imagen;
        this.barberiaId = barberiaId;
        this.activo = activo;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;

        this.validate();
    }

    validate() {
        if (!this.nombre || this.nombre.trim().length === 0) {
            throw new Error('El nombre del servicio es requerido');
        }

        if (!this.duracion || this.duracion <= 0) {
            throw new Error('La duración debe ser mayor a 0');
        }

        if (this.precio.amount <= 0) {
            throw new Error('El precio debe ser mayor a 0');
        }

        if (!this.barberiaId) {
            throw new Error('El servicio debe estar asociado a una barbería');
        }
    }

    /**
     * Activate the service
     */
    activate() {
        this.activo = true;
        this.updatedAt = new Date();
    }

    /**
     * Deactivate the service
     */
    deactivate() {
        this.activo = false;
        this.updatedAt = new Date();
    }

    /**
     * Update service details
     */
    update({ nombre, descripcion, duracion, precio, imagen }) {
        if (nombre !== undefined) this.nombre = nombre;
        if (descripcion !== undefined) this.descripcion = descripcion;
        if (duracion !== undefined) this.duracion = duracion;
        if (precio !== undefined) this.precio = precio instanceof Money ? precio : new Money(precio);
        if (imagen !== undefined) this.imagen = imagen;

        this.validate();
        this.updatedAt = new Date();
    }

    /**
     * Apply discount to service price
     */
    applyDiscount(percentage) {
        return this.precio.applyDiscount(percentage);
    }

    /**
     * Check if service is available
     */
    isAvailable() {
        return this.activo;
    }

    /**
     * Check if service can be booked
     * More specific than isAvailable() - checks price validity too
     * @returns {boolean}
     */
    canBeBooked() {
        return this.activo && this.precio.amount > 0;
    }

    /**
     * Update service price with audit trail
     * @param {Money|number} newPrice
     * @param {string} reason - Reason for price change
     * @returns {Object} Price change details
     */
    updatePrice(newPrice, reason = '') {
        const oldPrice = this.precio.amount;
        this.precio = newPrice instanceof Money ? newPrice : new Money(newPrice);
        this.validate();
        this.updatedAt = new Date();

        return {
            oldPrice,
            newPrice: this.precio.amount,
            reason,
            updatedAt: this.updatedAt
        };
    }

    /**
     * Convert to plain object
     */
    toObject() {
        return {
            id: this.id,
            nombre: this.nombre,
            descripcion: this.descripcion,
            duracion: this.duracion,
            precio: this.precio.amount,
            imagen: this.imagen,
            barberiaId: this.barberiaId,
            activo: this.activo,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Servicio;
