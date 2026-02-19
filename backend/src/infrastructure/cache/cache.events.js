const eventEmitter = require('../../events');
const cacheService = require('../cache/CacheService');
const logger = require('../../config/logger');

/**
 * Sistema de invalidación de caché basado en eventos
 * Se ejecuta automáticamente cuando los datos cambian
 */

// ========================================
// BARBEROS
// ========================================

eventEmitter.on('barbero:created', ({ barberiaId }) => {
    const deleted = cacheService.delByPattern(`${barberiaId}:barberos`);
    logger.debug(`[Cache] Invalidated barberos cache for barberia ${barberiaId} (${deleted} keys)`);
});

eventEmitter.on('barbero:updated', ({ barberiaId, barberoId }) => {
    cacheService.delByPattern(`${barberiaId}:barberos`);
    cacheService.delByPattern(`${barberiaId}:horarios:${barberoId}`);
    logger.debug(`[Cache] Invalidated barbero ${barberoId} cache`);
});

eventEmitter.on('barbero:deleted', ({ barberiaId }) => {
    cacheService.delByPattern(`${barberiaId}:barberos`);
    logger.debug(`[Cache] Invalidated barberos cache for barberia ${barberiaId}`);
});

// ========================================
// SERVICIOS
// ========================================

eventEmitter.on('servicio:created', ({ barberiaId }) => {
    cacheService.delByPattern(`${barberiaId}:servicios`);
    logger.debug(`[Cache] Invalidated servicios cache for barberia ${barberiaId}`);
});

eventEmitter.on('servicio:updated', ({ barberiaId }) => {
    cacheService.delByPattern(`${barberiaId}:servicios`);
    logger.debug(`[Cache] Invalidated servicios cache for barberia ${barberiaId}`);
});

eventEmitter.on('servicio:deleted', ({ barberiaId }) => {
    cacheService.delByPattern(`${barberiaId}:servicios`);
    logger.debug(`[Cache] Invalidated servicios cache for barberia ${barberiaId}`);
});

// ========================================
// RESERVAS
// ========================================

eventEmitter.on('reserva:created', ({ barberiaId, barberoId, fecha }) => {
    // Invalidar disponibilidad
    cacheService.delByPattern(`${barberiaId}:disponibilidad`);
    cacheService.delByPattern(`${barberiaId}:agenda`);

    // Invalidar estadísticas
    cacheService.delByPattern(`${barberiaId}:stats`);
    cacheService.delByPattern(`${barberiaId}:dashboard`);

    logger.debug(`[Cache] Invalidated reserva-related cache for barberia ${barberiaId}`);
});

eventEmitter.on('reserva:updated', ({ barberiaId, barberoId }) => {
    cacheService.delByPattern(`${barberiaId}:disponibilidad`);
    cacheService.delByPattern(`${barberiaId}:agenda`);
    cacheService.delByPattern(`${barberiaId}:stats`);
    logger.debug(`[Cache] Invalidated reserva cache after update`);
});

eventEmitter.on('reserva:cancelled', ({ barberiaId }) => {
    cacheService.delByPattern(`${barberiaId}:disponibilidad`);
    cacheService.delByPattern(`${barberiaId}:agenda`);
    cacheService.delByPattern(`${barberiaId}:stats`);
    logger.debug(`[Cache] Invalidated reserva cache after cancellation`);
});

eventEmitter.on('reserva:completed', ({ barberiaId }) => {
    cacheService.delByPattern(`${barberiaId}:stats`);
    cacheService.delByPattern(`${barberiaId}:dashboard`);
    logger.debug(`[Cache] Invalidated stats cache after reserva completion`);
});

// ========================================
// HORARIOS
// ========================================

eventEmitter.on('horario:updated', ({ barberiaId, barberoId }) => {
    cacheService.delByPattern(`${barberiaId}:horarios`);
    cacheService.delByPattern(`${barberiaId}:disponibilidad`);
    logger.debug(`[Cache] Invalidated horarios cache for barbero ${barberoId}`);
});

// ========================================
// PRODUCTOS E INVENTARIO
// ========================================

eventEmitter.on('producto:updated', ({ barberiaId }) => {
    cacheService.delByPattern(`${barberiaId}:productos`);
    cacheService.delByPattern(`${barberiaId}:inventario`);
    logger.debug(`[Cache] Invalidated productos cache`);
});

eventEmitter.on('inventario:updated', ({ barberiaId }) => {
    cacheService.delByPattern(`${barberiaId}:inventario`);
    cacheService.delByPattern(`${barberiaId}:productos`);
    logger.debug(`[Cache] Invalidated inventario cache`);
});

// ========================================
// VENTAS Y TRANSACCIONES
// ========================================

eventEmitter.on('venta:created', ({ barberiaId }) => {
    cacheService.delByPattern(`${barberiaId}:stats`);
    cacheService.delByPattern(`${barberiaId}:dashboard`);
    cacheService.delByPattern(`${barberiaId}:inventario`);
    logger.debug(`[Cache] Invalidated stats and inventario after venta`);
});

eventEmitter.on('transaction:created', ({ barberiaId }) => {
    cacheService.delByPattern(`${barberiaId}:stats`);
    cacheService.delByPattern(`${barberiaId}:caja`);
    logger.debug(`[Cache] Invalidated financial cache after transaction`);
});

// ========================================
// CONFIGURACIÓN
// ========================================

eventEmitter.on('barberia:updated', ({ barberiaId }) => {
    // Invalidar todo el caché de la barbería cuando cambia configuración
    cacheService.delByPattern(barberiaId);
    logger.info(`[Cache] Invalidated all cache for barberia ${barberiaId} after config update`);
});

logger.info('[Cache Events] Cache invalidation listeners registered');

module.exports = eventEmitter;
