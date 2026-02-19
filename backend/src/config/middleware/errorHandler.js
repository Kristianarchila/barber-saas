/**
 * Global Error Handler (CORS Safe)
 */

const errorHandler = (err, req, res, next) => {
  console.error("🔴 ERROR:", err);

  // 🔥 AÑADIR HEADERS CORS SI NO EXISTEN
  const origin = req.headers.origin;

  if (origin) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Accept, Origin"
    );
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
  }

  // Handle custom error classes with specific status codes
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Determine if error should show stack trace
  const showStack = process.env.NODE_ENV !== "production" && !err.userFriendly;

  res.status(statusCode).json({
    success: false,
    error: err.name || "Error",
    message,
    ...(err.field && { field: err.field }), // For ValidationError
    ...(showStack && { stack: err.stack })
  });
};

/**
 * 404 Handler
 */
const notFoundHandler = (req, res) => {
  const origin = req.headers.origin;

  if (origin) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  }

  res.status(404).json({
    success: false,
    message: "Route not found"
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
