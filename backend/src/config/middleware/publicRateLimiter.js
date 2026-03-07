'use strict';

const rateLimit = require('express-rate-limit');
const { getRedisStore } = require('../redisClient');

// ─── Stress-test bypass ───────────────────────────────────────────────────────
const skipForStressTest = (req) => {
    if (process.env.NODE_ENV === 'production') return false;
    if (process.env.STRESS_TEST !== 'true') return false;
    const ip = req.ip || req.connection?.remoteAddress || '';
    return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
};

// ─── Shared store (set once on init) ─────────────────────────────────────────
// Starts as undefined (MemoryStore). Replaced with RedisStore after
// initRateLimiters() runs in rateLimit.middleware.js during server startup.
// getRedisStore() is safe to call multiple times — it returns the cached instance.
let _store = undefined;

(async () => {
    _store = await getRedisStore();
    if (_store) {
        // Rebuild limiters with the real Redis store
        _reservaLimiter = _buildReservaLimiter();
        _cancelLimiter = _buildCancelLimiter();
        _reviewLimiter = _buildReviewLimiter();
    }
})();

// ─── Builders ─────────────────────────────────────────────────────────────────

const _buildReservaLimiter = () => rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    store: _store,
    message: 'Demasiadas reservas desde esta IP. Por favor, intenta más tarde.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipForStressTest,
});

const _buildCancelLimiter = () => rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    store: _store,
    message: 'Demasiadas cancelaciones desde esta IP. Por favor, intenta más tarde.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipForStressTest,
});

const _buildReviewLimiter = () => rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 3,
    store: _store,
    message: 'Demasiadas reseñas desde esta IP. Por favor, intenta mañana.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipForStressTest,
});

// Initial instances (MemoryStore). Replaced by the IIFE above if Redis connects.
let _reservaLimiter = _buildReservaLimiter();
let _cancelLimiter = _buildCancelLimiter();
let _reviewLimiter = _buildReviewLimiter();

// ─── Proxy exports ────────────────────────────────────────────────────────────
exports.reservaLimiter = (req, res, next) => _reservaLimiter(req, res, next);
exports.cancelLimiter = (req, res, next) => _cancelLimiter(req, res, next);
exports.reviewLimiter = (req, res, next) => _reviewLimiter(req, res, next);
