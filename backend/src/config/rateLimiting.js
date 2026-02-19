/**
 * Advanced Rate Limiting Configuration
 * 
 * Provides differentiated rate limits for different endpoint types
 * with automatic IP blacklisting for abusive behavior
 */

const rateLimit = require('express-rate-limit');
const { monitorRateLimitExceeded } = require('../utils/monitoring');

// In-memory store for blacklisted IPs (use Redis in production for multi-server)
const blacklistedIPs = new Map();

/**
 * Check if IP is blacklisted
 */
function isBlacklisted(ip) {
    const blacklistEntry = blacklistedIPs.get(ip);
    if (!blacklistEntry) return false;

    // Check if blacklist has expired
    if (Date.now() > blacklistEntry.expiresAt) {
        blacklistedIPs.delete(ip);
        return false;
    }

    return true;
}

/**
 * Blacklist an IP address
 */
function blacklistIP(ip, durationMs = 60 * 60 * 1000) { // Default 1 hour
    blacklistedIPs.set(ip, {
        blacklistedAt: Date.now(),
        expiresAt: Date.now() + durationMs,
        reason: 'Rate limit abuse'
    });

    console.log(`🚫 IP blacklisted: ${ip} for ${durationMs / 1000}s`);
}

/**
 * Custom handler for rate limit exceeded
 */
function createRateLimitHandler(severity = 'medium') {
    return (req, res, next, options) => {
        const ip = req.ip || req.connection.remoteAddress;

        // Log to monitoring
        if (typeof monitorRateLimitExceeded === 'function') {
            monitorRateLimitExceeded(ip, req.path, req.method, severity);
        }

        // Blacklist IP if severe abuse (>3 violations in 5 minutes)
        if (severity === 'high' || severity === 'critical') {
            const violations = (req.rateLimit?.violations || 0) + 1;

            if (violations >= 3) {
                blacklistIP(ip, 60 * 60 * 1000); // 1 hour blacklist
            }
        }

        res.status(429).json({
            success: false,
            error: 'Too Many Requests',
            message: options.message || 'Demasiadas solicitudes. Por favor, intente más tarde.',
            retryAfter: Math.ceil(options.windowMs / 1000)
        });
    };
}

/**
 * Skip function to check blacklist
 */
function skipBlacklisted(req, res) {
    const ip = req.ip || req.connection.remoteAddress;

    if (isBlacklisted(ip)) {
        res.status(403).json({
            success: false,
            error: 'Forbidden',
            message: 'Su IP ha sido bloqueada temporalmente por actividad sospechosa.'
        });
        return true;
    }

    return false;
}

/**
 * 1. CRITICAL - Authentication endpoints (Login, Register, Password Reset)
 * Strictest limits to prevent brute force attacks
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Only 5 attempts per 15 minutes
    message: 'Demasiados intentos de autenticación. Por seguridad, espere 15 minutos.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: createRateLimitHandler('critical'),
    skip: skipBlacklisted
});

/**
 * 2. HIGH - Public reservation creation
 * Prevent spam reservations
 */
const reservationLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 3, // Max 3 reservations per minute
    message: 'Demasiadas reservas en poco tiempo. Por favor, espere un momento.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: createRateLimitHandler('high'),
    skip: skipBlacklisted
});

/**
 * 3. HIGH - Payment endpoints
 * Prevent payment spam/fraud attempts
 */
const paymentLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Max 5 payment attempts per minute
    message: 'Demasiados intentos de pago. Por favor, espere un momento.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: createRateLimitHandler('high'),
    skip: skipBlacklisted
});

/**
 * 4. MEDIUM - Public API (Read operations)
 * Prevent scraping
 */
const publicApiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // Max 30 requests per minute
    message: 'Velocidad de solicitud excedida. Por favor, espere un momento.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: createRateLimitHandler('medium'),
    skip: skipBlacklisted
});

/**
 * 5. MEDIUM - Admin write operations
 * Prevent accidental spam from admin panel
 */
const adminWriteLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // Max 60 write operations per minute
    message: 'Demasiadas operaciones. Por favor, espere un momento.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: createRateLimitHandler('medium'),
    skip: skipBlacklisted
});

/**
 * 6. LOW - Admin read operations
 * Generous limits for dashboard/reports
 */
const adminReadLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 120, // Max 120 read operations per minute
    message: 'Demasiadas solicitudes. Por favor, espere un momento.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: createRateLimitHandler('low'),
    skip: skipBlacklisted
});

/**
 * 7. GLOBAL - Catch-all for all API endpoints
 * Last line of defense
 */
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 500 : 5000, // 500 in prod, 5000 in dev
    message: 'Límite de tráfico global excedido.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: createRateLimitHandler('low'),
    skip: (req, res) => {
        // Skip in development for easier testing
        if (process.env.NODE_ENV !== 'production') {
            return false;
        }
        return skipBlacklisted(req, res);
    }
});

/**
 * 8. STRICT - Email sending (confirmation, reminders)
 * Prevent email spam
 */
const emailLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // Max 10 emails per minute per IP
    message: 'Demasiadas solicitudes de email. Por favor, espere.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: createRateLimitHandler('high'),
    skip: skipBlacklisted
});

/**
 * 9. STRICT - File uploads
 * Prevent storage abuse
 */
const uploadLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // Max 10 uploads per minute
    message: 'Demasiadas cargas de archivos. Por favor, espere.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: createRateLimitHandler('high'),
    skip: skipBlacklisted
});

/**
 * Utility: Get blacklist status
 */
function getBlacklistStatus() {
    const now = Date.now();
    const active = [];

    blacklistedIPs.forEach((entry, ip) => {
        if (now < entry.expiresAt) {
            active.push({
                ip,
                blacklistedAt: new Date(entry.blacklistedAt).toISOString(),
                expiresAt: new Date(entry.expiresAt).toISOString(),
                reason: entry.reason
            });
        }
    });

    return active;
}

/**
 * Utility: Manually blacklist IP
 */
function manualBlacklist(ip, durationMs = 24 * 60 * 60 * 1000) {
    blacklistIP(ip, durationMs);
}

/**
 * Utility: Remove IP from blacklist
 */
function removeFromBlacklist(ip) {
    const removed = blacklistedIPs.delete(ip);
    if (removed) {
        console.log(`✅ IP removed from blacklist: ${ip}`);
    }
    return removed;
}

module.exports = {
    // Rate limiters
    authLimiter,
    reservationLimiter,
    paymentLimiter,
    publicApiLimiter,
    adminWriteLimiter,
    adminReadLimiter,
    globalLimiter,
    emailLimiter,
    uploadLimiter,

    // Blacklist utilities
    isBlacklisted,
    blacklistIP,
    getBlacklistStatus,
    manualBlacklist,
    removeFromBlacklist
};
