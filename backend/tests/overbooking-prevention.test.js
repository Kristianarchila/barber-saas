/**
 * Overbooking Prevention Stress Test
 * 
 * Simulates concurrent reservation attempts to verify that
 * the unique index and transaction locking prevent double bookings.
 * 
 * Usage:
 *   npm run test:overbooking
 */

const mongoose = require('mongoose');
const ReservaModel = require('../src/infrastructure/database/mongodb/models/Reserva');
const BarberoModel = require('../src/infrastructure/database/mongodb/models/Barbero');
const ServicioModel = require('../src/infrastructure/database/mongodb/models/Servicio');
const BarberiaModel = require('../src/infrastructure/database/mongodb/models/Barberia');
const UserModel = require('../src/infrastructure/database/mongodb/models/User');
const crypto = require('crypto');

// Test configuration
const CONCURRENT_ATTEMPTS = 50; // Number of simultaneous booking attempts
const TEST_DATE = new Date('2026-03-15');
const TEST_HORA = '10:00';
const TEST_HORA_FIN = '11:00';

let testBarberiaId;
let testBarberoId;
let testServicioId;

/**
 * Setup test data
 */
async function setupTestData() {
    console.log('🔧 Setting up test data...');

    // Create test barberia
    const barberia = await BarberiaModel.create({
        nombre: 'Test Barbería Overbooking',
        slug: `test-overbooking-${Date.now()}`,
        direccion: 'Test Address',
        telefono: '123456789',
        email: 'test@test.com',
        activa: true
    });
    testBarberiaId = barberia._id;

    // Create test admin user
    const admin = await UserModel.create({
        nombre: 'Test Admin',
        email: `admin-${Date.now()}@test.com`,
        password: 'hashedpassword',
        rol: 'BARBERIA_ADMIN',
        barberiaId: testBarberiaId,
        activo: true
    });

    // Create test barbero
    const barbero = await BarberoModel.create({
        usuario: admin._id,
        barberiaId: testBarberiaId,
        nombre: 'Test Barbero',
        especialidad: 'Corte',
        activo: true
    });
    testBarberoId = barbero._id;

    // Create test servicio
    const servicio = await ServicioModel.create({
        nombre: 'Corte de Cabello',
        descripcion: 'Test service',
        precio: 15000,
        duracion: 60,
        barberiaId: testBarberiaId,
        activo: true
    });
    testServicioId = servicio._id;

    console.log('✅ Test data created');
    console.log(`   Barbería ID: ${testBarberiaId}`);
    console.log(`   Barbero ID: ${testBarberoId}`);
    console.log(`   Servicio ID: ${testServicioId}`);
}

/**
 * Attempt to create a reservation
 */
async function attemptReservation(attemptNumber) {
    try {
        const reserva = await ReservaModel.create({
            barberoId: testBarberoId,
            clienteId: null,
            nombreCliente: `Cliente ${attemptNumber}`,
            emailCliente: `cliente${attemptNumber}@test.com`,
            barberiaId: testBarberiaId,
            servicioId: testServicioId,
            fecha: TEST_DATE,
            hora: TEST_HORA,
            horaFin: TEST_HORA_FIN,
            estado: 'RESERVADA',
            cancelToken: crypto.randomBytes(32).toString('hex')
        });

        return {
            success: true,
            attemptNumber,
            reservaId: reserva._id
        };
    } catch (error) {
        // Expected: duplicate key error for all but one attempt
        if (error.code === 11000) {
            return {
                success: false,
                attemptNumber,
                error: 'DUPLICATE_KEY',
                message: 'Horario ya reservado (esperado)'
            };
        }

        return {
            success: false,
            attemptNumber,
            error: error.name,
            message: error.message
        };
    }
}

/**
 * Run concurrent booking attempts
 */
