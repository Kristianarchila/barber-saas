const Cupon = require("../models/Cupon");
const UsoCupon = require("../models/UsoCupon");
const { validarCupon, aplicarCupon } = require("../services/cupon.service");

/**
 * @desc    Obtener todos los cupones de una barbería
 * @route   GET /api/barberias/:slug/cupones
 * @access  Private (Admin)
 */
const getCupones = async (req, res) => {
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

/**
 * @desc    Crear cupón
 * @route   POST /api/barberias/:slug/cupones
 * @access  Private (Admin)
 */
const createCupon = async (req, res) => {
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

/**
 * @desc    Actualizar cupón
 * @route   PUT /api/barberias/:slug/cupones/:id
 * @access  Private (Admin)
 */
const updateCupon = async (req, res) => {
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

/**
 * @desc    Eliminar/desactivar cupón
 * @route   DELETE /api/barberias/:slug/cupones/:id
 * @access  Private (Admin)
 */
const deleteCupon = async (req, res) => {
    try {
        const { id } = req.params;

        const cupon = await Cupon.findById(id);
        if (!cupon) {
            return res.status(404).json({ message: "Cupón no encontrado" });
        }

        cupon.activo = false;
        await cupon.save();

        res.json({ message: "Cupón desactivado" });
    } catch (error) {
        console.error("Error deleting cupon:", error);
        res.status(500).json({ message: "Error eliminando cupón" });
    }
};

/**
 * @desc    Validar cupón (público para usuarios)
 * @route   POST /api/barberias/:slug/cupones/validar
 * @access  Private (cualquier usuario autenticado)
 */
const validarCuponEndpoint = async (req, res) => {
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

/**
 * @desc    Obtener estadísticas de uso de cupones
 * @route   GET /api/barberias/:slug/cupones/:id/estadisticas
 * @access  Private (Admin)
 */
const getCuponStats = async (req, res) => {
    try {
        const { id } = req.params;

        const usos = await UsoCupon.find({ cupon: id })
            .populate("usuario", "nombre email")
            .sort({ createdAt: -1 });

        const totalDescuento = usos.reduce((sum, uso) => sum + uso.descuentoAplicado, 0);

        res.json({
            totalUsos: usos.length,
            totalDescuento,
            usos,
        });
    } catch (error) {
        console.error("Error getting cupon stats:", error);
        res.status(500).json({ message: "Error obteniendo estadísticas" });
    }
};

module.exports = {
    getCupones,
    createCupon,
    updateCupon,
    deleteCupon,
    validarCuponEndpoint,
    getCuponStats,
};
