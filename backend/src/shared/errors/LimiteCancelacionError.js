/**
 * @file LimiteCancelacionError.js
 * @description Custom error for cancellation limit violations
 */

class LimiteCancelacionError extends Error {
    constructor(message, horasRequeridas = null) {
        super(message);
        this.name = 'LimiteCancelacionError';
        this.statusCode = 400;
        this.horasRequeridas = horasRequeridas;
    }

    toJSON() {
        return {
            error: this.name,
            message: this.message,
            statusCode: this.statusCode,
            horasRequeridas: this.horasRequeridas
        };
    }
}

module.exports = LimiteCancelacionError;
