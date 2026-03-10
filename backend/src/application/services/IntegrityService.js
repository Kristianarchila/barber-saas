const AuditLog = require('../../infrastructure/database/mongodb/models/AuditLog');
const events = require('../../events');
const logger = require('../../config/logger');

/**
 * IntegrityService
 * 
 * Analiza patrones de logs para detectar anomalías que un simple log no captura.
 * Ejemplos: Fuerza bruta, borrado masivo, etc.
 */
class IntegrityService {
    constructor() {
        this.checkInterval = 1000 * 60 * 15; // Revisar cada 15 minutos
        this.initialize();
    }

    initialize() {
        // Ejecutar revisión inicial y programar
        this.runIntegrityChecks();
        setInterval(() => this.runIntegrityChecks(), this.checkInterval);

        logger.info('IntegrityService habilitado: Monitoreo de anomalías activo');
    }

    async runIntegrityChecks() {
        try {
            const now = new Date();
            const fifteenMinsAgo = new Date(now - 1000 * 60 * 15);

            await Promise.all([
                this.checkBruteForce(fifteenMinsAgo),
                this.checkDatabaseOrphans()
            ]);
        } catch (error) {
            logger.error('Error en ejecución de IntegrityService:', error);
        }
    }

    /**
     * Detecta múltiples logins fallidos desde una misma IP
     */
    async checkBruteForce(since) {
        const pipeline = [
            { $match: { action: 'LOGIN_FAILED', createdAt: { $gte: since } } },
            { $group: { _id: '$request.ip', count: { $sum: 1 }, emails: { $addToSet: '$metadata.email' } } },
            { $match: { count: { $gte: 5 } } }
        ];

        const results = await AuditLog.aggregate(pipeline);

        for (const attempt of results) {
            events.emit('alert:critical', {
                action: 'SUSPICIOUS_ACTIVITY',
                severity: 'HIGH',
                message: `Detección de fuerza bruta: ${attempt.count} intentos desde IP ${attempt._id}`,
                metadata: {
                    ip: attempt._id,
                    emailsAttempted: attempt.emails,
                    count: attempt.count
                }
            });
            logger.warn(`🚨 Anomalía detectada: Fuerza bruta desde ${attempt._id}`);
        }
    }

    /**
     * Verifica integridad referencial básica (ej. citas sin barbero)
     * Este es un "médico" preventivo.
     */
    async checkDatabaseOrphans() {
        // Aquí se pueden agregar queries para detectar inconsistencias
        // Por simplicidad en este MVP, solo logueamos la ejecución
        logger.debug('Chequeo de integridad de base de datos completado');
    }
}

module.exports = new IntegrityService();
