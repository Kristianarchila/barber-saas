/**
 * Tests de Seguridad Multi-Tenant
 * 
 * Valida que el sistema bloquea correctamente intentos de acceso cross-tenant
 * y registra todos los intentos en AuditLog.
 */

const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/infrastructure/database/mongodb/models/User');
const Barberia = require('../src/infrastructure/database/mongodb/models/Barberia');
const AuditLog = require('../src/infrastructure/database/mongodb/models/AuditLog');
const jwt = require('jsonwebtoken');

describe('🔒 Multi-Tenant Security Tests', () => {
    let barberiaA, barberiaB;
    let userA, userB, superAdmin;
    let tokenA, tokenB, tokenAdmin;

    beforeAll(async () => {
        // Crear barberías de prueba
        barberiaA = await Barberia.create({
            nombre: 'Barbería A',
            slug: 'barberia-a',
            email: 'admin@barberia-a.com',
            activa: true
        });

        barberiaB = await Barberia.create({
            nombre: 'Barbería B',
            slug: 'barberia-b',
            email: 'admin@barberia-b.com',
            activa: true
        });

        // Crear usuarios de prueba
        userA = await User.create({
            nombre: 'Usuario A',
            email: 'user@barberia-a.com',
            password: 'password123',
            rol: 'BARBERIA_ADMIN',
            barberiaId: barberiaA._id,
            estadoCuenta: 'ACTIVA'
        });

        userB = await User.create({
            nombre: 'Usuario B',
            email: 'user@barberia-b.com',
            password: 'password123',
            rol: 'BARBERIA_ADMIN',
            barberiaId: barberiaB._id,
            estadoCuenta: 'ACTIVA'
        });

        superAdmin = await User.create({
            nombre: 'Super Admin',
            email: 'admin@system.com',
            password: 'password123',
            rol: 'SUPER_ADMIN',
            estadoCuenta: 'ACTIVA'
        });

        // Generar tokens
        tokenA = jwt.sign(
            {
                _id: userA._id,
                barberiaId: barberiaA._id,
                rol: 'BARBERIA_ADMIN'
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        tokenB = jwt.sign(
            {
                _id: userB._id,
                barberiaId: barberiaB._id,
                rol: 'BARBERIA_ADMIN'
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        tokenAdmin = jwt.sign(
            {
                _id: superAdmin._id,
                rol: 'SUPER_ADMIN'
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
    });

    afterAll(async () => {
        // Limpiar base de datos
        await User.deleteMany({});
        await Barberia.deleteMany({});
        await AuditLog.deleteMany({});
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        // Limpiar audit logs antes de cada test
        await AuditLog.deleteMany({});
    });

    describe('❌ Bloqueo de Acceso Cross-Tenant', () => {
        const protectedRoutes = [
            '/api/barberias/{slug}/admin/servicios',
            '/api/barberias/{slug}/admin/bloqueos',
            '/api/barberias/{slug}/admin/horarios',
            '/api/barberias/{slug}/admin/reservas',
            '/api/barberias/{slug}/admin/dashboard',
            '/api/barberias/{slug}/admin/finanzas',
            '/api/barberias/{slug}/admin/caja',
            '/api/barberias/{slug}/inventario'
        ];

        protectedRoutes.forEach(route => {
            it(`debe bloquear acceso cross-tenant en ${route}`, async () => {
                const url = route.replace('{slug}', barberiaB.slug);

                const res = await request(app)
                    .get(url)
                    .set('Authorization', `Bearer ${tokenA}`);

                // Debe retornar 403 Forbidden
                expect(res.status).toBe(403);
                expect(res.body.code).toBe('TENANT_ISOLATION_VIOLATION');
                expect(res.body.message).toContain('No tienes permiso');

                // Debe registrar en AuditLog
                const log = await AuditLog.findOne({
                    userId: userA._id,
                    action: 'CROSS_TENANT_ATTEMPT'
                });

                expect(log).toBeDefined();
                expect(log.severity).toBe('CRITICAL');
                expect(log.result).toBe('BLOCKED');
                expect(log.metadata.userBarberiaId).toBe(barberiaA._id.toString());
                expect(log.metadata.attemptedBarberiaId).toBe(barberiaB._id.toString());
            });
        });

        it('debe bloquear múltiples intentos del mismo usuario', async () => {
            // Intentar 3 veces
            for (let i = 0; i < 3; i++) {
                await request(app)
                    .get(`/api/barberias/${barberiaB.slug}/admin/servicios`)
                    .set('Authorization', `Bearer ${tokenA}`);
            }

            // Debe haber 3 registros en AuditLog
            const logs = await AuditLog.find({
                userId: userA._id,
                action: 'CROSS_TENANT_ATTEMPT'
            });

            expect(logs).toHaveLength(3);
        });

        it('debe incluir información de IP y userAgent en AuditLog', async () => {
            await request(app)
                .get(`/api/barberias/${barberiaB.slug}/admin/servicios`)
                .set('Authorization', `Bearer ${tokenA}`)
                .set('User-Agent', 'Mozilla/5.0 Test Browser');

            const log = await AuditLog.findOne({
                userId: userA._id,
                action: 'CROSS_TENANT_ATTEMPT'
            });

            expect(log.request.userAgent).toBe('Mozilla/5.0 Test Browser');
            expect(log.request.ip).toBeDefined();
            expect(log.request.method).toBe('GET');
            expect(log.request.url).toContain(barberiaB.slug);
        });
    });

    describe('✅ Acceso Permitido', () => {
        it('debe permitir acceso a su propia barbería', async () => {
            const res = await request(app)
                .get(`/api/barberias/${barberiaA.slug}/admin/servicios`)
                .set('Authorization', `Bearer ${tokenA}`);

            // Puede retornar 200 o 404 (si no hay servicios), pero NO 403
            expect(res.status).not.toBe(403);

            // NO debe registrar como intento cross-tenant
            const log = await AuditLog.findOne({
                userId: userA._id,
                action: 'CROSS_TENANT_ATTEMPT'
            });

            expect(log).toBeNull();
        });

        it('debe permitir acceso a SUPER_ADMIN a cualquier barbería', async () => {
            const resA = await request(app)
                .get(`/api/barberias/${barberiaA.slug}/admin/servicios`)
                .set('Authorization', `Bearer ${tokenAdmin}`);

            const resB = await request(app)
                .get(`/api/barberias/${barberiaB.slug}/admin/servicios`)
                .set('Authorization', `Bearer ${tokenAdmin}`);

            // Ambos deben permitir acceso
            expect(resA.status).not.toBe(403);
            expect(resB.status).not.toBe(403);

            // NO debe registrar como intento cross-tenant
            const logs = await AuditLog.find({
                userId: superAdmin._id,
                action: 'CROSS_TENANT_ATTEMPT'
            });

            expect(logs).toHaveLength(0);
        });
    });

    describe('🔍 Validación de Slug', () => {
        it('debe retornar 404 si la barbería no existe', async () => {
            const res = await request(app)
                .get('/api/barberias/barberia-inexistente/admin/servicios')
                .set('Authorization', `Bearer ${tokenA}`);

            expect(res.status).toBe(404);
            expect(res.body.message).toContain('Barbería no encontrada');
        });

        it('debe retornar 400 si falta el slug', async () => {
            const res = await request(app)
                .get('/api/barberias//admin/servicios')
                .set('Authorization', `Bearer ${tokenA}`);

            // Puede retornar 400 o 404 dependiendo del router
            expect([400, 404]).toContain(res.status);
        });
    });

    describe('📊 Estadísticas de Seguridad', () => {
        it('debe poder consultar intentos de acceso por usuario', async () => {
            // Generar varios intentos
            await request(app)
                .get(`/api/barberias/${barberiaB.slug}/admin/servicios`)
                .set('Authorization', `Bearer ${tokenA}`);

            await request(app)
                .get(`/api/barberias/${barberiaB.slug}/admin/horarios`)
                .set('Authorization', `Bearer ${tokenA}`);

            // Consultar estadísticas
            const stats = await AuditLog.aggregate([
                { $match: { action: 'CROSS_TENANT_ATTEMPT' } },
                {
                    $group: {
                        _id: '$userId',
                        count: { $sum: 1 },
                        lastAttempt: { $max: '$createdAt' }
                    }
                }
            ]);

            expect(stats).toHaveLength(1);
            expect(stats[0]._id.toString()).toBe(userA._id.toString());
            expect(stats[0].count).toBe(2);
        });

        it('debe poder filtrar por severidad', async () => {
            await request(app)
                .get(`/api/barberias/${barberiaB.slug}/admin/servicios`)
                .set('Authorization', `Bearer ${tokenA}`);

            const criticalLogs = await AuditLog.find({
                severity: 'CRITICAL'
            });

            expect(criticalLogs.length).toBeGreaterThan(0);
            expect(criticalLogs[0].action).toBe('CROSS_TENANT_ATTEMPT');
        });
    });

    describe('🛡️ Casos Edge', () => {
        it('debe bloquear si barberiaId en JWT es null', async () => {
            const tokenNoBarberiaId = jwt.sign(
                {
                    _id: userA._id,
                    rol: 'BARBERIA_ADMIN'
                    // Sin barberiaId
                },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            const res = await request(app)
                .get(`/api/barberias/${barberiaA.slug}/admin/servicios`)
                .set('Authorization', `Bearer ${tokenNoBarberiaId}`);

            expect(res.status).toBe(403);
        });

        it('debe bloquear si barberiaId en JWT es inválido', async () => {
            const tokenInvalidBarberiaId = jwt.sign(
                {
                    _id: userA._id,
                    barberiaId: 'invalid-id',
                    rol: 'BARBERIA_ADMIN'
                },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            const res = await request(app)
                .get(`/api/barberias/${barberiaA.slug}/admin/servicios`)
                .set('Authorization', `Bearer ${tokenInvalidBarberiaId}`);

            expect(res.status).toBe(403);
        });
    });
});
