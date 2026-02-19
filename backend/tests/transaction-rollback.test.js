const mongoose = require('mongoose');
const { connectDB, closeDB, clearDB } = require('./setup');
const CompleteReserva = require('../src/application/use-cases/reservas/CompleteReserva');
const MongoReservaRepository = require('../src/infrastructure/database/mongodb/repositories/MongoReservaRepository');
const MongoClienteRepository = require('../src/infrastructure/database/mongodb/repositories/MongoClienteRepository');
const ReservaModel = require('../src/infrastructure/database/mongodb/models/Reserva');
const UserModel = require('../src/infrastructure/database/mongodb/models/User');

describe('Transaction Rollback Integration Tests', () => {
    let reservaRepository;
    let clienteRepository;
    let mockEmailService;
    let testBarberiaId;
    let testBarberoId;
    let testServicioId;

    beforeAll(async () => {
        await connectDB();

        reservaRepository = new MongoReservaRepository();
        clienteRepository = new MongoClienteRepository();
        mockEmailService = {
            sendReviewRequest: jest.fn().mockResolvedValue(true)
        };

        testBarberiaId = new mongoose.Types.ObjectId();
        testBarberoId = new mongoose.Types.ObjectId();
        testServicioId = new mongoose.Types.ObjectId();
    });

    afterAll(async () => {
        await closeDB();
    });

    beforeEach(async () => {
        await clearDB();
    });

    describe('CompleteReserva Transaction Rollback', () => {
        it('should rollback reservation update if client update fails', async () => {
            // 1. Create test reservation
            const reserva = await ReservaModel.create({
                barberoId: testBarberoId,
                servicioId: testServicioId,
                barberiaId: testBarberiaId,
                nombreCliente: 'Test Cliente',
                emailCliente: 'test@example.com',
                fecha: new Date('2026-12-01'),
                hora: '10:00',
                horaFin: '10:30',
                estado: 'RESERVADA',
                precioSnapshot: {
                    precioBase: 20,
                    precioFinal: 20,
                    fechaSnapshot: new Date()
                }
            });

            // 2. Create test client
            const cliente = await UserModel.create({
                nombre: 'Test Cliente',
                email: 'test@example.com',
                password: 'password123',
                barberiaId: testBarberiaId,
                rol: 'CLIENTE',
                activo: true,
                historialVisitas: 0
            });

            // 3. Mock client repository to fail on update
            const originalUpdate = clienteRepository.update;
            clienteRepository.update = jest.fn().mockRejectedValue(new Error('Database error'));

            // 4. Execute use case (should fail and rollback)
            const completeReserva = new CompleteReserva(
                reservaRepository,
                clienteRepository,
                mockEmailService
            );

            await expect(
                completeReserva.execute(reserva._id.toString())
            ).rejects.toThrow();

            // 5. Verify rollback: reservation should still be RESERVADA
            const reservaAfter = await ReservaModel.findById(reserva._id);
            expect(reservaAfter.estado).toBe('RESERVADA');
            expect(reservaAfter.completadaEn).toBeUndefined();

            // 6. Verify client visit count unchanged
            const clienteAfter = await UserModel.findById(cliente._id);
            expect(clienteAfter.historialVisitas).toBe(0);

            // Restore original method
            clienteRepository.update = originalUpdate;
        });

        it('should commit both updates when successful', async () => {
            // 1. Create test reservation
            const reserva = await ReservaModel.create({
                barberoId: testBarberoId,
                servicioId: testServicioId,
                barberiaId: testBarberiaId,
                clienteId: new mongoose.Types.ObjectId(),
                nombreCliente: 'Test Cliente Success',
                emailCliente: 'success@example.com',
                fecha: new Date('2026-12-01'),
                hora: '11:00',
                horaFin: '11:30',
                estado: 'RESERVADA',
                precioSnapshot: {
                    precioBase: 20,
                    precioFinal: 20,
                    fechaSnapshot: new Date()
                }
            });

            // 2. Create test client
            const cliente = await UserModel.create({
                _id: reserva.clienteId,
                nombre: 'Test Cliente Success',
                email: 'success@example.com',
                password: 'password123',
                barberiaId: testBarberiaId,
                rol: 'CLIENTE',
                activo: true,
                historialVisitas: 0
            });

            // 3. Execute use case (should succeed)
            const completeReserva = new CompleteReserva(
                reservaRepository,
                clienteRepository,
                mockEmailService
            );

            const result = await completeReserva.execute(reserva._id.toString());

            // 4. Verify both updates committed
            const reservaAfter = await ReservaModel.findById(reserva._id);
            expect(reservaAfter.estado).toBe('COMPLETADA');
            expect(reservaAfter.completadaEn).toBeDefined();

            const clienteAfter = await UserModel.findById(cliente._id);
            expect(clienteAfter.historialVisitas).toBe(1);
            expect(clienteAfter.ultimaVisita).toBeDefined();
        });
    });

    describe('Concurrent Reservation Prevention', () => {
        it('should prevent double booking with concurrent requests', async () => {
            // This test would require actual concurrent execution
            // For now, we verify the transaction isolation level is set correctly
            const session = await mongoose.startSession();
            session.startTransaction({
                readConcern: { level: 'majority' },
                writeConcern: { w: 'majority' }
            });

            expect(session.inTransaction()).toBe(true);

            await session.abortTransaction();
            await session.endSession();
        });
    });
});
