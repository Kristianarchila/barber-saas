const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Centralized Test Factories
 * Provides helpers to create valid test fixtures with proper defaults
 */

let testCounter = 0;

/**
 * Generate unique test identifier
 */
function getUniqueId() {
    return `${Date.now()}_${testCounter++}`;
}

/**
 * Create test barberia with unique slug and email
 */
function createTestBarberia(overrides = {}) {
    const uniqueId = getUniqueId();
    return {
        nombre: overrides.nombre || `Barbería Test ${uniqueId}`,
        slug: overrides.slug || `test-barberia-${uniqueId}`,
        email: overrides.email || `test-${uniqueId}@barberia.com`,
        telefono: overrides.telefono || '1234567890',
        direccion: overrides.direccion || 'Calle Test 123',
        activo: overrides.activo !== undefined ? overrides.activo : true,
        ...overrides
    };
}

/**
 * Create test user with specified role and barberiaId
 */
function createTestUser(overrides = {}) {
    const uniqueId = getUniqueId();
    return {
        nombre: overrides.nombre || `Usuario Test ${uniqueId}`,
        email: overrides.email || `user-${uniqueId}@test.com`,
        password: overrides.password || 'password123',
        rol: overrides.rol || 'BARBERIA_ADMIN',
        barberiaId: overrides.barberiaId || null,
        activo: overrides.activo !== undefined ? overrides.activo : true,
        ...overrides
    };
}

/**
 * Create test barbero with full availability schedule
 */
function createTestBarbero(overrides = {}) {
    const uniqueId = getUniqueId();
    return {
        nombre: overrides.nombre || `Barbero Test ${uniqueId}`,
        email: overrides.email || `barbero-${uniqueId}@test.com`,
        barberiaId: overrides.barberiaId,
        activo: overrides.activo !== undefined ? overrides.activo : true,
        disponibilidad: overrides.disponibilidad || [
            {
                dia: 1, // Lunes
                activo: true,
                horarios: [{ inicio: '09:00', fin: '18:00' }]
            },
            {
                dia: 2, // Martes
                activo: true,
                horarios: [{ inicio: '09:00', fin: '18:00' }]
            },
            {
                dia: 3, // Miércoles
                activo: true,
                horarios: [{ inicio: '09:00', fin: '18:00' }]
            },
            {
                dia: 4, // Jueves
                activo: true,
                horarios: [{ inicio: '09:00', fin: '18:00' }]
            },
            {
                dia: 5, // Viernes
                activo: true,
                horarios: [{ inicio: '09:00', fin: '18:00' }]
            },
            {
                dia: 6, // Sábado
                activo: true,
                horarios: [{ inicio: '10:00', fin: '14:00' }]
            }
        ],
        ...overrides
    };
}

/**
 * Create test servicio with pricing
 */
function createTestServicio(overrides = {}) {
    const uniqueId = getUniqueId();
    return {
        nombre: overrides.nombre || `Servicio Test ${uniqueId}`,
        descripcion: overrides.descripcion || 'Descripción del servicio de prueba',
        precio: overrides.precio !== undefined ? overrides.precio : 100,
        duracion: overrides.duracion !== undefined ? overrides.duracion : 30,
        barberiaId: overrides.barberiaId,
        activo: overrides.activo !== undefined ? overrides.activo : true,
        ...overrides
    };
}

/**
 * Create test reserva with all required fields
 */
function createTestReserva(overrides = {}) {
    const uniqueId = getUniqueId();
    return {
        barberoId: overrides.barberoId,
        barberiaId: overrides.barberiaId,
        servicioId: overrides.servicioId,
        clienteId: overrides.clienteId || null,
        nombreCliente: overrides.nombreCliente || `Cliente Test ${uniqueId}`,
        emailCliente: overrides.emailCliente || `cliente-${uniqueId}@test.com`,
        fecha: overrides.fecha || '2026-03-15',
        hora: overrides.hora || '10:00',
        horaFin: overrides.horaFin || '10:30',
        duracion: overrides.duracion !== undefined ? overrides.duracion : 30,
        precio: overrides.precio !== undefined ? overrides.precio : 100,
        estado: overrides.estado || 'RESERVADA',
        cancelToken: overrides.cancelToken || crypto.randomBytes(32).toString('hex'),
        ...overrides
    };
}

/**
 * Generate JWT token for testing
 */
function generateAuthToken(user) {
    const payload = {
        id: user._id,
        rol: user.rol,
        barberiaId: user.barberiaId
    };

    return jwt.sign(payload, process.env.JWT_SECRET || 'test-secret-key-for-testing', {
        expiresIn: '1d'
    });
}

/**
 * Create complete test setup with barberia, admin, barbero, and servicio
 */
async function createCompleteTestSetup(models) {
    const { Barberia, User, Barbero, Servicio } = models;

    // Create barberia
    const barberia = await Barberia.create(createTestBarberia());

    // Create admin user
    const admin = await User.create(createTestUser({
        rol: 'BARBERIA_ADMIN',
        barberiaId: barberia._id
    }));

    // Create barbero
    const barbero = await Barbero.create(createTestBarbero({
        barberiaId: barberia._id
    }));

    // Create servicio
    const servicio = await Servicio.create(createTestServicio({
        barberiaId: barberia._id
    }));

    // Generate token
    const token = generateAuthToken(admin);

    return {
        barberia,
        admin,
        barbero,
        servicio,
        token
    };
}

/**
 * Create future date for reservations (avoids past date validation errors)
 */
function getFutureDate(daysAhead = 7) {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * Get day of week for a date (0 = Sunday, 1 = Monday, etc.)
 */
function getDayOfWeek(dateString) {
    return new Date(dateString).getDay();
}

module.exports = {
    createTestBarberia,
    createTestUser,
    createTestBarbero,
    createTestServicio,
    createTestReserva,
    generateAuthToken,
    createCompleteTestSetup,
    getFutureDate,
    getDayOfWeek,
    getUniqueId
};
