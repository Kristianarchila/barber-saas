require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./config/db");
const logger = require("./config/logger");

// 🔥 REGISTRAR EVENT LISTENERS (UNA SOLA VEZ)
require("./controllers/reservas.events");
require("./events/resenas.events");
require("./infrastructure/cache/cache.events"); // Cache invalidation events

const PORT = process.env.PORT || 4000;

async function bootstrap() {
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

    app.listen(PORT, () => {
      logger.info(`API corriendo en puerto ${PORT}`);
      console.log(`🚀 SERVIDOR LISTO EN EL PUERTO ${PORT}`);
    });
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
