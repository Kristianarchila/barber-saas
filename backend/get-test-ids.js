/**
 * Quick Test - Get Database IDs
 * Run this to get a barberiaId and userId for testing
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function getTestIds() {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get first barberia
        const Barberia = require('./src/infrastructure/database/mongodb/models/Barberia');
        const barberia = await Barberia.findOne();

        if (barberia) {
            console.log('🏢 Barberia encontrada:');
            console.log(`   ID: ${barberia._id}`);
            console.log(`   Nombre: ${barberia.nombre}`);
            console.log(`   Plan: ${barberia.plan || 'N/A'}`);
        } else {
            console.log('❌ No hay barberías en la base de datos');
        }

        // Get SuperAdmin user
        const User = require('./src/infrastructure/database/mongodb/models/User');
        const superAdmin = await User.findOne({ rol: 'SUPER_ADMIN' });

        if (superAdmin) {
            console.log('\n👤 SuperAdmin encontrado:');
            console.log(`   ID: ${superAdmin._id}`);
            console.log(`   Email: ${superAdmin.email}`);
            console.log(`   Nombre: ${superAdmin.nombre}`);
        } else {
            console.log('\n❌ No hay SuperAdmin en la base de datos');
            console.log('   Necesitas crear un usuario SuperAdmin primero');
        }

        // Check if barberia has subscription
        if (barberia) {
            const Subscription = require('./src/infrastructure/database/mongodb/models/Subscription');
            const subscription = await Subscription.findOne({ barberiaId: barberia._id });

            if (subscription) {
                console.log('\n📋 Suscripción encontrada:');
                console.log(`   ID: ${subscription._id}`);
                console.log(`   Plan: ${subscription.plan}`);
                console.log(`   Status: ${subscription.status}`);
                console.log(`   Payment Method: ${subscription.paymentMethod || 'STRIPE'}`);
            } else {
                console.log('\n⚠️  Esta barbería no tiene suscripción');
                console.log('   Se creará automáticamente al hacer la primera operación');
            }
        }

        console.log('\n📝 Para probar los endpoints:');
        console.log('   1. Copia el Barberia ID de arriba');
        console.log('   2. Login como SuperAdmin para obtener token');
        console.log('   3. Usa los ejemplos en TESTING-SUBSCRIPTIONS.md');

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

getTestIds();
