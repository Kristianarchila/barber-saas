const FichaTecnica = require("../models/FichaTecnica");
const User = require("../models/User");

/**
 * Obtener o crear ficha técnica de un cliente para una barbería específica
 */
exports.obtenerFichaPorCliente = async (req, res, next) => {
    try {
        const { clienteId } = req.params;
        const { barberiaId } = req.user;

        let ficha = await FichaTecnica.findOne({ clienteId, barberiaId })
            .populate("historialServicios.barberoId", "nombre")
            .populate("historialServicios.servicioId", "nombre");

        if (!ficha) {
            // Validar que el usuario sea realmente un cliente
            const cliente = await User.findOne({ _id: clienteId, rol: "CLIENTE" });
            if (!cliente) {
                return res.status(404).json({ message: "Cliente no encontrado" });
            }

            ficha = await FichaTecnica.create({
                clienteId,
                barberiaId,
                historialServicios: []
            });
        }

        res.json(ficha);
    } catch (error) {
        next(error);
    }
};

/**
 * Actualizar las notas generales (preferencias constantes)
 */
exports.actualizarNotasGenerales = async (req, res, next) => {
    try {
        const { clienteId } = req.params;
        const { barberiaId } = req.user;
        const { notasGenerales } = req.body;

        const ficha = await FichaTecnica.findOneAndUpdate(
            { clienteId, barberiaId },
            { notasGenerales },
            { new: true, upsert: true }
        );

        res.json({
            message: "Notas generales actualizadas",
            ficha
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Agregar una entrada al historial de servicios técnicos
 */
exports.agregarServicioHistorial = async (req, res, next) => {
    try {
        const { clienteId } = req.params;
        const { barberiaId } = req.user;
        const { barberoId, servicioId, notaTecnica, fotos } = req.body;

        const nuevaEntrada = {
            fecha: new Date(),
            barberoId: barberoId || req.user.id, // Si no viene, usa el ID del que está logueado
            servicioId,
            notaTecnica,
            fotos: fotos || []
        };

        const ficha = await FichaTecnica.findOneAndUpdate(
            { clienteId, barberiaId },
            { $push: { historialServicios: { $each: [nuevaEntrada], $position: 0 } } },
            { new: true, upsert: true }
        );

        res.status(201).json({
            message: "Servicio técnico registrado en historial",
            ficha
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Eliminar una foto específica del historial (opcional)
 */
exports.eliminarFotoHistorial = async (req, res, next) => {
    try {
        const { clienteId, servicioId, fotoUrl } = req.params;
        const { barberiaId } = req.user;

        const ficha = await FichaTecnica.findOneAndUpdate(
            { clienteId, barberiaId, "historialServicios._id": servicioId },
            { $pull: { "historialServicios.$.fotos": fotoUrl } },
            { new: true }
        );

        res.json({
            message: "Foto eliminada",
            ficha
        });
    } catch (error) {
        next(error);
    }
};
