const Joi = require('joi');

/**
 * Middleware genérico para validar datos con Joi
 * 
 * @param {Joi.ObjectSchema} schema - El schema de Joi a validar
 * @param {string} source - La fuente de los datos ('body', 'query', 'params')
 * @returns {Function} Express middleware
 */
const validateJoi = (schema, source = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[source], {
            abortEarly: false, // Retornar todos los errores
            stripUnknown: true, // Eliminar campos no definidos en el schema
            allowUnknown: false // No permitir campos desconocidos
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message.replace(/['"]/g, '')
            }));

            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors
            });
        }

        // Reemplazar los datos originales con los datos validados/sanitizados
        req[source] = value;
        next();
    };
};

module.exports = validateJoi;
