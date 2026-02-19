const mongoose = require('mongoose');

/**
 * AuditLog Model
 * 
 * Registra todas las acciones sensibles y intentos de acceso no autorizado
 * para auditoría de seguridad y compliance.
 */
const auditLogSchema = new mongoose.Schema({
    // Usuario que realizó la acción
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Barbería afectada (si aplica)
    barberiaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Barberia',
        index: true
    },

    // Tipo de acción
    action: {
        type: String,
        required: true,
        enum: [
            // Autenticación
            'LOGIN',
            'LOGIN_FAILED',
            'LOGOUT',
            'PASSWORD_RESET',
            '2FA_ENABLED',
            '2FA_DISABLED',

            // Gestión de usuarios
            'CREATE_USER',
            'UPDATE_USER',
            'DELETE_USER',

            // Gestión de barberos
            'CREATE_BARBERO',
            'UPDATE_BARBERO',
            'DELETE_BARBERO',

            // Suscripciones
            'UPDATE_SUBSCRIPTION',
            'CHANGE_PLAN',
            'CANCEL_SUBSCRIPTION',
            'REACTIVATE_SUBSCRIPTION',

            // Acceso a datos
            'ACCESS_CLIENT_DATA',
            'EXPORT_DATA',
            'VIEW_FINANCIAL_REPORT',

            // Reservas
            'CREATE_RESERVA',
            'UPDATE_RESERVA',
            'DELETE_RESERVA',
            'CANCEL_RESERVA',

            // Configuración
            'UPDATE_BARBERIA_CONFIG',
            'UPDATE_EMAIL_CONFIG',
            'UPDATE_PAYMENT_CONFIG',

            // Seguridad
            'CROSS_TENANT_ATTEMPT',
            'UNAUTHORIZED_ACCESS_ATTEMPT',
            'RATE_LIMIT_EXCEEDED',
            'SUSPICIOUS_ACTIVITY'
        ],
        index: true
    },

    // Tipo de recurso afectado
    resourceType: {
        type: String,
        enum: ['User', 'Barbero', 'Reserva', 'Servicio', 'Barberia', 'Subscription', 'Cliente', 'Producto', 'Inventario', 'Caja', 'Pago', 'Egreso']
    },

    // ID del recurso afectado
    resourceId: {
        type: mongoose.Schema.Types.ObjectId
    },

    // Cambios realizados (antes/después)
    changes: {
        before: {
            type: mongoose.Schema.Types.Mixed
        },
        after: {
            type: mongoose.Schema.Types.Mixed
        }
    },

    // Información de la solicitud
    request: {
        ip: String,
        userAgent: String,
        method: String,
        url: String,
        params: mongoose.Schema.Types.Mixed,
        query: mongoose.Schema.Types.Mixed
    },

    // Severidad del evento
    severity: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'LOW',
        index: true
    },

    // Resultado de la acción
    result: {
        type: String,
        enum: ['SUCCESS', 'FAILED', 'BLOCKED'],
        default: 'SUCCESS'
    },

    // Mensaje descriptivo
    message: {
        type: String
    },

    // Metadata adicional
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Índices compuestos para queries eficientes
auditLogSchema.index({ barberiaId: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, severity: 1 });
auditLogSchema.index({ severity: 1, createdAt: -1 });
auditLogSchema.index({ result: 1, createdAt: -1 });

// Índice TTL para auto-eliminar logs antiguos (opcional, mantener 1 año)
// auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

/**
 * Método estático para crear un log de auditoría
 */
auditLogSchema.statics.log = async function (data) {
    try {
        return await this.create(data);
    } catch (error) {
        // No fallar la operación principal si el log falla
        console.error('Error creando audit log:', error);
        return null;
    }
};

/**
 * Método estático para registrar intento de acceso cross-tenant
 */
auditLogSchema.statics.logCrossTenantAttempt = async function ({
    userId,
    userBarberiaId,
    attemptedBarberiaId,
    request
}) {
    return await this.log({
        userId,
        barberiaId: attemptedBarberiaId,
        action: 'CROSS_TENANT_ATTEMPT',
        severity: 'CRITICAL',
        result: 'BLOCKED',
        message: `Usuario de barbería ${userBarberiaId} intentó acceder a barbería ${attemptedBarberiaId}`,
        request,
        metadata: {
            userBarberiaId,
            attemptedBarberiaId
        }
    });
};

/**
 * Método estático para registrar login fallido
 */
auditLogSchema.statics.logFailedLogin = async function ({
    email,
    ip,
    userAgent,
    reason
}) {
    return await this.log({
        userId: null, // No hay userId si el login falló
        action: 'LOGIN_FAILED',
        severity: 'MEDIUM',
        result: 'FAILED',
        message: `Login fallido para ${email}: ${reason}`,
        request: {
            ip,
            userAgent
        },
        metadata: {
            email,
            reason
        }
    });
};

module.exports = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
