const { z } = require('zod');
const {
    objectIdSchema,
    emailSchema,
    nameSchema,
    slugSchema,
    phoneSchema,
    addressSchema
} = require('./common.schemas');

/**
 * Barbería Validation Schemas
 * 
 * Schemas for barbería-related endpoints
 */

// ==================== Create Barbería ====================

/**
 * Schema for creating a new barbería
 * Used in: POST /api/superadmin/barberias
 */
const createBarberiaSchema = z.object({
    nombre: nameSchema,
    email: emailSchema,
    telefono: phoneSchema.optional(),
    direccion: addressSchema.optional(),
    descripcion: z.string()
        .trim()
        .max(1000, 'Description too long')
        .optional(),
    logo: z.string().url('Invalid logo URL').optional(),
    activa: z.boolean().default(true)
}).strict();

// ==================== Update Barbería ====================

/**
 * Schema for updating a barbería
 * Used in: PUT /api/superadmin/barberias/:id
 */
const updateBarberiaSchema = z.object({
    nombre: nameSchema.optional(),
    email: emailSchema.optional(),
    telefono: phoneSchema.optional(),
    direccion: addressSchema.optional(),
    descripcion: z.string()
        .trim()
        .max(1000, 'Description too long')
        .optional(),
    logo: z.string().url('Invalid logo URL').optional(),
    activa: z.boolean().optional()
}).strict();

// ==================== Barbería Params ====================

/**
 * Schema for barbería slug parameter
 * Used in: GET/PUT/DELETE /api/barberias/:slug
 */
const barberiaSlugParamsSchema = z.object({
    slug: slugSchema
});

/**
 * Schema for barbería ID parameter
 * Used in: GET/PUT/DELETE /api/superadmin/barberias/:id
 */
const barberiaIdParamsSchema = z.object({
    id: objectIdSchema
});

// ==================== Exports ====================

module.exports = {
    createBarberiaSchema,
    updateBarberiaSchema,
    barberiaSlugParamsSchema,
    barberiaIdParamsSchema
};
