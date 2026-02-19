const request = require('supertest');
const app = require('../../src/app');
const { connectDB, closeDB, clearDB } = require('../setup');
const { createTestUser } = require('../factories/test-factories');
const Barberia = require('../../src/infrastructure/database/mongodb/models/Barberia');
const User = require('../../src/infrastructure/database/mongodb/models/User');
const bcrypt = require('bcrypt');

describe('E2E - Barberia Creation Flow', () => {
    let superAdmin, barberiaAdmin;
    let superAdminToken, adminToken;
    const testPassword = 'password123';

    beforeAll(async () => {
        await connectDB();
    });

    afterAll(async () => {
        await closeDB();
    });

    beforeEach(async () => {
        await clearDB();

        // Create users with hashed passwords
        const hashedPassword = await bcrypt.hash(testPassword, 10);

        superAdmin = await User.create({
            nombre: 'Super Admin',
            email: 'superadmin@test.com',
            password: hashedPassword,
            rol: 'SUPER_ADMIN',
            activo: true
        });

        // Create a barberia for the admin
        const existingBarberia = await Barberia.create({
            nombre: 'Existing Barberia',
            slug: 'existing-barberia',
            email: 'existing@barberia.com',
            activo: true
        });

        barberiaAdmin = await User.create({
            nombre: 'Barberia Admin',
            email: 'admin@barberia.com',
            password: hashedPassword,
            rol: 'BARBERIA_ADMIN',
            barberiaId: existingBarberia._id,
            activo: true
        });

        // Login to get tokens
        const superAdminLogin = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'superadmin@test.com',
                password: testPassword
            });
        superAdminToken = superAdminLogin.body.token;

        const adminLogin = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@barberia.com',
                password: testPassword
            });
        adminToken = adminLogin.body.token;
    });

    describe('Complete Flow', () => {
        it('should complete full barberia creation flow', async () => {
            // Step 1: SUPER_ADMIN creates barberia
            const createBarberiaRes = await request(app)
                .post('/api/superadmin/barberias')
                .set('Authorization', `Bearer ${superAdminToken}`)
                .send({
                    nombre: 'Nueva Barbería Premium',
                    email: 'nueva@barberia.com',
                    direccion: 'Av. Principal 123',
                    telefono: '1234567890'
                })
                .expect(201);

            expect(createBarberiaRes.body.barberia).toBeDefined();
            expect(createBarberiaRes.body.barberia.slug).toBe('nueva-barberia-premium');
            const newBarberiaId = createBarberiaRes.body.barberia.id;

            // Step 2: SUPER_ADMIN creates admin user for new barberia
            const createAdminRes = await request(app)
                .post('/api/superadmin/users')
                .set('Authorization', `Bearer ${superAdminToken}`)
                .send({
                    nombre: 'Admin Nueva Barbería',
                    email: 'admin@nuevabarberia.com',
                    password: 'admin123',
                    rol: 'BARBERIA_ADMIN',
                    barberiaId: newBarberiaId
                })
                .expect(201);

            expect(createAdminRes.body.user).toBeDefined();
            expect(createAdminRes.body.user.barberiaId).toBe(newBarberiaId);

            // Step 3: New admin logs in
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'admin@nuevabarberia.com',
                    password: 'admin123'
                })
                .expect(200);

            expect(loginRes.body.token).toBeDefined();
            const newAdminToken = loginRes.body.token;

            // Step 4: New admin creates a service
            const createServiceRes = await request(app)
                .post('/api/admin/servicios')
                .set('Authorization', `Bearer ${newAdminToken}`)
                .send({
                    nombre: 'Corte Premium',
                    descripcion: 'Corte de cabello premium',
                    precio: 150,
                    duracion: 45
                })
                .expect(201);

            expect(createServiceRes.body.servicio).toBeDefined();
            expect(createServiceRes.body.servicio.nombre).toBe('Corte Premium');
        });
    });

    describe('Validation', () => {
        it('should reject duplicate email', async () => {
            // Create first barberia
            await request(app)
                .post('/api/superadmin/barberias')
                .set('Authorization', `Bearer ${superAdminToken}`)
                .send({
                    nombre: 'Barbería 1',
                    email: 'duplicate@test.com'
                })
                .expect(201);

            // Try to create second barberia with same email
            const res = await request(app)
                .post('/api/superadmin/barberias')
                .set('Authorization', `Bearer ${superAdminToken}`)
                .send({
                    nombre: 'Barbería 2',
                    email: 'duplicate@test.com'
                })
                .expect(400);

            expect(res.body.message).toContain('email');
        });

        it('should reject duplicate slug', async () => {
            // Create first barberia
            await request(app)
                .post('/api/superadmin/barberias')
                .set('Authorization', `Bearer ${superAdminToken}`)
                .send({
                    nombre: 'Mi Barbería',
                    email: 'test1@test.com'
                })
                .expect(201);

            // Create second barberia with same name (should auto-increment slug)
            const res = await request(app)
                .post('/api/superadmin/barberias')
                .set('Authorization', `Bearer ${superAdminToken}`)
                .send({
                    nombre: 'Mi Barbería',
                    email: 'test2@test.com'
                })
                .expect(201);

            // Slug should be different
            expect(res.body.barberia.slug).toBe('mi-barberia-1');
        });

        it('should require authentication', async () => {
            await request(app)
                .post('/api/superadmin/barberias')
                .send({
                    nombre: 'Test Barbería',
                    email: 'test@test.com'
                })
                .expect(401);
        });
    });

    describe('Authorization', () => {
        it('should allow SUPER_ADMIN to create barberia', async () => {
            const res = await request(app)
                .post('/api/superadmin/barberias')
                .set('Authorization', `Bearer ${superAdminToken}`)
                .send({
                    nombre: 'Nueva Barbería',
                    email: 'nueva@test.com'
                })
                .expect(201);

            expect(res.body.barberia).toBeDefined();
        });

        it('should prevent BARBERIA_ADMIN from creating barberia', async () => {
            await request(app)
                .post('/api/superadmin/barberias')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    nombre: 'Nueva Barbería',
                    email: 'nueva@test.com'
                })
                .expect(403);
        });
    });
});
