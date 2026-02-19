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
            expect(result.emailCliente).toBe('juan@test.com');
            expect(result.precio).toBe(100);
            expect(result.duracion).toBe(30);
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
                    emailCliente: 'test@test.com'
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
                estado: 'RESERVADA'
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
                expect(error.message).toBe('Database error');
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
});
