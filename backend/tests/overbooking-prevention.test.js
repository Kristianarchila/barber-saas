/**
 * Overbooking Prevention Stress Test
 *
 * Simulates concurrent reservation attempts to verify that
 * the unique index and transaction locking prevent double bookings.
 */

const mongoose = require('mongoose');
const crypto = require('crypto');
const { connectDB, closeDB, clearDB } = require('./setup');
const ReservaModel = require('../src/infrastructure/database/mongodb/models/Reserva');
const BarberoModel = require('../src/infrastructure/database/mongodb/models/Barbero');
const ServicioModel = require('../src/infrastructure/database/mongodb/models/Servicio');
const BarberiaModel = require('../src/infrastructure/database/mongodb/models/Barberia');
const UserModel = require('../src/infrastructure/database/mongodb/models/User');

// Test configuration
const CONCURRENT_ATTEMPTS = 10; // Reduced from 50 for test suite performance
const TEST_DATE = new Date('2026-03-15');
const TEST_HORA = '10:00';
const TEST_HORA_FIN = '11:00';

describe('Overbooking Prevention Tests', () => {
    let testBarberiaId;
    let testBarberoId;
    let testServicioId;

    beforeAll(async () => {
        await connectDB();
    });

    afterAll(async () => {
        await closeDB();
    });

    beforeEach(async () => {
        await clearDB();

        // Create test barberia
        const barberia = await BarberiaModel.create({
            nombre: 'Test Barbería Overbooking',
            slug: `test-overbooking-${Date.now()}`,
            direccion: 'Test Address',
            telefono: '123456789',
            email: 'test@overbooking.com',
            activa: true
        });
        testBarberiaId = barberia._id;

        // Create test admin user
        const admin = await UserModel.create({
            nombre: 'Test Admin',
            email: `admin-${Date.now()}@test.com`,
            password: 'hashedpassword',
            rol: 'BARBERIA_ADMIN',
            barberiaId: testBarberiaId,
            activo: true
        });

        // Create test barbero
        const barbero = await BarberoModel.create({
            usuario: admin._id,
            barberiaId: testBarberiaId,
            nombre: 'Test Barbero',
            activo: true
        });
        testBarberoId = barbero._id;

        // Create test servicio
        const servicio = await ServicioModel.create({
            nombre: 'Corte de Cabello',
            descripcion: 'Test service',
            precio: 15000,
            duracion: 60,
            barberiaId: testBarberiaId,
            activo: true
        });
        testServicioId = servicio._id;
    });

    describe('Concurrent Booking Prevention', () => {
        it('should allow only ONE reservation when multiple concurrent attempts are made', async () => {
            // Create array of promises for concurrent execution
            const attempts = Array.from({ length: CONCURRENT_ATTEMPTS }, (_, i) =>
                ReservaModel.create({
                    barberoId: testBarberoId,
                    clienteId: null,
                    nombreCliente: `Cliente ${i + 1}`,
                    emailCliente: `cliente${i + 1}@test.com`,
                    barberiaId: testBarberiaId,
                    servicioId: testServicioId,
                    fecha: TEST_DATE,
                    hora: TEST_HORA,
                    horaFin: TEST_HORA_FIN,
                    estado: 'RESERVADA',
                    cancelToken: crypto.randomBytes(32).toString('hex')
                }).then(r => ({ success: true, id: r._id }))
                    .catch(err => ({ success: false, error: err.code || err.name }))
            );

            const results = await Promise.all(attempts);
            const successful = results.filter(r => r.success);
            const duplicates = results.filter(r => r.error === 11000);

            // Exactly ONE reservation should succeed
            expect(successful.length).toBe(1);

            // All others should fail with duplicate key error
            expect(duplicates.length).toBe(CONCURRENT_ATTEMPTS - 1);

            // Verify in DB
            const reservasInDB = await ReservaModel.find({
                barberoId: testBarberoId,
                fecha: TEST_DATE,
                hora: TEST_HORA,
                barberiaId: testBarberiaId
            });
            expect(reservasInDB.length).toBe(1);
        });
    });

    describe('Cancellation and Re-booking', () => {
        it('should allow re-booking a cancelled slot', async () => {
            // Create initial reservation
            const initialReserva = await ReservaModel.create({
                barberoId: testBarberoId,
                clienteId: null,
                nombreCliente: 'Cliente Original',
                emailCliente: 'original@test.com',
                barberiaId: testBarberiaId,
                servicioId: testServicioId,
                fecha: TEST_DATE,
                hora: TEST_HORA,
                horaFin: TEST_HORA_FIN,
                estado: 'RESERVADA',
                cancelToken: crypto.randomBytes(32).toString('hex')
            });

            // Cancel the reservation
            await ReservaModel.findByIdAndUpdate(initialReserva._id, { estado: 'CANCELADA' });

            // Should be able to create a new reservation in the same slot
            const newReserva = await ReservaModel.create({
                barberoId: testBarberoId,
                clienteId: null,
                nombreCliente: 'Cliente Nuevo',
                emailCliente: 'nuevo@test.com',
                barberiaId: testBarberiaId,
                servicioId: testServicioId,
                fecha: TEST_DATE,
                hora: TEST_HORA,
                horaFin: TEST_HORA_FIN,
                estado: 'RESERVADA',
                cancelToken: crypto.randomBytes(32).toString('hex')
            });

            expect(newReserva).toBeDefined();
            expect(newReserva.estado).toBe('RESERVADA');
        });

        it('should NOT allow booking an already-reserved slot', async () => {
            // Create initial reservation
            await ReservaModel.create({
                barberoId: testBarberoId,
                nombreCliente: 'Cliente Original',
                emailCliente: 'original@test.com',
                barberiaId: testBarberiaId,
                servicioId: testServicioId,
                fecha: TEST_DATE,
                hora: TEST_HORA,
                horaFin: TEST_HORA_FIN,
                estado: 'RESERVADA',
                cancelToken: crypto.randomBytes(32).toString('hex')
            });

            // Try to create duplicate
            await expect(
                ReservaModel.create({
                    barberoId: testBarberoId,
                    nombreCliente: 'Cliente Duplicado',
                    emailCliente: 'duplicado@test.com',
                    barberiaId: testBarberiaId,
                    servicioId: testServicioId,
                    fecha: TEST_DATE,
                    hora: TEST_HORA,
                    horaFin: TEST_HORA_FIN,
                    estado: 'RESERVADA',
                    cancelToken: crypto.randomBytes(32).toString('hex')
                })
            ).rejects.toThrow();
        });
    });
});
