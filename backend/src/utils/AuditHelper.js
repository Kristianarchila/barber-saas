const AuditLog = require('../infrastructure/database/mongodb/models/AuditLog');

/**
 * Audit Helper
 * 
 * Centraliza la lógica de auditoría para acciones sensibles.
 * Proporciona métodos simples para registrar eventos sin bloquear la operación principal.
 */
class AuditHelper {
    /**
     * Registra eliminación de un recurso
     * @param {Object} params
     * @param {string} params.userId - ID del usuario que realizó la acción
     * @param {string} params.barberiaId - ID de la barbería
     * @param {string} params.resourceType - Tipo de recurso (Barbero, Reserva, etc.)
     * @param {string} params.resourceId - ID del recurso eliminado
     * @param {Object} params.resourceData - Datos del recurso antes de eliminar
     * @param {Object} params.request - Información de la solicitud (ip, userAgent, etc.)
     */
    static async logDelete({ userId, barberiaId, resourceType, resourceId, resourceData, request = {} }) {
        try {
            await AuditLog.log({
                userId,
                barberiaId,
                action: `DELETE_${resourceType.toUpperCase()}`,
                resourceType,
                resourceId,
                changes: {
                    before: resourceData,
                    after: null
                },
                request: {
                    ip: request.ip,
                    userAgent: request.userAgent,
                    method: request.method,
                    url: request.url
                },
                severity: 'HIGH',
                result: 'SUCCESS',
                message: `${resourceType} eliminado: ${resourceData?.nombre || resourceId}`
            });
        } catch (error) {
            console.error('Error logging delete action:', error);
            // No fallar la operación principal si el log falla
        }
    }

    /**
     * Registra actualización de un recurso
     * @param {Object} params
     * @param {string} params.userId
     * @param {string} params.barberiaId
     * @param {string} params.resourceType
     * @param {string} params.resourceId
     * @param {Object} params.before - Estado anterior
     * @param {Object} params.after - Estado nuevo
     * @param {Object} params.request
     */
    static async logUpdate({ userId, barberiaId, resourceType, resourceId, before, after, request = {} }) {
        try {
            // Determinar severidad basado en el tipo de cambio
            let severity = 'MEDIUM';
            let action = `UPDATE_${resourceType.toUpperCase()}`;

            // Cambios críticos tienen severidad HIGH
            if (resourceType === 'Subscription' || resourceType === 'Barberia') {
                severity = 'HIGH';
            }

            await AuditLog.log({
                userId,
                barberiaId,
                action,
                resourceType,
                resourceId,
                changes: {
                    before,
                    after
                },
                request: {
                    ip: request.ip,
                    userAgent: request.userAgent,
                    method: request.method,
                    url: request.url
                },
                severity,
                result: 'SUCCESS',
                message: `${resourceType} actualizado`
            });
        } catch (error) {
            console.error('Error logging update action:', error);
        }
    }

    /**
     * Registra cambio de plan de suscripción
     * @param {Object} params
     */
    static async logPlanChange({ userId, barberiaId, oldPlan, newPlan, request = {} }) {
        try {
            await AuditLog.log({
                userId,
                barberiaId,
                action: 'CHANGE_PLAN',
                resourceType: 'Subscription',
                changes: {
                    before: { plan: oldPlan },
                    after: { plan: newPlan }
                },
                request: {
                    ip: request.ip,
                    userAgent: request.userAgent,
                    method: request.method,
                    url: request.url
                },
                severity: 'HIGH',
                result: 'SUCCESS',
                message: `Plan cambiado de ${oldPlan} a ${newPlan}`
            });
        } catch (error) {
            console.error('Error logging plan change:', error);
        }
    }

