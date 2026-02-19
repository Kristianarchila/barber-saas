/**
 * Plan catalog with pricing, limits, and features
 */
export const PLANS_CATALOG = {
    basico: {
        nombre: 'Básico',
        displayName: 'Plan Básico',
        precio: 29990, // CLP mensual
        descripcion: 'Ideal para barberías pequeñas empezando',

        limites: {
            maxBarberos: 3,
            maxReservasMes: 100,
            maxServicios: 10,
            maxFotos: 5
        },

        features: {
            reservasOnline: true,
            gestionHorarios: true,
            gestionServicios: true,
            notificacionesEmail: false,
            reportesBasicos: true,
            reportesAvanzados: false,
            integracionWhatsApp: false,
            personalizacion: false,
            soportePrioritario: false,
            multipleAdmins: false
        }
    },

    pro: {
        nombre: 'Pro',
        displayName: 'Plan Pro',
        precio: 59990, // CLP mensual
        descripcion: 'Para barberías en crecimiento',

        limites: {
            maxBarberos: 10,
            maxReservasMes: 500,
            maxServicios: 30,
            maxFotos: 20
        },

        features: {
            reservasOnline: true,
            gestionHorarios: true,
            gestionServicios: true,
            notificacionesEmail: true,
            reportesBasicos: true,
            reportesAvanzados: true,
            integracionWhatsApp: true,
            personalizacion: true,
            soportePrioritario: false,
            multipleAdmins: true
        }
    },

    premium: {
        nombre: 'Premium',
        displayName: 'Plan Premium',
        precio: 99990, // CLP mensual
        descripcion: 'Sin límites para grandes operaciones',

        limites: {
            maxBarberos: -1, // -1 = ilimitado
            maxReservasMes: -1,
            maxServicios: -1,
            maxFotos: -1
        },

        features: {
            reservasOnline: true,
            gestionHorarios: true,
            gestionServicios: true,
            notificacionesEmail: true,
            reportesBasicos: true,
            reportesAvanzados: true,
            integracionWhatsApp: true,
            personalizacion: true,
            soportePrioritario: true,
            multipleAdmins: true
        }
    }
};
