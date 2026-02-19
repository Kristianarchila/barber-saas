/**
 * FichaTecnica Controller (Hexagonal Architecture Version)
 * Uses existing models directly
 */
const FichaTecnica = require("../infrastructure/database/mongodb/models/FichaTecnica");

// ==========================================
// 1) OBTENER FICHA POR CLIENTE
// ==========================================
exports.obtenerFichaPorCliente = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { clienteId } = req.params;

        let ficha = await FichaTecnica.findOne({ clienteId, barberiaId })
            .populate("clienteId", "nombre email telefono")
            .populate("historialServicios.servicioId", "nombre")
            .populate("historialServicios.barberoId", "nombre");

        if (!ficha) {
            ficha = await FichaTecnica.create({
                clienteId,
                barberiaId,
                notasGenerales: "",
                historialServicios: []
            });
        }

        res.json(ficha);
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 2) ACTUALIZAR NOTAS GENERALES
// ==========================================
exports.actualizarNotasGenerales = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { clienteId } = req.params;
        const { notasGenerales } = req.body;

        let ficha = await FichaTecnica.findOne({ clienteId, barberiaId });

        if (!ficha) {
            ficha = await FichaTecnica.create({
                clienteId,
                barberiaId,
                notasGenerales
            });
        } else {
            ficha.notasGenerales = notasGenerales;
            await ficha.save();
        }

        res.json(ficha);
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 3) AGREGAR SERVICIO AL HISTORIAL
// ==========================================
exports.agregarServicioHistorial = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { clienteId } = req.params;
        const { servicio, barbero, notas, fotos } = req.body;

        let ficha = await FichaTecnica.findOne({ clienteId, barberiaId });

        if (!ficha) {
            ficha = await FichaTecnica.create({ clienteId, barberiaId });
        }

        ficha.historialServicios.push({
            servicioId: servicio,
            barberoId: barbero,
            fecha: new Date(),
            notaTecnica: notas,
            fotos: fotos || []
        });

        await ficha.save();
        res.json(ficha);
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 4) ELIMINAR FOTO DE HISTORIAL
// ==========================================
exports.eliminarFotoHistorial = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { clienteId, servicioId } = req.params;
        const { fotoUrl } = req.body;

        const ficha = await FichaTecnica.findOne({ clienteId, barberiaId });

        if (!ficha) {
            return res.status(404).json({ message: "Ficha técnica no encontrada" });
        }

        const servicioH = ficha.historialServicios.id(servicioId);
        if (!servicioH) {
            return res.status(404).json({ message: "Servicio no encontrado en historial" });
        }

        servicioH.fotos = servicioH.fotos.filter(foto => foto !== fotoUrl);
        await ficha.save();

        res.json(ficha);
    } catch (error) {
        next(error);
    }
};
