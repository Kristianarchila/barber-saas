const mongoose = require("mongoose");
const { retryDatabaseOperation } = require("../utils/retry");

let isConnected = false;
let connectionAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

/**
 * Conectar a MongoDB con reconexión automática y manejo robusto de errores
 */
async function connectDB() {
  // Si ya está conectado, no hacer nada
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log("✅ MongoDB ya está conectado");
    return;
  }

  mongoose.set("strictQuery", true);

  const uri = process.env.NODE_ENV === 'test'
    ? (process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/barber-saas-test')
    : process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI no está definido en las variables de entorno");
  }

  const options = {
    maxPoolSize: 50, // Aumentado de 10 a 50 para soportar hasta 1000 usuarios
    minPoolSize: 5,  // Aumentado de 2 a 5 para mantener conexiones calientes
    serverSelectionTimeoutMS: 5000, // Timeout para seleccionar servidor
    socketTimeoutMS: 45000, // Timeout para operaciones de socket
    family: 4, // Usar IPv4
    retryWrites: true, // Reintentar escrituras automáticamente
    retryReads: true,  // Reintentar lecturas automáticamente
    // Transaction support
    w: 'majority', // Write concern for transactions
    readConcern: { level: 'majority' }, // Read concern for transactions
    replicaSet: process.env.MONGO_REPLICA_SET || undefined, // Replica set name (optional)
  };

  try {
    await retryDatabaseOperation(
      async () => {
        await mongoose.connect(uri, options);
      },
      'MongoDB Connection'
    );

    isConnected = true;
    connectionAttempts = 0;

    if (process.env.NODE_ENV !== 'test') {
      console.log("✅ MongoDB conectado exitosamente");
      console.log(`📊 Pool size: ${options.maxPoolSize} conexiones`);

      // Validate transaction support
      try {
        const TransactionManager = require('../utils/TransactionManager');
        await TransactionManager.validateTransactionSupport();
      } catch (transactionError) {
        console.warn('⚠️ Advertencia:', transactionError.message);
        console.warn('⚠️ Las transacciones no estarán disponibles');
      }
    }

    // Configurar event listeners para monitorear la conexión
    setupConnectionListeners();

  } catch (error) {
    console.error("❌ Error crítico conectando a MongoDB:", error.message);
    throw error;
  }
}

/**
 * Configurar listeners para eventos de conexión
 */
function setupConnectionListeners() {
  // Evitar duplicar listeners
  mongoose.connection.removeAllListeners();

  mongoose.connection.on('connected', () => {
    isConnected = true;
    connectionAttempts = 0;
    console.log('✅ MongoDB conectado');
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.warn('⚠️ MongoDB desconectado');
  });

  mongoose.connection.on('error', (err) => {
    isConnected = false;
    console.error('❌ Error en conexión MongoDB:', err.message);

    // Intentar reconectar automáticamente
    if (connectionAttempts < MAX_RECONNECT_ATTEMPTS) {
      connectionAttempts++;
      console.log(`🔄 Intentando reconectar (${connectionAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);

      setTimeout(() => {
        connectDB().catch(err => {
          console.error('❌ Fallo en reconexión automática:', err.message);
        });
      }, 5000 * connectionAttempts); // Backoff incremental
    } else {
      console.error('💥 Máximo de intentos de reconexión alcanzado');
    }
  });

  mongoose.connection.on('reconnected', () => {
    isConnected = true;
    connectionAttempts = 0;
    console.log('✅ MongoDB reconectado exitosamente');
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    try {
      await mongoose.connection.close();
      console.log('🛑 Conexión MongoDB cerrada por terminación de app');
      process.exit(0);
    } catch (err) {
      console.error('❌ Error cerrando conexión MongoDB:', err);
      process.exit(1);
    }
  });
}

/**
 * Verificar estado de la conexión
 */
function getConnectionStatus() {
  return {
    isConnected,
    readyState: mongoose.connection.readyState,
    readyStateText: getReadyStateText(mongoose.connection.readyState),
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    connectionAttempts
  };
}

function getReadyStateText(state) {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return states[state] || 'unknown';
}

module.exports = {
  connectDB,
  getConnectionStatus,
  get isConnected() { return isConnected; }
};
