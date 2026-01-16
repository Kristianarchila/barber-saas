require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./config/db");
// 🔥 REGISTRAR EVENT LISTENERS (UNA SOLA VEZ)
require("./controllers/reservas.events");

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`API corriendo en puerto ${PORT}`));
  } catch (err) {
    console.error("Error al iniciar:", err);
    process.exit(1);
  }
}

bootstrap();
