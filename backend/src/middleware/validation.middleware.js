const { z } = require('zod');

/**
 * Validation Middleware
 * 
 * Validates request data against Zod schemas
 * Returns 400 with detailed error messages on validation failure
 */

/**
 * Validate request against Zod schema
 * 
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @param {string} source - Where to get data from: 'body', 'query', 'params'
 * @returns {Function} Express middleware
 * 
 * @example
 * router.post('/reservas', 
 *   validate(createReservaSchema, 'body'),
 *   reservasController.create
 * );
 */
function validate(schema, source = 'body') {
    return async (req, res, next) => {
        try {
            // Validate and parse the data
            const validated = await schema.parseAsync(req[source]);

            // Replace request data with validated data
            req[source] = validated;

            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Format Zod errors for user-friendly response
                // Zod uses error.issues, NOT error.errors
                const errors = (error.issues || []).map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                    code: err.code
                }));

                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors
                });
            }

            // Pass other errors to error handler
            next(error);
        }
    };
}

/**
 * Validate multiple sources (body, query, params)
 * 
 * @param {Object} schemas - Object with schemas for each source
 * @param {z.ZodSchema} schemas.body - Schema for request body
 * @param {z.ZodSchema} schemas.query - Schema for query parameters
 * @param {z.ZodSchema} schemas.params - Schema for route parameters
 * @returns {Function} Express middleware
 * 
 * @example
 * router.put('/reservas/:id',
 *   validateMultiple({
 *     params: z.object({ id: objectIdSchema }),
 *     body: updateReservaSchema
 *   }),
 *   reservasController.update
 * );
 */
function validateMultiple(schemas) {
    return async (req, res, next) => {
        try {
            const errors = [];

            // Validate each source
            for (const [source, schema] of Object.entries(schemas)) {
                if (schema) {
                    try {
                        req[source] = await schema.parseAsync(req[source]);
                    } catch (error) {
                        if (error instanceof z.ZodError) {
                            // Zod uses error.issues, NOT error.errors
                            errors.push(...(error.issues || []).map(err => ({
                                source,
                                field: err.path.join('.'),
                                message: err.message,
                                code: err.code
                            })));
                        } else {
                            throw error;
                        }
                    }
                }
            }

            // If any validation errors, return them all
            if (errors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}

/**
 * Optional validation - validates if data is present, but doesn't require it
 * 
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @param {string} source - Where to get data from
 * @returns {Function} Express middleware
 */
function validateOptional(schema, source = 'body') {
    return async (req, res, next) => {
        // Skip validation if no data present
        if (!req[source] || Object.keys(req[source]).length === 0) {
            return next();
        }

        return validate(schema, source)(req, res, next);
    };
}

module.exports = {
    validate,
    validateMultiple,
    validateOptional
};
