require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const testRoutes = require("./routes/test.routes");
const barberiaRoutes = require("./routes/barberia.routes");
const userRoutes = require("./routes/user.routes");
const barberoRoutes = require("./routes/barbero.routes");
const horarioRoutes = require("./routes/horario.routes");
const turnosRoutes = require("./routes/turnos.routes");
const servicioRoutes = require("./routes/servicio.routes");
const reservasRoutes = require("./routes/reservas.routes");
const publicRoutes = require("./routes/public.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const finanzasRoutes = require("./routes/finanzas.routes");
const superAdminRoutes = require("./routes/superAdmin.routes");
const paymentsRoutes = require("./routes/payments.routes");
const resenasRoutes = require("./routes/resenas.routes");
const revenueConfigRoutes = require("./routes/revenueConfig.routes");
const transactionRoutes = require("./routes/transaction.routes");
const uploadRoutes = require("./routes/upload.routes");
const authRoutes = require("./routes/auth.routes");
const subscriptionRoutes = require("./routes/subscription.routes");
const bloqueosRoutes = require("./routes/bloqueos.routes");
const clienteStatsRoutes = require("./routes/clienteStats.routes");
const stripeWebhook = require("./webhooks/stripe.webhook");
const { errorHandler } = require("./config/middleware/errorHandler");
// Note: generalLimiter removed — rate limiting is handled by globalLimiter in middleware/rateLimit.middleware.js
const { initErrorTracking } = require("./config/errorTracking");
const { protect } = require("./config/middleware/auth.middleware");
const { extractBarberiaId, validateTenantAccess } = require("./middleware/tenantValidation.middleware");

// 🔍 Initialize Sentry (MUST be first)
const {
  initSentry,
  getRequestHandler,
  getTracingHandler,
  getErrorHandler
} = require("./config/sentry");

// Initialize Observability
initErrorTracking();

// Initialize MongoDB connection for tests is now handled by tests/setup.js
// so we don't need to call it here anymore to avoid connection conflicts.


const app = express();

// 🔍 Sentry Request Handler (MUST be first middleware)
app.use(getRequestHandler());

// 🔍 Sentry Tracing Handler (for performance monitoring)
app.use(getTracingHandler());

// Initialize Sentry with app context
initSentry(app);

/**
 * 1️⃣ PARSERS (Must be first, before CORS)
 */
// Stripe webhook route is mounted below with other routes
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

/**
 * 2️⃣ CORS CONFIGURATION (Must be early in middleware chain)
 */
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost',
  'http://127.0.0.1',
].filter(Boolean); // Remove undefined values

// Add production domains from environment variable (comma-separated)
if (process.env.PRODUCTION_DOMAINS) {
  const productionDomains = process.env.PRODUCTION_DOMAINS.split(',').map(d => d.trim());
  allowedOrigins.push(...productionDomains);
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, or same-origin)
    if (!origin) {
      return callback(null, true);
    }

    // In development, allow all localhost origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    // In production, strictly check whitelist
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Log blocked CORS attempt for security monitoring
      console.warn(`🚫 CORS blocked: ${origin}`);

      // Report to Sentry if available
      if (process.env.SENTRY_DSN) {
        const { captureMessage } = require('./config/sentry');
        captureMessage('CORS Origin Blocked', 'warning', {
          origin,
          allowedOrigins,
          tags: {
            category: 'security',
            severity: 'medium'
          }
        });
      }

      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200,
  preflightContinue: false
};

// Apply CORS to all routes
app.use(cors(corsOptions));

// 🚀 COMPRESSION (Reduce payload size for better performance)
app.use(compression());

// Log CORS configuration on startup (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('🔒 CORS Configuration:');
  console.log('   Allowed Origins:', allowedOrigins);
}

/**
 * 3️⃣ LOGGING & DEBUGGING
 */
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`📡 [${req.method}] ${req.url}`);
    next();
  });
}

/**
 * 4️⃣ SECURITY MIDDLEWARE
 */
const { sanitizeInputs } = require("./middleware/sanitization.middleware");
app.use(sanitizeInputs());

// 🔒 Trust proxy (Nginx) so express-rate-limit can read X-Forwarded-For correctly
app.set('trust proxy', 1);

const { globalLimiter } = require("./middleware/rateLimit.middleware");
if (process.env.NODE_ENV === "production" || process.env.ENABLE_RATE_LIMIT === "true") {
  app.use("/api", globalLimiter);
}

