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
    // barberiaId debe ser un MongoID válido (string de 24 hex chars)
    // El middleware extractBarberiaId lo inyecta en req.barberiaId, no en el body.
    // El controlador toma req.barberiaId.toString() antes de pasarlo al DTO.
    barberiaId: objectId.required(),
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

// ==================== GENERIC PARAMS ====================
const mongoIdParamsSchema = Joi.object({
    id: objectId.required()
});

// ==================== CUPONES ====================
const cuponSchema = Joi.object({
    codigo: Joi.string().trim().uppercase().alphanum().min(3).max(20).required()
        .messages({ 'string.alphanum': 'El código solo puede contener letras y números' }),
    tipo: Joi.string().valid('porcentaje', 'monto_fijo').required(),
    valor: Joi.number().positive().required()
        .when('tipo', {
            is: 'porcentaje',
            then: Joi.number().max(100).messages({ 'number.max': 'El descuento en porcentaje no puede superar el 100%' })
        }),
    usoMaximo: Joi.number().integer().min(1).optional().allow(null),
    usosPorUsuario: Joi.number().integer().min(1).default(1),
    montoMinimo: Joi.number().min(0).optional().allow(null),
    fechaInicio: Joi.date().iso().optional().allow(null),
    fechaFin: Joi.date().iso().min(Joi.ref('fechaInicio')).optional().allow(null)
        .messages({ 'date.min': 'La fecha de fin no puede ser anterior a la fecha de inicio' }),
    activo: Joi.boolean().default(true),
    descripcion: Joi.string().trim().max(300).optional().allow('')
});

const validarCuponSchema = Joi.object({
    codigo: Joi.string().trim().min(1).required(),
    monto: Joi.number().min(0).optional()
});

// ==================== INVENTARIO ====================
const inventarioSchema = Joi.object({
    nombre: Joi.string().trim().min(2).max(100).required(),
    descripcion: Joi.string().trim().max(500).optional().allow(''),
    cantidad: Joi.number().integer().min(0).required(),
    unidad: Joi.string().trim().min(1).max(30).required(),
    stockMinimo: Joi.number().integer().min(0).default(0),
    precio: Joi.number().min(0).optional(),
    categoria: Joi.string().trim().max(50).optional().allow(''),
    proveedor: objectId.optional()
});

const movimientoSchema = Joi.object({
    tipo: Joi.string().valid('entrada', 'salida', 'ajuste').required(),
    cantidad: Joi.number().integer().positive().required()
        .messages({ 'number.positive': 'La cantidad debe ser mayor a 0' }),
    motivo: Joi.string().trim().max(200).optional().allow('')
});

// ==================== PROVEEDORES ====================
const proveedorSchema = Joi.object({
    nombre: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().email().trim().optional().allow(''),
    telefono: Joi.string().trim().max(30).optional().allow(''),
    rut: Joi.string().trim().max(20).optional().allow(''),
    diasPago: Joi.number().integer().min(0).max(180).default(30),
    notas: Joi.string().trim().max(500).optional().allow(''),
    contacto: Joi.object({
        nombre: Joi.string().trim().max(100).optional().allow(''),
        cargo: Joi.string().trim().max(100).optional().allow('')
    }).optional()
});

// ==================== WAITING LIST ====================
const joinWaitingListSchema = Joi.object({
    barberiaId: objectId.required(),
    barberoId: objectId.required(),
    servicioId: objectId.required(),
    nombre: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().email().trim().required(),
    telefono: Joi.string().trim().max(30).optional().allow(''),
    fechaPreferida: Joi.date().iso().optional().allow(null),
    rangoHorario: Joi.object({
        inicio: Joi.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
        fin: Joi.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional()
    }).optional()
});

// ==================== AUTH PROFILE ====================
const updateProfileSchema = Joi.object({
    nombre: Joi.string().trim().min(2).max(100).optional(),
    telefono: Joi.string().trim().regex(/^\+?[1-9]\d{1,14}$/).optional().allow('')
        .messages({ 'string.pattern.base': 'El teléfono debe tener un formato válido' })
}).min(1).messages({ 'object.min': 'Debes enviar al menos un campo para actualizar' });

// ==================== HORARIOS ====================
const diaHorarioSchema = Joi.object({
    dia: Joi.string().valid('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo').required(),
    activo: Joi.boolean().default(true),
    inicio: Joi.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).required()
        .messages({ 'string.pattern.base': 'La hora de inicio debe tener formato HH:mm' }),
    fin: Joi.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).required()
        .messages({ 'string.pattern.base': 'La hora de fin debe tener formato HH:mm' })
});

const horarioSchema = Joi.object({
    barberoId: objectId.required(),
    diasHorario: Joi.array().items(diaHorarioSchema).min(1).required()
        .messages({ 'array.min': 'Debes configurar al menos un día en el horario' })
});

