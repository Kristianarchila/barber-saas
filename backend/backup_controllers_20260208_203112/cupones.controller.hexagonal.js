/**
 * Cupones Controller (Hexagonal Architecture Version)
 * Simplified implementation - delegates to existing cupon.service for complex validation
 */
const container = require('../shared/Container');
const Cupon = require("../models/Cupon");
const UsoCupon = require("../models/UsoCupon");
const { validarCupon, aplicarCupon } = require("../services/cupon.service");

exports.getCupones = async (req, res) => {
    try {
        const barberia = req.barberia;
        const { activo } = req.query;

        const query = { barberia: barberia._id };
        if (activo !== undefined) {
            query.activo = activo === "true";
        }

        const cupones = await Cupon.find(query)
            .populate("creadoPor", "nombre")
            .sort({ createdAt: -1 });

        res.json({ cupones });
    } catch (error) {
        console.error("Error getting cupones:", error);
        res.status(500).json({ message: "Error obteniendo cupones" });
    }
};

exports.createCupon = async (req, res) => {
    try {
        const barberia = req.barberia;
        const cuponData = {
            ...req.body,
            barberia: barberia._id,
            creadoPor: req.user.id,
        };

        const cupon = await Cupon.create(cuponData);
        res.status(201).json({ cupon });
    } catch (error) {
        console.error("Error creating cupon:", error);
        if (error.code === 11000) {
            return res.status(400).json({ message: "El código del cupón ya existe" });
        }
        res.status(500).json({ message: "Error creando cupón" });
    }
};

exports.updateCupon = async (req, res) => {
    try {
        const { id } = req.params;
        const cupon = await Cupon.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!cupon) {
            return res.status(404).json({ message: "Cupón no encontrado" });
        }

        res.json({ cupon });
    } catch (error) {
        console.error("Error updating cupon:", error);
        res.status(500).json({ message: "Error actualizando cupón" });
    }
};

exports.deleteCupon = async (req, res) => {
    try {
        const { id } = req.params;
        const cupon = await Cupon.findByIdAndUpdate(
            id,
            { activo: false },
            { new: true }
        );

        if (!cupon) {
            return res.status(404).json({ message: "Cupón no encontrado" });
        }

        res.json({ message: "Cupón desactivado", cupon });
    } catch (error) {
        console.error("Error deleting cupon:", error);
        res.status(500).json({ message: "Error eliminando cupón" });
    }
};

exports.validarCuponEndpoint = async (req, res) => {
    try {
        const barberia = req.barberia;
        const { codigo, montoCompra, tipoCompra, items } = req.body;

        const resultado = await validarCupon(
            codigo,
            barberia._id,
            req.user.id,
            montoCompra,
            tipoCompra,
            items
        );

        if (resultado.valid) {
            res.json({
                valid: true,
                descuento: resultado.descuento,
                montoFinal: resultado.montoFinal,
                mensaje: resultado.mensaje,
                cuponId: resultado.cupon._id,
            });
        } else {
            res.status(400).json({
                valid: false,
                mensaje: resultado.mensaje,
            });
        }
    } catch (error) {
        console.error("Error validando cupón:", error);
        res.status(500).json({ message: "Error validando cupón" });
    }
};

exports.getCuponStats = async (req, res) => {
    try {
        const barberia = req.barberia;

        const totalCupones = await Cupon.countDocuments({ barberia: barberia._id });
        const cuponesActivos = await Cupon.countDocuments({ barberia: barberia._id, activo: true });
        const totalUsos = await UsoCupon.countDocuments({ barberia: barberia._id });

        const usosRecientes = await UsoCupon.find({ barberia: barberia._id })
            .populate("cupon", "codigo descuento")
            .populate("usuario", "nombre email")
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            totalCupones,
            cuponesActivos,
            totalUsos,
            usosRecientes,
        });
    } catch (error) {
        console.error("Error getting estadísticas cupones:", error);
        res.status(500).json({ message: "Error obteniendo estadísticas" });
    }
};
