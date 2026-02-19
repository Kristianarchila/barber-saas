const { z } = require('zod');

/**
 * Common Validation Schemas
 * 
 * Reusable Zod schemas for common data types
 * Used across all endpoint validations
 */

// ==================== IDs ====================

/**
 * MongoDB ObjectId validation
 * Validates 24-character hexadecimal string
 */
const objectIdSchema = z.string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format')
    .describe('MongoDB ObjectId');

/**
 * Optional ObjectId (can be null or undefined)
 */
const optionalObjectIdSchema = objectIdSchema.optional();

// ==================== Email ====================

/**
 * Email validation with normalization
 * - Validates email format
 * - Converts to lowercase
 * - Trims whitespace
 * - Max length 255 characters
 */
const emailSchema = z.string()
    .email('Invalid email format')
    .toLowerCase()
    .trim()
    .max(255, 'Email too long')
    .describe('Email address');

// ==================== Phone ====================

/**
 * Phone number validation
 * Supports international format: +[country code][number]
 * Example: +5491123456789
 */
const phoneSchema = z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional()
    .describe('Phone number (international format)');

// ==================== Money ====================

/**
 * Money amount validation
 * - Non-negative
 * - Finite number
 * - Max 999,999.99
 */
const moneySchema = z.number()
    .nonnegative('Amount must be non-negative')
    .finite('Amount must be finite')
    .max(999999.99, 'Amount too large')
    .describe('Money amount');

/**
 * Currency code validation
 * ISO 4217 currency codes
 */
const currencySchema = z.enum(['USD', 'ARS', 'EUR', 'BRL'])
    .default('USD')
    .describe('Currency code');

// ==================== Dates & Times ====================

/**
 * Date string validation (YYYY-MM-DD)
 */
const dateStringSchema = z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (expected YYYY-MM-DD)')
    .refine((date) => {
        const parsed = new Date(date);
        return !isNaN(parsed.getTime());
    }, 'Invalid date')
    .describe('Date (YYYY-MM-DD)');

/**
 * Time string validation (HH:MM)
 * 24-hour format
 */
const timeStringSchema = z.string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (expected HH:MM)')
    .describe('Time (HH:MM)');

/**
 * Future date validation
 * Date must be today or in the future
 */
const futureDateSchema = dateStringSchema
    .refine((date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const inputDate = new Date(date);
        return inputDate >= today;
    }, 'Date must be today or in the future');

// ==================== Text Fields ====================

/**
 * Name validation
 * - 2-100 characters
 * - Trimmed
 */
const nameSchema = z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
    .describe('Name');

/**
 * Short text (notes, descriptions)
 * Max 500 characters
 */
const shortTextSchema = z.string()
    .trim()
    .max(500, 'Text too long (max 500 characters)')
    .optional()
    .describe('Short text');

/**
 * Long text (detailed descriptions)
 * Max 2000 characters
 */
const longTextSchema = z.string()
    .trim()
    .max(2000, 'Text too long (max 2000 characters)')
    .optional()
    .describe('Long text');

// ==================== Pagination ====================

/**
 * Pagination parameters
 * - page: positive integer, default 1
 * - limit: positive integer, max 100, default 20
 */
const paginationSchema = z.object({
    page: z.coerce.number()
        .int('Page must be an integer')
        .positive('Page must be positive')
        .default(1),
    limit: z.coerce.number()
        .int('Limit must be an integer')
        .positive('Limit must be positive')
        .max(100, 'Limit cannot exceed 100')
        .default(20)
}).describe('Pagination parameters');

// ==================== Status Enums ====================

/**
 * Reservation status
 */
const reservaStatusSchema = z.enum(['RESERVADA', 'COMPLETADA', 'CANCELADA'])
    .describe('Reservation status');

/**
 * Payment status
 */
const paymentStatusSchema = z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'])
    .describe('Payment status');

/**
 * User role
 */
const userRoleSchema = z.enum(['SUPERADMIN', 'ADMIN', 'BARBERO', 'CLIENTE'])
    .describe('User role');

// ==================== Address ====================

/**
 * Address validation
 */
const addressSchema = z.object({
    calle: z.string().trim().min(1, 'Street is required'),
    numero: z.string().trim().optional(),
    ciudad: z.string().trim().min(1, 'City is required'),
    provincia: z.string().trim().optional(),
    codigoPostal: z.string().trim().optional(),
    pais: z.string().trim().default('Argentina')
}).describe('Address');

// ==================== Slug ====================

/**
 * URL slug validation
 * - Lowercase
 * - Alphanumeric and hyphens only
 * - 3-100 characters
 */
const slugSchema = z.string()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .min(3, 'Slug too short')
    .max(100, 'Slug too long')
    .describe('URL slug');

// ==================== Exports ====================

module.exports = {
    // IDs
    objectIdSchema,
    optionalObjectIdSchema,

    // Contact
    emailSchema,
    phoneSchema,

    // Money
    moneySchema,
    currencySchema,

    // Dates & Times
    dateStringSchema,
    timeStringSchema,
    futureDateSchema,

    // Text
    nameSchema,
    shortTextSchema,
    longTextSchema,

    // Pagination
    paginationSchema,

    // Enums
    reservaStatusSchema,
    paymentStatusSchema,
    userRoleSchema,

    // Complex
    addressSchema,
    slugSchema
};
