const request = require('supertest');
const app = require('../../src/app');
const { connectDB, closeDB, clearDB } = require('../setup');
const { createTestBarberia, createTestUser } = require('../factories/test-factories');
const Barberia = require('../../src/infrastructure/database/mongodb/models/Barberia');
const User = require('../../src/infrastructure/database/mongodb/models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

describe('E2E - Auth Flow', () => {
    let barberia;
    let superAdmin, barberiaAdmin, barbero;
    const testPassword = 'password123';

    beforeAll(async () => {
        await connectDB();
    });

    afterAll(async () => {
        await closeDB();
    });

    beforeEach(async () => {
        await clearDB();

        // Create barberia
        barberia = await Barberia.create(createTestBarberia());

        // Create users with hashed passwords
        const hashedPassword = await bcrypt.hash(testPassword, 10);

        superAdmin = await User.create({
            nombre: 'Super Admin',
            email: 'superadmin@test.com',
            password: hashedPassword,
            rol: 'SUPER_ADMIN',
            activo: true
        });

        barberiaAdmin = await User.create({
            nombre: 'Barberia Admin',
            email: 'admin@barberia.com',
            password: hashedPassword,
            rol: 'BARBERIA_ADMIN',
            barberiaId: barberia._id,
            activo: true
        });

        barbero = await User.create({
            nombre: 'Barbero',
            email: 'barbero@barberia.com',
            password: hashedPassword,
            rol: 'BARBERO',
            barberiaId: barberia._id,
            activo: true
        });
    });

    describe('Login Flow', () => {
        it('should allow SUPER_ADMIN to login successfully', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'superadmin@test.com',
                    password: testPassword
                })
                .expect(200);

            expect(res.body.token).toBeDefined();
            expect(res.body.user).toBeDefined();
            expect(res.body.user.rol).toBe('SUPER_ADMIN');
            expect(res.body.user.email).toBe('superadmin@test.com');
        });

        it('should allow BARBERIA_ADMIN to login successfully', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'admin@barberia.com',
                    password: testPassword
                })
                .expect(200);

            expect(res.body.token).toBeDefined();
            expect(res.body.user).toBeDefined();
            expect(res.body.user.rol).toBe('BARBERIA_ADMIN');
            expect(res.body.user.barberiaId).toBeDefined();
        });

        it('should allow BARBERO to login successfully', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'barbero@barberia.com',
                    password: testPassword
                })
                .expect(200);

            expect(res.body.token).toBeDefined();
            expect(res.body.user).toBeDefined();
            expect(res.body.user.rol).toBe('BARBERO');
        });

        it('should reject invalid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'admin@barberia.com',
                    password: 'wrongpassword'
                })
                .expect(401);

            expect(res.body.token).toBeUndefined();
        });
    });

    describe('Token Validation', () => {
        it('should grant access with valid token', async () => {
            // Login first
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'admin@barberia.com',
                    password: testPassword
                })
                .expect(200);

            const token = loginRes.body.token;

            // Access protected route
            const res = await request(app)
                .get('/api/reservas')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(res.body).toBeDefined();
        });

        it('should reject expired token', async () => {
            // Create expired token
            const expiredToken = jwt.sign(
                { id: barberiaAdmin._id, rol: 'BARBERIA_ADMIN' },
                process.env.JWT_SECRET,
                { expiresIn: '-1h' } // Expired 1 hour ago
            );

            await request(app)
                .get('/api/reservas')
                .set('Authorization', `Bearer ${expiredToken}`)
                .expect(401);
        });

        it('should reject invalid token', async () => {
            await request(app)
                .get('/api/reservas')
                .set('Authorization', 'Bearer invalid-token-here')
                .expect(401);
        });
    });

    describe('Role-Based Access', () => {
        it('should allow SUPER_ADMIN to access superadmin routes', async () => {
            // Login as superadmin
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'superadmin@test.com',
                    password: testPassword
                })
                .expect(200);

            const token = loginRes.body.token;

            // Access superadmin route
            const res = await request(app)
                .get('/api/superadmin/stats')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(res.body).toBeDefined();
        });

        it('should prevent BARBERIA_ADMIN from accessing superadmin routes', async () => {
            // Login as barberia admin
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'admin@barberia.com',
                    password: testPassword
                })
                .expect(200);

            const token = loginRes.body.token;

            // Try to access superadmin route
            await request(app)
                .get('/api/superadmin/stats')
                .set('Authorization', `Bearer ${token}`)
                .expect(403);
        });

        it('should prevent BARBERO from accessing admin routes', async () => {
            // Login as barbero
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'barbero@barberia.com',
                    password: testPassword
                })
                .expect(200);

            const token = loginRes.body.token;

            // Try to access admin route (e.g., creating services)
            await request(app)
                .post('/api/admin/servicios')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    nombre: 'Test Service',
                    precio: 100,
                    duracion: 30
                })
                .expect(403);
        });
    });
});
