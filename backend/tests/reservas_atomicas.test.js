const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/app');
const { connectDB, closeDB, clearDB } = require('./setup');
const { buildBarberoValido } = require('./factories/barbero.factory');
const Barberia = require('../src/infrastructure/database/mongodb/models/Barberia');
const Barbero = require('../src/infrastructure/database/mongodb/models/Barbero');
const Servicio = require('../src/infrastructure/database/mongodb/models/Servicio');
const Reserva = require('../src/infrastructure/database/mongodb/models/Reserva');

describe('Pruebas de Atomicidad de Reservas (Anti-Overbooking)', () => {
    let barberia;
    let barbero;
    let servicio;

    beforeAll(async () => {
        // Use setup.js for replica set support (required for transactions)
        await connectDB();

        // Limpiar base de datos de test
        await clearDB();

        // Crear entorno de prueba
        barberia = await Barberia.create({
            nombre: 'Atomic Shop',
            slug: 'atomic-shop',
            email: 'atomic@test.com',
            activa: true
        });

        barbero = await Barbero.create(
            buildBarberoValido({
                nombre: 'Carlos Atomic',
                barberiaId: barberia._id
            })
        );

        servicio = await Servicio.create({
            nombre: 'Corte Especial',
            duracion: 30,
            precio: 20,
            barberiaId: barberia._id,
            activo: true
        });
    });

    // 🧹 CRITICAL: Clean only reservations between tests
    beforeEach(async () => {
        // Use collection.drop() to remove collection AND indexes
        // This prevents E11000 duplicate key errors from stale index state
        try {
            await Reserva.collection.drop();
        } catch (err) {
            // Collection doesn't exist yet on first test, ignore error
            if (err.code !== 26) throw err; // 26 = NamespaceNotFound
        }
    });

    afterAll(async () => {
        await closeDB();
    });

    test('No debe permitir dos reservas en el mismo horario (Previene Overbooking)', async () => {
        const payload = {
            fecha: '2026-12-01',
            hora: '10:00',
            emailCliente: 'cliente1@test.com',
            nombreCliente: 'Cliente 1',
            servicioId: servicio._id
        };

        // 1. Crear la primera reserva exitosamente
        const res1 = await request(app)
            .post(`/api/public/barberias/${barberia.slug}/barberos/${barbero._id}/reservar`)
            .send(payload);

        if (res1.status !== 201) console.log('DEBUG res1:', res1.status, res1.body);
        expect(res1.status).toBe(201);
        expect(res1.body.message).toContain('correctamente');

        // 2. Intentar crear exactamente la misma reserva
        const res2 = await request(app)
            .post(`/api/public/barberias/${barberia.slug}/barberos/${barbero._id}/reservar`)
            .send(payload);

        // Debe fallar con el código 409 Conflict (no 400)
        expect(res2.status).toBe(409);
        expect(res2.body.message).toContain('Alguien acaba de reservar este horario');

        // Verificar en la BD que solo hay una reserva real
        const conteo = await Reserva.countDocuments({
            barberoId: barbero._id,
            fecha: payload.fecha,
            hora: payload.hora,
            estado: 'RESERVADA'
        });
        expect(conteo).toBe(1);
    });

    test('Debe permitir reservar si la cita anterior fue CANCELADA', async () => {
        const payload = {
            fecha: '2026-12-01',
            hora: '11:00',
            emailCliente: 'cliente2@test.com',
            nombreCliente: 'Cliente 2',
            servicioId: servicio._id
        };

        // 1. Crear reserva
        const res1 = await request(app)
            .post(`/api/public/barberias/${barberia.slug}/barberos/${barbero._id}/reservar`)
            .send(payload);

        // Debug: Check if first reservation succeeded
        if (res1.status !== 201) {
            console.log('DEBUG res1 (second test):', res1.status, res1.body);
        }
        expect(res1.status).toBe(201);
        expect(res1.body.reserva).toBeDefined();

        const reservaId = res1.body.reserva._id;

        // 2. Cancelar la reserva
        await Reserva.findByIdAndUpdate(reservaId, { estado: 'CANCELADA' });

        // 3. Intentar reservar el mismo horario de nuevo
        // Esto debe funcionar porque el índice es PARCIAL y solo mira RESERVADA/COMPLETADA
        const res2 = await request(app)
            .post(`/api/public/barberias/${barberia.slug}/barberos/${barbero._id}/reservar`)
            .send(payload);

        expect(res2.status).toBe(201);
        expect(res2.body.reserva.emailCliente).toBe('cliente2@test.com');
    });
});
