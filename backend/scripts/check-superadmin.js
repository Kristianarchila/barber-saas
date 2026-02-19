// Script para verificar si existe un SUPER_ADMIN
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Barberia = require('../src/models/Barberia');

async function checkSuperAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado a MongoDB\n');

        // Buscar todos los SUPER_ADMIN
        const superAdmins = await User.find({ rol: 'SUPER_ADMIN' });

        console.log('📊 SUPER_ADMINS ENCONTRADOS:', superAdmins.length);
        console.log('='.repeat(50));

        if (superAdmins.length === 0) {
            console.log('❌ No hay ningún usuario SUPER_ADMIN en la base de datos\n');
            console.log('Para crear uno, ejecuta:');
            console.log('  node scripts/create-superadmin.js\n');
        } else {
            superAdmins.forEach((admin, index) => {
                console.log(`\n${index + 1}. SUPER_ADMIN:`);
                console.log('   - ID:', admin._id);
                console.log('   - Nombre:', admin.nombre);
                console.log('   - Email:', admin.email);
                console.log('   - Activo:', admin.activo ? '✅' : '❌');
                console.log('   - Creado:', admin.createdAt);
            });
        }

        // Contar barberías
        const totalBarberias = await Barberia.countDocuments();
        const activas = await Barberia.countDocuments({ estado: 'activa' });
        const trial = await Barberia.countDocuments({ estado: 'trial' });
        const suspendidas = await Barberia.countDocuments({ estado: 'suspendida' });

        console.log('\n' + '='.repeat(50));
        console.log('📊 ESTADÍSTICAS DE BARBERÍAS:');
        console.log('   - Total:', totalBarberias);
        console.log('   - Activas:', activas);
        console.log('   - Trial:', trial);
        console.log('   - Suspendidas:', suspendidas);

        if (totalBarberias === 0) {
            console.log('\n⚠️  No hay barberías registradas en el sistema');
        } else {
            const barberias = await Barberia.find().select('nombre slug estado').limit(10);
            console.log('\n📋 Primeras barberías:');
            barberias.forEach((b, i) => {
                console.log(`   ${i + 1}. ${b.nombre} (/${b.slug}) - ${b.estado}`);
            });
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Desconectado de MongoDB');
    }
}

checkSuperAdmin();
