const request = require('supertest');
const app = require('../src/app');
const { connectDB, closeDB, clearDB } = require('./setup');
const { buildBarberoValido } = require('./factories/barbero.factory');
const Barberia = require('../src/infrastructure/database/mongodb/models/Barberia');
const User = require('../src/infrastructure/database/mongodb/models/User');
const Reserva = require('../src/infrastructure/database/mongodb/models/Reserva');
const Servicio = require('../src/infrastructure/database/mongodb/models/Servicio');
const Barbero = require('../src/infrastructure/database/mongodb/models/Barbero');
const jwt = require('jsonwebtoken');

describe('🔐 Multi-Tenant Security Tests', () => {
    let barberiaA, barberiaB;
    let adminA, adminB;
    let barberoA, barberoB;
    let tokenAdminA, tokenAdminB, tokenBarberoA;
    let reservaA, reservaB;
    let servicioA, servicioB;

    beforeAll(async () => {
        await connectDB();
    });

    afterAll(async () => {
        await closeDB();
    });

    beforeEach(async () => {
        await clearDB();

        // Crear Barbería A
        barberiaA = await Barberia.create({
            nombre: 'Barbería Test A',
            slug: 'test-barberia-a',
            email: 'contacto@barberiaa.com',
            telefono: '1111111111',
            direccion: 'Calle A 123',
            activo: true
        });

        // Crear Barbería B
        barberiaB = await Barberia.create({
            nombre: 'Barbería Test B',
            slug: 'test-barberia-b',
            email: 'contacto@barberiab.com',
            telefono: '2222222222',
            direccion: 'Calle B 456',
            activo: true
        });

        // Crear Admin A
        adminA = await User.create({
            nombre: 'Admin A',
            email: 'admin@barberiaa.com',
            password: 'password123',
            rol: 'BARBERIA_ADMIN',
            barberiaId: barberiaA._id,
            activo: true
        });

        // Crear Admin B
        adminB = await User.create({
            nombre: 'Admin B',
            email: 'admin@barberiab.com',
            password: 'password123',
            rol: 'BARBERIA_ADMIN',
            barberiaId: barberiaB._id,
            activo: true
        });

        // Crear Barbero A
        barberoA = await Barbero.create(
            buildBarberoValido({
                nombre: 'Barbero A',
                email: 'barbero@barberiaa.com',
                barberiaId: barberiaA._id
            })
        );

        // Crear Barbero B
        barberoB = await Barbero.create(
            buildBarberoValido({
                nombre: 'Barbero B',
                email: 'barbero@barberiab.com',
                barberiaId: barberiaB._id
            })
        );

        // Crear Servicio A
        servicioA = await Servicio.create({
            nombre: 'Corte Clásico A',
            precio: 15,
            duracion: 30,
            barberiaId: barberiaA._id,
            activo: true
        });

        // Crear Servicio B
        servicioB = await Servicio.create({
            nombre: 'Corte Clásico B',
            precio: 20,
            duracion: 30,
            barberiaId: barberiaB._id,
            activo: true
        });

        // Crear Reserva A
        reservaA = await Reserva.create({
            barberoId: barberoA._id,
            barberiaId: barberiaA._id,
            servicioId: servicioA._id,
            emailCliente: 'cliente@test.com',
            nombreCliente: 'Cliente A',
            fecha: '2026-03-01',
            hora: '10:00',
            horaFin: '10:30',
            estado: 'RESERVADA'
        });

        // Crear Reserva B
        reservaB = await Reserva.create({
            barberoId: barberoB._id,
            barberiaId: barberiaB._id,
            servicioId: servicioB._id,
            emailCliente: 'cliente@test.com',
            nombreCliente: 'Cliente B',
            fecha: '2026-03-01',
            hora: '11:00',
            horaFin: '11:30',
            estado: 'RESERVADA'
        });

        // Generar tokens
        tokenAdminA = jwt.sign({ id: adminA._id, rol: 'BARBERIA_ADMIN', barberiaId: barberiaA._id }, process.env.JWT_SECRET);
        tokenAdminB = jwt.sign({ id: adminB._id, rol: 'BARBERIA_ADMIN', barberiaId: barberiaB._id }, process.env.JWT_SECRET);
        tokenBarberoA = jwt.sign({ id: adminA._id, rol: 'BARBERIA_ADMIN', barberiaId: barberiaA._id }, process.env.JWT_SECRET); // Usar adminA como barbero para simplificar
    });

    describe('🚫 Reservas - Cross-Tenant Access Prevention', () => {
        it('Admin A NO puede ver reserva de Barbería B', async () => {
            const res = await request(app)
                .get(`/api/reservas/${reservaB._id}`)
                .set('Authorization', `Bearer ${tokenAdminA}`);

            expect(res.status).toBe(404); // No revelar existencia
        });

        it('Admin A NO puede editar reserva de Barbería B', async () => {
            const res = await request(app)
                .patch(`/api/reservas/${reservaB._id}/completar`)
                .set('Authorization', `Bearer ${tokenAdminA}`);

            expect(res.status).toBe(404);
        });

        it('Admin A NO puede cancelar reserva de Barbería B', async () => {
            const res = await request(app)
                .patch(`/api/reservas/${reservaB._id}/cancelar`)
                .set('Authorization', `Bearer ${tokenAdminA}`);

            expect(res.status).toBe(404);
        });

        it('Admin A solo ve sus propias reservas al listar', async () => {
            const res = await request(app)
                .get('/api/reservas')
                .set('Authorization', `Bearer ${tokenAdminA}`);

            expect(res.status).toBe(200);
            expect(res.body.reservas).toBeDefined();
            // Use .id as returned by getDetails()
            const ids = res.body.reservas.map(r => r.id);
            expect(ids).toContain(reservaA._id.toString());
            expect(ids).not.toContain(reservaB._id.toString());
        });
    });

    describe('🚫 Servicios - Cross-Tenant Access Prevention', () => {
        it('Admin A solo ve sus propios servicios al listar', async () => {
            const res = await request(app)
                .get('/api/admin/servicios')
                .set('Authorization', `Bearer ${tokenAdminA}`);

            expect(res.status).toBe(200);
            expect(res.body.servicios).toBeDefined();
            const ids = res.body.servicios.map(s => s.id);
            expect(ids).toContain(servicioA._id.toString());
            expect(ids).not.toContain(servicioB._id.toString());
        });

        it('Admin A crea servicio en su propia barbería (no en B)', async () => {
            const res = await request(app)
                .post('/api/admin/servicios')
                .set('Authorization', `Bearer ${tokenAdminA}`)
                .send({
                    nombre: 'Servicio Test',
                    descripcion: 'Test',
                    precio: 100,
                    duracion: 60
                });

            expect(res.status).toBe(201);
            const servicio = await Servicio.findById(res.body.servicio.id);
            expect(servicio.barberiaId.toString()).toBe(barberiaA._id.toString());
        });

        it('Admin A NO puede editar servicio de Barbería B', async () => {
            const res = await request(app)
                .put(`/api/admin/servicios/${servicioB._id}`)
                .set('Authorization', `Bearer ${tokenAdminA}`)
                .send({
                    nombre: 'Servicio Modificado',
                    descripcion: 'Modified',
                    precio: 999,
                    duracion: 30
                });

            expect(res.status).toBe(404); // No encuentra el servicio porque no es de su barbería
        });
    });

    describe('🚫 Barberos - Cross-Tenant Access Prevention', () => {
        it('Admin A solo ve sus propios barberos al listar', async () => {
            const res = await request(app)
                .get('/api/admin/barberos')
                .set('Authorization', `Bearer ${tokenAdminA}`);

            expect(res.status).toBe(200);
            expect(res.body.barberos).toBeDefined();
            const ids = res.body.barberos.map(b => b.id);
            expect(ids).toContain(barberoA._id.toString());
            expect(ids).not.toContain(barberoB._id.toString());
        });

        it('Admin A crea barbero en su propia barbería (no en B)', async () => {
            const res = await request(app)
                .post('/api/admin/barberos')
                .set('Authorization', `Bearer ${tokenAdminA}`)
                .send({
                    nombre: 'Barbero Test',
                    email: 'test@barberiaa.com',
                    password: 'password123'
                });

            expect(res.status).toBe(201);
            const barbero = await Barbero.findById(res.body.barbero.id);
            expect(barbero.barberiaId.toString()).toBe(barberiaA._id.toString());
        });
    });

    describe('🔒 Direct ID Access Prevention', () => {
        it('Admin A NO puede acceder a barbero de Barbería B por ID', async () => {
            const res = await request(app)
                .get(`/api/admin/barberos/${barberoB._id}`)
                .set('Authorization', `Bearer ${tokenAdminA}`);

            expect(res.status).toBe(404); // No revela existencia
        });

        it('Admin A NO puede acceder a servicio de Barbería B por ID', async () => {
            const res = await request(app)
                .get(`/api/admin/servicios/${servicioB._id}`)
                .set('Authorization', `Bearer ${tokenAdminA}`);

            expect(res.status).toBe(404);
        });
    });

    describe('🔒 Query Parameter Injection Prevention', () => {
        it('Ignora barberiaId inyectado en query params', async () => {
            const res = await request(app)
                .get(`/api/reservas?barberiaId=${barberiaB._id}`)
                .set('Authorization', `Bearer ${tokenAdminA}`);

            expect(res.status).toBe(200);
            // Debe usar req.user.barberiaId, no el query param
            expect(res.body.reservas).toBeDefined();
            // Use .id as returned by getDetails()
            const ids = res.body.reservas.map(r => r.id);
            expect(ids).not.toContain(reservaB._id.toString());
        });

        it('Ignora barberiaId inyectado en request body', async () => {
            const res = await request(app)
                .post('/api/admin/servicios')
                .set('Authorization', `Bearer ${tokenAdminA}`)
                .send({
                    nombre: 'Servicio Test',
                    descripcion: 'Descripción del servicio',
                    precio: 25,
                    duracion: 30,
                    barberiaId: barberiaB._id // Intento de inyección
                });

            expect(res.status).toBe(201);

            // Verificar que se creó con barberiaId correcto (del JWT, no del body)
            const servicio = await Servicio.findById(res.body.servicio.id);
            expect(servicio.barberiaId.toString()).toBe(barberiaA._id.toString());
            expect(servicio.barberiaId.toString()).not.toBe(barberiaB._id.toString());
        });
    });

    describe('✅ Legitimate Access Allowed', () => {
        it('Admin A puede ver sus propias reservas', async () => {
            const res = await request(app)
                .get(`/api/reservas/${reservaA._id}`)
                .set('Authorization', `Bearer ${tokenAdminA}`);

            expect(res.status).toBe(200);
            expect(res.body.id).toBe(reservaA._id.toString());
        });

        it('Admin A puede acceder a sus servicios', async () => {
            const res = await request(app)
                .get('/api/admin/servicios')
                .set('Authorization', `Bearer ${tokenAdminA}`);

            expect(res.status).toBe(200);
            expect(res.body.servicios).toBeDefined();
            expect(Array.isArray(res.body.servicios)).toBe(true);
        });

        it('Admin B puede acceder a sus propios datos', async () => {
            const res = await request(app)
                .get('/api/admin/servicios')
                .set('Authorization', `Bearer ${tokenAdminB}`);

            expect(res.status).toBe(200);
        });
    });

    describe('🔍 Logging and Monitoring', () => {
        it('Bloquea acceso a recursos de otra barbería', async () => {
            // Intenta acceder a un servicio de otra barbería
            const res = await request(app)
                .get(`/api/admin/servicios/${servicioB._id}`)
                .set('Authorization', `Bearer ${tokenAdminA}`);

            expect(res.status).toBe(404); // No revela existencia
            // En producción, verificaríamos que se generó un log de warning
        });
    });

    describe('👑 SUPERADMIN Access', () => {
        let superAdmin, tokenSuperAdmin;

        beforeEach(async () => {
            superAdmin = await User.create({
                nombre: 'Super Admin',
                email: 'superadmin@barber.com',
                password: 'password123',
                rol: 'SUPER_ADMIN',  // Fixed: Use correct enum value
                activo: true
            });

            tokenSuperAdmin = jwt.sign({ id: superAdmin._id }, process.env.JWT_SECRET);
        });

        it('SUPERADMIN puede acceder a datos de cualquier barbería', async () => {
            // SuperAdmin puede ver todas las reservas
            const res = await request(app)
                .get('/api/reservas')
                .set('Authorization', `Bearer ${tokenSuperAdmin}`);

            expect(res.status).toBe(200);
            expect(res.body.reservas).toBeDefined();
            // SuperAdmin ve reservas de ambas barberías
            const ids = res.body.reservas.map(r => r.id);
            expect(ids).toContain(reservaA._id.toString());
            expect(ids).toContain(reservaB._id.toString());
        });
    });
});