async function runConcurrentTest() {
    console.log(`\n🚀 Starting concurrent booking test with ${CONCURRENT_ATTEMPTS} attempts...`);
    console.log(`   Target: ${TEST_DATE.toISOString().split('T')[0]} at ${TEST_HORA}`);
    console.log(`   Barbero: ${testBarberoId}\n`);

    const startTime = Date.now();

    // Create array of promises for concurrent execution
    const attempts = Array.from({ length: CONCURRENT_ATTEMPTS }, (_, i) =>
        attemptReservation(i + 1)
    );

    // Execute all attempts concurrently
    const results = await Promise.all(attempts);

    const duration = Date.now() - startTime;

    // Analyze results
    const successful = results.filter(r => r.success);
    const duplicates = results.filter(r => r.error === 'DUPLICATE_KEY');
    const otherErrors = results.filter(r => r.error && r.error !== 'DUPLICATE_KEY');

    console.log('📊 Test Results:');
    console.log('─'.repeat(60));
    console.log(`   Total attempts:       ${CONCURRENT_ATTEMPTS}`);
    console.log(`   ✅ Successful:         ${successful.length}`);
    console.log(`   🔒 Blocked (expected): ${duplicates.length}`);
    console.log(`   ❌ Other errors:       ${otherErrors.length}`);
    console.log(`   ⏱️  Duration:           ${duration}ms`);
    console.log('─'.repeat(60));

    // Verify exactly ONE reservation was created
    const reservasCreadas = await ReservaModel.find({
        barberoId: testBarberoId,
        fecha: TEST_DATE,
        hora: TEST_HORA,
        barberiaId: testBarberiaId
    });

    console.log(`\n🔍 Database Verification:`);
    console.log(`   Reservations in DB: ${reservasCreadas.length}`);

    if (successful.length === 1 && reservasCreadas.length === 1) {
        console.log('\n✅ TEST PASSED: Overbooking prevention working correctly!');
        console.log('   - Exactly 1 reservation created');
        console.log(`   - ${duplicates.length} concurrent attempts blocked`);
        console.log('   - No race conditions detected\n');
        return true;
    } else {
        console.log('\n❌ TEST FAILED: Overbooking detected!');
        console.log(`   - Expected: 1 reservation`);
        console.log(`   - Found: ${reservasCreadas.length} reservations`);
        console.log(`   - Successful attempts: ${successful.length}\n`);
        return false;
    }
}

/**
 * Test cancellation and re-booking
 */
async function testCancellationRebooking() {
    console.log('\n🔄 Testing cancellation and re-booking...');

    // Find the existing reservation
    const existingReserva = await ReservaModel.findOne({
        barberoId: testBarberoId,
        fecha: TEST_DATE,
        hora: TEST_HORA,
        barberiaId: testBarberiaId
    });

    if (!existingReserva) {
        console.log('❌ No reservation found to cancel');
        return false;
    }

    // Cancel the reservation
    existingReserva.estado = 'CANCELADA';
    await existingReserva.save();
    console.log('✅ Reservation cancelled');

    // Try to create a new reservation in the same slot
    try {
        const newReserva = await ReservaModel.create({
            barberoId: testBarberoId,
            clienteId: null,
            nombreCliente: 'New Cliente',
            emailCliente: 'newcliente@test.com',
            barberiaId: testBarberiaId,
            servicioId: testServicioId,
            fecha: TEST_DATE,
            hora: TEST_HORA,
            horaFin: TEST_HORA_FIN,
            estado: 'RESERVADA',
            cancelToken: crypto.randomBytes(32).toString('hex')
        });

        console.log('✅ New reservation created after cancellation');
        console.log('✅ TEST PASSED: Cancelled slots can be re-booked\n');
        return true;
    } catch (error) {
        console.log('❌ TEST FAILED: Could not re-book cancelled slot');
        console.log(`   Error: ${error.message}\n`);
        return false;
    }
}

/**
 * Cleanup test data
 */
async function cleanup() {
    console.log('🧹 Cleaning up test data...');

    await ReservaModel.deleteMany({ barberiaId: testBarberiaId });
    await ServicioModel.deleteMany({ barberiaId: testBarberiaId });
    await BarberoModel.deleteMany({ barberiaId: testBarberiaId });
    await UserModel.deleteMany({ barberiaId: testBarberiaId });
    await BarberiaModel.deleteMany({ _id: testBarberiaId });

    console.log('✅ Cleanup complete\n');
}

/**
 * Main test runner
 */
async function runTests() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 OVERBOOKING PREVENTION STRESS TEST');
    console.log('='.repeat(60) + '\n');

    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/barber-saas-test';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        // Setup
        await setupTestData();

        // Test 1: Concurrent booking attempts
        const test1Passed = await runConcurrentTest();

        // Test 2: Cancellation and re-booking
        const test2Passed = await testCancellationRebooking();

        // Cleanup
        await cleanup();

        // Final results
        console.log('='.repeat(60));
        console.log('📋 FINAL RESULTS:');
        console.log('='.repeat(60));
        console.log(`   Test 1 (Concurrent): ${test1Passed ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`   Test 2 (Rebooking):  ${test2Passed ? '✅ PASSED' : '❌ FAILED'}`);
        console.log('='.repeat(60) + '\n');

        if (test1Passed && test2Passed) {
            console.log('🎉 ALL TESTS PASSED! Overbooking prevention is working correctly.\n');
            process.exit(0);
        } else {
            console.log('⚠️  SOME TESTS FAILED. Review the implementation.\n');
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Test execution failed:', error);
        await cleanup().catch(() => { });
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

// Run tests
runTests();
