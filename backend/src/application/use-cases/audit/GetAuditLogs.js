const AuditLog = require('../../../infrastructure/database/mongodb/models/AuditLog');

/**
 * Get Audit Logs Use Case
 */
class GetAuditLogs {
    /**
     * Execute the use case
     * @param {Object} filters - Filter criteria
     * @param {Object} pagination - Pagination options
     * @returns {Promise<Object>}
     */
    async execute(filters = {}, pagination = { page: 1, limit: 20 }) {
        const {
            barberiaId,
            userId,
            action,
            severity,
            result,
            resourceType,
            startDate,
            endDate
        } = filters;

        const { page = 1, limit = 20 } = pagination;

        // Build query
        const query = {};

        if (barberiaId) query.barberiaId = barberiaId;
        if (userId) query.userId = userId;
        if (action) query.action = action;
        if (severity) query.severity = severity;
        if (result) query.result = result;
        if (resourceType) query.resourceType = resourceType;

        // Date range filter
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        // Calculate skip
        const skip = (page - 1) * limit;

        // Execute query
        const [logs, total] = await Promise.all([
            AuditLog.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('userId', 'nombre email')
                .populate('barberiaId', 'nombre slug')
                .lean(),
            AuditLog.countDocuments(query)
        ]);

        return {
            logs: logs.map(log => ({
                id: log._id,
                userId: log.userId,
                barberiaId: log.barberiaId,
                action: log.action,
                resourceType: log.resourceType,
                resourceId: log.resourceId,
                severity: log.severity,
                result: log.result,
                message: log.message,
                metadata: log.metadata,
                request: log.request,
                createdAt: log.createdAt
            })),
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    }
}

module.exports = GetAuditLogs;
