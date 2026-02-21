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
    // Barberia data
    nombre: nameSchema,
    slug: slugSchema,
    email: emailSchema,
    telefono: phoneSchema.optional(),
    rut: z.string().trim().optional(),
    direccion: z.string().trim().optional(),
    plan: z.enum(['trial', 'basico', 'premium', 'pro']).default('basico').optional(),
    diasTrial: z.number().int().min(0).max(365).default(14).optional(),

    // Admin user data
    adminNombre: nameSchema,
    adminEmail: emailSchema,
    adminPassword: z.string().min(6, 'Password must be at least 6 characters'),
    adminTelefono: phoneSchema.optional(),

    // Legacy/Extra UI fields
    descripcion: z.string()
        .trim()
        .max(1000, 'Description too long')
        .optional(),
    logo: z.string().url('Invalid logo URL').optional(),
    activa: z.boolean().default(true)
});

// ==================== Update Barbería ====================

/**
 * Schema for updating a barbería
 * Used in: PUT /api/superadmin/barberias/:id
 */
const updateBarberiaSchema = z.object({
    nombre: nameSchema.optional(),
    email: emailSchema.optional(),
    telefono: phoneSchema.optional(),
    direccion: z.string().trim().optional(),
    rut: z.string().trim().optional(),
    plan: z.enum(['trial', 'basico', 'premium', 'pro']).optional(),
    descripcion: z.string()
        .trim()
        .max(1000, 'Description too long')
        .optional(),
    logo: z.string().url('Invalid logo URL').optional(),
    activa: z.boolean().optional()
});

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
