const { z } = require('zod');

/**
 * Money Value Object
 * Handles monetary operations with precision
 * Enhanced with Zod for robust validation
 */

// Zod schema for money amount
const moneyAmountSchema = z.number()
    .nonnegative('Money amount must be non-negative')
    .finite('Money amount must be finite')
    .max(999999.99, 'Amount too large');

class Money {
    constructor(amount, currency = 'USD') {
        // Validate using Zod
        const validated = moneyAmountSchema.parse(amount);

        this._amount = Math.round(validated * 100) / 100; // Round to 2 decimals
        this._currency = currency;
    }

    get amount() {
        return this._amount;
    }

    get currency() {
        return this._currency;
    }

    add(other) {
        if (!(other instanceof Money)) {
            throw new Error('Can only add Money objects');
        }
        if (this._currency !== other._currency) {
            throw new Error('Cannot add different currencies');
        }
        return new Money(this._amount + other._amount, this._currency);
    }

    subtract(other) {
        if (!(other instanceof Money)) {
            throw new Error('Can only subtract Money objects');
        }
        if (this._currency !== other._currency) {
            throw new Error('Cannot subtract different currencies');
        }
        const result = this._amount - other._amount;
        if (result < 0) {
            throw new Error('Result cannot be negative');
        }
        return new Money(result, this._currency);
    }

    multiply(factor) {
        if (typeof factor !== 'number' || factor < 0) {
            throw new Error('Factor must be a non-negative number');
        }
        return new Money(this._amount * factor, this._currency);
    }

    applyDiscount(percentage) {
        if (typeof percentage !== 'number' || percentage < 0 || percentage > 100) {
            throw new Error('Percentage must be between 0 and 100');
        }
        const discountAmount = this._amount * (percentage / 100);
        return new Money(this._amount - discountAmount, this._currency);
    }

    equals(other) {
        if (!(other instanceof Money)) {
            return false;
        }
        return this._amount === other._amount && this._currency === other._currency;
    }

    toString() {
        return `${this._currency} ${this._amount.toFixed(2)}`;
    }

    toJSON() {
        return {
            amount: this._amount,
            currency: this._currency
        };
    }
}

module.exports = Money;
