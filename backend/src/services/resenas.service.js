const Resena = require("../infrastructure/database/mongodb/models/Resena");
const Barberia = require("../infrastructure/database/mongodb/models/Barberia");

/**
 * Recalcula las estadísticas de reseñas de una barbería
 * y las guarda en el modelo Barberia para acceso rápido
 * 
 * @param {ObjectId} barberiaId - ID de la barbería
 * @param {Object} session - Sesión de MongoDB para transacciones (opcional)
 * @returns {Promise<Object>} Estadísticas calculadas
 */
async function recalcularEstadisticasResenas(barberiaId, session = null) {
    try {
        // Usar agregación de MongoDB para cálculo eficiente
        const stats = await Resena.aggregate([
            {
                $match: {
                    barberiaId: barberiaId,
                    aprobada: true,
                    visible: true
                }
            },
            {
                $group: {
                    _id: null,
                    ratingAverage: { $avg: "$calificacionGeneral" },
                    ratingCount: { $sum: 1 },
                    ratings: { $push: "$calificacionGeneral" }
                }
            }
        ]);

        // Calcular distribución de calificaciones
        const distribucion = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

        if (stats.length > 0 && stats[0].ratings) {
            stats[0].ratings.forEach(rating => {
                distribucion[rating] = (distribucion[rating] || 0) + 1;
            });
        }

        const estadisticas = {
            ratingAverage: stats.length > 0 ? Math.round(stats[0].ratingAverage * 10) / 10 : 0,
            ratingCount: stats.length > 0 ? stats[0].ratingCount : 0,
            distribucion,
            lastUpdated: new Date()
        };

        // Actualizar en el modelo Barbería
        const updateOptions = session ? { session } : {};
        await Barberia.findByIdAndUpdate(
            barberiaId,
            { estadisticasResenas: estadisticas },
            updateOptions
        );

        console.log(`✅ Estadísticas de reseñas recalculadas para barbería ${barberiaId}`);
        return estadisticas;

    } catch (error) {
        console.error("❌ Error recalculando estadísticas de reseñas:", error);
        throw error;
    }
}

/**
 * Incrementa el contador de una calificación específica
 * Útil para actualizaciones incrementales sin recalcular todo
 * 
 * @param {ObjectId} barberiaId - ID de la barbería
 * @param {Number} rating - Calificación (1-5)
 * @param {Number} delta - Incremento (+1 para agregar, -1 para quitar)
 */
async function actualizarDistribucionIncremental(barberiaId, rating, delta = 1) {
    try {
        const updateField = `estadisticasResenas.distribucion.${rating}`;

        await Barberia.findByIdAndUpdate(barberiaId, {
            $inc: {
                [updateField]: delta,
                'estadisticasResenas.ratingCount': delta
            },
            $set: {
                'estadisticasResenas.lastUpdated': new Date()
            }
        });

        // Recalcular promedio
        const barberia = await Barberia.findById(barberiaId);
        if (barberia && barberia.estadisticasResenas) {
            const dist = barberia.estadisticasResenas.distribucion;
            const total = barberia.estadisticasResenas.ratingCount;

            if (total > 0) {
                const suma = (dist[5] * 5) + (dist[4] * 4) + (dist[3] * 3) + (dist[2] * 2) + (dist[1] * 1);
                const promedio = Math.round((suma / total) * 10) / 10;

                await Barberia.findByIdAndUpdate(barberiaId, {
                    'estadisticasResenas.ratingAverage': promedio
                });
            }
        }

    } catch (error) {
        console.error("❌ Error actualizando distribución incremental:", error);
        throw error;
    }
}

module.exports = {
    recalcularEstadisticasResenas,
    actualizarDistribucionIncremental
};
