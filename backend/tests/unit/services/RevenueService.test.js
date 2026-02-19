const { connectDB, closeDB, clearDB } = require('../../setup');
const { createTestBarberia, createTestBarbero, createTestServicio } = require('../../factories/test-factories');
const RevenueService = require('../../../src/domain/services/RevenueService');
const MongoRevenueConfigRepository = require('../../../src/infrastructure/database/mongodb/repositories/MongoRevenueConfigRepository');
const Barberia = require('../../../src/infrastructure/database/mongodb/models/Barberia');
const Barbero = require('../../../src/infrastructure/database/mongodb/models/Barbero');
const Servicio = require('../../../src/infrastructure/database/mongodb/models/Servicio');
const RevenueConfig = require('../../../src/infrastructure/database/mongodb/models/RevenueConfig');

describe('RevenueService Domain Service', () => {
    let revenueService;
    let revenueConfigRepository;
    let barberia;
    let barbero;
    let servicio;

    beforeAll(async () => {
        await connectDB();
    });

    afterAll(async () => {
        await closeDB();
    });

    beforeEach(async () => {
        await clearDB();
        jest.clearAllMocks();

        // Create test data
        barberia = await Barberia.create(createTestBarberia());
        barbero = await Barbero.create(createTestBarbero({ barberiaId: barberia._id }));
        servicio = await Servicio.create(createTestServicio({ barberiaId: barberia._id }));

        // Initialize service
        revenueConfigRepository = new MongoRevenueConfigRepository();
        revenueService = new RevenueService(revenueConfigRepository);
    });

    describe('Percentage Calculation', () => {
        it('should return default 50/50 when no config exists', async () => {
            const reserva = { barberiaId: barberia._id };

            const result = await revenueService.calcularPorcentaje(
                reserva,
                barbero._id,
                servicio._id,
                barberia._id
            );

            expect(result.barbero).toBe(50);
            expect(result.barberia).toBe(50);
            expect(result.origen).toBe('default');
        });

        it('should use barberia default percentage from config', async () => {
            await RevenueConfig.create({
                barberiaId: barberia._id,
                configuracionGeneral: {
                    porcentajeDefaultBarbero: 60,
                    porcentajeDefaultBarberia: 40
                }
            });

            const reserva = { barberiaId: barberia._id };

            const result = await revenueService.calcularPorcentaje(
                reserva,
                barbero._id,
                servicio._id,
                barberia._id
            );

            expect(result.barbero).toBe(60);
            expect(result.barberia).toBe(40);
            expect(result.origen).toBe('default');
        });

        it('should prioritize barbero override over default', async () => {
            const config = await RevenueConfig.create({
                barberiaId: barberia._id,
                configuracionGeneral: {
                    porcentajeDefaultBarbero: 50,
                    porcentajeDefaultBarberia: 50
                },
                overridesPorBarbero: [{
                    barberoId: barbero._id,
                    porcentajeBarbero: 70,
                    porcentajeBarberia: 30,
                    activo: true
                }]
            });

            const reserva = { barberiaId: barberia._id };

            const result = await revenueService.calcularPorcentaje(
                reserva,
                barbero._id,
                servicio._id,
                barberia._id
            );

            expect(result.barbero).toBe(70);
            expect(result.barberia).toBe(30);
            expect(result.origen).toBe('barbero');
        });

        it('should prioritize servicio override over barbero override', async () => {
            await RevenueConfig.create({
                barberiaId: barberia._id,
                configuracionGeneral: {
                    porcentajeDefaultBarbero: 50,
                    porcentajeDefaultBarberia: 50
                },
                overridesPorBarbero: [{
                    barberoId: barbero._id,
                    porcentajeBarbero: 70,
                    porcentajeBarberia: 30,
                    activo: true
                }],
                overridesPorServicio: [{
                    servicioId: servicio._id,
                    porcentajeBarbero: 80,
                    porcentajeBarberia: 20,
                    activo: true
                }]
            });

            const reserva = { barberiaId: barberia._id };

            const result = await revenueService.calcularPorcentaje(
                reserva,
                barbero._id,
                servicio._id,
                barberia._id
            );

            expect(result.barbero).toBe(80);
            expect(result.barberia).toBe(20);
            expect(result.origen).toBe('servicio');
        });

        it('should prioritize reserva override over all others', async () => {
            await RevenueConfig.create({
                barberiaId: barberia._id,
                configuracionGeneral: {
                    porcentajeDefaultBarbero: 50,
                    porcentajeDefaultBarberia: 50
                },
                overridesPorServicio: [{
                    servicioId: servicio._id,
                    porcentajeBarbero: 80,
                    porcentajeBarberia: 20,
                    activo: true
                }]
            });

            const reserva = {
                barberiaId: barberia._id,
                overridePorcentaje: {
                    barbero: 90,
                    barberia: 10
                }
            };

            const result = await revenueService.calcularPorcentaje(
                reserva,
                barbero._id,
                servicio._id,
                barberia._id
            );

            expect(result.barbero).toBe(90);
            expect(result.barberia).toBe(10);
            expect(result.origen).toBe('reserva');
        });

        it('should ignore inactive overrides', async () => {
            await RevenueConfig.create({
                barberiaId: barberia._id,
                configuracionGeneral: {
                    porcentajeDefaultBarbero: 50,
                    porcentajeDefaultBarberia: 50
                },
                overridesPorBarbero: [{
                    barberoId: barbero._id,
                    porcentajeBarbero: 70,
                    porcentajeBarberia: 30,
                    activo: false // Inactive
                }]
            });

            const reserva = { barberiaId: barberia._id };

            const result = await revenueService.calcularPorcentaje(
                reserva,
                barbero._id,
                servicio._id,
                barberia._id
            );

            // Should use default, not inactive override
            expect(result.barbero).toBe(50);
            expect(result.barberia).toBe(50);
            expect(result.origen).toBe('default');
        });
    });

    describe('Amount Calculation', () => {
        it('should calculate barbero and barberia amounts correctly', () => {
            const montoTotal = 1000;
            const porcentaje = { barbero: 60, barberia: 40 };

            const result = revenueService.calcularMontos(montoTotal, porcentaje);

            expect(result.montoTotal).toBe(1000);
            expect(result.montoBarbero).toBe(600);
            expect(result.montoBarberia).toBe(400);
        });

        it('should round amounts properly', () => {
            const montoTotal = 100;
            const porcentaje = { barbero: 33, barberia: 67 };

            const result = revenueService.calcularMontos(montoTotal, porcentaje);

            expect(result.montoBarbero).toBe(33);
            expect(result.montoBarberia).toBe(67);
        });

        it('should ensure total equals sum of parts', () => {
            const montoTotal = 1500;
            const porcentaje = { barbero: 55, barberia: 45 };

            const result = revenueService.calcularMontos(montoTotal, porcentaje);

            expect(result.montoBarbero + result.montoBarberia).toBe(montoTotal);
        });
    });

    describe('Tax Calculation', () => {
        it('should return zero taxes when no config', async () => {
            const montoBarbero = 1000;

            const result = await revenueService.calcularImpuestos(barberia._id, montoBarbero);

            expect(result.iva).toBe(0);
            expect(result.retencion).toBe(0);
            expect(result.montoIVA).toBe(0);
            expect(result.montoRetencion).toBe(0);
        });

        it('should calculate IVA correctly when enabled', async () => {
            await RevenueConfig.create({
                barberiaId: barberia._id,
                impuestos: {
                    aplicarIVA: true,
                    iva: 19,
                    aplicarRetencion: false,
                    retencion: 0
                }
            });

            const montoBarbero = 10000;

            const result = await revenueService.calcularImpuestos(barberia._id, montoBarbero);

            expect(result.iva).toBe(19);
            expect(result.montoIVA).toBe(1900);
            expect(result.montoRetencion).toBe(0);
        });

        it('should calculate retention correctly when enabled', async () => {
            await RevenueConfig.create({
                barberiaId: barberia._id,
                impuestos: {
                    aplicarIVA: false,
                    iva: 0,
                    aplicarRetencion: true,
                    retencion: 10
                }
            });

            const montoBarbero = 10000;

            const result = await revenueService.calcularImpuestos(barberia._id, montoBarbero);

            expect(result.retencion).toBe(10);
            expect(result.montoRetencion).toBe(1000);
            expect(result.montoIVA).toBe(0);
        });

        it('should calculate both IVA and retention together', async () => {
            await RevenueConfig.create({
                barberiaId: barberia._id,
                impuestos: {
                    aplicarIVA: true,
                    iva: 19,
                    aplicarRetencion: true,
                    retencion: 10
                }
            });

            const montoBarbero = 10000;

            const result = await revenueService.calcularImpuestos(barberia._id, montoBarbero);

            expect(result.iva).toBe(19);
            expect(result.montoIVA).toBe(1900);
            expect(result.retencion).toBe(10);
            expect(result.montoRetencion).toBe(1000);
        });
    });

    describe('Multi-Tenant Security', () => {
        it('should only use config from correct barberiaId', async () => {
            // Create another barberia with different config
            const barberia2 = await Barberia.create(createTestBarberia());
            await RevenueConfig.create({
                barberiaId: barberia2._id,
                configuracionGeneral: {
                    porcentajeDefaultBarbero: 80,
                    porcentajeDefaultBarberia: 20
                }
            });

            // Create config for original barberia
            await RevenueConfig.create({
                barberiaId: barberia._id,
                configuracionGeneral: {
                    porcentajeDefaultBarbero: 60,
                    porcentajeDefaultBarberia: 40
                }
            });

            const reserva = { barberiaId: barberia._id };

            const result = await revenueService.calcularPorcentaje(
                reserva,
                barbero._id,
                servicio._id,
                barberia._id
            );

            // Should use config from barberia 1, not barberia 2
            expect(result.barbero).toBe(60);
            expect(result.barberia).toBe(40);
        });
    });
});
