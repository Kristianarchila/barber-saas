/**
 * Sentry Configuration
 * 
 * Application Performance Monitoring (APM) and Error Tracking
 * 
 * Features:
 * - Error tracking with stack traces
 * - Performance monitoring
 * - User context tracking
 * - Custom breadcrumbs
 * - Release tracking
 */

const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

/**
 * Initialize Sentry
 */
function initSentry(app) {
    // Only initialize if DSN is provided
    if (!process.env.SENTRY_DSN) {
        console.warn('⚠️  Sentry DSN not configured. Error tracking disabled.');
        return;
    }

    Sentry.init({
        dsn: process.env.SENTRY_DSN,

        // Environment
        environment: process.env.NODE_ENV || 'development',

        // Release tracking (use git commit hash or version)
        release: process.env.SENTRY_RELEASE || `barber-saas@${process.env.npm_package_version || '1.0.0'}`,

        // Performance Monitoring
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev

        // Profiling (CPU/Memory)
        profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

        integrations: [
            // Enable HTTP calls tracing
            new Sentry.Integrations.Http({ tracing: true }),

            // Enable Express.js middleware tracing
            new Sentry.Integrations.Express({ app }),

            // Enable profiling
            new ProfilingIntegration(),
        ],

        // Ignore specific errors
        ignoreErrors: [
            // Browser errors
            'ResizeObserver loop limit exceeded',
            'Non-Error promise rejection captured',

            // Expected validation errors
            'ValidationError',
            'CastError',

            // Network errors
            'NetworkError',
            'ECONNREFUSED',
        ],

        // Before sending events
        beforeSend(event, hint) {
            // Don't send errors in development
            if (process.env.NODE_ENV === 'development') {
                console.log('Sentry event (dev mode):', event);
                return null; // Don't send to Sentry in dev
            }

            // Filter sensitive data
            if (event.request) {
                // Remove sensitive headers
                delete event.request.headers?.authorization;
                delete event.request.headers?.cookie;

                // Remove sensitive query params
                if (event.request.query_string) {
                    event.request.query_string = event.request.query_string
                        .replace(/password=[^&]*/gi, 'password=[FILTERED]')
                        .replace(/token=[^&]*/gi, 'token=[FILTERED]');
                }
            }

            return event;
        },

        // Before sending breadcrumbs
        beforeBreadcrumb(breadcrumb) {
            // Filter sensitive breadcrumb data
            if (breadcrumb.category === 'http') {
                if (breadcrumb.data?.url?.includes('password')) {
                    breadcrumb.data.url = breadcrumb.data.url.replace(/password=[^&]*/gi, 'password=[FILTERED]');
                }
            }
            return breadcrumb;
        },
    });

    console.log('✅ Sentry initialized');
    console.log(`   Environment: ${process.env.NODE_ENV}`);
    console.log(`   Traces Sample Rate: ${process.env.NODE_ENV === 'production' ? '10%' : '100%'}`);
}

/**
 * Get Sentry request handler middleware
 */
function getRequestHandler() {
    if (!process.env.SENTRY_DSN) {
        return (req, res, next) => next();
    }
    return Sentry.Handlers.requestHandler();
}

/**
 * Get Sentry tracing middleware
 */
function getTracingHandler() {
    if (!process.env.SENTRY_DSN) {
        return (req, res, next) => next();
    }
    return Sentry.Handlers.tracingHandler();
}

/**
 * Get Sentry error handler middleware
 */
function getErrorHandler() {
    if (!process.env.SENTRY_DSN) {
        return (err, req, res, next) => next(err);
    }
    return Sentry.Handlers.errorHandler({
        shouldHandleError(error) {
            // Only send 5xx errors to Sentry
            // 4xx errors are client errors (validation, not found, etc.)
            return error.statusCode >= 500 || !error.statusCode;
        }
    });
}

/**
 * Capture exception manually
 */
function captureException(error, context = {}) {
    if (!process.env.SENTRY_DSN) {
        console.error('Error (Sentry disabled):', error);
        return;
    }

    Sentry.captureException(error, {
        level: 'error',
        extra: context
    });
}

/**
 * Capture message manually
 */
function captureMessage(message, level = 'info', context = {}) {
    if (!process.env.SENTRY_DSN) {
        console.log(`Message (Sentry disabled) [${level}]:`, message, context);
        return;
    }

    Sentry.captureMessage(message, {
        level,
        extra: context
    });
}

/**
 * Set user context for error tracking
 */
function setUser(user) {
    if (!process.env.SENTRY_DSN) return;

    Sentry.setUser({
        id: user.id || user._id,
        email: user.email,
        username: user.nombre,
        rol: user.rol,
        barberiaId: user.barberiaId
    });
}

/**
 * Add breadcrumb for debugging
 */
function addBreadcrumb(message, category, data = {}) {
    if (!process.env.SENTRY_DSN) return;

    Sentry.addBreadcrumb({
        message,
        category,
        level: 'info',
        data
    });
}

/**
 * Start a transaction for performance monitoring
 */
function startTransaction(name, op) {
    if (!process.env.SENTRY_DSN) {
        return {
            finish: () => { },
            setStatus: () => { },
            setData: () => { }
        };
    }

    return Sentry.startTransaction({
        name,
        op
    });
}

module.exports = {
    initSentry,
    getRequestHandler,
    getTracingHandler,
    getErrorHandler,
    captureException,
    captureMessage,
    setUser,
    addBreadcrumb,
    startTransaction,
    Sentry
};
