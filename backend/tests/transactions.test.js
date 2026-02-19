const mongoose = require('mongoose');
const { connectDB, closeDB, clearDB } = require('./setup');
const TransactionManager = require('../src/utils/TransactionManager');
const TransactionError = require('../src/domain/errors/TransactionError');

describe('TransactionManager', () => {
    beforeAll(async () => {
        await connectDB();
    });

    afterAll(async () => {
        await closeDB();
    });

    beforeEach(async () => {
        await clearDB();
    });

    describe('Transaction Execution', () => {
        it('should successfully commit a transaction', async () => {
            const result = await TransactionManager.executeInTransaction(
                async (session) => {
                    // Simulate some database operation
                    return { success: true, data: 'test' };
                },
                { operationName: 'TestSuccessfulTransaction' }
            );

            expect(result).toEqual({ success: true, data: 'test' });
        });

        it('should rollback transaction on error', async () => {
            await expect(
                TransactionManager.executeInTransaction(
                    async (session) => {
                        throw new Error('Simulated error');
                    },
                    { operationName: 'TestRollback' }
                )
            ).rejects.toThrow(TransactionError);
        });

        it('should retry on transient errors', async () => {
            let attemptCount = 0;

            const result = await TransactionManager.executeInTransaction(
                async (session) => {
                    attemptCount++;
                    if (attemptCount < 2) {
                        // Simulate transient error on first attempt
                        const error = new Error('WriteConflict');
                        error.code = 112; // MongoDB WriteConflict error code
                        throw error;
                    }
                    return { success: true, attempts: attemptCount };
                },
                { operationName: 'TestRetry', maxRetries: 3 }
            );

            expect(result.success).toBe(true);
            expect(result.attempts).toBe(2);
        });

        it('should not retry on business logic errors', async () => {
            let attemptCount = 0;

            await expect(
                TransactionManager.executeInTransaction(
                    async (session) => {
                        attemptCount++;
                        throw new Error('Reserva no encontrada');
                    },
                    { operationName: 'TestNoRetry', maxRetries: 3 }
                )
            ).rejects.toThrow(TransactionError);

            // Should only attempt once (no retry for business errors)
            expect(attemptCount).toBe(1);
        });
    });

    describe('Transaction Validation', () => {
        it('should validate transaction support on startup', async () => {
            const isSupported = await TransactionManager.validateTransactionSupport();
            expect(isSupported).toBe(true);
        });
    });

    describe('Error Classification', () => {
        it('should identify transient errors correctly', () => {
            const writeConflictError = new Error('Write conflict');
            writeConflictError.code = 112;
            expect(TransactionManager.isTransientError(writeConflictError)).toBe(true);

            const businessError = new Error('Reserva no encontrada');
            expect(TransactionManager.isTransientError(businessError)).toBe(false);
        });

        it('should identify error labels correctly', () => {
            const transientError = new Error('Transaction error');
            transientError.errorLabels = ['TransientTransactionError'];
            expect(TransactionManager.isTransientError(transientError)).toBe(true);
        });
    });
});

describe('TransactionError', () => {
    it('should create error with context', () => {
        const originalError = new Error('Original error');
        const transactionError = new TransactionError(
            'Transaction failed',
            originalError,
            { operationName: 'TestOperation', userId: '123' }
        );

        expect(transactionError.name).toBe('TransactionError');
        expect(transactionError.isTransactionError).toBe(true);
        expect(transactionError.originalError).toBe(originalError);
        expect(transactionError.context.operationName).toBe('TestOperation');
    });

    it('should identify business logic errors', () => {
        const businessError = new Error('Cliente no encontrado');
        const transactionError = new TransactionError(
            'Transaction failed',
            businessError,
            {}
        );

        expect(transactionError.isBusinessLogicError()).toBe(true);
        expect(transactionError.isSystemError()).toBe(false);
    });

    it('should identify system errors', () => {
        const systemError = new Error('Connection timeout');
        const transactionError = new TransactionError(
            'Transaction failed',
            systemError,
            {}
        );

        expect(transactionError.isBusinessLogicError()).toBe(false);
        expect(transactionError.isSystemError()).toBe(true);
    });

    it('should serialize to JSON', () => {
        const originalError = new Error('Test error');
        const transactionError = new TransactionError(
            'Transaction failed',
            originalError,
            { userId: '123' }
        );

        const json = transactionError.toJSON();

        expect(json.name).toBe('TransactionError');
        expect(json.message).toBe('Transaction failed');
        expect(json.context.userId).toBe('123');
        expect(json.originalError.message).toBe('Test error');
    });
});
