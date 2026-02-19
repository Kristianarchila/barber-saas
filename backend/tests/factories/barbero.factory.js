/**
 * Test Factory for Barbero entities
 * Generates valid Barbero fixtures with complete disponibilidad schedule
 * 
 * Domain Rule: Barbero MUST have disponibilidad to accept reservations
 */

function buildBarberoValido(overrides = {}) {
    return {
        nombre: 'Barbero Test',
        email: `barbero_${Date.now()}@test.com`,
        barberiaId: overrides.barberiaId,
        activo: true,
        disponibilidad: [
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

module.exports = { buildBarberoValido };
