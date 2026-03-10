require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./config/db");
const logger = require("./config/logger");

// 🔥 REGISTRAR EVENT LISTENERS (UNA SOLA VEZ)
require("./controllers/reservas.events");
require("./events/resenas.events");
require("./infrastructure/cache/cache.events"); // Cache invalidation events

// 🔍 Inicializar Sistema de Integridad y Conciencia (S.I.A.S.)
require('./infrastructure/notifications/AlertService');
require('./application/services/IntegrityService');

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  // 🛡️ VALIDACIÓN DE VARIABLES DE ENTORNO CRÍTICAS
  const requiredEnv = [
    "MONGO_URI",
    "JWT_SECRET",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "CLIENT_URL"
  ];

  const missing = requiredEnv.filter(k => !process.env[k]);
  if (missing.length > 0) {
    logger.error(`❌ Faltan variables de entorno críticas: ${missing.join(", ")}`);
    process.exit(1);
  }

  try {
    await connectDB();

    // Inicializar cron jobs de notificaciones y mantenimiento
    const { initCronJobs } = require("./utils/scheduledNotifications");
    initCronJobs();
    require("./services/maintenance.service");

    // Inicializar scheduler de recordatorios automáticos
    const { initializeReminderScheduler } = require("./infrastructure/jobs/reminderScheduler");
    initializeReminderScheduler();

    // 🔄 Cron jobs de mantenimiento del sistema
    const { startResetMonthlyCancelacionesJob } = require('./jobs/resetMonthlyCancelaciones');
    const { startDesbloqueoAutomaticoJob } = require('./jobs/desbloqueoAutomatico');
    const { startSendRemindersJob } = require('./jobs/sendReminders');
    startResetMonthlyCancelacionesJob();
    startDesbloqueoAutomaticoJob();
    startSendRemindersJob();
    require('./jobs/expireWaitingList');

    // ✅ Inicializar rate limiters con Redis (await garantiza que Redis está conectado
    // antes de que llegue el primer request — evita el race condition del store)
    const { initRateLimiters } = require("./middleware/rateLimit.middleware");
    await initRateLimiters();

    const server = app.listen(PORT, () => {
      logger.info(`API corriendo en puerto ${PORT}`);
      console.log(`🚀 SERVIDOR LISTO EN EL PUERTO ${PORT}`);
    });

    // ── Graceful shutdown (Docker sends SIGTERM on stop/restart) ──
    const gracefulShutdown = async (signal) => {
      console.log(`\n🛑 ${signal} recibido. Cerrando gracefully...`);
      server.close(async () => {
        console.log('   ✅ HTTP server cerrado (no más requests nuevos)');
        try {
          const mongoose = require('mongoose');
          await mongoose.connection.close();
          console.log('   ✅ MongoDB conexión cerrada');
        } catch (err) {
          console.error('   ❌ Error cerrando MongoDB:', err.message);
        }
        process.exit(0);
      });

      // Si no cierra en 10s, forzar (Docker mata a los 30s por defecto)
      setTimeout(() => {
        console.error('   ⚠️ Timeout 10s — forzando cierre');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (err) {
    logger.error("Error al iniciar servidor", { error: err.message, stack: err.stack });
    process.exit(1);
  }
}

process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION!', err.name, err.message);
  console.error(err.stack);
  // Always exit: Docker will restart the container automatically (restart: unless-stopped)
  // Running in corrupted state is more dangerous than restarting
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('💥 UNHANDLED REJECTION!', err.name, err.message);
  console.error(err.stack);
  // Always exit: Docker will restart the container automatically
  process.exit(1);
});


bootstrap();
