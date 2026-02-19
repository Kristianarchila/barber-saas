const cacheService = require('../infrastructure/cache/CacheService');
const logger = require('../config/logger');

/**
 * Middleware para cachear respuestas HTTP GET
 * 
 * @param {number} duration - Duración del caché en segundos (default: 600 = 10 min)
 * @returns {Function} Middleware de Express
 */
const cacheMiddleware = (duration = 600) => {
    return (req, res, next) => {
        // Solo cachear GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Generar key única basada en URL + query params + barberiaId
        const barberiaId = req.user?.barberiaId || 'public';
        const userId = req.user?.id || 'anonymous';

        // Incluir query params en la key para diferenciar filtros
        const queryString = Object.keys(req.query).length > 0
            ? ':' + JSON.stringify(req.query)
            : '';

        const key = `http:${barberiaId}:${userId}:${req.originalUrl}${queryString}`;

        // Intentar obtener del caché
        const cachedResponse = cacheService.get(key);

        if (cachedResponse) {
            logger.debug(`Serving from cache: ${req.originalUrl}`);
            return res.json(cachedResponse);
        }

        // Interceptar res.json para cachear la respuesta
        const originalJson = res.json.bind(res);

        res.json = (body) => {
            // Solo cachear respuestas exitosas (200-299)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                cacheService.set(key, body, duration);
                logger.debug(`Cached response: ${req.originalUrl}`);
            }
            return originalJson(body);
        };

        next();
    };
};

/**
 * Middleware para invalidar caché de un recurso específico
 * Útil para DELETE, PUT, POST
 * 
 * @param {string} resourcePattern - Patrón del recurso a invalidar
 * @returns {Function} Middleware de Express
 */
const invalidateCacheMiddleware = (resourcePattern) => {
    return (req, res, next) => {
        const barberiaId = req.user?.barberiaId;

        // Ejecutar después de que la respuesta se envíe
        res.on('finish', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const pattern = barberiaId
                    ? `${barberiaId}:${resourcePattern}`
                    : resourcePattern;

                const deleted = cacheService.delByPattern(pattern);
                if (deleted > 0) {
                    logger.debug(`Invalidated ${deleted} cache entries for pattern: ${pattern}`);
                }
            }
        });

        next();
    };
};

/**
 * Middleware para limpiar todo el caché de una barbería
 * Útil para operaciones que afectan múltiples recursos
 */
const invalidateBarberiaCache = (req, res, next) => {
    const barberiaId = req.user?.barberiaId;

    res.on('finish', () => {
        if (res.statusCode >= 200 && res.statusCode < 300 && barberiaId) {
            const deleted = cacheService.delByPattern(barberiaId);
            logger.debug(`Invalidated ${deleted} cache entries for barberia: ${barberiaId}`);
        }
    });

    next();
};

module.exports = {
    cacheMiddleware,
    invalidateCacheMiddleware,
    invalidateBarberiaCache
};
