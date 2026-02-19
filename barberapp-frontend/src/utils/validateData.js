/**
 * Utilidades de validación de datos
 * Funciones helper para validar datos antes de usarlos
 */

/**
 * Verifica si un valor es un array válido y no vacío
 * @param {*} data - Dato a verificar
 * @returns {boolean}
 */
export function isValidArray(data) {
    return Array.isArray(data) && data.length > 0;
}

/**
 * Verifica si un valor es un array válido (puede estar vacío)
 * @param {*} data - Dato a verificar
 * @returns {boolean}
 */
export function isArray(data) {
    return Array.isArray(data);
}

/**
 * Acceso seguro a propiedades anidadas de un objeto
 * @param {Object} obj - Objeto a acceder
 * @param {string} path - Path a la propiedad (ej: 'user.profile.name')
 * @param {*} defaultValue - Valor por defecto si no existe
 * @returns {*}
 * 
 * @example
 * const name = safeAccess(user, 'profile.name', 'Sin nombre');
 */
export function safeAccess(obj, path, defaultValue = null) {
    if (!obj) return defaultValue;

    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
        if (result?.[key] === undefined || result?.[key] === null) {
            return defaultValue;
        }
        result = result[key];
    }

    return result;
}

/**
 * Verifica si un objeto tiene todas las propiedades requeridas
 * @param {Object} obj - Objeto a validar
 * @param {string[]} requiredFields - Array de campos requeridos
 * @returns {boolean}
 * 
 * @example
 * const isValid = hasRequiredFields(formData, ['nombre', 'email', 'telefono']);
 */
export function hasRequiredFields(obj, requiredFields) {
    if (!obj || typeof obj !== 'object') return false;

    return requiredFields.every(field => {
        const value = obj[field];
        return value !== undefined && value !== null && value !== '';
    });
}

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean}
 */
export function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Valida un teléfono (formato chileno)
 * @param {string} phone - Teléfono a validar
 * @returns {boolean}
 */
export function isValidPhone(phone) {
    if (!phone || typeof phone !== 'string') return false;
    // Acepta +56912345678, 912345678, +569 12345678
    const phoneRegex = /^(\+?56)?9\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Valida un RUT chileno
 * @param {string} rut - RUT a validar (con o sin puntos y guión)
 * @returns {boolean}
 */
export function isValidRUT(rut) {
    if (!rut || typeof rut !== 'string') return false;

    // Limpiar RUT
    const cleanRut = rut.replace(/[.-]/g, '');

    if (cleanRut.length < 2) return false;

    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1).toUpperCase();

    // Calcular dígito verificador
    let sum = 0;
    let multiplier = 2;

    for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body[i]) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const expectedDV = 11 - (sum % 11);
    const calculatedDV = expectedDV === 11 ? '0' : expectedDV === 10 ? 'K' : String(expectedDV);

    return dv === calculatedDV;
}

/**
 * Sanitiza un string para prevenir XSS
 * @param {string} str - String a sanitizar
 * @returns {string}
 */
export function sanitizeString(str) {
    if (!str || typeof str !== 'string') return '';

    return str
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Valida un rango de fechas
 * @param {string|Date} startDate - Fecha inicio
 * @param {string|Date} endDate - Fecha fin
 * @returns {boolean}
 */
export function isValidDateRange(startDate, endDate) {
    if (!startDate || !endDate) return false;

    const start = new Date(startDate);
    const end = new Date(endDate);

    return start <= end;
}

/**
 * Valida un número dentro de un rango
 * @param {number} value - Valor a validar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {boolean}
 */
export function isInRange(value, min, max) {
    if (typeof value !== 'number' || isNaN(value)) return false;
    return value >= min && value <= max;
}

/**
 * Convierte un array potencialmente inválido en un array válido
 * @param {*} data - Dato a convertir
 * @returns {Array}
 * 
 * @example
 * const items = ensureArray(apiResponse); // Siempre retorna array
 * items.map(item => ...)  // Seguro
 */
export function ensureArray(data) {
    if (Array.isArray(data)) return data;
    if (data === null || data === undefined) return [];
    return [data];
}

/**
 * Valida un objeto contra un schema simple
 * @param {Object} data - Datos a validar
 * @param {Object} schema - Schema de validación
 * @returns {Object} { isValid: boolean, errors: string[] }
 * 
 * @example
 * const schema = {
 *   nombre: { required: true, type: 'string' },
 *   email: { required: true, type: 'email' },
 *   edad: { required: false, type: 'number', min: 18, max: 100 }
 * };
 * 
 * const { isValid, errors } = validateSchema(formData, schema);
 */
export function validateSchema(data, schema) {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
        const value = data[field];

        // Required
        if (rules.required && (value === undefined || value === null || value === '')) {
            errors.push(`El campo ${field} es requerido`);
            continue;
        }

        // Si no es requerido y está vacío, skip
        if (!rules.required && (value === undefined || value === null || value === '')) {
            continue;
        }

        // Type validation
        if (rules.type === 'string' && typeof value !== 'string') {
            errors.push(`El campo ${field} debe ser texto`);
        }

        if (rules.type === 'number' && typeof value !== 'number') {
            errors.push(`El campo ${field} debe ser un número`);
        }

        if (rules.type === 'email' && !isValidEmail(value)) {
            errors.push(`El campo ${field} debe ser un email válido`);
        }

        if (rules.type === 'phone' && !isValidPhone(value)) {
            errors.push(`El campo ${field} debe ser un teléfono válido`);
        }

        if (rules.type === 'rut' && !isValidRUT(value)) {
            errors.push(`El campo ${field} debe ser un RUT válido`);
        }

        // Min/Max for numbers
        if (rules.type === 'number' && typeof value === 'number') {
            if (rules.min !== undefined && value < rules.min) {
                errors.push(`El campo ${field} debe ser mayor o igual a ${rules.min}`);
            }
            if (rules.max !== undefined && value > rules.max) {
                errors.push(`El campo ${field} debe ser menor o igual a ${rules.max}`);
            }
        }

        // Min/Max length for strings
        if (rules.type === 'string' && typeof value === 'string') {
            if (rules.minLength !== undefined && value.length < rules.minLength) {
                errors.push(`El campo ${field} debe tener al menos ${rules.minLength} caracteres`);
            }
            if (rules.maxLength !== undefined && value.length > rules.maxLength) {
                errors.push(`El campo ${field} debe tener máximo ${rules.maxLength} caracteres`);
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}
