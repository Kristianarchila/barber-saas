// Script para agregar slug a la barbería que no lo tiene
require('dotenv').config();
const mongoose = require('mongoose');
const Barberia = require('../src/models/Barberia');

async function fixBarberiaSlug() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado a MongoDB');

        // Buscar barberías sin slug o con slug null/undefined
        const barberiaSinSlug = await Barberia.findOne({
            $or: [
                { slug: { $exists: false } },
                { slug: null },
                { slug: '' }
            ]
        });

        if (!barberiaSinSlug) {
            console.log('✅ Todas las barberías tienen slug');
            return;
        }

        console.log('\n🔧 Barbería encontrada sin slug:');
        console.log('  - ID:', barberiaSinSlug._id);
        console.log('  - Nombre:', barberiaSinSlug.nombre);

        // Generar slug desde el nombre
        const slug = barberiaSinSlug.nombre
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
            .replace(/[^a-z0-9]+/g, '-')     // Reemplazar espacios y caracteres especiales con -
            .replace(/^-+|-+$/g, '');        // Quitar guiones al inicio y final

        console.log('  - Slug generado:', slug);

        // Actualizar directamente sin validación
        await Barberia.updateOne(
            { _id: barberiaSinSlug._id },
            { $set: { slug: slug } }
        );

        console.log('\n✅ Barbería actualizada exitosamente');
        console.log('  - Nuevo slug:', slug);

        // Verificar si hay más barberías sin slug
        const count = await Barberia.countDocuments({
            $or: [
                { slug: { $exists: false } },
                { slug: null },
                { slug: '' }
            ]
        });
        if (count > 0) {
            console.log(`\n⚠️ Aún quedan ${count} barberías sin slug. Ejecuta el script nuevamente.`);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Desconectado de MongoDB');
    }
}

fixBarberiaSlug();
