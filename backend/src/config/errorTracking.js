/**
 * Error Tracking Utility (Sentry Placeholder)
 * 
 * This utility provides a centralized way to capture and report errors.
 * In production, this would be replaced with a real Sentry.init() call.
 */

const logger = require('./logger');

const initErrorTracking = () => {
    if (process.env.NODE_ENV === 'production') {
        console.log('Error Tracking initialized (Sentry Placeholder)');
        // Sentry.init({ dsn: process.env.SENTRY_DSN });
    }
};

const captureException = (error, context = {}) => {
    // Log locally using winston
    logger.error(error.message, {
        stack: error.stack,
        ...context
    });

    // Report to Sentry if in production
    if (process.env.NODE_ENV === 'production') {
        // Sentry.captureException(error, { extra: context });
    }
};

module.exports = {
    initErrorTracking,
    captureException
};
