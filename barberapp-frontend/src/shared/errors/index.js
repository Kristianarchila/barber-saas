/**
 * Base Domain Error
 * Todos los errores de dominio heredan de esta clase
 */
export class DomainError extends Error {
    constructor(message) {
        super(message);
        this.name = 'DomainError';
        this.timestamp = new Date();
    }
}

/**
 * Error de Validación
 * Se lanza cuando los datos no cumplen las reglas de negocio
 */
export class ValidationError extends DomainError {
    constructor(message, field = null) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
    }
}

/**
 * Error de Entidad No Encontrada
 */
export class NotFoundError extends DomainError {
    constructor(entityName, id) {
        super(`${entityName} con ID ${id} no encontrado`);
        this.name = 'NotFoundError';
        this.entityName = entityName;
        this.id = id;
    }
}

/**
 * Error de Negocio
 * Se lanza cuando una operación viola reglas de negocio
 */
export class BusinessRuleError extends DomainError {
    constructor(message, rule = null) {
        super(message);
        this.name = 'BusinessRuleError';
        this.rule = rule;
    }
}

/**
 * Error de Infraestructura
 * Errores relacionados con servicios externos, BD, etc.
 */
export class InfrastructureError extends Error {
    constructor(message, originalError = null) {
        super(message);
        this.name = 'InfrastructureError';
        this.originalError = originalError;
        this.timestamp = new Date();
    }
}

/**
 * Error de Red/HTTP
 */
export class NetworkError extends InfrastructureError {
    constructor(message, statusCode = null, originalError = null) {
        super(message, originalError);
        this.name = 'NetworkError';
        this.statusCode = statusCode;
    }
}
