/**
 * TransactionError
 * 
 * Custom error class for transaction-related failures.
 * Provides additional context for debugging and monitoring.
 */

class TransactionError extends Error {
    /**
     * @param {string} message - Error message
     * @param {Error} originalError - The original error that caused the transaction to fail
     * @param {Object} context - Additional context (operationName, userId, etc.)
     */
    constructor(message, originalError = null, context = {}) {
        super(message);

        this.name = 'TransactionError';
        this.isTransactionError = true;
        this.originalError = originalError;
        this.context = context;
        this.timestamp = new Date();

        // Capture stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, TransactionError);
        }

        // Preserve original error stack if available
        if (originalError && originalError.stack) {
            this.originalStack = originalError.stack;
        }
    }

    /**
     * Get a JSON representation of the error
     * Useful for logging and monitoring
     */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            context: this.context,
            timestamp: this.timestamp,
            originalError: this.originalError ? {
                name: this.originalError.name,
                message: this.originalError.message,
                code: this.originalError.code,
                stack: this.originalError.stack
            } : null
        };
    }

    /**
     * Check if the error is due to a business logic validation
     * (as opposed to a technical/system error)
     */
    isBusinessLogicError() {
        if (!this.originalError) return false;

        const businessErrorPatterns = [
            /no encontrado/i,
            /no disponible/i,
            /sin permisos/i,
            /ya existe/i,
            /obligatorio/i,
            /inválido/i
        ];

        return businessErrorPatterns.some(pattern =>
            pattern.test(this.originalError.message)
        );
    }

    /**
     * Check if the error is due to a system/technical issue
     */
    isSystemError() {
        return !this.isBusinessLogicError();
    }
}

module.exports = TransactionError;
