
require("dotenv").config({ path: "c:/Users/Kristian/Desktop/barber-saas/backend/.env" });
const mongoose = require("mongoose");
const Horario = require("./src/models/Horario");
const Barbero = require("./src/models/Barbero");

async function checkHorarios() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Conectado a Mongo");

        const barberos = await Barbero.find();

        const allData = [];

        for (const barbero of barberos) {
            console.log(`\n💈 Barbero: ${barbero.nombre} (${barbero._id})`);
            const horarios = await Horario.find({ barberoId: barbero._id }).sort({ diaSemana: 1 });

            const result = horarios.map(h => ({
                dia: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][h.diaSemana],
                diaIndex: h.diaSemana,
                horaInicio: h.horaInicio,
                horaFin: h.horaFin,
                duracion: h.duracionTurno
            }));

            allData.push({
                nombre: barbero.nombre,
                id: barbero._id,
                horarios: result
            });
        }

        require('fs').writeFileSync('horarios.json', JSON.stringify(allData, null, 2));
        console.log("✅ Datos COMPLETOS guardados en horarios.json");

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

checkHorarios();
