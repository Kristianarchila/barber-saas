/**
 * Logger Utility for Hexagonal Architecture
 * Provides consistent logging across all controllers and use cases
 */

class Logger {
    /**
     * Log successful operations
     * @param {string} context - Controller or use case name
     * @param {string} operation - Operation being performed
     * @param {object} metadata - Additional data to log
     */
    static success(context, operation, metadata = {}) {
        console.log(`✅ [${context}] ${operation}`, metadata);
    }

    /**
     * Log errors with full context
     * @param {string} context - Controller or use case name
     * @param {string} operation - Operation that failed
     * @param {Error} error - Error object
     * @param {object} metadata - Additional context
     */
    static error(context, operation, error, metadata = {}) {
        console.error(`❌ [${context}] ${operation} FAILED`);
        console.error(`📍 Error: ${error.message}`);
        console.error(`🔍 Metadata:`, metadata);
        if (process.env.NODE_ENV === 'development') {
            console.error(`📚 Stack:`, error.stack);
        }
    }

    /**
     * Log warnings
     * @param {string} context - Controller or use case name
     * @param {string} message - Warning message
     * @param {object} metadata - Additional data
     */
    static warn(context, message, metadata = {}) {
        console.warn(`⚠️  [${context}] ${message}`, metadata);
    }

    /**
     * Log info messages
     * @param {string} context - Controller or use case name
     * @param {string} message - Info message
     * @param {object} metadata - Additional data
     */
    static info(context, message, metadata = {}) {
        console.log(`ℹ️  [${context}] ${message}`, metadata);
    }

    /**
     * Log debug messages (only in development)
     * @param {string} context - Controller or use case name
     * @param {string} message - Debug message
     * @param {object} metadata - Additional data
     */
    static debug(context, message, metadata = {}) {
        if (process.env.NODE_ENV === 'development') {
            console.log(`🐛 [${context}] ${message}`, metadata);
        }
    }
}

module.exports = Logger;
