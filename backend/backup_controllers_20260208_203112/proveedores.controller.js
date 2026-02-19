const Proveedor = require("../models/Proveedor");

/**
 * @desc    Obtener todos los proveedores de una barbería
 * @route   GET /api/barberias/:slug/proveedores
 * @access  Private (Admin)
 */
const getProveedores = async (req, res) => {
    try {
        const barberia = req.barberia;
        const { activo } = req.query;

        const query = { barberia: barberia._id };

        if (activo !== undefined) {
            query.activo = activo === "true";
        }

        const proveedores = await Proveedor.find(query)
            .populate("productos", "nombre imagen")
            .sort({ nombre: 1 });

        res.json({ proveedores });
    } catch (error) {
        console.error("Error getting proveedores:", error);
        res.status(500).json({ message: "Error obteniendo proveedores" });
    }
};

/**
 * @desc    Obtener un proveedor específico
 * @route   GET /api/barberias/:slug/proveedores/:id
 * @access  Private (Admin)
 */
const getProveedor = async (req, res) => {
    try {
        const { id } = req.params;

        const proveedor = await Proveedor.findById(id).populate("productos");

        if (!proveedor) {
            return res.status(404).json({ message: "Proveedor no encontrado" });
        }

        res.json({ proveedor });
    } catch (error) {
        console.error("Error getting proveedor:", error);
        res.status(500).json({ message: "Error obteniendo proveedor" });
    }
};

/**
 * @desc    Crear proveedor
 * @route   POST /api/barberias/:slug/proveedores
 * @access  Private (Admin)
 */
const createProveedor = async (req, res) => {
    try {
        const barberia = req.barberia;
        const proveedorData = {
            ...req.body,
            barberia: barberia._id,
        };

        const proveedor = await Proveedor.create(proveedorData);

        res.status(201).json({ proveedor });
    } catch (error) {
        console.error("Error creating proveedor:", error);
        res.status(500).json({ message: "Error creando proveedor" });
    }
};

/**
 * @desc    Actualizar proveedor
 * @route   PUT /api/barberias/:slug/proveedores/:id
 * @access  Private (Admin)
 */
const updateProveedor = async (req, res) => {
    try {
        const { id } = req.params;

        const proveedor = await Proveedor.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        }).populate("productos");

        if (!proveedor) {
            return res.status(404).json({ message: "Proveedor no encontrado" });
        }

        res.json({ proveedor });
    } catch (error) {
        console.error("Error updating proveedor:", error);
        res.status(500).json({ message: "Error actualizando proveedor" });
    }
};

/**
 * @desc    Eliminar (desactivar) proveedor
 * @route   DELETE /api/barberias/:slug/proveedores/:id
 * @access  Private (Admin)
 */
const deleteProveedor = async (req, res) => {
    try {
        const { id } = req.params;

        const proveedor = await Proveedor.findById(id);

        if (!proveedor) {
            return res.status(404).json({ message: "Proveedor no encontrado" });
        }

        proveedor.activo = false;
        await proveedor.save();

        res.json({ message: "Proveedor desactivado exitosamente" });
    } catch (error) {
        console.error("Error deleting proveedor:", error);
        res.status(500).json({ message: "Error eliminando proveedor" });
    }
};

module.exports = {
    getProveedores,
    getProveedor,
    createProveedor,
    updateProveedor,
    deleteProveedor,
};
