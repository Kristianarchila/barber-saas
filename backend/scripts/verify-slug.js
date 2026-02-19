// Script simple para verificar el slug de la barbería
require('dotenv').config();
const mongoose = require('mongoose');
const Barberia = require('../src/models/Barberia');

async function checkSlug() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const barberia = await Barberia.findOne({ nombre: 'Barbería Central' });

        if (barberia) {
            console.log('✅ Slug de la barbería:', barberia.slug);
        } else {
            console.log('❌ Barbería no encontrada');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

checkSlug();
