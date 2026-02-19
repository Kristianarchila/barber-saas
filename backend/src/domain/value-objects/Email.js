const { z } = require('zod');

/**
 * Email Value Object
 * Ensures email validation and immutability
 * Enhanced with Zod for robust validation
 */

// Zod schema for email validation
const emailSchema = z.string()
    .email('Invalid email format')
    .toLowerCase()
    .trim()
    .max(255, 'Email too long');

class Email {
    constructor(value) {
        // Validate using Zod
        const validated = emailSchema.parse(value);
        this._value = validated;
    }

    get value() {
        return this._value;
    }

    equals(other) {
        if (!(other instanceof Email)) {
            return false;
        }
        return this._value === other._value;
    }

    toString() {
        return this._value;
    }
}

module.exports = Email;
