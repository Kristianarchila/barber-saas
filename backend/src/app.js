require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
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


const authRoutes = require("./routes/auth.routes");
const { errorHandler } = require("./config/middleware/errorHandler");
const { generalLimiter, authLimiter } = require("./config/middleware/rateLimiter");

const app = express();

app.use((req, res, next) => {
  console.log(`📡 [${req.method}] ${req.url}`);
  next();
});

/**
 * 1️⃣ PARSERS (SIEMPRE PRIMERO)
 */
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

/**
 * 2️⃣ SEGURIDAD Y LOGS
 */
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
  })
);

/**
 * 2.5️⃣ RATE LIMITING (solo en producción/desarrollo, no en tests)
 */
if (process.env.NODE_ENV !== 'test') {
  app.use("/api/", generalLimiter);
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", authLimiter);
}

/**
 * 3️⃣ RUTAS
 */
// Auth y Public (sin tenant)
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/public/barberias", publicRoutes); // ✅ Namespace claro y sin conflictos
app.use("/public", require("./routes/public.turnos.routes"));
app.use("/api", resenasRoutes); // Rutas de reseñas (públicas y admin)
app.use("/api/reservas", reservasRoutes); // Rutas de reservas (públicas por token y admin)

// SuperAdmin (sin slug)
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/payments", paymentsRoutes);

// Gestión de barberías (SuperAdmin)
app.use("/api/barberias", barberiaRoutes);
app.use("/api/users", userRoutes);

// =========================================================
// RUTAS MULTI-TENANT CON SLUG
// =========================================================

// Módulo BARBERO (ya migrado ✅)
app.use("/api/barberias/:slug/barbero", barberoRoutes);

// Módulo ADMIN (migrado a slug-based ✅)
app.use("/api/barberias/:slug/admin/servicios", servicioRoutes);
app.use("/api/barberias/:slug/admin/horarios", horarioRoutes);
app.use("/api/barberias/:slug/admin/turnos", turnosRoutes);
app.use("/api/barberias/:slug/admin/reservas", reservasRoutes);
app.use("/api/barberias/:slug/admin/dashboard", dashboardRoutes);
app.use("/api/barberias/:slug/admin/finanzas", finanzasRoutes);
app.use("/api/barberias/:slug/admin/revenue-config", revenueConfigRoutes);
app.use("/api/barberias/:slug/transactions", transactionRoutes);


/**
 * 4️⃣ HEALTHCHECK
 */
app.get("/health", (req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV });
});

/**
 * 5️⃣ ERROR HANDLER (SIEMPRE AL FINAL)
 */
app.use(errorHandler);

module.exports = app;
