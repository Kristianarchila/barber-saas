const Email = require('../value-objects/Email');
const PhoneNumber = require('../value-objects/PhoneNumber');

/**
 * Cliente Domain Entity
 * Represents a customer/client
 */
class Cliente {
    constructor({
        id,
        nombre,
        email,
        telefono,
        barberiaId,
        notas = '',
        preferencias = {},
        historialVisitas = 0,
        ultimaVisita = null,
        createdAt,
        updatedAt
    }) {
        this.id = id;
        this.nombre = nombre;
        this.email = email instanceof Email ? email : new Email(email);
        this.telefono = telefono ? (telefono instanceof PhoneNumber ? telefono : new PhoneNumber(telefono)) : null;
        this.barberiaId = barberiaId;
        this.notas = notas;
        this.preferencias = preferencias;
        this.historialVisitas = historialVisitas;
        this.ultimaVisita = ultimaVisita;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;

        this.validate();
    }

    validate() {
        if (!this.nombre || this.nombre.trim().length === 0) {
            throw new Error('El nombre del cliente es requerido');
        }

        if (!this.barberiaId) {
            throw new Error('El cliente debe estar asociado a una barbería');
        }
    }

    /**
     * Update client information
     */
    update({ nombre, email, telefono, notas, preferencias }) {
        if (nombre !== undefined) this.nombre = nombre;
        if (email !== undefined) this.email = email instanceof Email ? email : new Email(email);
        if (telefono !== undefined) this.telefono = telefono instanceof PhoneNumber ? telefono : new PhoneNumber(telefono);
        if (notas !== undefined) this.notas = notas;
        if (preferencias !== undefined) this.preferencias = { ...this.preferencias, ...preferencias };

        this.validate();
        this.updatedAt = new Date();
    }

    /**
     * Record a visit
     */
    recordVisit() {
        this.historialVisitas += 1;
        this.ultimaVisita = new Date();
        this.updatedAt = new Date();
    }

    /**
     * Check if client is a regular customer
     */
    isRegular() {
        return this.historialVisitas >= 5;
    }

    /**
     * Check if client is a VIP
     */
    isVIP() {
        return this.historialVisitas >= 10;
    }

    /**
     * Add notes
     */
    addNotes(newNotes) {
        this.notas = this.notas ? `${this.notas}\n${newNotes}` : newNotes;
        this.updatedAt = new Date();
    }

    /**
     * Convert to plain object
     */
    toObject() {
        return {
            id: this.id,
            nombre: this.nombre,
            email: this.email.value,
            telefono: this.telefono ? this.telefono.value : null,
            barberiaId: this.barberiaId,
            notas: this.notas,
            preferencias: this.preferencias,
            historialVisitas: this.historialVisitas,
            ultimaVisita: this.ultimaVisita,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Cliente;
