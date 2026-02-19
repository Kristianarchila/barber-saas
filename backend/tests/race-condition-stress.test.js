/**
 * Tests de Stress para Race Conditions
 * Valida que el sistema previene double booking bajo carga concurrente
 */

const request = require('supertest');
const app = require('../src/app');
const { connectDB, closeDB, clearDB } = require('./setup');
const { buildBarberoValido } = require('./factories/barbero.factory');
const Barberia = require('../src/infrastructure/database/mongodb/models/Barberia');
const Barbero = require('../src/infrastructure/database/mongodb/models/Barbero');
const Servicio = require('../src/infrastructure/database/mongodb/models/Servicio');
const Reserva = require('../src/infrastructure/database/mongodb/models/Reserva');

describe('🔥 Race Condition Stress Tests', () => {
    let barberia, barbero, servicio;

    beforeAll(async () => {
        await connectDB();
    });

    afterAll(async () => {
        await closeDB();
    });

    beforeEach(async () => {
        await clearDB();

        barberia = await Barberia.create({
            nombre: 'Test Barbería',
            slug: 'test-barberia',
            email: 'test@barberia.com',
            telefono: '1234567890',
            direccion: 'Test 123',
            activo: true
        });

        barbero = await Barbero.create(
            buildBarberoValido({
                nombre: 'Test Barbero',
                email: 'barbero@test.com',
                barberiaId: barberia._id
            })
        );

        servicio = await Servicio.create({
            nombre: 'Corte Test',
            precio: 20,
            duracion: 30,
            barberiaId: barberia._id,
            activo: true
        });
    });

    describe('Concurrencia Extrema', () => {
        it('10 requests simultáneos al mismo horario - solo 1 debe tener éxito', async () => {
            const payload = {
                barberoId: barbero._id,
                servicioId: servicio._id,
                fecha: '2026-03-15',
                hora: '10:00',
                nombreCliente: 'Cliente Test',
                emailCliente: 'cliente@test.com'
            };

            // Crear 10 requests simultáneos
            const promises = Array(10).fill().map((_, index) =>
                request(app)
                    .post(`/api/public/barberias/${barberia.slug}/barberos/${barbero._id}/reservar`)
                    .send({
                        ...payload,
                        emailCliente: `cliente${index}@test.com` // Diferentes emails
                    })
            );

            const results = await Promise.allSettled(promises);

            // Contar éxitos y fallos
            const successful = results.filter(r =>
                r.status === 'fulfilled' && r.value.status === 201
            );
            const failed = results.filter(r =>
                r.status === 'fulfilled' && r.value.status !== 201
            );

            console.log(`✅ Exitosos: ${successful.length}`);
            console.log(`❌ Fallidos: ${failed.length}`);

            // Solo 1 debe tener éxito
            expect(successful.length).toBe(1);
            expect(failed.length).toBe(9);

            // Verificar en DB que solo hay 1 reserva
            const count = await Reserva.countDocuments({
                barberoId: barbero._id,
                fecha: '2026-03-15',
                hora: '10:00',
                estado: 'RESERVADA'
            });

            expect(count).toBe(1);
        });

        it('50 requests simultáneos - solo 1 debe tener éxito', async () => {
            const payload = {
                barberoId: barbero._id,
                servicioId: servicio._id,
                fecha: '2026-03-16',
                hora: '14:00',
                nombreCliente: 'Cliente Test'
            };

            const promises = Array(50).fill().map((_, index) =>
                request(app)
                    .post(`/api/public/barberias/${barberia.slug}/barberos/${barbero._id}/reservar`)
                    .send({
                        ...payload,
                        emailCliente: `stress${index}@test.com`
                    })
            );

            const results = await Promise.allSettled(promises);
            const successful = results.filter(r =>
                r.status === 'fulfilled' && r.value.status === 201
            );

            expect(successful.length).toBe(1);

            // Verificar en DB
            const count = await Reserva.countDocuments({
                barberoId: barbero._id,
                fecha: '2026-03-16',
                hora: '14:00',
                estado: 'RESERVADA'
            });

            expect(count).toBe(1);
        }, 30000); // Timeout de 30 segundos
    });

    describe('Índice Único - Validación Directa', () => {
        it('Índice único previene duplicados en DB', async () => {
            // Crear primera reserva directamente en DB
            const reserva1 = await Reserva.create({
                barberoId: barbero._id,
                barberiaId: barberia._id,
                servicioId: servicio._id,
                fecha: new Date('2026-03-20'),
                hora: '10:00',
                horaFin: '10:30',
                nombreCliente: 'Cliente 1',
                emailCliente: 'cliente1@test.com',
                estado: 'RESERVADA'
            });

            expect(reserva1).toBeDefined();

            // Intentar crear segunda reserva con mismo barbero/fecha/hora
            await expect(
                Reserva.create({
                    barberoId: barbero._id,
                    barberiaId: barberia._id,
                    servicioId: servicio._id,
                    fecha: new Date('2026-03-20'),
                    hora: '10:00',
                    horaFin: '10:30',
                    nombreCliente: 'Cliente 2',
                    emailCliente: 'cliente2@test.com',
                    estado: 'RESERVADA'
                })
            ).rejects.toThrow(/duplicate key|E11000/);
        });

        it('Permite re-usar horario si reserva anterior fue cancelada', async () => {
            // Crear reserva cancelada
            await Reserva.create({
                barberoId: barbero._id,
                barberiaId: barberia._id,
                servicioId: servicio._id,
                fecha: new Date('2026-03-21'),
                hora: '11:00',
                horaFin: '11:30',
                nombreCliente: 'Cliente Cancelado',
                emailCliente: 'cancelado@test.com',
                estado: 'CANCELADA' // Estado cancelada
            });

            // Debe permitir crear nueva reserva en mismo horario
            const reserva2 = await Reserva.create({
                barberoId: barbero._id,
                barberiaId: barberia._id,
                servicioId: servicio._id,
                fecha: new Date('2026-03-21'),
                hora: '11:00',
                horaFin: '11:30',
                nombreCliente: 'Cliente Nuevo',
                emailCliente: 'nuevo@test.com',
                estado: 'RESERVADA'
            });

            expect(reserva2).toBeDefined();
            expect(reserva2.estado).toBe('RESERVADA');
        });
    });

    describe('Validación de Transacciones', () => {
        it('Rollback automático si falla después de crear reserva', async () => {
            // Este test simula un error después de crear la reserva
            // La transacción debe hacer rollback y no dejar reserva huérfana

            const initialCount = await Reserva.countDocuments({});

            try {
                // Intentar crear reserva con servicio inválido
                await request(app)
                    .post(`/api/public/barberias/${barberia.slug}/barberos/${barbero._id}/reservar`)
                    .send({
                        barberoId: barbero._id,
                        servicioId: '000000000000000000000000', // ID inválido
                        fecha: '2026-03-22',
                        hora: '12:00',
                        nombreCliente: 'Cliente Test',
                        emailCliente: 'test@test.com'
                    });
            } catch (error) {
                // Esperamos que falle
            }

            // Verificar que NO se creó ninguna reserva
            const finalCount = await Reserva.countDocuments({});
            expect(finalCount).toBe(initialCount);
        });
    });

    describe('Performance bajo carga', () => {
        it('Maneja 20 reservas diferentes simultáneas sin problemas', async () => {
            // Crear 20 reservas en diferentes horarios simultáneamente
            const promises = Array(20).fill().map((_, index) =>
                request(app)
                    .post(`/api/public/barberias/${barberia.slug}/barberos/${barbero._id}/reservar`)
                    .send({
                        barberoId: barbero._id,
                        servicioId: servicio._id,
                        fecha: '2026-03-25',
                        hora: `${10 + Math.floor(index / 2)}:${index % 2 === 0 ? '00' : '30'}`,
                        nombreCliente: `Cliente ${index}`,
                        emailCliente: `cliente${index}@test.com`
                    })
            );

            const results = await Promise.allSettled(promises);
            const successful = results.filter(r =>
                r.status === 'fulfilled' && r.value.status === 201
            );

            // Todas deberían tener éxito (diferentes horarios)
            expect(successful.length).toBeGreaterThan(15); // Al menos 75% de éxito

            // Verificar que no hay duplicados
            const reservas = await Reserva.find({
                barberoId: barbero._id,
                fecha: '2026-03-25'
            });

            const horarios = reservas.map(r => r.hora);
            const uniqueHorarios = [...new Set(horarios)];

            expect(horarios.length).toBe(uniqueHorarios.length); // No duplicados
        }, 30000);
    });
});
