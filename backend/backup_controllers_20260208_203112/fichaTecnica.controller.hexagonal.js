/**
 * FichaTecnica Controller (Hexagonal Architecture Version)
 * Uses existing models directly
 */
const container = require('../shared/Container');
const FichaTecnica = require("../models/FichaTecnica");

exports.obtenerFichaPorCliente = async (req, res, next) => {
    try {
        const { clienteId } = req.params;

        let ficha = await FichaTecnica.findOne({ cliente: clienteId })
            .populate("cliente", "nombre email telefono")
            .populate("historialServicios.servicio", "nombre")
            .populate("historialServicios.barbero", "nombre");

        if (!ficha) {
            ficha = await FichaTecnica.create({
                cliente: clienteId,
                notasGenerales: "",
                historialServicios: []
            });
        }

        res.json(ficha);
    } catch (error) {
        next(error);
    }
};

exports.actualizarNotasGenerales = async (req, res, next) => {
    try {
        const { clienteId } = req.params;
        const { notasGenerales } = req.body;

        let ficha = await FichaTecnica.findOne({ cliente: clienteId });

        if (!ficha) {
            ficha = await FichaTecnica.create({
                cliente: clienteId,
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

exports.agregarServicioHistorial = async (req, res, next) => {
    try {
        const { clienteId } = req.params;
        const { servicio, barbero, notas, fotos } = req.body;

        let ficha = await FichaTecnica.findOne({ cliente: clienteId });

        if (!ficha) {
            ficha = await FichaTecnica.create({ cliente: clienteId });
        }

        ficha.historialServicios.push({
            servicio,
            barbero,
            fecha: new Date(),
            notas,
            fotos: fotos || []
        });

        await ficha.save();
        res.json(ficha);
    } catch (error) {
        next(error);
    }
};

exports.eliminarFotoHistorial = async (req, res, next) => {
    try {
        const { clienteId, servicioId } = req.params;
        const { fotoUrl } = req.body;

        const ficha = await FichaTecnica.findOne({ cliente: clienteId });

        if (!ficha) {
            return res.status(404).json({ message: "Ficha técnica no encontrada" });
        }

        const servicio = ficha.historialServicios.id(servicioId);
        if (!servicio) {
            return res.status(404).json({ message: "Servicio no encontrado en historial" });
        }

        servicio.fotos = servicio.fotos.filter(foto => foto !== fotoUrl);
        await ficha.save();

        res.json(ficha);
    } catch (error) {
        next(error);
    }
};
