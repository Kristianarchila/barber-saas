const express = require('express');
const router = express.Router();
const cacheService = require('../infrastructure/cache/CacheService');
const { protect } = require('../config/middleware/auth.middleware');

/**
 * GET /api/cache/stats
 * Obtener estadísticas del caché
 * Solo para administradores
 */
router.get('/stats', protect, (req, res) => {
    try {
        const stats = cacheService.getStats();
        const keys = cacheService.keys();

        // Calcular hit rate
        const totalRequests = stats.hits + stats.misses;
        const hitRate = totalRequests > 0
            ? ((stats.hits / totalRequests) * 100).toFixed(2)
            : '0.00';

        res.json({
            success: true,
            stats: {
                hits: stats.hits,
                misses: stats.misses,
                keys: stats.keys,
                ksize: stats.ksize,
                vsize: stats.vsize,
                hitRate: `${hitRate}%`,
                totalRequests,
                cacheKeys: keys.length,
                keysSample: keys.slice(0, 20) // Mostrar primeras 20 keys
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas de caché',
            error: error.message
        });
    }
});

/**
 * DELETE /api/cache/flush
 * Limpiar todo el caché
 * Solo para administradores
 */
router.delete('/flush', protect, (req, res) => {
    try {
        cacheService.flush();

        res.json({
            success: true,
            message: 'Caché limpiado exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al limpiar caché',
            error: error.message
        });
    }
});

/**
 * DELETE /api/cache/invalidate/:pattern
 * Invalidar caché por patrón
 * Solo para administradores
 */
router.delete('/invalidate/:pattern', protect, (req, res) => {
    try {
        const { pattern } = req.params;
        const deleted = cacheService.delByPattern(pattern);

        res.json({
            success: true,
            message: `${deleted} entradas de caché eliminadas`,
            pattern,
            deleted
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al invalidar caché',
            error: error.message
        });
    }
});

module.exports = router;
