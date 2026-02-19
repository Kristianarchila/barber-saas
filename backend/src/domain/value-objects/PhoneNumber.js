const { z } = require('zod');

/**
 * PhoneNumber Value Object
 * Validates and formats phone numbers
 * Enhanced with Zod for robust validation
 */

// Zod schema for phone number
const phoneSchema = z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .transform(val => val.replace(/\D/g, '')); // Remove non-digits

class PhoneNumber {
    constructor(value, countryCode = '+1') {
        // Validate and normalize using Zod
        const validated = phoneSchema.parse(value);
        this._value = validated;
        this._countryCode = countryCode;
    }

    get value() {
        return this._value;
    }

    get countryCode() {
        return this._countryCode;
    }

    get formatted() {
        // Format as (XXX) XXX-XXXX for 10-digit numbers
        if (this._value.length === 10) {
            return `(${this._value.slice(0, 3)}) ${this._value.slice(3, 6)}-${this._value.slice(6)}`;
        }
        return this._value;
    }

    get international() {
        return `${this._countryCode}${this._value}`;
    }

    equals(other) {
        if (!(other instanceof PhoneNumber)) {
            return false;
        }
        return this._value === other._value && this._countryCode === other._countryCode;
    }

    toString() {
        return this.formatted;
    }

    toJSON() {
        return {
            value: this._value,
            countryCode: this._countryCode,
            formatted: this.formatted
        };
    }
}

module.exports = PhoneNumber;
