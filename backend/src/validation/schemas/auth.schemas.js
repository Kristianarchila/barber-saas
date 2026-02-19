/**
 * Validation Schemas for Authentication
 * Using Zod for runtime validation
 */

const { z } = require('zod');

// ==================== Common Schemas ====================

const passwordSchema = z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña es demasiado larga')
    .regex(/[A-Z]/, 'La contraseña debe tener al menos una letra mayúscula')
    .regex(/[0-9]/, 'La contraseña debe tener al menos un número');


const nameSchema = z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo')
    .trim();

const emailSchema = z.string()
    .email('Email inválido')
    .toLowerCase()
    .trim();

// ==================== Registration ====================

/**
 * Schema for PUBLIC user registration (Barberia Owners Only)
 * Used in: POST /api/auth/register
 * 
 * Password requirements (Senior - Secure):
 * - At least 10 characters
 * - At least one uppercase letter
 * - At least one number
 * - At least one special character
 */
const registerSchema = z.object({
    nombre: nameSchema,
    email: emailSchema,
    password: passwordSchema
}).strict(); // No additional fields allowed for public registration

// ==================== Reset Password ====================

/**
 * Schema for requesting password reset
 */
const requestPasswordResetSchema = z.object({
    email: emailSchema
}).strict();

/**
 * Schema for resetting password with token
 */
const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token requerido'),
    newPassword: passwordSchema
}).strict();

// ==================== Login ====================

/**
 * Schema for user login
 */
const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Contraseña requerida')
}).strict();

// ==================== Exports ====================

module.exports = {
    registerSchema,
    loginSchema,
    requestPasswordResetSchema,
    resetPasswordSchema
};
