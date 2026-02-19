/**
 * Script de migración: Calcular estadísticas iniciales de reseñas
 * 
 * Este script recalcula las estadísticas de reseñas para todas las barberías
 * y las guarda en el campo estadisticasResenas del modelo Barbería.
 * 
 * Ejecutar: node scripts/migrate-resenas-stats.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Barberia = require('../src/infrastructure/database/mongodb/models/Barberia');
const { recalcularEstadisticasResenas } = require('../src/services/resenas.service');

async function migrateResenasStats() {
    try {
        console.log('🚀 Iniciando migración de estadísticas de reseñas...\n');

        // Conectar a MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/barber-saas');
        console.log('✅ Conectado a MongoDB\n');

        // Obtener todas las barberías activas
        const barberias = await Barberia.find({ activa: true });
        console.log(`📊 Encontradas ${barberias.length} barberías activas\n`);

        let procesadas = 0;
        let conReseñas = 0;
        let errores = 0;

        // Procesar cada barbería
        for (const barberia of barberias) {
            try {
                console.log(`⏳ Procesando: ${barberia.nombre} (${barberia.slug})...`);

                const stats = await recalcularEstadisticasResenas(barberia._id);

                if (stats.ratingCount > 0) {
                    console.log(`   ✅ ${stats.ratingCount} reseñas | Promedio: ${stats.ratingAverage}⭐`);
                    conReseñas++;
                } else {
                    console.log(`   ℹ️  Sin reseñas`);
                }

                procesadas++;
            } catch (error) {
                console.error(`   ❌ Error: ${error.message}`);
                errores++;
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📈 RESUMEN DE MIGRACIÓN');
        console.log('='.repeat(60));
        console.log(`Total de barberías: ${barberias.length}`);
        console.log(`Procesadas exitosamente: ${procesadas}`);
        console.log(`Con reseñas: ${conReseñas}`);
        console.log(`Sin reseñas: ${procesadas - conReseñas}`);
        console.log(`Errores: ${errores}`);
        console.log('='.repeat(60));

        if (errores === 0) {
            console.log('\n✅ Migración completada exitosamente');
        } else {
            console.log('\n⚠️  Migración completada con errores');
        }

    } catch (error) {
        console.error('\n❌ Error fatal en la migración:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Desconectado de MongoDB');
        process.exit(0);
    }
}

// Ejecutar migración
migrateResenasStats();
