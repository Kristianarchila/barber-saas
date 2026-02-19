const Joi = require('joi');

/**
 * Schema de validación para crear una reseña
 */
const crearResenaSchema = Joi.object({
    // Token de la reserva (requerido)
    token: Joi.string()
        .required()
        .length(64) // crypto.randomBytes(32).toString('hex') = 64 chars
        .hex()
        .messages({
            'string.empty': 'El token es requerido',
            'string.length': 'Token inválido',
            'string.hex': 'Token inválido'
        }),

    // Calificación general (requerida)
    calificacionGeneral: Joi.number()
        .integer()
        .min(1)
        .max(5)
        .required()
        .messages({
            'number.base': 'La calificación general debe ser un número',
            'number.min': 'La calificación general debe ser al menos 1',
            'number.max': 'La calificación general debe ser máximo 5',
            'any.required': 'La calificación general es requerida'
        }),

    // Calificaciones detalladas (opcionales)
    calificacionServicio: Joi.number()
        .integer()
        .min(1)
        .max(5)
        .optional()
        .messages({
            'number.min': 'La calificación de servicio debe ser al menos 1',
            'number.max': 'La calificación de servicio debe ser máximo 5'
        }),

    calificacionAtencion: Joi.number()
        .integer()
        .min(1)
        .max(5)
        .optional()
        .messages({
            'number.min': 'La calificación de atención debe ser al menos 1',
            'number.max': 'La calificación de atención debe ser máximo 5'
        }),

    calificacionLimpieza: Joi.number()
        .integer()
        .min(1)
        .max(5)
        .optional()
        .messages({
            'number.min': 'La calificación de limpieza debe ser al menos 1',
            'number.max': 'La calificación de limpieza debe ser máximo 5'
        }),

    // Comentario (opcional)
    comentario: Joi.string()
        .max(500)
        .trim()
        .optional()
        .allow('')
        .messages({
            'string.max': 'El comentario no puede exceder 500 caracteres'
        })
});

/**
 * Middleware de validación para crear reseña
 */
const validateCrearResena = (req, res, next) => {
    // Combinar query params y body para validación
    const dataToValidate = {
        token: req.query.token,
        ...req.body
    };

    const { error, value } = crearResenaSchema.validate(dataToValidate, {
        abortEarly: false, // Retornar todos los errores
        stripUnknown: true // Remover campos no definidos en schema
    });

    if (error) {
        const errors = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
        }));

        return res.status(400).json({
            success: false,
            message: 'Error de validación',
            errors
        });
    }

    // Reemplazar req.body con datos validados y sanitizados
    req.validatedData = value;
    next();
};

module.exports = {
    crearResenaSchema,
    validateCrearResena
};
