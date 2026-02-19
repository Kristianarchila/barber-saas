/**
 * Critical Operations Monitor
 * 
 * Tracks and reports critical business operations to Sentry
 * for monitoring and alerting
 */

const { captureMessage, captureException, addBreadcrumb } = require('../config/sentry');

/**
 * Monitor subscription payment failures
 */
function monitorPaymentFailure(barberiaId, error, context = {}) {
    captureMessage('Subscription Payment Failed', 'error', {
        barberiaId,
        error: error.message,
        ...context,
        tags: {
            category: 'payments',
            severity: 'critical'
        }
    });

    addBreadcrumb('Payment failure detected', 'payment', {
        barberiaId,
        error: error.message
    });
}

/**
 * Monitor database connection issues
 */
function monitorDatabaseError(operation, error) {
    captureException(error, {
        operation,
        tags: {
            category: 'database',
            severity: 'critical'
        }
    });
}

/**
 * Monitor email sending failures
 */
function monitorEmailFailure(type, recipient, error) {
    captureMessage('Email Sending Failed', 'warning', {
        emailType: type,
        recipient,
        error: error.message,
        tags: {
            category: 'email',
            severity: 'medium'
        }
    });
}

/**
 * Monitor webhook processing failures
 */
function monitorWebhookFailure(webhookType, error, payload = {}) {
    captureMessage('Webhook Processing Failed', 'error', {
        webhookType,
        error: error.message,
        payload: JSON.stringify(payload).substring(0, 500), // Limit size
        tags: {
            category: 'webhooks',
            severity: 'high'
        }
    });
}

/**
 * Monitor cross-tenant access attempts
 */
function monitorTenantViolation(userId, requestedBarberiaId, userBarberiaId) {
    captureMessage('Cross-Tenant Access Attempt', 'warning', {
        userId,
        requestedBarberiaId,
        userBarberiaId,
        tags: {
            category: 'security',
            severity: 'high'
        }
    });
}

/**
 * Monitor overbooking attempts
 */
function monitorOverbookingAttempt(barberoId, fecha, hora, barberiaId) {
    captureMessage('Overbooking Attempt Blocked', 'info', {
        barberoId,
        fecha,
        hora,
        barberiaId,
        tags: {
            category: 'reservations',
            severity: 'low'
        }
    });
}

/**
 * Monitor slow database queries
 */
function monitorSlowQuery(query, duration) {
    if (duration > 5000) { // > 5 seconds
        captureMessage('Slow Database Query Detected', 'warning', {
            query,
            duration,
            tags: {
                category: 'performance',
                severity: 'medium'
            }
        });
    }
}

/**
 * Monitor high memory usage
 */
function monitorMemoryUsage() {
    const used = process.memoryUsage();
    const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024);
    const usagePercent = (heapUsedMB / heapTotalMB) * 100;

    if (usagePercent > 90) {
        captureMessage('High Memory Usage', 'warning', {
            heapUsedMB,
            heapTotalMB,
            usagePercent: usagePercent.toFixed(2),
            tags: {
                category: 'performance',
                severity: 'high'
            }
        });
    }
}

/**
 * Monitor backup failures
 */
function monitorBackupFailure(error, backupType = 'automated') {
    captureException(error, {
        backupType,
        tags: {
            category: 'backup',
            severity: 'critical'
        }
    });
}

/**
 * Monitor subscription sync issues
 */
function monitorSubscriptionOutOfSync(barberiaId, dbStatus, stripeStatus) {
    captureMessage('Subscription Out of Sync', 'error', {
        barberiaId,
        dbStatus,
        stripeStatus,
        tags: {
            category: 'subscriptions',
            severity: 'critical'
        }
    });
}

/**
 * Monitor rate limit exceeded
 */
function monitorRateLimitExceeded(ip, path, method, severity = 'medium') {
    const level = severity === 'critical' || severity === 'high' ? 'warning' : 'info';

    captureMessage('Rate Limit Exceeded', level, {
        ip,
        path,
        method,
        severity,
        tags: {
            category: 'security',
            severity
        }
    });
}

module.exports = {
    monitorPaymentFailure,
    monitorDatabaseError,
    monitorEmailFailure,
    monitorWebhookFailure,
    monitorTenantViolation,
    monitorOverbookingAttempt,
    monitorSlowQuery,
    monitorMemoryUsage,
    monitorBackupFailure,
    monitorSubscriptionOutOfSync,
    monitorRateLimitExceeded
};
