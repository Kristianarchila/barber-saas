/**
 * Custom Error for Reservation Conflicts (Overbooking)
 * Thrown when attempting to create a duplicate reservation
 */
class ReservationConflictError extends Error {
    constructor(message = 'El horario seleccionado ya no está disponible. Por favor, elige otro horario.') {
        super(message);
        this.name = 'ReservationConflictError';
        this.statusCode = 409; // Conflict
        this.userFriendly = true;
    }
}

/**
 * Custom Error for Tenant Isolation Violations
 */
class TenantIsolationError extends Error {
    constructor(message = 'No tienes permiso para acceder a los datos de esta barbería') {
        super(message);
        this.name = 'TenantIsolationError';
        this.statusCode = 403; // Forbidden
        this.userFriendly = true;
    }
}

/**
 * Custom Error for Validation Failures
 */
class ValidationError extends Error {
    constructor(message, field = null) {
        super(message);
        this.name = 'ValidationError';
        this.statusCode = 400; // Bad Request
        this.field = field;
        this.userFriendly = true;
    }
}

/**
 * Custom Error for Not Found Resources
 */
class NotFoundError extends Error {
    constructor(resource = 'Recurso', message = null) {
        super(message || `${resource} no encontrado`);
        this.name = 'NotFoundError';
        this.statusCode = 404;
        this.userFriendly = true;
    }
}

/**
 * Detect if error is a MongoDB duplicate key error
 * @param {Error} error 
 * @returns {boolean}
 */
function isDuplicateKeyError(error) {
    return error.code === 11000 || error.name === 'MongoServerError' && error.code === 11000;
}

/**
 * Convert MongoDB duplicate key error to user-friendly ReservationConflictError
 * @param {Error} error 
 * @returns {ReservationConflictError|Error}
 */
function handleDuplicateKeyError(error) {
    if (isDuplicateKeyError(error)) {
        // Check if it's the reservation slot index
        if (error.message.includes('unique_reservation_slot') ||
            error.message.includes('barberoId') && error.message.includes('fecha') && error.message.includes('hora')) {
            return new ReservationConflictError();
        }

        // Generic duplicate error
        return new ValidationError('Ya existe un registro con estos datos');
    }

    return error;
}

module.exports = {
    ReservationConflictError,
    TenantIsolationError,
    ValidationError,
    NotFoundError,
    isDuplicateKeyError,
    handleDuplicateKeyError
};
