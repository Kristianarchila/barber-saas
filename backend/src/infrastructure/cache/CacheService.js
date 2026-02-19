const NodeCache = require('node-cache');
const logger = require('../../config/logger');

/**
 * Servicio de caché en memoria usando Node-Cache
 * Para producción, migrar a Redis
 */
class CacheService {
    constructor() {
        this.cache = new NodeCache({
            stdTTL: 600, // 10 minutos por defecto
            checkperiod: 120, // Verificar expiración cada 2 minutos
            useClones: false // Mejor performance, pero cuidado con mutaciones
        });

        // Logging de eventos
        this.cache.on('set', (key, value) => {
            logger.debug(`Cache SET: ${key}`);
        });

        this.cache.on('del', (key, value) => {
            logger.debug(`Cache DEL: ${key}`);
        });

        this.cache.on('expired', (key, value) => {
            logger.debug(`Cache EXPIRED: ${key}`);
        });

        logger.info('CacheService initialized with Node-Cache');
    }

    /**
     * Obtener valor del caché
     * @param {string} key - Clave del caché
     * @returns {*} Valor cacheado o undefined
     */
    get(key) {
        const value = this.cache.get(key);
        if (value !== undefined) {
            logger.debug(`Cache HIT: ${key}`);
        } else {
            logger.debug(`Cache MISS: ${key}`);
        }
        return value;
    }

    /**
     * Guardar en caché
     * @param {string} key - Clave del caché
     * @param {*} value - Valor a cachear
     * @param {number} ttl - Tiempo de vida en segundos (opcional)
     * @returns {boolean} true si se guardó correctamente
     */
    set(key, value, ttl = null) {
        try {
            if (ttl) {
                return this.cache.set(key, value, ttl);
            }
            return this.cache.set(key, value);
        } catch (error) {
            logger.error(`Error setting cache key ${key}:`, error);
            return false;
        }
    }

    /**
     * Eliminar del caché
     * @param {string} key - Clave a eliminar
     * @returns {number} Número de keys eliminadas
     */
    del(key) {
        return this.cache.del(key);
    }

    /**
     * Eliminar múltiples keys
     * @param {string[]} keys - Array de claves a eliminar
     * @returns {number} Número de keys eliminadas
     */
    delMultiple(keys) {
        return this.cache.del(keys);
    }

    /**
     * Eliminar por patrón
     * @param {string} pattern - Patrón a buscar en las keys
     * @returns {number} Número de keys eliminadas
     */
    delByPattern(pattern) {
        const keys = this.cache.keys().filter(key => key.includes(pattern));
        if (keys.length > 0) {
            logger.debug(`Deleting ${keys.length} keys matching pattern: ${pattern}`);
            return this.cache.del(keys);
        }
        return 0;
    }

    /**
     * Limpiar todo el caché
     */
    flush() {
        logger.info('Flushing all cache');
        return this.cache.flushAll();
    }

    /**
     * Obtener estadísticas del caché
     * @returns {object} Estadísticas
     */
    getStats() {
        return this.cache.getStats();
    }

    /**
     * Obtener todas las keys
     * @returns {string[]} Array de keys
     */
    keys() {
        return this.cache.keys();
    }

    /**
     * Wrapper para cachear funciones
     * Ejecuta la función solo si no hay valor en caché
     * 
     * @param {string} key - Clave del caché
     * @param {Function} fn - Función async a ejecutar si no hay caché
     * @param {number} ttl - Tiempo de vida en segundos (opcional)
     * @returns {Promise<*>} Resultado de la función o valor cacheado
     */
    async wrap(key, fn, ttl = null) {
        const cached = this.get(key);
        if (cached !== undefined) {
            return cached;
        }

        try {
            const result = await fn();
            this.set(key, result, ttl);
            return result;
        } catch (error) {
            logger.error(`Error in cache wrap for key ${key}:`, error);
            throw error;
        }
    }

    /**
     * Generar key de caché para multi-tenant
     * @param {string} barberiaId - ID de la barbería
     * @param {string} resource - Recurso (ej: 'barberos', 'servicios')
     * @param {string} identifier - Identificador adicional (opcional)
     * @returns {string} Key formateada
     */
    generateKey(barberiaId, resource, identifier = null) {
        if (identifier) {
            return `${barberiaId}:${resource}:${identifier}`;
        }
        return `${barberiaId}:${resource}`;
    }
}

// Exportar instancia singleton
module.exports = new CacheService();
