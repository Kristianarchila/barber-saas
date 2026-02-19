/**
 * TransactionManager
 * 
 * Utility for managing MongoDB transactions with automatic retry,
 * rollback, and comprehensive error handling.
 */

const mongoose = require('mongoose');
const TransactionError = require('../domain/errors/TransactionError');

class TransactionManager {
    /**
     * Execute an operation within a MongoDB transaction
     * 
     * @param {Function} operation - Async function that receives a session parameter
     * @param {Object} options - Transaction options
     * @param {number} options.maxRetries - Maximum retry attempts for transient errors (default: 3)
     * @param {number} options.retryDelay - Base delay between retries in ms (default: 100)
     * @param {string} options.operationName - Name for logging purposes
     * @returns {Promise<any>} - Result from the operation
     * 
     * @example
     * const result = await TransactionManager.executeInTransaction(
     *   async (session) => {
     *     const reserva = await reservaRepo.save(reservaData, session);
     *     await clienteRepo.update(clienteId, updateData, session);
     *     return reserva;
     *   },
     *   { operationName: 'CompleteReservation' }
     * );
     */
    static async executeInTransaction(operation, options = {}) {
        const {
            maxRetries = 3,
            retryDelay = 100,
            operationName = 'UnnamedOperation'
        } = options;

        let session = null;
        let attempt = 0;

        while (attempt < maxRetries) {
            try {
                // Start a new session
                session = await mongoose.startSession();

                // Start transaction
                session.startTransaction({
                    readConcern: { level: 'majority' },
                    writeConcern: { w: 'majority' },
                    readPreference: 'primary'
                });

                console.log(`[Transaction] Started: ${operationName} (attempt ${attempt + 1}/${maxRetries})`);

                // Execute the operation with the session
                const result = await operation(session);

                // Commit the transaction
                await session.commitTransaction();
                console.log(`[Transaction] Committed: ${operationName}`);

                return result;

            } catch (error) {
                // Abort transaction if it's still active
                if (session && session.inTransaction()) {
                    await session.abortTransaction();
                    console.log(`[Transaction] Aborted: ${operationName}`);
                }

                // Check if error is transient and we should retry
                if (this.isTransientError(error) && attempt < maxRetries - 1) {
                    attempt++;
                    const delay = retryDelay * Math.pow(2, attempt); // Exponential backoff
                    console.warn(`[Transaction] Transient error, retrying in ${delay}ms:`, error.message);
                    await this.sleep(delay);
                    continue;
                }

                // Non-transient error or max retries reached
                console.error(`[Transaction] Failed: ${operationName}`, {
                    error: error.message,
                    attempt: attempt + 1,
                    stack: error.stack
                });

                const transactionError = new TransactionError(
                    `Transaction failed for ${operationName}: ${error.message}`,
                    error,
                    { operationName, attempt: attempt + 1 }
                );

                // Preserve statusCode from original error for proper HTTP responses
                if (error.statusCode) {
                    transactionError.statusCode = error.statusCode;
                }

                throw transactionError;

            } finally {
                // Always end the session
                if (session) {
                    await session.endSession();
                }
            }
        }
    }

    /**
     * Start a new MongoDB session
     * Use this for manual transaction management
     * 
     * @returns {Promise<ClientSession>}
     */
    static async startSession() {
        return await mongoose.startSession();
    }

    /**
     * Check if an error is transient and can be retried
     * 
     * @param {Error} error 
     * @returns {boolean}
     */
    static isTransientError(error) {
        if (!error) return false;

        const transientErrorCodes = [
            112,  // WriteConflict
            117,  // ConflictingOperationInProgress
            251,  // NoSuchTransaction
            262,  // TransactionAborted
        ];

        const transientErrorLabels = [
            'TransientTransactionError',
            'UnknownTransactionCommitResult'
        ];

        // Check error code
        if (error.code && transientErrorCodes.includes(error.code)) {
            return true;
        }

        // Check error labels
        if (error.errorLabels && Array.isArray(error.errorLabels)) {
            return error.errorLabels.some(label =>
                transientErrorLabels.includes(label)
            );
        }

        // Check error message for common transient patterns
        const transientPatterns = [
            /write conflict/i,
            /transaction.*aborted/i,
            /could not contact primary/i,
            /connection.*closed/i
        ];

        return transientPatterns.some(pattern =>
            pattern.test(error.message)
        );
    }

    /**
     * Sleep utility for retry delays
     * 
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise<void>}
     */
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Validate that MongoDB is configured for transactions
     * Call this on application startup
     * 
     * @returns {Promise<boolean>}
     * @throws {Error} If transactions are not supported
     */
    static async validateTransactionSupport() {
        try {
            const session = await mongoose.startSession();

            // Try to start a transaction
            session.startTransaction();
            await session.abortTransaction();
            await session.endSession();

            console.log('✅ MongoDB transactions are supported');
            return true;

        } catch (error) {
            if (error.message.includes('replica set')) {
                throw new Error(
                    'MongoDB transactions require a replica set. ' +
                    'Please configure MongoDB as a replica set or use MongoDB Atlas.'
                );
            }
            throw error;
        }
    }
}

module.exports = TransactionManager;
