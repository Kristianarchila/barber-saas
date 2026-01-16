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







const authRoutes = require("./routes/auth.routes");
const { errorHandler } = require("./config/middleware/errorHandler");

const app = express();

/**
 * 1️⃣ PARSERS (SIEMPRE PRIMERO)
 * Si no, req.body será undefined
 */
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

/**
 * 2️⃣ SEGURIDAD Y LOGS
 * Deben envolver TODA la app
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
 * 3️⃣ RUTAS
 * Ya con body, headers y seguridad
 */
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/barberias", barberiaRoutes);
app.use("/api/users", userRoutes);
app.use("/api/barberos", barberoRoutes);

app.use("/api/horarios", horarioRoutes);
app.use("/api/turnos", turnosRoutes);
app.use("/api/servicios", servicioRoutes);
app.use("/api/reservas", reservasRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/finanzas", finanzasRoutes);


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
