const mongoose = require('mongoose');
const revenueCalculator = require('../src/services/revenueCalculator.service');
const RevenueConfig = require('../src/infrastructure/database/mongodb/models/RevenueConfig');
const Barberia = require('../src/infrastructure/database/mongodb/models/Barberia');
const Barbero = require('../src/infrastructure/database/mongodb/models/Barbero');
const Servicio = require('../src/infrastructure/database/mongodb/models/Servicio');

describe('RevenueCalculatorService', () => {
    let barberiaId;
    let barberoId;
    let servicioId;

    beforeAll(async () => {
        // Conectar a base de datos de test
        await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/barber-saas-test');

        // Setup inicial: Crear datos de prueba
        const barberia = await Barberia.create({
            nombre: 'Test Barberia',
            slug: 'test-barberia-' + Date.now(),
            email: 'test@test.com'
        });
        barberiaId = barberia._id;

        const barbero = await Barbero.create({
            nombre: 'Test Barbero',
            barberiaId: barberiaId
        });
        barberoId = barbero._id;

        const servicio = await Servicio.create({
            nombre: 'Corte Test',
            precio: 100,
            duracion: 30,
            barberiaId: barberiaId
        });
        servicioId = servicio._id;
    });

    afterAll(async () => {
        await Barberia.deleteMany({});
        await Barbero.deleteMany({});
        await Servicio.deleteMany({});
        await RevenueConfig.deleteMany({});
        await mongoose.connection.close();
    });

    test('Debe usar el porcentaje por defecto (50/50) si no hay configuración', async () => {
        const reserva = { barberiaId };
        const result = await revenueCalculator.calcularPorcentaje(reserva, barberoId, servicioId);

        expect(result.barbero).toBe(50);
        expect(result.barberia).toBe(50);
        expect(result.origen).toBe('default');
    });

    test('Debe usar el porcentaje configurado en la barbería (60/40)', async () => {
        await RevenueConfig.create({
            barberiaId,
            configuracionGeneral: {
                porcentajeDefaultBarbero: 60,
                porcentajeDefaultBarberia: 40
            }
        });

        const reserva = { barberiaId };
        const result = await revenueCalculator.calcularPorcentaje(reserva, barberoId, servicioId);

        expect(result.barbero).toBe(60);
        expect(result.barberia).toBe(40);
        expect(result.origen).toBe('default');
    });

    test('Debe priorizar el override por Barbero (70/30)', async () => {
        const config = await RevenueConfig.findOne({ barberiaId });
        config.overridesPorBarbero.push({
            barberoId,
            porcentajeBarbero: 70,
            porcentajeBarberia: 30,
            activo: true
        });
        await config.save();

        const reserva = { barberiaId };
        const result = await revenueCalculator.calcularPorcentaje(reserva, barberoId, servicioId);

        expect(result.barbero).toBe(70);
        expect(result.barberia).toBe(30);
        expect(result.origen).toBe('barbero');
    });

    test('Debe calcular correctamente los montos finales (100 -> 70/30)', () => {
        const montoTotal = 100;
        const porcentaje = { barbero: 70, barberia: 30 };

        const result = revenueCalculator.calcularMontos(montoTotal, porcentaje);

        expect(result.montoBarbero).toBe(70);
        expect(result.montoBarberia).toBe(30);
    });

    test('Debe calcular impuestos correctamente', async () => {
        const config = await RevenueConfig.findOne({ barberiaId });
        config.impuestos = {
            aplicarIVA: true,
            iva: 19,
            aplicarRetencion: true,
            retencion: 10
        };
        await config.save();

        const montoBarbero = 10000;
        const result = await revenueCalculator.calcularImpuestos(barberiaId, montoBarbero);

        expect(result.montoIVA).toBe(1900);
        expect(result.montoRetencion).toBe(1000);
    });
});
