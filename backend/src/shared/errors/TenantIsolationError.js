/**
 * Error lanzado cuando se detecta una violación de aislamiento multi-tenant
 * 
 * Ejemplos:
 * - Usuario intenta acceder a datos de otra barbería
 * - Query sin barberiaId en contexto multi-tenant
 * - Recurso no pertenece a la barbería del usuario
 */
class TenantIsolationError extends Error {
    constructor(message = 'Acceso denegado: violación de aislamiento de datos') {
        super(message);
        this.name = 'TenantIsolationError';
        this.statusCode = 403;
        this.isOperational = true;
    }
}

module.exports = TenantIsolationError;
