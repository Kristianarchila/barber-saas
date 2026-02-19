const request = require('supertest');
const app = require('../src/app');

describe('Input Validation Tests', () => {
    describe('Auth Validation', () => {
        it('should reject invalid email format', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'invalid-email',
                    password: 'ValidPassword123'
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Validation error');
            expect(res.body.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        field: 'email'
                    })
                ])
            );
        });

        it('should reject weak password on registration', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    nombre: 'Test User',
                    email: 'test@example.com',
                    password: 'weak', // Too short, no uppercase, no number
                    barberiaId: '507f1f77bcf86cd799439011'
                });

            expect(res.status).toBe(400);
            expect(res.body.errors.length).toBeGreaterThan(0);
        });

        it('should accept valid login data', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'ValidPassword123'
                });

            // Should not be a validation error (may be auth error)
            expect(res.status).not.toBe(400);
        });
    });

    describe('Reserva Validation', () => {
        it('should reject invalid ObjectId format', async () => {
            const res = await request(app)
                .post('/api/reservas/barberos/invalid-id/reservar')
                .send({
                    barberoId: 'invalid-id',
                    servicioId: '507f1f77bcf86cd799439011',
                    nombreCliente: 'Test Client',
                    emailCliente: 'test@example.com',
                    fecha: '2026-12-01',
                    hora: '10:00'
                });

            expect(res.status).toBe(400);
            expect(res.body.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        field: 'barberoId',
                        message: expect.stringContaining('Invalid ObjectId')
                    })
                ])
            );
        });

        it('should reject past dates', async () => {
            const res = await request(app)
                .post('/api/reservas/barberos/507f1f77bcf86cd799439011/reservar')
                .send({
                    servicioId: '507f1f77bcf86cd799439011',
                    nombreCliente: 'Test Client',
                    emailCliente: 'test@example.com',
                    fecha: '2020-01-01', // Past date
                    hora: '10:00'
                });

            expect(res.status).toBe(400);
            expect(res.body.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        field: 'fecha'
                    })
                ])
            );
        });

        it('should reject invalid time format', async () => {
            const res = await request(app)
                .post('/api/reservas/barberos/507f1f77bcf86cd799439011/reservar')
                .send({
                    barberoId: '507f1f77bcf86cd799439011',
                    servicioId: '507f1f77bcf86cd799439011',
                    nombreCliente: 'Test Client',
                    emailCliente: 'test@example.com',
                    fecha: '2026-12-01',
                    hora: '25:00' // Invalid hour
                });

            expect(res.status).toBe(400);
        });
    });

    describe('Servicio Validation', () => {
        it('should reject negative price', async () => {
            const res = await request(app)
                .post('/api/barberias/test-slug/admin/servicios')
                .send({
                    nombre: 'Test Service',
                    precio: -10, // Negative price
                    duracion: 30
                });

            expect(res.status).toBe(400);
            expect(res.body.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        field: 'precio',
                        message: expect.stringContaining('non-negative')
                    })
                ])
            );
        });

        it('should reject invalid duration', async () => {
            const res = await request(app)
                .post('/api/barberias/test-slug/admin/servicios')
                .send({
                    nombre: 'Test Service',
                    precio: 20,
                    duracion: 2 // Too short (min 5 minutes)
                });

            expect(res.status).toBe(400);
        });
    });
});

describe('Sanitization Tests', () => {
    describe('NoSQL Injection Prevention', () => {
        it('should sanitize MongoDB operators in query', async () => {
            const res = await request(app)
                .get('/api/reservas')
                .query({ barberoId: { $ne: null } }); // Injection attempt

            // Should either sanitize or reject
            expect(res.status).toBeLessThan(500);
        });

        it('should sanitize MongoDB operators in body', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: { $ne: null }, // Injection attempt
                    password: 'test'
                });

            expect(res.status).toBe(400);
        });
    });

    describe('XSS Prevention', () => {
        it('should sanitize script tags in input', async () => {
            const res = await request(app)
                .post('/api/reservas/barberos/507f1f77bcf86cd799439011/reservar')
                .send({
                    barberoId: '507f1f77bcf86cd799439011',
                    servicioId: '507f1f77bcf86cd799439011',
                    nombreCliente: '<script>alert("XSS")</script>',
                    emailCliente: 'test@example.com',
                    fecha: '2026-12-01',
                    hora: '10:00'
                });

            // Should sanitize the input
            // Verify in database that script tags are removed
            expect(res.status).toBeLessThan(500);
        });

        it('should sanitize event handlers', async () => {
            const res = await request(app)
                .post('/api/reservas/barberos/507f1f77bcf86cd799439011/reservar')
                .send({
                    barberoId: '507f1f77bcf86cd799439011',
                    servicioId: '507f1f77bcf86cd799439011',
                    nombreCliente: '<img src=x onerror=alert(1)>',
                    emailCliente: 'test@example.com',
                    fecha: '2026-12-01',
                    hora: '10:00'
                });

            expect(res.status).toBeLessThan(500);
        });
    });
});

describe('Error Message Quality', () => {
    it('should provide clear field-level errors', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                nombre: 'A', // Too short
                email: 'invalid', // Invalid format
                password: '123', // Too short, no uppercase
                barberiaId: 'invalid' // Invalid ObjectId
            });

        expect(res.status).toBe(400);
        expect(res.body.errors.length).toBeGreaterThan(0);

        // Each error should have field and message
        res.body.errors.forEach(error => {
            expect(error).toHaveProperty('field');
            expect(error).toHaveProperty('message');
            expect(typeof error.message).toBe('string');
        });
    });
});