// ==================== BLOQUEOS ====================
const bloqueoSchema = Joi.object({
    barberoId: objectId.required(),
    fechaInicio: Joi.date().iso().required(),
    fechaFin: Joi.date().iso().min(Joi.ref('fechaInicio')).required()
        .messages({ 'date.min': 'La fecha de fin no puede ser anterior a la fecha de inicio' }),
    motivo: Joi.string().trim().max(200).optional().allow(''),
    horaInicio: Joi.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional()
        .messages({ 'string.pattern.base': 'La hora debe tener formato HH:mm' }),
    horaFin: Joi.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional()
        .messages({ 'string.pattern.base': 'La hora debe tener formato HH:mm' }),
    diaCompleto: Joi.boolean().default(true)
});

// ==================== EGRESOS ====================
const CATEGORIAS_EGRESO = ['alquiler', 'suministros', 'marketing', 'personal', 'equipamiento', 'mantenimiento', 'impuestos', 'otros'];

const egresoSchema = Joi.object({
    concepto: Joi.string().trim().min(2).max(200).required(),
    monto: Joi.number().positive().required()
        .messages({ 'number.positive': 'El monto del egreso debe ser mayor a 0' }),
    categoria: Joi.string().valid(...CATEGORIAS_EGRESO).required(),
    fecha: Joi.date().iso().max('now').required()
        .messages({ 'date.max': 'La fecha del egreso no puede ser en el futuro' }),
    descripcion: Joi.string().trim().max(500).optional().allow(''),
    comprobante: Joi.string().trim().optional().allow('')
});

// ==================== VENTAS ====================
const ventaItemSchema = Joi.object({
    productoId: objectId.required(),
    cantidad: Joi.number().integer().positive().required(),
    precioUnitario: Joi.number().positive().required()
});

const ventaSchema = Joi.object({
    items: Joi.array().items(ventaItemSchema).min(1).required()
        .messages({ 'array.min': 'La venta debe tener al menos un producto' }),
    metodoPago: Joi.string().valid('efectivo', 'tarjeta', 'transferencia', 'otro').required(),
    descuento: Joi.number().min(0).max(100).default(0),
    notas: Joi.string().trim().max(300).optional().allow('')
});

// ==================== PEDIDOS ====================
const pedidoItemSchema = Joi.object({
    productoId: objectId.required(),
    cantidad: Joi.number().integer().positive().required(),
    precioUnitario: Joi.number().min(0).optional()
});

const pedidoSchema = Joi.object({
    items: Joi.array().items(pedidoItemSchema).min(1).required()
        .messages({ 'array.min': 'El pedido debe tener al menos un producto' }),
    direccionEntrega: Joi.object({
        calle: Joi.string().trim().required(),
        ciudad: Joi.string().trim().required(),
        codigoPostal: Joi.string().trim().optional()
    }).optional(),
    notas: Joi.string().trim().max(300).optional().allow(''),
    cuponCodigo: Joi.string().trim().optional().allow('')
});

const actualizarEstadoPedidoSchema = Joi.object({
    estado: Joi.string().valid('pendiente', 'confirmado', 'preparando', 'enviado', 'entregado', 'cancelado').required()
});

// ==================== CHANGE PASSWORD ====================
const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().min(1).required()
        .messages({ 'string.empty': 'La contraseña actual es requerida' }),
    newPassword: Joi.string().min(8).max(100)
        .regex(/[A-Z]/, 'uppercase')
        .regex(/[0-9]/, 'number')
        .required()
        .messages({
            'string.min': 'La nueva contraseña debe tener al menos 8 caracteres',
            'string.pattern.name': 'La nueva contraseña debe contener al menos una mayúscula y un número'
        })
});

module.exports = {
    // Reservas
    crearReservaSchema,
    updateReservaSchema,
    reservaParamsSchema,
    cancelTokenSchema,
    queryReservasSchema,
    // Servicios
    servicioSchema,
    servicioParamsSchema,
    // Barberos
    crearBarberoSchema,
    barberoParamsSchema,
    // Productos
    productoSchema,
    productoParamsSchema,
    queryProductosSchema,
    // Cupones
    cuponSchema,
    validarCuponSchema,
    // Inventario
    inventarioSchema,
    movimientoSchema,
    // Proveedores
    proveedorSchema,
    // Waiting List
    joinWaitingListSchema,
    // Auth
    updateProfileSchema,
    changePasswordSchema,
    // Horarios
    horarioSchema,
    // Bloqueos
    bloqueoSchema,
    // Egresos
    egresoSchema,
    // Ventas
    ventaSchema,
    // Pedidos
    pedidoSchema,
    actualizarEstadoPedidoSchema,
    // Params
    mongoIdParamsSchema
};

