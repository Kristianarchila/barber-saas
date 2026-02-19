const { xss } = require('express-xss-sanitizer');

/**
 * Sanitization Middleware
 * 
 * Protects against:
 * - NoSQL injection attacks (removes $ and . operators)
 * - XSS attacks (sanitizes HTML/script tags)
 */

/**
 * Custom MongoDB sanitization (Express 5 compatible)
 * Recursively sanitizes objects without modifying read-only properties
 */
function sanitizeValue(value, replaceWith = '_') {
    if (value === null || value === undefined) {
        return value;
    }

    // Handle arrays
    if (Array.isArray(value)) {
        return value.map(item => sanitizeValue(item, replaceWith));
    }

    // Handle objects
    if (typeof value === 'object' && !(value instanceof Date)) {
        const sanitized = {};
        for (const key in value) {
            // Use Object.prototype.hasOwnProperty.call() to handle objects without hasOwnProperty
            if (Object.prototype.hasOwnProperty.call(value, key)) {
                // Replace keys containing $ or . (MongoDB operators)
                const sanitizedKey = key.replace(/[\$\.]/g, replaceWith);
                sanitized[sanitizedKey] = sanitizeValue(value[key], replaceWith);
            }
        }
        return sanitized;
    }

    // Return primitives as-is
    return value;
}

/**
 * Configure MongoDB sanitization middleware
 * Compatible with Express 5.x (doesn't modify read-only properties)
 */
function configureMongoSanitize() {
    return (req, res, next) => {
        try {
            // Sanitize body
            if (req.body && typeof req.body === 'object') {
                try {
                    req.body = sanitizeValue(req.body);
                } catch (err) {
                    console.warn('⚠️ [Security] Could not sanitize body:', err.message);
                }
            }

            // Sanitize params
            if (req.params && typeof req.params === 'object') {
                try {
                    req.params = sanitizeValue(req.params);
                } catch (err) {
                    console.warn('⚠️ [Security] Could not sanitize params:', err.message);
                }
            }

            // Sanitize query - Express 5 special handling
            if (req.query && typeof req.query === 'object' && Object.keys(req.query).length > 0) {
                try {
                    // Create a plain copy of query
                    const plainQuery = {};
                    for (const key in req.query) {
                        if (Object.prototype.hasOwnProperty.call(req.query, key)) {
                            plainQuery[key] = req.query[key];
                        }
                    }

                    // Sanitize the plain copy
                    const sanitized = sanitizeValue(plainQuery);

                    // Redefine query property
                    Object.defineProperty(req, 'query', {
                        value: sanitized,
                        writable: true,
                        enumerable: true,
                        configurable: true
                    });
                } catch (err) {
                    console.warn('⚠️ [Security] Could not sanitize query:', err.message);
                }
            }

            // Always call next() to prevent hanging
            next();
        } catch (error) {
            console.error('❌ [Security] Critical error in sanitization middleware:', error);
            // Always call next() even on error to prevent hanging
            next();
        }
    };
}

/**
 * Configure XSS sanitization
 * Removes potentially dangerous HTML/JavaScript from input
 */
function configureXssSanitize() {
    return xss({
        // Sanitize these request properties
        allowedKeys: ['body', 'query', 'params'],

        // Custom sanitization options
        sanitizeBody: true,
        sanitizeQuery: true,
        sanitizeParams: true
    });
}

/**
 * Combined sanitization middleware
 * Apply both NoSQL and XSS protection
 * 
 * @returns {Array} Array of middleware functions
 * 
 * @example
 * // In app.js
 * app.use(sanitizeInputs());
 */
function sanitizeInputs() {
    return [
        configureMongoSanitize(),
        configureXssSanitize()
    ];
}

/**
 * Sanitize specific field manually
 * Useful for custom sanitization logic
 * 
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
function sanitizeString(input) {
    if (typeof input !== 'string') return input;

    // Remove MongoDB operators
    let sanitized = input.replace(/[$\.]/g, '_');

    // Basic XSS protection (remove script tags and event handlers)
    sanitized = sanitized
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/on\w+\s*=\s*[^\s>]*/gi, '');

    return sanitized;
}

module.exports = {
    sanitizeInputs,
    configureMongoSanitize,
    configureXssSanitize,
    sanitizeString
};
