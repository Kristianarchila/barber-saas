const mongoose = require('mongoose');

// Configuración global para tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.MONGODB_TEST_URI = 'mongodb://localhost:27017/barber-saas-test';
process.env.FRONTEND_URL = 'http://localhost:5173';

// Aumentar timeout para tests de base de datos
jest.setTimeout(30000);

// Mock email services to prevent actual emails during tests
jest.mock('../src/notifications/email/email.service', () => ({
    reservaConfirmada: jest.fn().mockResolvedValue(true),
    enviarSolicitudResena: jest.fn().mockResolvedValue(true),
    notificarNuevaResena: jest.fn().mockResolvedValue(true),
    sendConfirmacionReserva: jest.fn().mockResolvedValue(true),
    sendCancelacionReserva: jest.fn().mockResolvedValue(true),
    sendReagendamientoReserva: jest.fn().mockResolvedValue(true),
    sendReservaConfirmation: jest.fn().mockResolvedValue(true),
    sendReviewRequest: jest.fn().mockResolvedValue(true),
    sendRescheduleConfirmation: jest.fn().mockResolvedValue(true),
    sendCancellationNotification: jest.fn().mockResolvedValue(true),
}));

const { MongoMemoryReplSet } = require('mongodb-memory-server');
let replSet;

const connectDB = async () => {
    if (mongoose.connection.readyState === 0) {
        // Use MongoMemoryReplSet for transactions support in tests
        replSet = await MongoMemoryReplSet.create({ replSet: { storageEngine: 'wiredTiger' } });
        const uri = replSet.getUri();

        await mongoose.connect(uri);
    }
};

const closeDB = async () => {
    await mongoose.connection.close();
    if (replSet) {
        await replSet.stop();
    }
};

const clearDB = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
};

module.exports = {
    connectDB,
    closeDB,
    clearDB
};
