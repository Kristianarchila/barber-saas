// Script para crear el primer usuario SUPER_ADMIN
require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const User = require('../src/models/User');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function createSuperAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado a MongoDB\n');

        // Verificar si ya existe un SUPER_ADMIN
        const existingSuperAdmin = await User.findOne({ rol: 'SUPER_ADMIN' });
        if (existingSuperAdmin) {
            console.log('⚠️  Ya existe un usuario SUPER_ADMIN:');
            console.log('   - Nombre:', existingSuperAdmin.nombre);
            console.log('   - Email:', existingSuperAdmin.email);
            console.log('   - Activo:', existingSuperAdmin.activo);

            const continuar = await question('\n¿Deseas crear otro SUPER_ADMIN de todas formas? (s/n): ');
            if (continuar.toLowerCase() !== 's') {
                console.log('\n❌ Operación cancelada');
                rl.close();
                await mongoose.disconnect();
                return;
            }
        }

        console.log('📝 Creando nuevo usuario SUPER_ADMIN\n');

        // Solicitar datos
        const nombre = await question('Nombre completo: ');
        const email = await question('Email: ');
        const password = await question('Contraseña (mínimo 8 caracteres): ');

        // Validaciones
        if (!nombre || !email || !password) {
            console.log('\n❌ Error: Todos los campos son obligatorios');
            rl.close();
            await mongoose.disconnect();
            return;
        }

        if (password.length < 8) {
            console.log('\n❌ Error: La contraseña debe tener al menos 8 caracteres');
            rl.close();
            await mongoose.disconnect();
            return;
        }

        // Verificar que el email no exista
        const emailExiste = await User.findOne({ email: email.toLowerCase() });
        if (emailExiste) {
            console.log('\n❌ Error: El email ya está registrado');
            rl.close();
            await mongoose.disconnect();
            return;
        }

        // Crear usuario
        const nuevoSuperAdmin = new User({
            nombre,
            email: email.toLowerCase(),
            password, // Se hasheará automáticamente en el modelo
            rol: 'SUPER_ADMIN',
            barberiaId: null, // SUPER_ADMIN no tiene barbería asignada
            activo: true
        });

        await nuevoSuperAdmin.save();

        console.log('\n✅ Usuario SUPER_ADMIN creado exitosamente!');
        console.log('\n📋 Detalles:');
        console.log('   - ID:', nuevoSuperAdmin._id);
        console.log('   - Nombre:', nuevoSuperAdmin.nombre);
        console.log('   - Email:', nuevoSuperAdmin.email);
        console.log('   - Rol:', nuevoSuperAdmin.rol);
        console.log('   - Activo:', nuevoSuperAdmin.activo);
        console.log('\n🔐 Ahora puedes iniciar sesión con estas credenciales');
        console.log('   URL: http://localhost:5173/login');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        rl.close();
        await mongoose.disconnect();
        console.log('\n👋 Desconectado de MongoDB');
    }
}

createSuperAdmin();
