const { z } = require('zod');
const {
    objectIdSchema,
    nameSchema,
    moneySchema,
    shortTextSchema
} = require('./common.schemas');

/**
 * Servicio Validation Schemas
 * 
 * Schemas for service-related endpoints
 */

// ==================== Create Servicio ====================

/**
 * Schema for creating a new service
 * Used in: POST /api/barberias/:slug/admin/servicios
 */
const createServicioSchema = z.object({
    nombre: nameSchema,
    descripcion: shortTextSchema,
    precio: moneySchema,
    duracion: z.number()
        .int('Duration must be an integer')
        .positive('Duration must be positive')
        .min(5, 'Duration must be at least 5 minutes')
        .max(480, 'Duration cannot exceed 8 hours'),
    activo: z.boolean().default(true),
    categoria: z.string()
        .trim()
        .max(50, 'Category too long')
        .optional()
}).passthrough();

// ==================== Update Servicio ====================

/**
 * Schema for updating a service
 * Used in: PUT /api/barberias/:slug/admin/servicios/:id
 */
const updateServicioSchema = z.object({
    nombre: nameSchema.optional(),
    descripcion: shortTextSchema,
    precio: moneySchema.optional(),
    duracion: z.number()
        .int('Duration must be an integer')
        .positive('Duration must be positive')
        .min(5, 'Duration must be at least 5 minutes')
        .max(480, 'Duration cannot exceed 8 hours')
        .optional(),
    activo: z.boolean().optional(),
    categoria: z.string()
        .trim()
        .max(50, 'Category too long')
        .optional()
}).passthrough();

// ==================== Servicio Params ====================

/**
 * Schema for service ID parameter
 * Used in: GET/PUT/DELETE /api/servicios/:id
 */
const servicioParamsSchema = z.object({
    id: objectIdSchema
});

// ==================== Exports ====================

module.exports = {
    createServicioSchema,
    updateServicioSchema,
    servicioParamsSchema
};
