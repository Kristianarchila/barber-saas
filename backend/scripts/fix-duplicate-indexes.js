require('dotenv').config();
const mongoose = require('mongoose');

/**
 * Migration Script: Fix Duplicate Indexes
 * 
 * This script drops old duplicate indexes and ensures only the correct
 * indexes exist in the database.
 * 
 * SAFE TO RUN MULTIPLE TIMES - will skip if indexes don't exist
 */

async function fixDuplicateIndexes() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        const db = mongoose.connection.db;

        // ========================================
        // FIX RESENA COLLECTION
        // ========================================
        console.log('📋 Fixing Resena indexes...');
        const resenaCollection = db.collection('resenas');

        try {
            // Drop old duplicate indexes if they exist
            await resenaCollection.dropIndex('reservaId_1').catch(() => console.log('  ⏭️  reservaId_1 index not found (OK)'));
            await resenaCollection.dropIndex('reviewToken_1').catch(() => console.log('  ⏭️  reviewToken_1 index not found (OK)'));

            // Recreate correct indexes
            await resenaCollection.createIndex({ barberiaId: 1, aprobada: 1 });
            await resenaCollection.createIndex({ barberoId: 1, aprobada: 1 });
            await resenaCollection.createIndex({ reservaId: 1 }, { unique: true });
            await resenaCollection.createIndex({ reviewToken: 1 }, { unique: true, sparse: true });
            await resenaCollection.createIndex({ createdAt: -1 });

            console.log('✅ Resena indexes fixed\n');
        } catch (error) {
            console.error('❌ Error fixing Resena indexes:', error.message);
        }

        // ========================================
        // FIX PEDIDO COLLECTION
        // ========================================
        console.log('📋 Fixing Pedido indexes...');
        const pedidoCollection = db.collection('pedidos');

        try {
            // Drop old duplicate indexes
            await pedidoCollection.dropIndex('numeroPedido_1').catch(() => console.log('  ⏭️  numeroPedido_1 index not found (OK)'));
            await pedidoCollection.dropIndex('expiraEn_1').catch(() => console.log('  ⏭️  expiraEn_1 index not found (OK)'));

            // Recreate correct indexes
            await pedidoCollection.createIndex({ barberiaId: 1, estado: 1, createdAt: -1 });
            await pedidoCollection.createIndex({ clienteId: 1, createdAt: -1 });
            await pedidoCollection.createIndex({ numeroPedido: 1 }, { unique: true });

            console.log('✅ Pedido indexes fixed\n');
        } catch (error) {
            console.error('❌ Error fixing Pedido indexes:', error.message);
        }

        // ========================================
        // FIX RESERVA COLLECTION
        // ========================================
        console.log('📋 Fixing Reserva indexes...');
        const reservaCollection = db.collection('reservas');

        try {
            // Drop old duplicate indexes
            await reservaCollection.dropIndex('reviewToken_1').catch(() => console.log('  ⏭️  reviewToken_1 index not found (OK)'));

            // Recreate correct indexes
            await reservaCollection.createIndex(
                { barberoId: 1, fecha: 1, hora: 1, barberiaId: 1 },
                {
                    unique: true,
                    partialFilterExpression: { estado: { $in: ["RESERVADA", "COMPLETADA"] } },
                    name: 'unique_reservation_slot'
                }
            );
            await reservaCollection.createIndex({ barberiaId: 1, fecha: 1 });
            await reservaCollection.createIndex({ emailCliente: 1 });
            await reservaCollection.createIndex({ cancelToken: 1 }, { unique: true, sparse: true });
            await reservaCollection.createIndex({ reviewToken: 1 }, { unique: true, sparse: true });

            console.log('✅ Reserva indexes fixed\n');
        } catch (error) {
            console.error('❌ Error fixing Reserva indexes:', error.message);
        }

        // ========================================
        // FIX CARRITO COLLECTION
        // ========================================
        console.log('📋 Fixing Carrito indexes...');
        const carritoCollection = db.collection('carritos');

        try {
            // Drop old duplicate indexes
            await carritoCollection.dropIndex('expiraEn_1').catch(() => console.log('  ⏭️  expiraEn_1 index not found (OK)'));

            // Recreate correct indexes
            await carritoCollection.createIndex({ barberiaId: 1, clienteId: 1 });
            await carritoCollection.createIndex({ barberiaId: 1, sessionId: 1 });
            await carritoCollection.createIndex({ expiraEn: 1 }, { expireAfterSeconds: 0 }); // TTL index

            console.log('✅ Carrito indexes fixed\n');
        } catch (error) {
            console.error('❌ Error fixing Carrito indexes:', error.message);
        }

        // ========================================
        // SUMMARY
        // ========================================
        console.log('═══════════════════════════════════════');
        console.log('✅ All indexes fixed successfully!');
        console.log('═══════════════════════════════════════\n');

        console.log('📊 Current indexes:');
        const collections = ['resenas', 'pedidos', 'reservas', 'carritos'];
        for (const collName of collections) {
            const coll = db.collection(collName);
            const indexes = await coll.indexes();
            console.log(`\n${collName}:`);
            indexes.forEach(idx => {
                console.log(`  - ${JSON.stringify(idx.key)} ${idx.unique ? '(unique)' : ''} ${idx.sparse ? '(sparse)' : ''}`);
            });
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

// Run migration
fixDuplicateIndexes()
    .then(() => {
        console.log('\n✅ Migration completed successfully!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    });
