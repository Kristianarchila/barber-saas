/**
 * Address Value Object
 * Encapsulates address validation and formatting
 */
class Address {
    constructor({ calle, numero, ciudad, estado, codigoPostal, pais = 'Argentina' }) {
        this.validate({ calle, numero, ciudad, estado, codigoPostal, pais });

        this._calle = calle?.trim();
        this._numero = numero?.trim();
        this._ciudad = ciudad?.trim();
        this._estado = estado?.trim();
        this._codigoPostal = codigoPostal?.trim();
        this._pais = pais?.trim();
    }

    validate({ calle, ciudad }) {
        if (!calle || typeof calle !== 'string' || calle.trim().length === 0) {
            throw new Error('La calle es requerida');
        }

        if (!ciudad || typeof ciudad !== 'string' || ciudad.trim().length === 0) {
            throw new Error('La ciudad es requerida');
        }
    }

    get calle() {
        return this._calle;
    }

    get numero() {
        return this._numero;
    }

    get ciudad() {
        return this._ciudad;
    }

    get estado() {
        return this._estado;
    }

    get codigoPostal() {
        return this._codigoPostal;
    }

    get pais() {
        return this._pais;
    }

    /**
     * Get formatted address for display
     */
    get formatted() {
        const parts = [];

        if (this._calle) {
            const street = this._numero ? `${this._calle} ${this._numero}` : this._calle;
            parts.push(street);
        }

        if (this._ciudad) parts.push(this._ciudad);
        if (this._estado) parts.push(this._estado);
        if (this._codigoPostal) parts.push(this._codigoPostal);
        if (this._pais) parts.push(this._pais);

        return parts.join(', ');
    }

    /**
     * Get short address (street and city only)
     */
    get short() {
        const parts = [];

        if (this._calle) {
            const street = this._numero ? `${this._calle} ${this._numero}` : this._calle;
            parts.push(street);
        }

        if (this._ciudad) parts.push(this._ciudad);

        return parts.join(', ');
    }

    /**
     * Check if two addresses are equal
     */
    equals(other) {
        if (!(other instanceof Address)) {
            return false;
        }

        return this._calle === other._calle &&
            this._numero === other._numero &&
            this._ciudad === other._ciudad &&
            this._estado === other._estado &&
            this._codigoPostal === other._codigoPostal &&
            this._pais === other._pais;
    }

    /**
     * Convert to string
     */
    toString() {
        return this.formatted;
    }

    /**
     * Convert to plain object for persistence
     */
    toObject() {
        return {
            calle: this._calle,
            numero: this._numero,
            ciudad: this._ciudad,
            estado: this._estado,
            codigoPostal: this._codigoPostal,
            pais: this._pais
        };
    }

    /**
     * Convert to JSON
     */
    toJSON() {
        return {
            ...this.toObject(),
            formatted: this.formatted,
            short: this.short
        };
    }
}

module.exports = Address;
