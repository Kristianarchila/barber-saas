const Joi = require('joi');

// Reusable ObjectId validation
const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
    'string.pattern.base': '{#label} debe ser un ID de MongoDB válido'
});

// ==================== RESERVAS ====================
const crearReservaSchema = Joi.object({
    barberoId: objectId.required(),
    servicioId: objectId.required(),
    clienteId: objectId.optional(),
    nombreCliente: Joi.string().trim().min(2).max(100).required(),
    emailCliente: Joi.string().email().trim().required(),
    telefonoCliente: Joi.string().trim().optional(),
    fecha: Joi.date().iso().required().messages({
        'date.format': 'La fecha debe tener un formato ISO válido (YYYY-MM-DD)'
    }),
    hora: Joi.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).required().messages({
        'string.pattern.base': 'La hora debe tener el formato HH:mm'
    }),
    notas: Joi.string().max(500).trim().optional().allow('')
});

const updateReservaSchema = Joi.object({
    estado: Joi.string().valid('RESERVADA', 'COMPLETADA', 'CANCELADA').optional(),
    notas: Joi.string().max(500).trim().optional().allow('')
});

const reservaParamsSchema = Joi.object({
    id: objectId.required()
});

const cancelTokenSchema = Joi.object({
    token: Joi.string().length(64).hex().required()
});

const queryReservasSchema = Joi.object({
    barberoId: objectId.optional(),
    clienteId: objectId.optional(),
    estado: Joi.string().valid('RESERVADA', 'COMPLETADA', 'CANCELADA').optional(),
    fechaInicio: Joi.date().iso().optional(),
    fechaFin: Joi.date().iso().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
});

// ==================== SERVICIOS ====================
const servicioSchema = Joi.object({
    nombre: Joi.string().trim().min(3).max(100).required(),
    descripcion: Joi.string().trim().max(500).optional().allow(''),
    precio: Joi.number().positive().required(),
    duracion: Joi.number().integer().min(5).max(480).required(),
    activo: Joi.boolean().default(true),
    categoria: Joi.string().trim().max(50).optional().allow(''),
    imagen: Joi.string().uri().optional().allow('')
});

const servicioParamsSchema = Joi.object({
    id: objectId.required()
});

// ==================== BARBEROS ====================
const crearBarberoSchema = Joi.object({
    nombre: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().email().trim().required(),
    password: Joi.string().min(6).max(50).required(),
    // barberiaId puede venir como string (ObjectId string) o como objeto (inyectado por middleware)
    barberiaId: Joi.alternatives().try(
        objectId,
        Joi.object() // Acepta ObjectId de Mongoose
    ).required(),
    sucursalId: objectId.optional(),
    especialidades: Joi.array().items(Joi.string().trim()).optional(),
    experiencia: Joi.number().integer().min(0).max(100).optional(), // Años de experiencia como número
    descripcion: Joi.string().trim().max(1000).optional().allow(''),
    foto: Joi.string().optional().allow(''), // Acepta base64 o URL
    activo: Joi.boolean().default(true)
});

const barberoParamsSchema = Joi.object({
    id: objectId.required()
});

// ==================== PRODUCTOS ====================
const productoSchema = Joi.object({
    nombre: Joi.string().trim().min(2).max(100).required(),
    descripcion: Joi.string().trim().max(1000).optional().allow(''),
    precio: Joi.number().min(0).required(),
    stock: Joi.number().integer().min(0).required(),
    categoria: Joi.string().trim().required(),
    codigoBarras: Joi.string().trim().optional().allow(''),
    imagen: Joi.string().uri().optional().allow(''),
    activo: Joi.boolean().default(true),
    destacado: Joi.boolean().default(false)
});

const productoParamsSchema = Joi.object({
    id: objectId.required()
});

const queryProductosSchema = Joi.object({
    categoria: Joi.string().trim().optional(),
    busqueda: Joi.string().trim().optional(),
    minPrecio: Joi.number().min(0).optional(),
    maxPrecio: Joi.number().min(0).optional(),
    orden: Joi.string().valid('precio_asc', 'precio_desc', 'recientes').optional()
});

module.exports = {
    crearReservaSchema,
    updateReservaSchema,
    reservaParamsSchema,
    cancelTokenSchema,
    queryReservasSchema,
    servicioSchema,
    servicioParamsSchema,
    crearBarberoSchema,
    barberoParamsSchema,
    productoSchema,
    productoParamsSchema,
    queryProductosSchema
};
