import { ValidationError } from '../shared/errors';

/**
 * Value Object: Email
 * 
 * Encapsula la lógica de validación de emails.
 * Los Value Objects son inmutables y se comparan por valor.
 */
export class Email {
    constructor(value) {
        if (!value) {
            throw new ValidationError('El email es obligatorio', 'email');
        }

        if (!this.isValid(value)) {
            throw new ValidationError('El formato del email es inválido', 'email');
        }

        this._value = value.toLowerCase().trim();
    }

    /**
     * Validar formato de email
     */
    isValid(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Obtener valor del email
     */
    get value() {
        return this._value;
    }

    /**
     * Comparar con otro email
     */
    equals(other) {
        if (!(other instanceof Email)) {
            return false;
        }
        return this._value === other._value;
    }

    /**
     * Convertir a string
     */
    toString() {
        return this._value;
    }
}

/**
 * Value Object: Telefono
 * 
 * Encapsula la lógica de validación de teléfonos.
 */
export class Telefono {
    constructor(value) {
        if (!value) {
            throw new ValidationError('El teléfono es obligatorio', 'telefono');
        }

        // Limpiar el teléfono (quitar espacios, guiones, paréntesis)
        const cleaned = value.replace(/[\s\-\(\)]/g, '');

        if (!this.isValid(cleaned)) {
            throw new ValidationError('El formato del teléfono es inválido', 'telefono');
        }

        this._value = cleaned;
    }

    /**
     * Validar formato de teléfono
     * Acepta formatos internacionales con + y números de 8-15 dígitos
     */
    isValid(telefono) {
        const telefonoRegex = /^\+?[0-9]{8,15}$/;
        return telefonoRegex.test(telefono);
    }

    /**
     * Obtener valor del teléfono
     */
    get value() {
        return this._value;
    }

    /**
     * Formatear para mostrar (ejemplo: +56 9 1234 5678)
     */
    format() {
        // Formato simple: agregar espacios cada 4 dígitos
        return this._value.replace(/(\d{4})(?=\d)/g, '$1 ');
    }

    /**
     * Comparar con otro teléfono
     */
    equals(other) {
        if (!(other instanceof Telefono)) {
            return false;
        }
        return this._value === other._value;
    }

    /**
     * Convertir a string
     */
    toString() {
        return this._value;
    }
}
