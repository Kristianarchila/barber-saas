/**
 * Soft Delete Plugin for Mongoose
 * 
 * Adds soft delete functionality to any Mongoose schema
 * - Adds deletedAt and deletedBy fields
 * - Overrides find queries to exclude deleted documents by default
 * - Provides softDelete() method for marking as deleted
 * - Provides restore() method for restoring deleted documents
 */

module.exports = function softDeletePlugin(schema, options = {}) {
    // Add soft delete fields to schema
    schema.add({
        deletedAt: {
            type: Date,
            default: null,
            index: true // Index for performance
        },
        deletedBy: {
            type: schema.path('_id').constructor, // Same type as _id (ObjectId)
            ref: 'User',
            default: null
        }
    });

    // Override find queries to exclude deleted documents by default
    const excludeDeleted = function () {
        // Only apply if not explicitly including deleted
        if (!this.getOptions().includeDeleted) {
            this.where({ deletedAt: null });
        }
    };

    schema.pre('find', excludeDeleted);
    schema.pre('findOne', excludeDeleted);
    schema.pre('findOneAndUpdate', excludeDeleted);
    schema.pre('count', excludeDeleted);
    schema.pre('countDocuments', excludeDeleted);

    /**
     * Soft delete a document
     * @param {String|ObjectId} userId - ID of user performing deletion
     * @returns {Promise<Document>}
     */
    schema.methods.softDelete = function (userId) {
        this.deletedAt = new Date();
        this.deletedBy = userId;
        return this.save();
    };

    /**
     * Restore a soft-deleted document
     * @returns {Promise<Document>}
     */
    schema.methods.restore = function () {
        this.deletedAt = null;
        this.deletedBy = null;
        return this.save();
    };

    /**
     * Check if document is deleted
     * @returns {Boolean}
     */
    schema.methods.isDeleted = function () {
        return this.deletedAt !== null;
    };

    /**
     * Static method to find deleted documents
     * @param {Object} conditions - Query conditions
     * @returns {Query}
     */
    schema.statics.findDeleted = function (conditions = {}) {
        return this.find({ ...conditions, deletedAt: { $ne: null } });
    };

    /**
     * Static method to find all (including deleted)
     * @param {Object} conditions - Query conditions
     * @returns {Query}
     */
    schema.statics.findWithDeleted = function (conditions = {}) {
        return this.find(conditions).setOptions({ includeDeleted: true });
    };

    /**
     * Static method to restore by ID
     * @param {String|ObjectId} id - Document ID
     * @returns {Promise<Document>}
     */
    schema.statics.restoreById = async function (id) {
        const doc = await this.findOne({ _id: id }).setOptions({ includeDeleted: true });
        if (!doc) {
            throw new Error('Document not found');
        }
        return doc.restore();
    };

    /**
     * Static method to permanently delete (hard delete)
     * @param {String|ObjectId} id - Document ID
     * @returns {Promise}
     */
    schema.statics.hardDelete = async function (id) {
        return this.findByIdAndDelete(id).setOptions({ includeDeleted: true });
    };
};
