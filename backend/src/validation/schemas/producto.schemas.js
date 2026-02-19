const { z } = require('zod');
const {
    objectIdSchema,
    nameSchema,
    moneySchema,
    shortTextSchema,
    longTextSchema
} = require('./common.schemas');

/**
 * Producto Validation Schemas
 * 
 * Schemas for product-related endpoints
 */

// ==================== Create Producto ====================

/**
 * Schema for creating a new product
 * Used in: POST /api/barberias/:slug/productos
 */
const createProductoSchema = z.object({
    nombre: nameSchema,
    descripcion: longTextSchema,
    precio: moneySchema,
    stock: z.number()
        .int('Stock must be an integer')
        .nonnegative('Stock cannot be negative')
        .default(0),
    categoria: z.string()
        .trim()
        .max(50, 'Category too long')
        .optional(),
    imagenes: z.array(z.string().url('Invalid image URL'))
        .max(5, 'Maximum 5 images allowed')
        .optional(),
    activo: z.boolean().default(true),
    destacado: z.boolean().default(false)
}).strict();

// ==================== Update Producto ====================

/**
 * Schema for updating a product
 * Used in: PUT /api/barberias/:slug/productos/:id
 */
const updateProductoSchema = z.object({
    nombre: nameSchema.optional(),
    descripcion: longTextSchema,
    precio: moneySchema.optional(),
    stock: z.number()
        .int('Stock must be an integer')
        .nonnegative('Stock cannot be negative')
        .optional(),
    categoria: z.string()
        .trim()
        .max(50, 'Category too long')
        .optional(),
    imagenes: z.array(z.string().url('Invalid image URL'))
        .max(5, 'Maximum 5 images allowed')
        .optional(),
    activo: z.boolean().optional(),
    destacado: z.boolean().optional()
}).strict();

// ==================== Query Productos ====================

/**
 * Schema for querying products
 * Used in: GET /api/barberias/:slug/productos
 */
const queryProductosSchema = z.object({
    categoria: z.string().optional(),
    activo: z.coerce.boolean().optional(),
    destacado: z.coerce.boolean().optional(),
    precioMin: z.coerce.number().nonnegative().optional(),
    precioMax: z.coerce.number().nonnegative().optional(),
    page: z.coerce.number().int().positive().default(1).optional(),
    limit: z.coerce.number().int().positive().max(100).default(20).optional()
});

// ==================== Producto Params ====================

/**
 * Schema for product ID parameter
 * Used in: GET/PUT/DELETE /api/productos/:id
 */
const productoParamsSchema = z.object({
    id: objectIdSchema
});

// ==================== Exports ====================

module.exports = {
    createProductoSchema,
    updateProductoSchema,
    queryProductosSchema,
    productoParamsSchema
};
