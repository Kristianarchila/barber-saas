/**
 * MongoDB Index Creation Script
 * 
 * Run: node scripts/create-indexes.js
 * 
 * Creates performance-critical indexes for handling 1000+ concurrent users.
 * Safe to run multiple times — skips indexes that already exist.
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function safeCreateIndex(collection, fields, options, label) {
    try {
        await collection.createIndex(fields, options);
        console.log(`  ✅ ${label}`);
    } catch (err) {
        if (err.message.includes('already exists')) {
            console.log(`  ⏭️  ${label} — ya existe (OK)`);
        } else {
            console.error(`  ❌ ${label} — ${err.message}`);
        }
    }
}

async function createIndexes() {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error('❌ MONGO_URI no definido en .env');
        process.exit(1);
    }

    try {
        await mongoose.connect(uri);
        console.log('✅ Conectado a MongoDB\n');
        const db = mongoose.connection.db;

        // RESERVAS
        const reservas = db.collection('reservas');
        await safeCreateIndex(reservas, { barberiaId: 1, barberoId: 1, fecha: 1 },
            { name: 'idx_reservas_barbero_fecha', background: true }, 'reservas: barbero+fecha');
        await safeCreateIndex(reservas, { barberiaId: 1, estado: 1, fecha: -1 },
            { name: 'idx_reservas_estado_fecha', background: true }, 'reservas: estado+fecha');
        await safeCreateIndex(reservas, { cancelToken: 1 },
            { name: 'idx_reservas_cancelToken', sparse: true, background: true }, 'reservas: cancelToken');
        await safeCreateIndex(reservas, { reviewToken: 1 },
            { name: 'idx_reservas_reviewToken', sparse: true, background: true }, 'reservas: reviewToken');

        // BARBEROS
        await safeCreateIndex(db.collection('barberos'), { barberiaId: 1, activo: 1 },
            { name: 'idx_barberos_barberia_activo', background: true }, 'barberos: barberia+activo');

        // SERVICIOS
        await safeCreateIndex(db.collection('servicios'), { barberiaId: 1, activo: 1 },
            { name: 'idx_servicios_barberia_activo', background: true }, 'servicios: barberia+activo');

        // HORARIOS
        await safeCreateIndex(db.collection('horarios'), { barberoId: 1, diaSemana: 1 },
            { name: 'idx_horarios_barbero_dia', background: true }, 'horarios: barbero+dia');

        // BARBERIAS
        await safeCreateIndex(db.collection('barberias'), { slug: 1 },
            { name: 'idx_barberias_slug', unique: true, background: true }, 'barberias: slug (unique)');

        // PAGOS
        await safeCreateIndex(db.collection('pagos'), { barberiaId: 1, fecha: -1 },
            { name: 'idx_pagos_barberia_fecha', background: true }, 'pagos: barberia+fecha');

        // BLOQUEOS
        await safeCreateIndex(db.collection('bloqueos'), { barberiaId: 1, barberoId: 1, fechaInicio: 1, fechaFin: 1 },
            { name: 'idx_bloqueos_barbero_fechas', background: true }, 'bloqueos: barbero+fechas');

        // USERS
        await safeCreateIndex(db.collection('users'), { email: 1 },
            { name: 'idx_users_email', unique: true, background: true }, 'users: email (unique)');
        await safeCreateIndex(db.collection('users'), { barberiaId: 1, rol: 1 },
            { name: 'idx_users_barberia_rol', background: true }, 'users: barberia+rol');

        console.log('\n🎉 Proceso completado!');

    } catch (error) {
        console.error('❌ Error general:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado de MongoDB');
    }
}

createIndexes();