app.use(helmet({
  // Content Security Policy - Prevents XSS attacks
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for React
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"], // Allow Cloudinary images
      connectSrc: ["'self'"], // API calls
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  // Cross-Origin Resource Policy
  crossOriginResourcePolicy: { policy: "cross-origin" },
  // Prevent clickjacking
  xFrameOptions: { action: 'deny' },
  // Prevent MIME sniffing
  noSniff: true,
  // Force HTTPS in production
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  // Hide X-Powered-By header
  hidePoweredBy: true,
  // Referrer Policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
app.use(morgan("dev"));
app.use(cookieParser());

// Auth rate limiting is handled in auth.routes.js
// Global rate limiting is handled by globalLimiter above (lines 157-160)

/**
 * 3️⃣ ROUTES
 */
app.use("/api/auth", authRoutes);
app.use("/api/webhooks", stripeWebhook);
app.use("/api/test", testRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/public/barberias", publicRoutes); // Changed to match frontend calls


app.use("/public", require("./routes/public.turnos.routes"));
app.use("/api/public", resenasRoutes); // Public reseñas routes (/:slug/resenas/*)
app.use("/api", resenasRoutes); // Admin reseñas routes (/admin/resenas/*)
app.use("/api/reservas", reservasRoutes);

app.use("/api/superadmin", superAdminRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/sse", require("./routes/sse.routes")); // SSE real-time notifications
app.use("/api/cache", require("./routes/cache.routes")); // Cache management
app.use("/api/barberias/:slug/notifications", require("./routes/notifications.routes"));

app.use("/api/barberias", barberiaRoutes);
app.use("/api/users", userRoutes);

// 🔐 MULTI-TENANT SLUG-BASED ROUTES
const tenantAdminMiddleware = [protect, extractBarberiaId, validateTenantAccess];
const tenantPublicMiddleware = [extractBarberiaId];

// ✅ FIXED: Servicios ahora tiene validación multi-tenant completa
app.use("/api/barberias/:slug/admin/servicios", tenantAdminMiddleware, servicioRoutes);

app.use("/api/barberias/:slug/barbero", tenantAdminMiddleware, barberoRoutes);
app.use("/api/barberias/:slug/admin/horarios", tenantAdminMiddleware, horarioRoutes);
app.use("/api/barberias/:slug/admin/turnos", tenantAdminMiddleware, turnosRoutes);
app.use("/api/barberias/:slug/admin/reservas", tenantAdminMiddleware, reservasRoutes);

// ✅ FIXED: Bloqueos ahora tiene validación multi-tenant completa
app.use("/api/barberias/:slug/admin/bloqueos", tenantAdminMiddleware, bloqueosRoutes);

app.use("/api/barberias/:slug/admin/dashboard", tenantAdminMiddleware, dashboardRoutes);
app.use("/api/barberias/:slug/admin/finanzas", tenantAdminMiddleware, finanzasRoutes);
app.use("/api/barberias/:slug/admin/clientes", tenantAdminMiddleware, userRoutes);

app.use("/api/barberias/:slug/admin/pagos", tenantAdminMiddleware, require("./routes/pagos.routes"));
app.use("/api/barberias/:slug/admin/egresos", tenantAdminMiddleware, require("./routes/egresos.routes"));
app.use("/api/barberias/:slug/admin/caja", tenantAdminMiddleware, require("./routes/caja.routes"));
app.use("/api/barberias/:slug/admin/reportes", tenantAdminMiddleware, require("./routes/reportes.routes"));

app.use("/api/barberias/:slug/admin/revenue-config", tenantAdminMiddleware, revenueConfigRoutes);
app.use("/api/barberias/:slug/transactions", tenantAdminMiddleware, transactionRoutes);

app.use("/api/barberias/:slug/inventario", tenantAdminMiddleware, require("./routes/inventario.routes"));
app.use("/api/barberias/:slug/proveedores", tenantAdminMiddleware, require("./routes/proveedores.routes"));

app.use("/api/barberias/:slug/reportes/pdf", tenantAdminMiddleware, require("./routes/pdf.routes"));
app.use("/api/barberias/:slug/cupones", tenantAdminMiddleware, require("./routes/cupones.routes"));

app.use("/api/barberias/:slug/productos", tenantPublicMiddleware, require("./routes/productos.routes"));
app.use("/api/barberias/:slug/pedidos", tenantPublicMiddleware, require("./routes/pedidos.routes"));
app.use("/api/barberias/:slug/carrito", tenantPublicMiddleware, require("./routes/carrito.routes"));

app.use("/api/barberias/:slug/admin/ficha-tecnica", tenantAdminMiddleware, require("./routes/fichaTecnica.routes"));
app.use("/api/barberias/:slug/admin/ventas", tenantAdminMiddleware, require("./routes/venta.routes"));
app.use("/api/waiting-list", require("./routes/waitingList.routes"));
app.use("/api/calendar", require("./routes/calendar.routes"));

/**
 * 4️⃣ HEALTHCHECK
 */
const { checkSystemHealth, checkBasicHealth, checkReadiness } = require('./utils/healthCheck');

// Liveness probe - Verifica que el servidor esté vivo
app.get("/health", (req, res) => {
  res.json(checkBasicHealth());
});

// Readiness probe - Verifica que el servidor esté listo para recibir tráfico
app.get("/health/ready", async (req, res) => {
  try {
    const readiness = await checkReadiness();
    const statusCode = readiness.ready ? 200 : 503;
    res.status(statusCode).json(readiness);
  } catch (error) {
    res.status(503).json({
      ready: false,
      reason: 'Error verificando readiness',
      error: error.message
    });
  }
});

// Detailed health check - Para monitoreo y debugging
app.get("/health/detailed", async (req, res) => {
  try {
    const health = await checkSystemHealth();
    const statusCode = health.status === 'unhealthy' ? 503 : 200;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Error verificando salud del sistema',
      error: error.message
    });
  }
});

/**
 * 5️⃣ ERROR HANDLER
 */
// 🔍 Sentry Error Handler (MUST be before other error handlers)
app.use(getErrorHandler());

// Global error handler
app.use(errorHandler);

module.exports = app;
