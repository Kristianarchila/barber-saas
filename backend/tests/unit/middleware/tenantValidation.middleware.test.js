const { connectDB, closeDB, clearDB } = require('../../setup');
const { createTestBarberia, createTestUser, generateAuthToken } = require('../../factories/test-factories');
const {
    extractBarberiaId,
    validateTenantAccess,
    validateResourceTenant
} = require('../../../src/middleware/tenantValidation.middleware');
const Barberia = require('../../../src/infrastructure/database/mongodb/models/Barberia');
const User = require('../../../src/infrastructure/database/mongodb/models/User');
const Reserva = require('../../../src/infrastructure/database/mongodb/models/Reserva');

describe('TenantValidation Middleware', () => {
    let barberia1, barberia2;
    let admin1, admin2, superAdmin;

    beforeAll(async () => {
        await connectDB();
    });

    afterAll(async () => {
        await closeDB();
    });

    beforeEach(async () => {
        await clearDB();
        jest.clearAllMocks();

        // Create test barberias
        barberia1 = await Barberia.create(createTestBarberia({ slug: 'barberia-1' }));
        barberia2 = await Barberia.create(createTestBarberia({ slug: 'barberia-2' }));

        // Create test users
        admin1 = await User.create(createTestUser({
            rol: 'BARBERIA_ADMIN',
            barberiaId: barberia1._id
        }));

        admin2 = await User.create(createTestUser({
            rol: 'BARBERIA_ADMIN',
            barberiaId: barberia2._id
        }));

        superAdmin = await User.create(createTestUser({
            rol: 'SUPER_ADMIN',
            barberiaId: null
        }));
    });

    describe('extractBarberiaId', () => {
        it('should extract barberiaId from slug successfully', async () => {
            const req = {
                params: { slug: 'barberia-1' }
            };
            const res = {};
            const next = jest.fn();

            await extractBarberiaId(req, res, next);

            expect(req.barberiaId).toBeDefined();
            expect(req.barberiaId.toString()).toBe(barberia1._id.toString());
            expect(req.barberia).toBeDefined();
            expect(req.barberia.slug).toBe('barberia-1');
            expect(next).toHaveBeenCalled();
        });

        it('should return 400 when slug is missing', async () => {
            const req = {
                params: {}
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();

            await extractBarberiaId(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Slug de barbería requerido en la URL'
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 404 when barberia not found', async () => {
            const req = {
                params: { slug: 'non-existent-slug' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();

            await extractBarberiaId(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Barbería no encontrada'
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 404 when barberia is inactive', async () => {
            await Barberia.findByIdAndUpdate(barberia1._id, { activo: false });

            const req = {
                params: { slug: 'barberia-1' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();

            await extractBarberiaId(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Barbería no encontrada'
            });
        });
    });

    describe('validateTenantAccess', () => {
        it('should allow access when user belongs to barberia', () => {
            const req = {
                user: admin1,
                barberiaId: barberia1._id
            };
            const res = {};
            const next = jest.fn();

            validateTenantAccess(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(); // Called without error
        });

        it('should allow SUPER_ADMIN to access any barberia', () => {
            const req = {
                user: superAdmin,
                barberiaId: barberia1._id
            };
            const res = {};
            const next = jest.fn();

            validateTenantAccess(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        it('should return 401 when user not authenticated', () => {
            const req = {
                barberiaId: barberia1._id
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();

            validateTenantAccess(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Autenticación requerida'
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 500 when barberiaId not in request', () => {
            const req = {
                user: admin1
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();

            validateTenantAccess(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Error de configuración del servidor'
            });
        });

        it('should return 403 when user tries to access different barberia', () => {
            const req = {
                user: admin1,
                barberiaId: barberia2._id // Admin1 trying to access Barberia2
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();

            validateTenantAccess(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                message: 'No tienes permiso para acceder a los datos de esta barbería'
            });
        });

        it('should log warning on cross-tenant access attempt', () => {
            const loggerSpy = jest.spyOn(require('../../../src/config/logger'), 'warn');

            const req = {
                user: admin1,
                barberiaId: barberia2._id,
                originalUrl: '/api/test',
                method: 'GET'
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();

            validateTenantAccess(req, res, next);

            expect(loggerSpy).toHaveBeenCalledWith(
                'Intento de acceso cross-tenant bloqueado',
                expect.objectContaining({
                    userId: admin1._id,
                    requestedBarberiaId: barberia2._id.toString()
                })
            );

            loggerSpy.mockRestore();
        });
    });

    describe('validateResourceTenant', () => {
        let reserva1, reserva2;

        beforeEach(async () => {
            // Create test reservas
            reserva1 = await Reserva.create({
                barberiaId: barberia1._id,
                barberoId: admin1._id,
                servicioId: admin1._id,
                nombreCliente: 'Test Client',
                emailCliente: 'test@test.com',
                fecha: '2026-03-15',
                hora: '10:00',
                horaFin: '10:30',
                duracion: 30,
                precio: 100,
                estado: 'RESERVADA'
            });

            reserva2 = await Reserva.create({
                barberiaId: barberia2._id,
                barberoId: admin2._id,
                servicioId: admin2._id,
                nombreCliente: 'Test Client 2',
                emailCliente: 'test2@test.com',
                fecha: '2026-03-15',
                hora: '11:00',
                horaFin: '11:30',
                duracion: 30,
                precio: 100,
                estado: 'RESERVADA'
            });
        });

        it('should allow access to own resource', async () => {
            const middleware = validateResourceTenant('Reserva');

            const req = {
                params: { id: reserva1._id.toString() },
                user: admin1,
                barberiaId: barberia1._id
            };
            const res = {};
            const next = jest.fn();

            await middleware(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(); // No error
        });

        it('should return 404 when resource belongs to different barberia', async () => {
            const middleware = validateResourceTenant('Reserva');

            const req = {
                params: { id: reserva2._id.toString() },
                user: admin1,
                barberiaId: barberia1._id // Admin1 trying to access Reserva from Barberia2
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();

            await middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Reserva no encontrado'
            });
        });

        it('should return 404 when resource does not exist', async () => {
            const middleware = validateResourceTenant('Reserva');

            const req = {
                params: { id: '507f1f77bcf86cd799439011' }, // Non-existent ID
                user: admin1,
                barberiaId: barberia1._id
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();

            await middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 500 when barberiaId not available', async () => {
            const middleware = validateResourceTenant('Reserva');

            const req = {
                params: { id: reserva1._id.toString() },
                user: {} // No barberiaId
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();

            await middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Error de configuración: barberiaId no disponible'
            });
        });
    });
});
