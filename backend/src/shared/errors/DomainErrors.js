/**
 * Base Domain Error
 */
class DomainError extends Error {
    constructor(message) {
        super(message);
        this.name = 'DomainError';
        this.statusCode = 400;
    }
}

/**
 * Not Found Error
 */
class NotFoundError extends DomainError {
    constructor(resource) {
        super(`${resource} not found`);
        this.name = 'NotFoundError';
        this.statusCode = 404;
    }
}

/**
 * Validation Error
 */
class ValidationError extends DomainError {
    constructor(message, field = null) {
        super(message);
        this.name = 'ValidationError';
        this.statusCode = 422;
        this.field = field;
    }
}

/**
 * Unauthorized Error
 */
class UnauthorizedError extends DomainError {
    constructor(message = 'Unauthorized') {
        super(message);
        this.name = 'UnauthorizedError';
        this.statusCode = 401;
    }
}

/**
 * Forbidden Error
 */
class ForbiddenError extends DomainError {
    constructor(message = 'Forbidden') {
        super(message);
        this.name = 'ForbiddenError';
        this.statusCode = 403;
    }
}

/**
 * Conflict Error (for business rule violations)
 */
class ConflictError extends DomainError {
    constructor(message) {
        super(message);
        this.name = 'ConflictError';
        this.statusCode = 409;
    }
}

/**
 * Business Rule Violation Error
 */
class BusinessRuleError extends DomainError {
    constructor(message, rule = null) {
        super(message);
        this.name = 'BusinessRuleError';
        this.statusCode = 422;
        this.rule = rule;
    }
}

module.exports = {
    DomainError,
    NotFoundError,
    ValidationError,
    UnauthorizedError,
    ForbiddenError,
    ConflictError,
    BusinessRuleError
};
