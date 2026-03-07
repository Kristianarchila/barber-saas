/**
 * TransactionManager
 * 
 * Utility for managing MongoDB transactions with automatic retry,
 * rollback, and comprehensive error handling.
 */

const mongoose = require('mongoose');
const TransactionError = require('../domain/errors/TransactionError');

class TransactionManager {
    // Cached result of replica-set detection.
    // null  = not yet tested | true = transactions OK | false = standalone
    static _replicaSetAvailable = null;

    /**
     * Detect once whether MongoDB supports multi-document transactions.
     * Called lazily on first executeInTransaction call.
     */
    static async _detectReplicaSet() {
        if (TransactionManager._replicaSetAvailable !== null) {
            return TransactionManager._replicaSetAvailable;
        }
        try {
            const session = await mongoose.startSession();
            session.startTransaction();
            await session.abortTransaction();
            await session.endSession();
            TransactionManager._replicaSetAvailable = true;
            console.log('[TransactionManager] Replica set detected — transactions enabled');
        } catch {
            TransactionManager._replicaSetAvailable = false;
            console.warn(
                '[TransactionManager] No replica set — running without transactions. ' +
                'Double-booking protection relies on unique index {barberoId,fecha,hora}.'
            );
        }
        return TransactionManager._replicaSetAvailable;
    }

    /**
     * Execute an operation within a MongoDB transaction (or directly if no replica set).
     *
     * When MongoDB is in standalone mode, `session` will be null and the operation
     * runs without a transaction. The unique index on {barberoId,fecha,hora} is the
     * safety net — concurrent duplicates throw code 11000 → handleDuplicateKeyError
     * converts it to ReservationConflictError (409).
     */
    static async executeInTransaction(operation, options = {}) {
        const useTransactions = await TransactionManager._detectReplicaSet();

        // ── No-transaction path (standalone MongoDB) ──────────────────────────
        if (!useTransactions) {
            try {
                return await operation(null); // null session → repo saves without session
            } catch (error) {
                throw error; // bubble up: customErrors / errorHandler will classify it
            }
        }

        // ── Transaction path (replica set available) ──────────────────────────
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

                // ── 1. Already-typed errors (ReservationConflictError, etc.) ──
                // These have a statusCode set by the original thrower (e.g. 409).
                // Re-throw directly: wrapping them in TransactionError loses the statusCode
                // and the errorHandler falls back to 500.
                if (error.statusCode) {
                    throw error;
                }

                // ── 2. WriteConflict after retries exhausted → treat as 409 ──
                // MongoDB code 112 means two concurrent transactions tried to write the
                // same document; the loser should retry or get a conflict response.
                const { ReservationConflictError, handleDuplicateKeyError } = require('../utils/customErrors');
                if (error.code === 112) {
                    throw new ReservationConflictError(
                        'Otro usuario reservó este horario al mismo tiempo. Por favor elige otro.'
                    );
                }

                // ── 3. Duplicate key (unique index fired) → convert to 409 ──
                // e.g. concurrent inserts that pass the availability check but hit the index.
                const converted = handleDuplicateKeyError(error);
                if (converted !== error) throw converted;

                // ── 4. Unknown / infrastructure error → wrap and log ──
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
