const Resena = require("../infrastructure/database/mongodb/models/Resena");

/**
 * Detecta si una reseña es potencialmente spam
 * 
 * @param {Object} params - Parámetros de la reseña
 * @param {string} params.emailCliente - Email del cliente
 * @param {string} params.comentario - Comentario de la reseña
 * @param {number} params.calificacionGeneral - Calificación general
 * @param {ObjectId} params.barberiaId - ID de la barbería
 * @returns {Promise<{esSpam: boolean, razon: string|null}>}
 */
async function detectarSpam({ emailCliente, comentario, calificacionGeneral, barberiaId }) {
    try {
        // 1. Verificar reseñas duplicadas del mismo email en las últimas 24 horas
        const hace24Horas = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const resenasRecientes = await Resena.find({
            emailCliente,
            barberiaId,
            createdAt: { $gte: hace24Horas }
        });

        if (resenasRecientes.length > 0) {
            return {
                esSpam: true,
                razon: 'duplicada'
            };
        }

        // 2. Verificar contenido repetitivo (mismo comentario)
        if (comentario && comentario.trim().length > 10) {
            const comentarioNormalizado = comentario.toLowerCase().trim();

            const resenasConMismoComentario = await Resena.find({
                barberiaId,
                comentario: { $regex: new RegExp(`^${comentarioNormalizado}$`, 'i') },
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Últimos 7 días
            });

            if (resenasConMismoComentario.length > 0) {
                return {
                    esSpam: true,
                    razon: 'contenido_repetitivo'
                };
            }
        }

        // 3. Detectar patrones sospechosos
        // Múltiples reseñas del mismo email en diferentes barberías en poco tiempo
        const resenasGlobales = await Resena.find({
            emailCliente,
            createdAt: { $gte: hace24Horas }
        });

        if (resenasGlobales.length >= 5) {
            return {
                esSpam: true,
                razon: 'patron_sospechoso'
            };
        }

        // 4. Verificar comentarios extremadamente cortos con calificación extrema
        if (comentario && comentario.trim().length < 5) {
            if (calificacionGeneral === 1 || calificacionGeneral === 5) {
                // Permitir, pero marcar para revisión manual si hay muchas así
                const resenasExtremasCortas = await Resena.find({
                    barberiaId,
                    $or: [
                        { calificacionGeneral: 1 },
                        { calificacionGeneral: 5 }
                    ],
                    comentario: { $exists: true },
                    $expr: { $lt: [{ $strLenCP: "$comentario" }, 5] },
                    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                });

                if (resenasExtremasCortas.length >= 10) {
                    return {
                        esSpam: true,
                        razon: 'patron_sospechoso'
                    };
                }
            }
        }

        // No es spam
        return {
            esSpam: false,
            razon: null
        };

    } catch (error) {
        console.error("Error al detectar spam:", error);
        // En caso de error, no marcar como spam (fail-safe)
        return {
            esSpam: false,
            razon: null
        };
    }
}

/**
 * Valida si un token de reseña ha expirado
 * 
 * @param {Date} expiryDate - Fecha de expiración del token
 * @returns {boolean} true si el token ha expirado
 */
function tokenExpirado(expiryDate) {
    if (!expiryDate) {
        // Si no hay fecha de expiración (tokens antiguos), no han expirado
        return false;
    }
    return new Date() > new Date(expiryDate);
}

module.exports = {
    detectarSpam,
    tokenExpirado
};
