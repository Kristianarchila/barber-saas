const rateLimit = require('express-rate-limit');
const Logger = require('../shared/Logger');

/**
 * Factory for creating customized rate limiters
 */
const createLimiter = (options = {}) => {
    return rateLimit({
        windowMs: options.windowMs || 15 * 60 * 1000, // Default 15 minutes
        max: options.max || 100, // Default 100 requests per windowMs
        message: {
            success: false,
            message: options.message || 'Demasiadas solicitudes, intente más tarde.'
        },
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        handler: (req, res, next, options) => {
            Logger.warn('Security', 'Rate limit exceeded', {
                ip: req.ip,
                method: req.method,
                path: req.path,
                max: options.max
            });
            res.status(options.statusCode).send(options.message);
        },
        ...options
    });
};

/**
 * Aggressive limiter for sensitive endpoints (Auth, Passwords)
 */
const authLimiter = createLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Max 10 attempts
    message: 'Demasiados intentos de acceso. Por seguridad, espere 15 minutos.'
});

/**
 * Public API limiter (Reservations, Public data)
 */
const publicApiLimiter = createLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // Aumentado de 30 a 60 para permitir mayor fluidez en reservas
    message: 'Velocidad de solicitud excedida. Por favor espere un momento.'
});

/**
 * Global API limiter (General protection)
 */
const globalLimiter = createLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Max 500 requests
    message: 'Límite de tráfico global excedido.'
});

module.exports = {
    authLimiter,
    publicApiLimiter,
    globalLimiter
};
