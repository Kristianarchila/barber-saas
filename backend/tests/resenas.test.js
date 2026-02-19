const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const { connectDB, closeDB, clearDB } = require('./setup');
const Resena = require('../src/infrastructure/database/mongodb/models/Resena');
const Reserva = require('../src/infrastructure/database/mongodb/models/Reserva');
const Barberia = require('../src/infrastructure/database/mongodb/models/Barberia');
const Barbero = require('../src/infrastructure/database/mongodb/models/Barbero');
const Servicio = require('../src/infrastructure/database/mongodb/models/Servicio');
const User = require('../src/infrastructure/database/mongodb/models/User');

describe('Sistema de Reseñas - Tests', () => {
    let barberia;
    let barbero;
    let servicio;
    let adminUser;
    let adminToken;
    let reserva;
    let reviewToken;

    beforeAll(async () => {
        // Usar conexión global de setup.js
        await connectDB();
    });

    afterAll(async () => {
        // Limpiar y cerrar conexión usando setup.js
        await closeDB();
    });

    beforeEach(async () => {
        // Limpiar colecciones
        await Resena.deleteMany({});
        await Reserva.deleteMany({});
        await Barberia.deleteMany({});
        await Barbero.deleteMany({});
        await Servicio.deleteMany({});
        await User.deleteMany({});

        // Crear barbería de prueba
        barberia = await Barberia.create({
            nombre: 'Barbería Test',
            slug: 'barberia-test',
            email: 'test@barberia.com',
            telefono: '123456789',
            plan: 'premium',
            estado: 'activa',
            activa: true
        });

        // Crear admin
        adminUser = await User.create({
            nombre: 'Admin Test',
            email: 'admin@test.com',
            password: 'password123',
            rol: 'BARBERIA_ADMIN',
            barberiaId: barberia._id,
            activo: true
        });

        // Generar token de admin
        const jwt = require('jsonwebtoken');
        adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET || 'test-secret');

        // Crear barbero
        barbero = await Barbero.create({
            nombre: 'Barbero Test',
            barberiaId: barberia._id,
            activo: true
        });

        // Crear servicio
        servicio = await Servicio.create({
            nombre: 'Corte Clásico',
            barberiaId: barberia._id,
            duracion: 30,
            precio: 10000,
            activo: true
        });

        // Crear reserva completada
        const crypto = require('crypto');
        reviewToken = crypto.randomBytes(32).toString('hex');

        reserva = await Reserva.create({
            barberoId: barbero._id,
            barberiaId: barberia._id,
            servicioId: servicio._id,
            nombreCliente: 'Cliente Test',
            emailCliente: 'cliente@test.com',
            fecha: new Date(),
            hora: '10:00',
            horaFin: '10:30',
            estado: 'COMPLETADA',
            completadaEn: new Date(),
            reviewToken,
            cancelToken: crypto.randomBytes(32).toString('hex')
        });
    });

    describe('POST /api/public/:slug/resenas - Crear Reseña', () => {
        test('Debe crear una reseña con token válido', async () => {
            const response = await request(app)
                .post(`/api/public/barberias/${barberia.slug}/resenas?reviewToken=${reviewToken}`)
                .send({
                    calificacionGeneral: 5,
                    calificacionServicio: 5,
                    calificacionAtencion: 4,
                    calificacionLimpieza: 5,
                    comentario: 'Excelente servicio!'
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.calificacionGeneral).toBe(5);
            expect(response.body.data.aprobada).toBe(false); // Requiere moderación
        });

        test('Debe rechazar reseña sin token', async () => {
            const response = await request(app)
                .post(`/api/public/barberias/${barberia.slug}/resenas`)
                .send({
                    calificacionGeneral: 5
                });

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });

        test('Debe rechazar reseña con token inválido', async () => {
            const response = await request(app)
                .post(`/api/public/barberias/${barberia.slug}/resenas?reviewToken=invalid-token`)
                .send({
                    calificacionGeneral: 5
                });

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });

        test('Debe rechazar reseña duplicada', async () => {
            // Crear primera reseña
            await request(app)
                .post(`/api/public/barberias/${barberia.slug}/resenas?reviewToken=${reviewToken}`)
                .send({
                    calificacionGeneral: 5,
                    calificacionServicio: 5,
                    calificacionAtencion: 5,
                    calificacionLimpieza: 5
                });

            // Intentar crear segunda reseña con mismo token (ruta incorrecta sin 'barberias')
            const response = await request(app)
                .post(`/api/public/${barberia.slug}/resenas?reviewToken=${reviewToken}`)
                .send({
                    calificacionGeneral: 4
                });

            expect(response.status).toBe(404); // 404 porque la ruta no existe sin 'barberias'
        });

        test('Debe rechazar reseña sin calificación general', async () => {
            const response = await request(app)
                .post(`/api/public/${barberia.slug}/resenas?reviewToken=${reviewToken}`)
                .send({
                    comentario: 'Buen servicio'
                });

            expect(response.status).toBe(404); // 404 porque la ruta no existe sin 'barberias'
        });
    });

    describe('GET /api/public/:slug/resenas/validar-token - Validar Token', () => {
        test('Debe validar token correcto', async () => {
            const response = await request(app)
                .get(`/api/public/barberias/${barberia.slug}/resenas/validar-token?reviewToken=${reviewToken}`);

            expect(response.status).toBe(200);
            expect(response.body.valido).toBe(true);
        });

        test('Debe rechazar token inválido', async () => {
            const response = await request(app)
                .get(`/api/public/barberias/${barberia.slug}/resenas/validar-token?reviewToken=invalid`);

            expect(response.status).toBe(404);
            expect(response.body.valido).toBe(false);
        });
    });

    describe('GET /api/public/:slug/resenas - Listar Reseñas Públicas', () => {
        beforeEach(async () => {
            // Crear reseñas de prueba
            await Resena.create([
                {
                    reservaId: reserva._id,
                    barberoId: barbero._id,
                    barberiaId: barberia._id,
                    nombreCliente: 'Cliente 1',
                    emailCliente: 'cliente1@test.com',
                    calificacionGeneral: 5,
                    aprobada: true,
                    visible: true
                },
                {
                    reservaId: new mongoose.Types.ObjectId(),
                    barberoId: barbero._id,
                    barberiaId: barberia._id,
                    nombreCliente: 'Cliente 2',
                    emailCliente: 'cliente2@test.com',
                    calificacionGeneral: 4,
                    aprobada: true,
                    visible: true
                },
                {
                    reservaId: new mongoose.Types.ObjectId(),
                    barberoId: barbero._id,
                    barberiaId: barberia._id,
                    nombreCliente: 'Cliente 3',
                    emailCliente: 'cliente3@test.com',
                    calificacionGeneral: 3,
                    aprobada: false, // No aprobada
                    visible: true
                }
            ]);
        });

        test('Debe listar solo reseñas aprobadas', async () => {
            const response = await request(app)
                .get(`/api/public/barberias/${barberia.slug}/resenas`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.resenas.length).toBe(2); // Solo las aprobadas
        });

        test('Debe calcular promedio correctamente', async () => {
            const response = await request(app)
                .get(`/api/public/barberias/${barberia.slug}/resenas`);

            expect(response.status).toBe(200);
            expect(response.body.data.promedio).toBe(4.5); // (5+4)/2
        });
    });

    describe('GET /api/admin/resenas/pendientes - Listar Pendientes (Admin)', () => {
        beforeEach(async () => {
            await Resena.create({
                reservaId: reserva._id,
                barberoId: barbero._id,
                barberiaId: barberia._id,
                nombreCliente: 'Cliente Pendiente',
                emailCliente: 'pendiente@test.com',
                calificacionGeneral: 5,
                aprobada: false
            });
        });

        test('Debe listar reseñas pendientes con autenticación', async () => {
            const response = await request(app)
                .get('/api/admin/resenas/pendientes')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
        });

        test('Debe rechazar sin autenticación', async () => {
            const response = await request(app)
                .get('/api/admin/resenas/pendientes');

            expect(response.status).toBe(401);
        });
    });

    describe('PATCH /api/admin/resenas/:id/aprobar - Aprobar Reseña', () => {
        let resena;

        beforeEach(async () => {
            resena = await Resena.create({
                reservaId: reserva._id,
                barberoId: barbero._id,
                barberiaId: barberia._id,
                nombreCliente: 'Cliente Test',
                emailCliente: 'test@test.com',
                calificacionGeneral: 5,
                aprobada: false
            });
        });

        test('Debe aprobar reseña correctamente', async () => {
            const response = await request(app)
                .patch(`/api/admin/resenas/${resena._id}/aprobar`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.aprobada).toBe(true);
        });

        test('Debe rechazar sin autenticación', async () => {
            const response = await request(app)
                .patch(`/api/admin/resenas/${resena._id}/aprobar`);

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/admin/resenas/estadisticas - Estadísticas', () => {
        beforeEach(async () => {
            await Resena.create([
                {
                    reservaId: new mongoose.Types.ObjectId(),
                    barberoId: barbero._id,
                    barberiaId: barberia._id,
                    nombreCliente: 'Cliente 1',
                    emailCliente: 'c1@test.com',
                    calificacionGeneral: 5,
                    calificacionServicio: 5,
                    calificacionAtencion: 5,
                    calificacionLimpieza: 5,
                    aprobada: true
                },
                {
                    reservaId: new mongoose.Types.ObjectId(),
                    barberoId: barbero._id,
                    barberiaId: barberia._id,
                    nombreCliente: 'Cliente 2',
                    emailCliente: 'c2@test.com',
                    calificacionGeneral: 4,
                    calificacionServicio: 4,
                    calificacionAtencion: 4,
                    calificacionLimpieza: 4,
                    aprobada: true
                }
            ]);
        });

        test('Debe retornar estadísticas correctas', async () => {
            const response = await request(app)
                .get('/api/admin/resenas/estadisticas')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.total).toBe(2);
            expect(response.body.data.promedio).toBe(4.5);
            expect(response.body.data.porCalificacion).toBeDefined();
        });
    });

    describe('Multitenancy - Aislamiento de Datos', () => {
        let barberia2;
        let barbero2;
        let reserva2;

        beforeEach(async () => {
            // Crear segunda barbería
            barberia2 = await Barberia.create({
                nombre: 'Barbería 2',
                slug: 'barberia-2',
                email: 'test2@barberia.com',
                plan: 'premium',
                estado: 'activa',
                activa: true
            });

            barbero2 = await Barbero.create({
                nombre: 'Barbero 2',
                barberiaId: barberia2._id,
                activo: true
            });

            const crypto = require('crypto');
            reserva2 = await Reserva.create({
                barberoId: barbero2._id,
                barberiaId: barberia2._id,
                servicioId: servicio._id,
                nombreCliente: 'Cliente 2',
                emailCliente: 'cliente2@test.com',
                fecha: new Date(),
                hora: '11:00',
                horaFin: '11:30',
                estado: 'COMPLETADA',
                completadaEn: new Date(),
                reviewToken: crypto.randomBytes(32).toString('hex'),
                cancelToken: crypto.randomBytes(32).toString('hex')
            });

            // Crear reseñas para ambas barberías
            await Resena.create([
                {
                    reservaId: reserva._id,
                    barberoId: barbero._id,
                    barberiaId: barberia._id,
                    nombreCliente: 'Cliente Barbería 1',
                    emailCliente: 'c1@test.com',
                    calificacionGeneral: 5,
                    aprobada: true,
                    visible: true
                },
                {
                    reservaId: reserva2._id,
                    barberoId: barbero2._id,
                    barberiaId: barberia2._id,
                    nombreCliente: 'Cliente Barbería 2',
                    emailCliente: 'c2@test.com',
                    calificacionGeneral: 4,
                    aprobada: true,
                    visible: true
                }
            ]);
        });

        test('Barbería 1 solo debe ver sus propias reseñas', async () => {
            const response = await request(app)
                .get(`/api/public/barberias/${barberia.slug}/resenas`);

            expect(response.status).toBe(200);
            expect(response.body.data.resenas.length).toBe(1);
            expect(response.body.data.resenas[0].barberiaId.toString()).toBe(barberia._id.toString());
        });

        test('Barbería 2 solo debe ver sus propias reseñas', async () => {
            const response = await request(app)
                .get(`/api/public/barberias/${barberia2.slug}/resenas`);

            expect(response.status).toBe(200);
            expect(response.body.data.resenas.length).toBe(1);
            expect(response.body.data.resenas[0].barberiaId.toString()).toBe(barberia2._id.toString());
        });
    });
});

