const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for public reservation creation
 * Prevents spam and overbooking attacks
 */
exports.reservaLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 reservations per IP per 15 minutes
    message: 'Demasiadas reservas desde esta IP. Por favor, intenta más tarde.',
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for authenticated admin users
    skip: (req) => req.user && (req.user.rol === 'BARBERIA_ADMIN' || req.user.rol === 'SUPER_ADMIN')
});

/**
 * Rate limiter for reservation cancellations
 * Prevents malicious mass cancellations
 */
exports.cancelLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 cancellations per IP per hour
    message: 'Demasiadas cancelaciones desde esta IP. Por favor, intenta más tarde.',
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Rate limiter for public reviews
 * Prevents review spam
 */
exports.reviewLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 3, // 3 reviews per IP per day
    message: 'Demasiadas reseñas desde esta IP. Por favor, intenta mañana.',
    standardHeaders: true,
    legacyHeaders: false
});
