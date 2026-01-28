require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./config/db");
const logger = require("./config/logger");

// 🔥 REGISTRAR EVENT LISTENERS (UNA SOLA VEZ)
require("./controllers/reservas.events");
require("./events/resenas.events");

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  try {
    await connectDB();
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
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (err) => {
  console.error('💥 UNHANDLED REJECTION!', err.name, err.message);
  console.error(err.stack);
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});


bootstrap();
