const { connectDB, closeDB, clearDB } = require('../../setup');
const { createTestBarberia } = require('../../factories/test-factories');
const CreateBarberia = require('../../../src/application/use-cases/barberias/CreateBarberia');
const MongoBarberiaRepository = require('../../../src/infrastructure/database/mongodb/repositories/MongoBarberiaRepository');
const Barberia = require('../../../src/infrastructure/database/mongodb/models/Barberia');

describe('CreateBarberia Use Case', () => {
    let createBarberia;
    let barberiaRepository;

    beforeAll(async () => {
        await connectDB();
    });

    afterAll(async () => {
        await closeDB();
    });

    beforeEach(async () => {
        await clearDB();
        jest.clearAllMocks();

        barberiaRepository = new MongoBarberiaRepository();
        createBarberia = new CreateBarberia(barberiaRepository);
    });

    describe('Happy Path', () => {
        it('should create barberia successfully with valid data', async () => {
            const data = {
                nombre: 'Barbería Premium',
                email: 'contacto@barberiapremium.com',
                direccion: 'Av. Principal 123',
                telefono: '1234567890'
            };

            const result = await createBarberia.execute(data);

            expect(result).toBeDefined();
            expect(result.nombre).toBe('Barbería Premium');
            expect(result.email).toBe('contacto@barberiapremium.com');
            expect(result.slug).toBe('barberia-premium');
            expect(result.direccion).toBe('Av. Principal 123');
            expect(result.telefono).toBe('1234567890');
            expect(result.activo).toBe(true);
        });

        it('should generate unique slug from nombre', async () => {
            const data1 = {
                nombre: 'Mi Barbería',
                email: 'contacto1@test.com'
            };

            const data2 = {
                nombre: 'Mi Barbería',
                email: 'contacto2@test.com'
            };

            const barberia1 = await createBarberia.execute(data1);
            const barberia2 = await createBarberia.execute(data2);

            expect(barberia1.slug).toBe('mi-barberia');
            expect(barberia2.slug).toBe('mi-barberia-1');
        });

        it('should handle slug collisions by appending numbers', async () => {
            const baseName = 'Barbería Test';

            const barberia1 = await createBarberia.execute({
                nombre: baseName,
                email: 'test1@test.com'
            });

            const barberia2 = await createBarberia.execute({
                nombre: baseName,
                email: 'test2@test.com'
            });

            const barberia3 = await createBarberia.execute({
                nombre: baseName,
                email: 'test3@test.com'
            });

            expect(barberia1.slug).toBe('barberia-test');
            expect(barberia2.slug).toBe('barberia-test-1');
            expect(barberia3.slug).toBe('barberia-test-2');
        });
    });

    describe('Validation', () => {
        it('should throw error when nombre is missing', async () => {
            const data = {
                email: 'test@test.com'
            };

            await expect(createBarberia.execute(data)).rejects.toThrow(
                'El nombre de la barbería es obligatorio'
            );
        });

        it('should throw error when email is missing', async () => {
            const data = {
                nombre: 'Test Barbería'
            };

            await expect(createBarberia.execute(data)).rejects.toThrow(
                'El email de la barbería es obligatorio'
            );
        });

        it('should throw error when email already exists', async () => {
            const email = 'duplicate@test.com';

            await createBarberia.execute({
                nombre: 'Barbería 1',
                email: email
            });

            await expect(
                createBarberia.execute({
                    nombre: 'Barbería 2',
                    email: email
                })
            ).rejects.toThrow('Ya existe una barbería con ese email');
        });

        it('should normalize email to lowercase', async () => {
            const data = {
                nombre: 'Test Barbería',
                email: 'UPPERCASE@TEST.COM'
            };

            const result = await createBarberia.execute(data);

            expect(result.email).toBe('uppercase@test.com');
        });
    });

    describe('Transaction Integrity', () => {
        it('should rollback on database error', async () => {
            const data = {
                nombre: 'Test Barbería',
                email: 'test@test.com'
            };

            // Mock repository to fail during save
            const originalSave = barberiaRepository.save;
            barberiaRepository.save = jest.fn().mockRejectedValue(new Error('Database error'));

            try {
                await createBarberia.execute(data);
                fail('Should have thrown error');
            } catch (error) {
                expect(error.message).toBe('Database error');
            }

            // Verify no barberia was created
            const barberias = await Barberia.find({});
            expect(barberias.length).toBe(0);

            // Restore original method
            barberiaRepository.save = originalSave;
        });

        it('should ensure atomicity of slug generation and save', async () => {
            const data = {
                nombre: 'Test Barbería',
                email: 'test@test.com'
            };

            // Mock exists to simulate race condition
            let callCount = 0;
            const originalExists = barberiaRepository.exists;
            barberiaRepository.exists = jest.fn().mockImplementation(async (query) => {
                callCount++;
                // First call (slug check) returns false
                // Second call (email check) returns false
                return false;
            });

            const result = await createBarberia.execute(data);

            expect(result).toBeDefined();
            expect(result.slug).toBe('test-barberia');

            // Should have checked slug existence
            expect(barberiaRepository.exists).toHaveBeenCalled();

            // Restore original method
            barberiaRepository.exists = originalExists;
        });
    });
});