    /**
     * Registra cancelación de suscripción
     */
    static async logCancelSubscription({ userId, barberiaId, plan, reason, request = {} }) {
        try {
            await AuditLog.log({
                userId,
                barberiaId,
                action: 'CANCEL_SUBSCRIPTION',
                resourceType: 'Subscription',
                metadata: {
                    plan,
                    reason
                },
                request: {
                    ip: request.ip,
                    userAgent: request.userAgent,
                    method: request.method,
                    url: request.url
                },
                severity: 'HIGH',
                result: 'SUCCESS',
                message: `Suscripción ${plan} cancelada. Razón: ${reason || 'No especificada'}`
            });
        } catch (error) {
            console.error('Error logging subscription cancellation:', error);
        }
    }

    /**
     * Registra cancelación de reserva
     */
    static async logCancelReserva({ userId, barberiaId, reservaId, reservaData, isAdmin, request = {} }) {
        try {
            await AuditLog.log({
                userId,
                barberiaId,
                action: 'CANCEL_RESERVA',
                resourceType: 'Reserva',
                resourceId: reservaId,
                changes: {
                    before: { estado: reservaData.estado },
                    after: { estado: 'CANCELADA' }
                },
                request: {
                    ip: request.ip,
                    userAgent: request.userAgent,
                    method: request.method,
                    url: request.url
                },
                severity: isAdmin ? 'MEDIUM' : 'LOW',
                result: 'SUCCESS',
                message: `Reserva cancelada ${isAdmin ? 'por admin' : 'por cliente'}: ${reservaData.nombreCliente}`
            });
        } catch (error) {
            console.error('Error logging reserva cancellation:', error);
        }
    }

    /**
     * Registra actualización de configuración crítica
     */
    static async logConfigUpdate({ userId, barberiaId, configType, changes, request = {} }) {
        try {
            await AuditLog.log({
                userId,
                barberiaId,
                action: 'UPDATE_BARBERIA_CONFIG',
                resourceType: 'Barberia',
                resourceId: barberiaId,
                changes,
                request: {
                    ip: request.ip,
                    userAgent: request.userAgent,
                    method: request.method,
                    url: request.url
                },
                severity: 'MEDIUM',
                result: 'SUCCESS',
                message: `Configuración actualizada: ${configType}`,
                metadata: {
                    configType
                }
            });
        } catch (error) {
            console.error('Error logging config update:', error);
        }
    }

    /**
     * Registra exportación de datos
     */
    static async logDataExport({ userId, barberiaId, dataType, recordCount, request = {} }) {
        try {
            await AuditLog.log({
                userId,
                barberiaId,
                action: 'EXPORT_DATA',
                severity: 'HIGH',
                result: 'SUCCESS',
                message: `Exportación de ${dataType}: ${recordCount} registros`,
                metadata: {
                    dataType,
                    recordCount
                },
                request: {
                    ip: request.ip,
                    userAgent: request.userAgent,
                    method: request.method,
                    url: request.url
                }
            });
        } catch (error) {
            console.error('Error logging data export:', error);
        }
    }

    /**
     * Registra acceso a datos sensibles de clientes
     */
    static async logClientDataAccess({ userId, barberiaId, clientId, accessType, request = {} }) {
        try {
            await AuditLog.log({
                userId,
                barberiaId,
                action: 'ACCESS_CLIENT_DATA',
                resourceType: 'Cliente',
                resourceId: clientId,
                severity: 'MEDIUM',
                result: 'SUCCESS',
                message: `Acceso a datos de cliente: ${accessType}`,
                metadata: {
                    accessType
                },
                request: {
                    ip: request.ip,
                    userAgent: request.userAgent,
                    method: request.method,
                    url: request.url
                }
            });
        } catch (error) {
            console.error('Error logging client data access:', error);
        }
    }

    /**
     * Helper para extraer información de request de Express
     */
    static extractRequestInfo(req) {
        if (!req) return {};

        return {
            ip: req.ip || req.connection?.remoteAddress,
            userAgent: req.headers?.['user-agent'],
            method: req.method,
            url: req.originalUrl || req.url
        };
    }
}

module.exports = AuditHelper;
