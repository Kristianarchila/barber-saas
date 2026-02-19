// Script para verificar si el admin tiene una barbería asignada
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Barberia = require('../src/models/Barberia');

async function checkAdminBarberia() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado a MongoDB');

        // Buscar el usuario admin
        const adminId = '69488fbc69326d57eb39ad2e';
        const admin = await User.findById(adminId).populate('barberiaId');

        if (!admin) {
            console.log('❌ Usuario admin no encontrado');
            return;
        }

        console.log('\n📋 INFORMACIÓN DEL ADMIN:');
        console.log('  - ID:', admin._id);
        console.log('  - Nombre:', admin.nombre);
        console.log('  - Email:', admin.email);
        console.log('  - Rol:', admin.rol);
        console.log('  - BarberiaId:', admin.barberiaId);

        if (admin.barberiaId) {
            console.log('\n🏪 BARBERÍA ASIGNADA:');
            console.log('  - Nombre:', admin.barberiaId.nombre);
            console.log('  - Slug:', admin.barberiaId.slug);
            console.log('  - Email:', admin.barberiaId.email);
        } else {
            console.log('\n⚠️ El admin NO tiene barbería asignada');

            // Buscar todas las barberías
            const barberias = await Barberia.find();
            console.log(`\n📊 Barberías disponibles: ${barberias.length}`);

            if (barberias.length > 0) {
                console.log('\n🏪 BARBERÍAS EN LA BASE DE DATOS:');
                barberias.forEach((b, i) => {
                    console.log(`  ${i + 1}. ${b.nombre} (slug: ${b.slug}, id: ${b._id})`);
                });

                console.log('\n💡 Para asignar una barbería al admin, ejecuta:');
                console.log(`   node scripts/assign-barberia-to-admin.js ${adminId} ${barberias[0]._id}`);
            } else {
                console.log('\n⚠️ No hay barberías en la base de datos');
                console.log('💡 Primero debes crear una barbería');
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Desconectado de MongoDB');
    }
}

checkAdminBarberia();
