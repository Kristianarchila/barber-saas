/**
 * Controller Logging Middleware
 * Wraps controller functions with automatic logging
 */

const Logger = require('./Logger');

/**
 * Wraps a controller function with logging
 * @param {string} controllerName - Name of the controller
 * @param {string} operationName - Name of the operation
 * @param {Function} controllerFn - Controller function to wrap
 * @returns {Function} Wrapped controller function
 */
function withLogging(controllerName, operationName, controllerFn) {
    return async (req, res, next) => {
        const startTime = Date.now();
        const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        try {
            // Log incoming request
            Logger.info(controllerName, `${operationName} - Request started`, {
                requestId,
                method: req.method,
                path: req.path,
                params: req.params,
                userId: req.user?.id || 'anonymous',
                barberiaId: req.user?.barberiaId || req.params?.slug
            });

            // Execute controller
            await controllerFn(req, res, next);

            // Log success
            const duration = Date.now() - startTime;
            Logger.success(controllerName, `${operationName} - Completed`, {
                requestId,
                duration: `${duration}ms`,
                statusCode: res.statusCode
            });

        } catch (error) {
            // Log error with full context
            const duration = Date.now() - startTime;
            Logger.error(controllerName, operationName, error, {
                requestId,
                duration: `${duration}ms`,
                method: req.method,
                path: req.path,
                params: req.params,
                body: req.body,
                userId: req.user?.id || 'anonymous',
                barberiaId: req.user?.barberiaId || req.params?.slug
            });

            // Pass error to error handler
            next(error);
        }
    };
}

/**
 * Creates a logged controller object
 * @param {string} controllerName - Name of the controller
 * @param {object} controllerMethods - Object with controller methods
 * @returns {object} Controller with logging
 */
function createLoggedController(controllerName, controllerMethods) {
    const loggedController = {};

    for (const [methodName, methodFn] of Object.entries(controllerMethods)) {
        if (typeof methodFn === 'function') {
            loggedController[methodName] = withLogging(
                controllerName,
                methodName,
                methodFn
            );
        } else {
            loggedController[methodName] = methodFn;
        }
    }

    return loggedController;
}

module.exports = {
    withLogging,
    createLoggedController
};
