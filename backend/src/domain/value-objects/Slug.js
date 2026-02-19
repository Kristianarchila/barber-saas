/**
 * Slug Value Object
 * Represents a normalized URL-friendly identifier
 */
class Slug {
    constructor(value) {
        if (!value || typeof value !== 'string') {
            throw new Error('Slug debe ser un string válido');
        }

        this.value = Slug.normalize(value);

        if (!this.value || this.value.length === 0) {
            throw new Error('Slug no puede estar vacío después de normalización');
        }

        if (this.value.length > 100) {
            throw new Error('Slug no puede exceder 100 caracteres');
        }
    }

    /**
     * Normalize a raw string into a valid slug
     * @param {string} rawSlug - Raw string to normalize
     * @returns {string} Normalized slug
     */
    static normalize(rawSlug) {
        return String(rawSlug || '')
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')           // Spaces to hyphens
            .replace(/[^a-z0-9-]/g, '')     // Remove non-alphanumeric except hyphens
            .replace(/-+/g, '-')            // Multiple hyphens to single
            .replace(/^-|-$/g, '');         // Remove leading/trailing hyphens
    }

    /**
     * Get string representation
     */
    toString() {
        return this.value;
    }

    /**
     * Check equality with another slug
     */
    equals(other) {
        if (!(other instanceof Slug)) {
            return false;
        }
        return this.value === other.value;
    }

    /**
     * Validate slug format
     */
    static isValid(slug) {
        if (!slug || typeof slug !== 'string') {
            return false;
        }

        const normalized = Slug.normalize(slug);
        return normalized.length > 0 && normalized.length <= 100;
    }
}

module.exports = Slug;
