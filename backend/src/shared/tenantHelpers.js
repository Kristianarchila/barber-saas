const TenantIsolationError = require('./errors/TenantIsolationError');
const logger = require('../config/logger');

/**
 * Helpers para garantizar aislamiento de datos multi-tenant
 */

/**
 * Asegura que una query incluya barberiaId para aislamiento
 * 
 * @param {Object} query - Query object de Mongoose
 * @param {String|ObjectId} barberiaId - ID de la barbería
 * @returns {Object} Query con barberiaId agregado
 * @throws {TenantIsolationError} Si barberiaId no está presente
 * 
 * @example
 * const query = ensureTenantIsolation({ estado: 'ACTIVA' }, req.barberiaId);
 * const reservas = await Reserva.find(query);
 */
function ensureTenantIsolation(query = {}, barberiaId) {
    if (!barberiaId) {
        logger.error('Intento de query sin barberiaId', { query });
        throw new TenantIsolationError('barberiaId es requerido para esta operación');
    }

    return {
        ...query,
        barberiaId
    };
}

/**
 * Valida que un recurso pertenece a la barbería especificada
 * 
 * @param {Object} resource - Recurso a validar (debe tener barberiaId)
 * @param {String|ObjectId} barberiaId - ID de la barbería esperada
 * @param {String} resourceType - Tipo de recurso (para logging)
 * @throws {TenantIsolationError} Si el recurso no pertenece a la barbería
 * 
 * @example
 * const reserva = await Reserva.findById(id);
 * validateResourceOwnership(reserva, req.barberiaId, 'Reserva');
 */
function validateResourceOwnership(resource, barberiaId, resourceType = 'Recurso') {
    if (!resource) {
        return; // Recurso no encontrado, se maneja en otro lugar
    }

    if (!barberiaId) {
        logger.error('Intento de validación sin barberiaId', { resourceType });
        throw new TenantIsolationError('barberiaId es requerido para validación');
    }

    const resourceBarberiaId = resource.barberiaId?.toString() || resource.barberiaId;
    const expectedBarberiaId = barberiaId.toString();

    if (resourceBarberiaId !== expectedBarberiaId) {
        logger.warn('Intento de acceso cross-tenant detectado', {
            resourceType,
            resourceId: resource._id,
            resourceBarberiaId,
            attemptedBarberiaId: expectedBarberiaId
        });

        throw new TenantIsolationError(
            `No tienes permiso para acceder a este ${resourceType.toLowerCase()}`
        );
    }
}

/**
 * Valida que un array de recursos pertenecen a la barbería
 * 
 * @param {Array} resources - Array de recursos a validar
 * @param {String|ObjectId} barberiaId - ID de la barbería esperada
 * @param {String} resourceType - Tipo de recurso
 * @throws {TenantIsolationError} Si algún recurso no pertenece a la barbería
 */
function validateResourcesOwnership(resources, barberiaId, resourceType = 'Recursos') {
    if (!Array.isArray(resources)) {
        return;
    }

    resources.forEach(resource => {
        validateResourceOwnership(resource, barberiaId, resourceType);
    });
}

/**
 * Crea un filtro seguro para queries multi-tenant
 * Combina filtros del usuario con barberiaId obligatorio
 * 
 * @param {Object} userFilters - Filtros proporcionados por el usuario
 * @param {String|ObjectId} barberiaId - ID de la barbería
 * @returns {Object} Filtro combinado seguro
 * 
 * @example
 * const filters = createTenantFilter(req.query, req.barberiaId);
 * const reservas = await Reserva.find(filters);
 */
function createTenantFilter(userFilters = {}, barberiaId) {
    if (!barberiaId) {
        throw new TenantIsolationError('barberiaId es requerido');
    }

    // Eliminar cualquier intento de inyectar barberiaId en los filtros del usuario
    const { barberiaId: _, ...safeFilters } = userFilters;

    return {
        ...safeFilters,
        barberiaId // Siempre usar el barberiaId del contexto autenticado
    };
}

/**
 * Middleware helper para extraer barberiaId de forma segura
 * 
 * @param {Object} req - Request object
 * @returns {String|null} barberiaId extraído o null
 */
function extractBarberiaIdFromRequest(req) {
    // Prioridad: req.barberiaId (ya validado) > req.user.barberiaId
    return req.barberiaId || req.user?.barberiaId || null;
}

module.exports = {
    ensureTenantIsolation,
    validateResourceOwnership,
    validateResourcesOwnership,
    createTenantFilter,
    extractBarberiaIdFromRequest
};
