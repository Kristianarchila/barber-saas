/**
 * Script para verificar que los índices críticos existen en MongoDB
 * Ejecutar: node scripts/verify-indexes.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function verifyIndexes() {
    try {
        console.log('🔍 Conectando a MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado\n');

        // Obtener modelo de Reserva
        const Reserva = require('../src/models/Reserva');

        // Obtener índices de la colección
        const indexes = await Reserva.collection.getIndexes();

        console.log('📊 Índices en colección "reservas":\n');
        console.log(JSON.stringify(indexes, null, 2));
        console.log('\n');

        // Verificar índice crítico para prevenir overbooking
        let criticalIndexFound = false;

        for (const [indexName, indexSpec] of Object.entries(indexes)) {
            // Buscar índice con barberoId, fecha, hora
            if (indexSpec.barberoId && indexSpec.fecha && indexSpec.hora) {
                console.log('✅ ÍNDICE CRÍTICO ENCONTRADO:', indexName);
                console.log('   Campos:', indexSpec);

                // Verificar que es único
                const indexInfo = await Reserva.collection.indexInformation();
                const isUnique = indexInfo[indexName]?.unique || false;

                if (isUnique) {
                    console.log('   ✅ Es ÚNICO (previene duplicados)');
                } else {
                    console.log('   ⚠️  NO es único (PROBLEMA)');
                }

                criticalIndexFound = true;
            }
        }

        if (!criticalIndexFound) {
            console.log('❌ CRÍTICO: Índice único (barberoId + fecha + hora) NO EXISTE');
            console.log('\n📝 Para crear el índice manualmente:');
            console.log(`
db.reservas.createIndex(
  { barberoId: 1, fecha: 1, hora: 1 },
  { 
    unique: true,
    partialFilterExpression: { estado: { $in: ["RESERVADA", "COMPLETADA"] } }
  }
)
      `);
        }

        // Verificar otros índices importantes
        console.log('\n📋 Otros índices:');
        for (const [indexName, indexSpec] of Object.entries(indexes)) {
            if (indexName !== '_id_') {
                console.log(`   - ${indexName}:`, indexSpec);
            }
        }

        await mongoose.disconnect();
        console.log('\n✅ Verificación completada');

        process.exit(criticalIndexFound ? 0 : 1);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

verifyIndexes();
