'use strict';

const rateLimit = require('express-rate-limit');
const Logger = require('../shared/Logger');
const { getRedisStore } = require('../config/redisClient');

// ─── Stress-test bypass ───────────────────────────────────────────────────────
// ONLY active when STRESS_TEST=true AND NODE_ENV !== 'production'.
// In production this always returns false, regardless of STRESS_TEST.
const skipForStressTest = (req) => {
    if (process.env.NODE_ENV === 'production') return false;
    if (process.env.STRESS_TEST !== 'true') return false;
    const ip = req.ip || req.connection?.remoteAddress || '';
    return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
};

// ─── Shared store (set once on init) ─────────────────────────────────────────
// Starts as undefined (MemoryStore fallback). Replaced with RedisStore after
// initRateLimiters() completes during server startup.
let _store = undefined;

/**
 * Call this once at startup (await it) so Redis is fully connected
 * before the first request arrives.
 *
 * Example in server.js:
 *   const { initRateLimiters } = require('./middleware/rateLimit.middleware');
 *   await initRateLimiters();
 */
async function initRateLimiters() {
    _store = await getRedisStore();

    // Rebuild limiters with the real store now that Redis is connected
    _authLimiter = _buildAuthLimiter();
    _publicApiLimiter = _buildPublicApiLimiter();
    _globalLimiter = _buildGlobalLimiter();

    Logger.info('Security', `Rate limiters initialized — store: ${_store ? 'Redis' : 'MemoryStore'}`);
}

// ─── Factory ──────────────────────────────────────────────────────────────────
const createLimiter = (options = {}) => {
    const message = {
        success: false,
        message: typeof options.message === 'string'
            ? options.message
            : 'Demasiadas solicitudes, intente más tarde.',
    };

    return rateLimit({
        windowMs: options.windowMs || 15 * 60 * 1000,
        max: options.max || 100,
        standardHeaders: true,
        legacyHeaders: false,
        store: _store,
        skip: skipForStressTest,
        message,
        handler(req, res, _next, opts) {
            Logger.warn('Security', 'Rate limit exceeded', {
                ip: req.ip,
                method: req.method,
                path: req.path,
                max: opts.max,
            });
            res.status(opts.statusCode).json(message);
        },
    });
};

// ─── Limiter definitions ──────────────────────────────────────────────────────
const _buildAuthLimiter = () => createLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Demasiados intentos de acceso. Por seguridad, espere 15 minutos.',
});

const _buildPublicApiLimiter = () => createLimiter({
    // 200 req/min por IP:
    //   - carga inicial SPA: ~10 req simultáneos
    //   - polling de notificaciones/SSE: ~4 req/min
    //   - navegación activa del admin: ~20-30 req/min
    //   Margen holgado para uso legítimo sin abrir la puerta a scrapers.
    //   Los endpoints críticos (reservas, auth) tienen sus propios limiters más estrictos.
    windowMs: 60 * 1000,
    max: 200,
    message: 'Velocidad de solicitud excedida. Por favor espere un momento.',
});

const _buildGlobalLimiter = () => createLimiter({
    // 1500 req/15min por IP (~100 req/min):
    //   - admin usando el panel 15 min seguidos: ~600-800 req (estimado generoso)
    //   - buffer x2 para picos de carga/recargas
    //   - sigue siendo suficientemente bajo para limitar DDoS básico por IP
    //   Si hay Cloudflare delante, este limiter es la segunda línea de defensa.
    windowMs: 15 * 60 * 1000,
    max: 1500,
    message: 'Límite de tráfico global excedido.',
});

// Created with MemoryStore initially; replaced after initRateLimiters() runs.
let _authLimiter = _buildAuthLimiter();
let _publicApiLimiter = _buildPublicApiLimiter();
let _globalLimiter = _buildGlobalLimiter();

// ─── Proxy exports (always point to the current limiter instance) ─────────────
// Using a function proxy so existing `app.use(globalLimiter)` calls keep working
// even though the instance is replaced after init.
const authLimiter = (req, res, next) => _authLimiter(req, res, next);
const publicApiLimiter = (req, res, next) => _publicApiLimiter(req, res, next);
const globalLimiter = (req, res, next) => _globalLimiter(req, res, next);

module.exports = {
    initRateLimiters,
    authLimiter,
    publicApiLimiter,
    globalLimiter,
};
