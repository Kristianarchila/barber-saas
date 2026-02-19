/**
 * Database Migration Script - Add Compound Unique Index to Reserva Collection
 * 
 * This script creates a compound unique index to prevent overbooking:
 * - barberoId + fecha + hora + barberiaId
 * - Only applies to RESERVADA and COMPLETADA states (partial filter)
 * - Allows reusing time slots when reservations are CANCELADA
 * 
 * Run this script ONCE before deploying the overbooking fix
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function migrateReservaIndex() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('reservas');

        console.log('\n📋 Current indexes on reservas collection:');
        const existingIndexes = await collection.indexes();
        existingIndexes.forEach(index => {
            console.log(`  - ${index.name}:`, JSON.stringify(index.key));
        });

        // Check if old index exists (without barberiaId)
        const oldIndexName = 'barberoId_1_fecha_1_hora_1';
        const oldIndexExists = existingIndexes.some(idx => idx.name === oldIndexName);

        if (oldIndexExists) {
            console.log(`\n🗑️  Dropping old index: ${oldIndexName}`);
            await collection.dropIndex(oldIndexName);
            console.log('✅ Old index dropped');
        }

        // Create new compound unique index with barberiaId
        console.log('\n🔨 Creating new compound unique index: unique_reservation_slot');
        console.log('   Fields: barberoId + fecha + hora + barberiaId');
        console.log('   Filter: estado IN ["RESERVADA", "COMPLETADA"]');

        await collection.createIndex(
            { barberoId: 1, fecha: 1, hora: 1, barberiaId: 1 },
            {
                unique: true,
                partialFilterExpression: { estado: { $in: ["RESERVADA", "COMPLETADA"] } },
                name: 'unique_reservation_slot'
            }
        );

        console.log('✅ New index created successfully!');

        console.log('\n📋 Updated indexes on reservas collection:');
        const updatedIndexes = await collection.indexes();
        updatedIndexes.forEach(index => {
            console.log(`  - ${index.name}:`, JSON.stringify(index.key));
            if (index.partialFilterExpression) {
                console.log(`    Partial filter:`, JSON.stringify(index.partialFilterExpression));
            }
        });

        console.log('\n✅ Migration completed successfully!');
        console.log('\n🔐 Overbooking prevention is now active:');
        console.log('   - Only ONE reservation allowed per barbero/fecha/hora/barbería');
        console.log('   - CANCELADA reservations do not block the time slot');
        console.log('   - Complete tenant isolation enforced');

    } catch (error) {
        console.error('\n❌ Migration failed:', error);

        if (error.code === 11000) {
            console.error('\n⚠️  DUPLICATE KEY ERROR DETECTED!');
            console.error('   This means there are existing duplicate reservations in the database.');
            console.error('\n   Steps to fix:');
            console.error('   1. Run this query to find duplicates:');
            console.error('      db.reservas.aggregate([');
            console.error('        { $match: { estado: { $in: ["RESERVADA", "COMPLETADA"] } } },');
            console.error('        { $group: { _id: { barberoId: "$barberoId", fecha: "$fecha", hora: "$hora", barberiaId: "$barberiaId" }, count: { $sum: 1 } } },');
            console.error('        { $match: { count: { $gt: 1 } } }');
            console.error('      ])');
            console.error('\n   2. Manually resolve duplicates (cancel or reschedule)');
            console.error('   3. Run this migration script again');
        }

        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

// Run migration
console.log('🚀 Starting Reserva Index Migration...\n');
migrateReservaIndex();
