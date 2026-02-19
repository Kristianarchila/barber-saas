const rateLimit = require("express-rate-limit");

/**
 * Limite general para todas las peticiones a la API
 * En desarrollo: límites más altos para evitar bloqueos
 */
exports.generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 1000 en dev, 100 en prod
    message: {
        message: "Demasiadas peticiones desde esta IP, por favor intenta de nuevo en 15 minutos"
    },
    standardHeaders: true, // Retorna info del límite en los headers `RateLimit-*`
    legacyHeaders: false, // Desactiva los headers `X-RateLimit-*`
    skip: (req) => {
        // Skip rate limiting para rutas públicas en desarrollo
        if (process.env.NODE_ENV !== 'production' && req.path.startsWith('/api/public')) {
            return true;
        }
        return false;
    }
});

/**
 * Limite más estricto para rutas de autenticación (Login/Registro)
 * CRÍTICO: Protección contra brute force attacks
 */
exports.authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: process.env.NODE_ENV === 'production' ? 5 : 20, // 5 intentos en prod, 20 en dev
    message: {
        message: "Demasiados intentos de inicio de sesión. Por favor intenta de nuevo en 15 minutos."
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false, // Contar también requests exitosos
    skipFailedRequests: false
});
