const { z } = require('zod');
const {
    objectIdSchema,
    emailSchema,
    dateStringSchema,
    timeStringSchema,
    nameSchema,
    shortTextSchema
} = require('./common.schemas');

/**
 * Reserva Validation Schemas
 * 
 * Schemas for reservation-related endpoints
 */

// ==================== Create Reserva ====================

/**
 * Schema for creating a new reservation
 * Used in: POST /api/public/:slug/barberos/:id/reservar
 */
const createReservaSchema = z.object({
    barberoId: objectIdSchema,
    servicioId: objectIdSchema,
    clienteId: objectIdSchema.optional(),
    nombreCliente: nameSchema,
    emailCliente: emailSchema,
    fecha: dateStringSchema.refine((date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const inputDate = new Date(date);
        return inputDate >= today;
    }, 'Reservation date must be today or in the future'),
    hora: timeStringSchema,
    notas: shortTextSchema
}).strict(); // Reject unknown fields

// ==================== Update Reserva ====================

/**
 * Schema for updating a reservation
 * Used in: PUT /api/reservas/:id
 */
const updateReservaSchema = z.object({
    estado: z.enum(['RESERVADA', 'COMPLETADA', 'CANCELADA']).optional(),
    notas: shortTextSchema
}).strict();

// ==================== Query Reservas ====================

/**
 * Schema for querying reservations
 * Used in: GET /api/reservas
 */
const queryReservasSchema = z.object({
    barberoId: objectIdSchema.optional(),
    clienteId: objectIdSchema.optional(),
    estado: z.enum(['RESERVADA', 'COMPLETADA', 'CANCELADA']).optional(),
    fechaInicio: dateStringSchema.optional(),
    fechaFin: dateStringSchema.optional(),
    page: z.coerce.number().int().positive().default(1).optional(),
    limit: z.coerce.number().int().positive().max(100).default(20).optional()
});

// ==================== Reserva Params ====================

/**
 * Schema for reservation ID parameter
 * Used in: GET/PUT/DELETE /api/reservas/:id
 */
const reservaParamsSchema = z.object({
    id: objectIdSchema
});

// ==================== Cancel by Token ====================

/**
 * Schema for cancellation token
 * Used in: POST /api/reservas/cancel/:token
 */
const cancelTokenSchema = z.object({
    token: z.string().length(64, 'Invalid cancellation token')
});

// ==================== Exports ====================

module.exports = {
    createReservaSchema,
    updateReservaSchema,
    queryReservasSchema,
    reservaParamsSchema,
    cancelTokenSchema
};
