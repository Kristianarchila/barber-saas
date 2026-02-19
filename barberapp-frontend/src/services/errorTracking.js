/**
 * Error Tracking Utility (Sentry Placeholder)
 * 
 * Centralized way to capture frontend exceptions.
 */

export const initErrorTracking = () => {
    if (import.meta.env.PROD) {
        console.log('Frontend Error Tracking initialized (Sentry Placeholder)');
    }
};

export const captureException = (error, context = {}) => {
    console.error('[ErrorTracking]', error, context);

    if (import.meta.env.PROD) {
        // Sentry.captureException(error, { extra: context });
    }
};

export default {
    initErrorTracking,
    captureException
};
