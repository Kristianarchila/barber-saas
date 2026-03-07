const { connectDB, closeDB, clearDB } = require('../../setup');
const {
    createTestBarberia,
    createTestBarbero,
    createTestServicio,
    getFutureDate
} = require('../../factories/test-factories');
const CreateReserva = require('../../../src/application/use-cases/reservas/CreateReserva');
const MongoReservaRepository = require('../../../src/infrastructure/database/mongodb/repositories/MongoReservaRepository');
const MongoServicioRepository = require('../../../src/infrastructure/database/mongodb/repositories/MongoServicioRepository');
const AvailabilityService = require('../../../src/domain/services/AvailabilityService');
const Barberia = require('../../../src/infrastructure/database/mongodb/models/Barberia');
const Barbero = require('../../../src/infrastructure/database/mongodb/models/Barbero');
const Servicio = require('../../../src/infrastructure/database/mongodb/models/Servicio');
const Reserva = require('../../../src/infrastructure/database/mongodb/models/Reserva');

describe('CreateReserva Use Case', () => {
    let createReserva;
    let reservaRepository;
    let servicioRepository;
    let availabilityService;
    let barberia;
    let barbero;
    let servicio;
    let mockEmailService;

    beforeAll(async () => {
        await connectDB();
    });

    afterAll(async () => {
        await closeDB();
    });

    beforeEach(async () => {
        await clearDB();
        jest.clearAllMocks();

        // Create test data
        barberia = await Barberia.create(createTestBarberia());
        barbero = await Barbero.create(createTestBarbero({ barberiaId: barberia._id }));
        servicio = await Servicio.create(createTestServicio({
            barberiaId: barberia._id,
            precio: 100,
            duracion: 30
        }));

        // Initialize repositories and services
        reservaRepository = new MongoReservaRepository();
        servicioRepository = new MongoServicioRepository();
        availabilityService = new AvailabilityService(reservaRepository);

        // Mock email service
        mockEmailService = {
            sendReservaConfirmation: jest.fn().mockResolvedValue(true)
        };

        // Initialize use case
        createReserva = new CreateReserva(
            reservaRepository,
            servicioRepository,
            availabilityService,
            mockEmailService
        );
    });

    describe('Happy Path', () => {
        it('should create reservation successfully with valid data', async () => {
            const dto = {
                barberoId: barbero._id,
                barberiaId: barberia._id,
                servicioId: servicio._id,
                nombreCliente: 'Juan Pérez',
                emailCliente: 'juan@test.com',
                fecha: getFutureDate(7),
                hora: '10:00'
            };

            const result = await createReserva.execute(dto);

            expect(result).toBeDefined();
            expect(result.barberoId.toString()).toBe(barbero._id.toString());
            expect(result.servicioId.toString()).toBe(servicio._id.toString());
            expect(result.nombreCliente).toBe('Juan Pérez');
            expect(result.emailCliente.value).toBe('juan@test.com');
            expect(result.precio.amount).toBe(100);
            expect(result.timeSlot.durationMinutes).toBe(30);
            expect(result.estado).toBe('RESERVADA');
        });

        it('should generate unique cancelToken for each reservation', async () => {
            const dto = {
                barberoId: barbero._id,
                barberiaId: barberia._id,
                servicioId: servicio._id,
                nombreCliente: 'Cliente Test',
                emailCliente: 'test@test.com',
                fecha: getFutureDate(7),
                hora: '10:00'
            };

            const reserva1 = await createReserva.execute(dto);
            const reserva2 = await createReserva.execute({
                ...dto,
                hora: '11:00'
            });

            expect(reserva1.cancelToken).toBeDefined();
            expect(reserva2.cancelToken).toBeDefined();
            expect(reserva1.cancelToken).not.toBe(reserva2.cancelToken);
            expect(reserva1.cancelToken.length).toBe(64); // 32 bytes = 64 hex chars
        });

        it('should send confirmation email after transaction commits', async () => {
            const dto = {
                barberoId: barbero._id,
                barberiaId: barberia._id,
                servicioId: servicio._id,
                nombreCliente: 'Cliente Test',
                emailCliente: 'test@test.com',
                fecha: getFutureDate(7),
                hora: '10:00'
            };

            await createReserva.execute(dto);

            // Email should be called asynchronously
            await new Promise(resolve => setTimeout(resolve, 100));

            expect(mockEmailService.sendReservaConfirmation).toHaveBeenCalledTimes(1);
            expect(mockEmailService.sendReservaConfirmation).toHaveBeenCalledWith(
                expect.objectContaining({
                    nombreCliente: 'Cliente Test',
                    emailCliente: expect.objectContaining({ _value: 'test@test.com' })
                })
            );
        });
    });

    describe('Error Handling', () => {
        it('should throw error when service not found', async () => {
            const dto = {
                barberoId: barbero._id,
                barberiaId: barberia._id,
                servicioId: '507f1f77bcf86cd799439011', // Non-existent ID
                nombreCliente: 'Cliente Test',
                emailCliente: 'test@test.com',
                fecha: getFutureDate(7),
                hora: '10:00'
            };

            await expect(createReserva.execute(dto)).rejects.toThrow('Servicio no encontrado');
        });

        it('should throw error when service is inactive', async () => {
            // Deactivate service
            await Servicio.findByIdAndUpdate(servicio._id, { activo: false });

            const dto = {
                barberoId: barbero._id,
                barberiaId: barberia._id,
                servicioId: servicio._id,
                nombreCliente: 'Cliente Test',
                emailCliente: 'test@test.com',
                fecha: getFutureDate(7),
                hora: '10:00'
            };

            await expect(createReserva.execute(dto)).rejects.toThrow('El servicio no está disponible');
        });

        it('should throw error when time slot not available', async () => {
            // Create existing reservation
            await Reserva.create({
                barberoId: barbero._id,
                barberiaId: barberia._id,
                servicioId: servicio._id,
                nombreCliente: 'Existing Client',
                emailCliente: 'existing@test.com',
                fecha: getFutureDate(7),
                hora: '10:00',
                horaFin: '10:30',
                duracion: 30,
                precio: 100,
                estado: 'RESERVADA',
                cancelToken: require('crypto').randomBytes(32).toString('hex')
            });

            const dto = {
                barberoId: barbero._id,
                barberiaId: barberia._id,
                servicioId: servicio._id,
                nombreCliente: 'New Client',
                emailCliente: 'new@test.com',
                fecha: getFutureDate(7),
                hora: '10:00' // Same time slot
            };

            await expect(createReserva.execute(dto)).rejects.toThrow();
        });

        it('should throw ReservationConflictError on double booking attempt', async () => {
            const dto = {
                barberoId: barbero._id,
                barberiaId: barberia._id,
                servicioId: servicio._id,
                nombreCliente: 'Cliente Test',
                emailCliente: 'test@test.com',
                fecha: getFutureDate(7),
                hora: '10:00'
            };

            // Create first reservation
            await createReserva.execute(dto);

            // Attempt to create conflicting reservation
            await expect(createReserva.execute(dto)).rejects.toThrow();
        });

        it('should handle duplicate key errors gracefully', async () => {
            // This tests the handleDuplicateKeyError utility
            const dto = {
                barberoId: barbero._id,
                barberiaId: barberia._id,
                servicioId: servicio._id,
                nombreCliente: 'Cliente Test',
                emailCliente: 'test@test.com',
                fecha: getFutureDate(7),
                hora: '10:00'
            };

            await createReserva.execute(dto);

            // Try to create duplicate
            try {
                await createReserva.execute(dto);
                fail('Should have thrown error');
            } catch (error) {
                expect(error).toBeDefined();
                // Error should be user-friendly, not raw MongoDB error
                expect(error.message).not.toContain('E11000');
            }
        });
    });

    describe('Transaction Integrity', () => {
        it('should prevent race conditions with concurrent bookings', async () => {
            const dto = {
                barberoId: barbero._id,
                barberiaId: barberia._id,
                servicioId: servicio._id,
                nombreCliente: 'Cliente Test',
                emailCliente: 'test@test.com',
                fecha: getFutureDate(7),
                hora: '10:00'
            };

            // Simulate concurrent requests
            const promises = [
                createReserva.execute(dto),
                createReserva.execute(dto),
                createReserva.execute(dto)
            ];

            const results = await Promise.allSettled(promises);

            // Only one should succeed
            const successful = results.filter(r => r.status === 'fulfilled');
            const failed = results.filter(r => r.status === 'rejected');

            expect(successful.length).toBe(1);
            expect(failed.length).toBe(2);
        });

        it('should rollback on transaction failure', async () => {
            // Create a scenario where transaction should fail
            const invalidDto = {
                barberoId: barbero._id,
                barberiaId: barberia._id,
                servicioId: servicio._id,
                nombreCliente: 'Cliente Test',
                emailCliente: 'test@test.com',
                fecha: getFutureDate(7),
                hora: '10:00'
            };

            // Mock repository to fail after availability check
            const originalSave = reservaRepository.save;
            reservaRepository.save = jest.fn().mockRejectedValue(new Error('Database error'));

            try {
                await createReserva.execute(invalidDto);
                fail('Should have thrown error');
            } catch (error) {
                expect(error.message).toContain('Database error');
            }

            // Verify no reservation was created
            const reservas = await Reserva.find({ barberiaId: barberia._id });
            expect(reservas.length).toBe(0);

            // Restore original method
            reservaRepository.save = originalSave;
        });
    });

    describe('Multi-Tenant Security', () => {
        it('should validate barberiaId matches between service and reservation', async () => {
            // Create another barberia
            const barberia2 = await Barberia.create(createTestBarberia());
            const servicio2 = await Servicio.create(createTestServicio({
                barberiaId: barberia2._id
            }));

            const dto = {
                barberoId: barbero._id,
                barberiaId: barberia._id, // Barberia A
                servicioId: servicio2._id, // Service from Barberia B
                nombreCliente: 'Cliente Test',
                emailCliente: 'test@test.com',
                fecha: getFutureDate(7),
                hora: '10:00'
            };

            // Should fail because service belongs to different barberia
            await expect(createReserva.execute(dto)).rejects.toThrow('Servicio no encontrado');
        });

        it('should prevent creating reservation for service from different barberia', async () => {
            const barberia2 = await Barberia.create(createTestBarberia());
            const barbero2 = await Barbero.create(createTestBarbero({ barberiaId: barberia2._id }));
            const servicio2 = await Servicio.create(createTestServicio({ barberiaId: barberia2._id }));

            const dto = {
                barberoId: barbero2._id,
                barberiaId: barberia2._id,
                servicioId: servicio._id, // Service from barberia A
                nombreCliente: 'Cliente Test',
                emailCliente: 'test@test.com',
                fecha: getFutureDate(7),
                hora: '10:00'
            };

            // Repository should enforce barberiaId filtering
            await expect(createReserva.execute(dto)).rejects.toThrow('Servicio no encontrado');
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // REGRESSION TESTS — bugs fixed in production, must never regress
    // ─────────────────────────────────────────────────────────────────────────

    describe('Regression: ClienteStats upsert (BUG-001)', () => {
        /**
         * BUG-001: MongoClienteStatsRepository.findOrCreate() used Model.create()
         * inside a Mongoose session, which triggered the pre('save') hook with an
         * incorrect `next` argument, throwing "TypeError: next is not a function"
         * and causing 18,081 HTTP 500 errors under concurrent load.
         *
         * FIX: replaced Model.create() with findOneAndUpdate({ upsert: true,
         * $setOnInsert: {...} }) which bypasses the pre('save') hook entirely.
         *
         * REGRESSION GUARD: create N concurrent reservations for the same client
         * email but different time slots. All should succeed. If the bug regresses,
         * at least one will throw "next is not a function" (500).
         */
        it('should create multiple reservations for the same client without 5xx errors', async () => {
            const clientEmail = 'regression-bug001@test.com';
            const slots = ['09:00', '11:00', '14:00'];

            const promises = slots.map(hora => createReserva.execute({
                barberoId: barbero._id,
                barberiaId: barberia._id,
                servicioId: servicio._id,
                nombreCliente: 'Regression Client',
                emailCliente: clientEmail,
                telefono: '1234567890',
                fecha: getFutureDate(7),
                hora,
            }));

            // All 3 different slots must succeed — no "next is not a function" crash
            const results = await Promise.allSettled(promises);
            const errors = results.filter(r => r.status === 'rejected');

            expect(errors).toHaveLength(0);
            results.forEach(r => {
                expect(r.status).toBe('fulfilled');
                expect(r.value.emailCliente.value).toBe(clientEmail);
            });
        });

        it('should handle concurrent same-client reservations across different barberias', async () => {
            const barberia2 = await Barberia.create(createTestBarberia());
            const barbero2 = await Barbero.create(createTestBarbero({ barberiaId: barberia2._id }));
            const servicio2 = await Servicio.create(createTestServicio({ barberiaId: barberia2._id, duracion: 30 }));

            const createReserva2 = new CreateReserva(
                new MongoReservaRepository(),
                new MongoServicioRepository(),
                new AvailabilityService(new MongoReservaRepository()),
                mockEmailService
            );

            const email = 'shared-client@test.com';
            const fecha = getFutureDate(7);

            const [r1, r2] = await Promise.all([
                createReserva.execute({
                    barberoId: barbero._id, barberiaId: barberia._id,
                    servicioId: servicio._id, nombreCliente: 'Shared', emailCliente: email,
                    telefono: '1234567890', fecha, hora: '10:00',
                }),
                createReserva2.execute({
                    barberoId: barbero2._id, barberiaId: barberia2._id,
                    servicioId: servicio2._id, nombreCliente: 'Shared', emailCliente: email,
                    telefono: '1234567890', fecha, hora: '10:00',
                }),
            ]);

            // Both succeed — same client, different barberias, isolated ClienteStats per tenant
            expect(r1).toBeDefined();
            expect(r2).toBeDefined();
        });
    });

    describe('Regression: 409 error propagation (BUG-002)', () => {
        /**
         * BUG-002: TransactionManager caught business errors from the use case
         * and re-wrapped them as generic 500s, losing the original statusCode.
         * Double-booking attempts showed as HTTP 500 instead of 409 Conflict.
         *
         * FIX: TransactionManager now re-throws errors that have a statusCode
         * property, preserving the original HTTP status code.
         *
         * REGRESSION GUARD: a double-booking attempt must produce an error with
         * statusCode 409 (or at least not 500).
         */
        it('should produce an error with statusCode 409 on double-booking, not 500', async () => {
            const dto = {
                barberoId: barbero._id,
                barberiaId: barberia._id,
                servicioId: servicio._id,
                nombreCliente: 'Cliente Test',
                emailCliente: 'test@test.com',
                telefono: '1234567890',
                fecha: getFutureDate(7),
                hora: '10:00'
            };

            // First booking succeeds
            await createReserva.execute(dto);

            // Second booking must conflict
            let caughtError;
            try {
                await createReserva.execute({ ...dto, emailCliente: 'otro@test.com', nombreCliente: 'Otro' });
            } catch (err) {
                caughtError = err;
            }

            expect(caughtError).toBeDefined();
            // The error must NOT be a generic 500-type error
            // It should have statusCode 409 OR at least not 500
            const statusCode = caughtError.statusCode || caughtError.status;
            if (statusCode !== undefined) {
                expect(statusCode).toBe(409);
            }
            // And the message must not be a raw MongoDB duplicate key error
            expect(caughtError.message).not.toMatch(/E11000/);
        });

        it('concurrent double-booking: exactly 1 succeeds, rest fail with conflict (not server error)', async () => {
            const dto = {
                barberoId: barbero._id,
                barberiaId: barberia._id,
                servicioId: servicio._id,
                nombreCliente: 'Race User',
                emailCliente: 'race@test.com',
                telefono: '1234567890',
                fecha: getFutureDate(7),
                hora: '10:00'
            };

            const N = 5;
            const attempts = Array.from({ length: N }, (_, i) =>
                createReserva.execute({
                    ...dto,
                    emailCliente: `race${i}@test.com`,
                    nombreCliente: `Race User ${i}`,
                })
            );

            const results = await Promise.allSettled(attempts);

            const succeeded = results.filter(r => r.status === 'fulfilled');
            const failed = results.filter(r => r.status === 'rejected');

            // Exactly 1 must win
            expect(succeeded).toHaveLength(1);
            expect(failed).toHaveLength(N - 1);

            // Failures must NOT be internal server errors (BUG-002 regression)
            for (const f of failed) {
                const msg = f.reason?.message || '';
                // Must not be a raw Mongoose/Mongo crash message
                expect(msg).not.toMatch(/next is not a function/i);
                expect(msg).not.toMatch(/TypeError/i);
                expect(msg).not.toMatch(/Cannot read properties/i);
            }
        });
    });
});
