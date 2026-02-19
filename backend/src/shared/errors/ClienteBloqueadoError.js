/**
 * @file ClienteBloqueadoError.js
 * @description Custom error for blocked clients
 */

class ClienteBloqueadoError extends Error {
    constructor(message, fechaDesbloqueo = null) {
        super(message);
        this.name = 'ClienteBloqueadoError';
        this.statusCode = 403;
        this.fechaDesbloqueo = fechaDesbloqueo;
    }

    toJSON() {
        return {
            error: this.name,
            message: this.message,
            statusCode: this.statusCode,
            fechaDesbloqueo: this.fechaDesbloqueo
        };
    }
}

module.exports = ClienteBloqueadoError;
