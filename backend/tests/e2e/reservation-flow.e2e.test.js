const request = require('supertest');
const app = require('../../src/app');
const { connectDB, closeDB, clearDB } = require('../setup');
const {
    createTestBarberia,
    createTestUser,
    createTestBarbero,
    createTestServicio,
    generateAuthToken,
    getFutureDate
} = require('../factories/test-factories');
const Barberia = require('../../src/infrastructure/database/mongodb/models/Barberia');
const User = require('../../src/infrastructure/database/mongodb/models/User');
const Barbero = require('../../src/infrastructure/database/mongodb/models/Barbero');
const Servicio = require('../../src/infrastructure/database/mongodb/models/Servicio');
const Reserva = require('../../src/infrastructure/database/mongodb/models/Reserva');

describe('E2E - Reservation Flow', () => {
    let barberiaA, barberiaB;
    let adminA, adminB;
    let barberoA, barberoB;
    let servicioA, servicioB;
    let tokenA, tokenB;

    beforeAll(async () => {
        await connectDB();
    });

    afterAll(async () => {
        await closeDB();
    });

    beforeEach(async () => {
        await clearDB();

        // Setup Barberia A
        barberiaA = await Barberia.create(createTestBarberia({ slug: 'barberia-a' }));
        adminA = await User.create(createTestUser({
            rol: 'BARBERIA_ADMIN',
            barberiaId: barberiaA._id
        }));
        barberoA = await Barbero.create(createTestBarbero({ barberiaId: barberiaA._id }));
        servicioA = await Servicio.create(createTestServicio({
            barberiaId: barberiaA._id,
            precio: 100,
            duracion: 30
        }));
        tokenA = generateAuthToken(adminA);

        // Setup Barberia B
        barberiaB = await Barberia.create(createTestBarberia({ slug: 'barberia-b' }));
        adminB = await User.create(createTestUser({
            rol: 'BARBERIA_ADMIN',
            barberiaId: barberiaB._id
        }));
        barberoB = await Barbero.create(createTestBarbero({ barberiaId: barberiaB._id }));
        servicioB = await Servicio.create(createTestServicio({ barberiaId: barberiaB._id }));
        tokenB = generateAuthToken(adminB);
    });

    describe('Complete Flow', () => {
        it('should complete full reservation flow: create → view → cancel', async () => {
            // Step 1: Create reservation
            const createRes = await request(app)
                .post(`/api/reservas/barberos/${barberoA._id}/reservar`)
                .send({
                    barberiaId: barberiaA._id,
                    servicioId: servicioA._id,
                    nombreCliente: 'Juan Pérez',
                    emailCliente: 'juan@test.com',
                    fecha: getFutureDate(7),
                    hora: '10:00'
                })
                .expect(201);

            expect(createRes.body.reserva).toBeDefined();
            const reservaId = createRes.body.reserva.id;
            const cancelToken = createRes.body.reserva.cancelToken;

            // Step 2: View reservation (authenticated)
            const viewRes = await request(app)
                .get(`/api/reservas/${reservaId}`)
                .set('Authorization', `Bearer ${tokenA}`)
                .expect(200);

            expect(viewRes.body.nombreCliente).toBe('Juan Pérez');
            expect(viewRes.body.estado).toBe('RESERVADA');

            // Step 3: Cancel via token (public)
            const cancelRes = await request(app)
                .post(`/api/reservas/token/${cancelToken}/cancelar`)
                .expect(200);

            expect(cancelRes.body.message).toContain('cancelada');

            // Step 4: Verify cancellation
            const verifyRes = await request(app)
                .get(`/api/reservas/${reservaId}`)
                .set('Authorization', `Bearer ${tokenA}`)
                .expect(200);

            expect(verifyRes.body.estado).toBe('CANCELADA');
        });
    });

    describe('Authentication Flow', () => {
        it('should allow admin to create and complete reservation', async () => {
            // Create reservation
            const createRes = await request(app)
                .post(`/api/reservas/barberos/${barberoA._id}/reservar`)
                .send({
                    barberiaId: barberiaA._id,
                    servicioId: servicioA._id,
                    nombreCliente: 'Cliente Test',
                    emailCliente: 'test@test.com',
                    fecha: getFutureDate(7),
                    hora: '10:00'
                })
                .expect(201);

            const reservaId = createRes.body.reserva.id;

            // Complete reservation
            const completeRes = await request(app)
                .patch(`/api/reservas/${reservaId}/completar`)
                .set('Authorization', `Bearer ${tokenA}`)
                .expect(200);

            expect(completeRes.body.estado).toBe('COMPLETADA');
        });

        it('should allow admin to create and cancel reservation', async () => {
            // Create reservation
            const createRes = await request(app)
                .post(`/api/reservas/barberos/${barberoA._id}/reservar`)
                .send({
                    barberiaId: barberiaA._id,
                    servicioId: servicioA._id,
                    nombreCliente: 'Cliente Test',
                    emailCliente: 'test@test.com',
                    fecha: getFutureDate(7),
                    hora: '10:00'
                })
                .expect(201);

            const reservaId = createRes.body.reserva.id;

            // Cancel reservation
            const cancelRes = await request(app)
                .patch(`/api/reservas/${reservaId}/cancelar`)
                .set('Authorization', `Bearer ${tokenA}`)
                .expect(200);

            expect(cancelRes.body.estado).toBe('CANCELADA');
        });

        it('should allow admin to view reservation list filtered by barberia', async () => {
            // Create reservations for both barberias
            await request(app)
                .post(`/api/reservas/barberos/${barberoA._id}/reservar`)
                .send({
                    barberiaId: barberiaA._id,
                    servicioId: servicioA._id,
                    nombreCliente: 'Cliente A',
                    emailCliente: 'clientea@test.com',
                    fecha: getFutureDate(7),
                    hora: '10:00'
                })
                .expect(201);

            await request(app)
                .post(`/api/reservas/barberos/${barberoB._id}/reservar`)
                .send({
                    barberiaId: barberiaB._id,
                    servicioId: servicioB._id,
                    nombreCliente: 'Cliente B',
                    emailCliente: 'clienteb@test.com',
                    fecha: getFutureDate(7),
                    hora: '10:00'
                })
                .expect(201);

            // Admin A should only see their reservations
            const listRes = await request(app)
                .get('/api/reservas')
                .set('Authorization', `Bearer ${tokenA}`)
                .expect(200);

            expect(listRes.body.reservas).toBeDefined();
            expect(listRes.body.reservas.length).toBe(1);
            expect(listRes.body.reservas[0].nombreCliente).toBe('Cliente A');
        });
    });

    describe('Error Scenarios', () => {
        it('should reject reservation for non-existent service', async () => {
            const res = await request(app)
                .post(`/api/reservas/barberos/${barberoA._id}/reservar`)
                .send({
                    barberiaId: barberiaA._id,
                    servicioId: '507f1f77bcf86cd799439011', // Non-existent
                    nombreCliente: 'Cliente Test',
                    emailCliente: 'test@test.com',
                    fecha: getFutureDate(7),
                    hora: '10:00'
                })
                .expect(400);

            expect(res.body.message).toContain('Servicio no encontrado');
        });

        it('should prevent double booking same time slot', async () => {
            const reservaData = {
                barberiaId: barberiaA._id,
                servicioId: servicioA._id,
                nombreCliente: 'Cliente Test',
                emailCliente: 'test@test.com',
                fecha: getFutureDate(7),
                hora: '10:00'
            };

            // First reservation succeeds
            await request(app)
                .post(`/api/reservas/barberos/${barberoA._id}/reservar`)
                .send(reservaData)
                .expect(201);

            // Second reservation fails
            const res = await request(app)
                .post(`/api/reservas/barberos/${barberoA._id}/reservar`)
                .send(reservaData)
                .expect(400);

            expect(res.body.message).toBeDefined();
        });

        it('should require authentication for protected routes', async () => {
            // Create a reservation first
            const createRes = await request(app)
                .post(`/api/reservas/barberos/${barberoA._id}/reservar`)
                .send({
                    barberiaId: barberiaA._id,
                    servicioId: servicioA._id,
                    nombreCliente: 'Cliente Test',
                    emailCliente: 'test@test.com',
                    fecha: getFutureDate(7),
                    hora: '10:00'
                })
                .expect(201);

            const reservaId = createRes.body.reserva.id;

            // Try to complete without auth
            await request(app)
                .patch(`/api/reservas/${reservaId}/completar`)
                .expect(401);

            // Try to view list without auth
            await request(app)
                .get('/api/reservas')
                .expect(401);
        });
    });

    describe('Multi-Tenant Security', () => {
        it('should prevent Admin A from viewing reservations from Barberia B', async () => {
            // Create reservation in Barberia B
            const createRes = await request(app)
                .post(`/api/reservas/barberos/${barberoB._id}/reservar`)
                .send({
                    barberiaId: barberiaB._id,
                    servicioId: servicioB._id,
                    nombreCliente: 'Cliente B',
                    emailCliente: 'clienteb@test.com',
                    fecha: getFutureDate(7),
                    hora: '10:00'
                })
                .expect(201);

            const reservaIdB = createRes.body.reserva.id;

            // Admin A tries to view Barberia B's reservation
            await request(app)
                .get(`/api/reservas/${reservaIdB}`)
                .set('Authorization', `Bearer ${tokenA}`)
                .expect(404); // Should not reveal existence
        });

        it('should prevent Admin A from completing/canceling reservations from Barberia B', async () => {
            // Create reservation in Barberia B
            const createRes = await request(app)
                .post(`/api/reservas/barberos/${barberoB._id}/reservar`)
                .send({
                    barberiaId: barberiaB._id,
                    servicioId: servicioB._id,
                    nombreCliente: 'Cliente B',
                    emailCliente: 'clienteb@test.com',
                    fecha: getFutureDate(7),
                    hora: '10:00'
                })
                .expect(201);

            const reservaIdB = createRes.body.reserva.id;

            // Admin A tries to complete Barberia B's reservation
            await request(app)
                .patch(`/api/reservas/${reservaIdB}/completar`)
                .set('Authorization', `Bearer ${tokenA}`)
                .expect(404);

            // Admin A tries to cancel Barberia B's reservation
            await request(app)
                .patch(`/api/reservas/${reservaIdB}/cancelar`)
                .set('Authorization', `Bearer ${tokenA}`)
                .expect(404);
        });
    });
});
