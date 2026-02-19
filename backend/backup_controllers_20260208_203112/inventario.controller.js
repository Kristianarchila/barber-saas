const Inventario = require("../models/Inventario");
const MovimientoStock = require("../models/MovimientoStock");
const Producto = require("../models/Producto");

/**
 * @desc    Obtener inventario completo de una barbería
 * @route   GET /api/barberias/:slug/inventario
 * @access  Private (Admin)
 */
const getInventario = async (req, res) => {
    try {
        const barberia = req.barberia;
        const { bajoStock, activo } = req.query;

        const query = { barberia: barberia._id };

        if (activo !== undefined) {
            query.activo = activo === "true";
        }

        let inventario = await Inventario.find(query)
            .populate("producto", "nombre descripcion precio imagen categoria")
            .sort({ "producto.nombre": 1 });

        // Filtrar por bajo stock si se solicita
        if (bajoStock === "true") {
            inventario = inventario.filter((item) => item.bajoPuntoReorden);
        }

        res.json({ inventario });
    } catch (error) {
        console.error("Error getting inventario:", error);
        res.status(500).json({ message: "Error obteniendo inventario" });
    }
};

/**
 * @desc    Obtener un item de inventario específico
 * @route   GET /api/barberias/:slug/inventario/:id
 * @access  Private (Admin)
 */
const getInventarioItem = async (req, res) => {
    try {
        const { id } = req.params;

        const item = await Inventario.findById(id).populate("producto");

        if (!item) {
            return res.status(404).json({ message: "Item de inventario no encontrado" });
        }

        res.json({ item });
    } catch (error) {
        console.error("Error getting inventario item:", error);
        res.status(500).json({ message: "Error obteniendo item" });
    }
};

/**
 * @desc    Crear registro de inventario para un producto
 * @route   POST /api/barberias/:slug/inventario
 * @access  Private (Admin)
 */
const createInventario = async (req, res) => {
    try {
        const barberia = req.barberia;
        const { productoId, cantidadInicial, stockMinimo, stockMaximo, ubicacion, unidadMedida } = req.body;

        // Verificar que el producto existe
        const producto = await Producto.findById(productoId);
        if (!producto) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        // Verificar si ya existe inventario para este producto
        const existente = await Inventario.findOne({
            producto: productoId,
            barberia: barberia._id,
        });

        if (existente) {
            return res.status(400).json({ message: "Ya existe inventario para este producto" });
        }

        // Crear inventario
        const inventario = await Inventario.create({
            producto: productoId,
            barberia: barberia._id,
            cantidadActual: cantidadInicial || 0,
            stockMinimo: stockMinimo || 5,
            stockMaximo: stockMaximo || 100,
            ubicacion,
            unidadMedida: unidadMedida || "unidad",
        });

        // Registrar movimiento inicial si hay cantidad
        if (cantidadInicial > 0) {
            await MovimientoStock.create({
                producto: productoId,
                inventario: inventario._id,
                barberia: barberia._id,
                tipo: "entrada",
                cantidad: cantidadInicial,
                cantidadAnterior: 0,
                cantidadNueva: cantidadInicial,
                motivo: "Stock inicial",
                usuario: req.user.id,
            });
        }

        const inventarioPopulated = await Inventario.findById(inventario._id).populate("producto");

        res.status(201).json({ inventario: inventarioPopulated });
    } catch (error) {
        console.error("Error creating inventario:", error);
        res.status(500).json({ message: "Error creando inventario" });
    }
};

/**
 * @desc    Actualizar configuración de inventario (stock mín/máx, ubicación)
 * @route   PUT /api/barberias/:slug/inventario/:id
 * @access  Private (Admin)
 */
const updateInventario = async (req, res) => {
    try {
        const { id } = req.params;
        const { stockMinimo, stockMaximo, ubicacion, unidadMedida, activo } = req.body;

        const inventario = await Inventario.findById(id);

        if (!inventario) {
            return res.status(404).json({ message: "Inventario no encontrado" });
        }

        if (stockMinimo !== undefined) inventario.stockMinimo = stockMinimo;
        if (stockMaximo !== undefined) inventario.stockMaximo = stockMaximo;
        if (ubicacion !== undefined) inventario.ubicacion = ubicacion;
        if (unidadMedida !== undefined) inventario.unidadMedida = unidadMedida;
        if (activo !== undefined) inventario.activo = activo;

        await inventario.save();

        const inventarioPopulated = await Inventario.findById(inventario._id).populate("producto");

        res.json({ inventario: inventarioPopulated });
    } catch (error) {
        console.error("Error updating inventario:", error);
        res.status(500).json({ message: "Error actualizando inventario" });
    }
};

/**
 * @desc    Registrar movimiento de stock (entrada/salida/ajuste)
 * @route   POST /api/barberias/:slug/inventario/:id/movimiento
 * @access  Private (Admin)
 */
const registrarMovimiento = async (req, res) => {
    try {
        const { id } = req.params;
        const barberia = req.barberia;
        const { tipo, cantidad, motivo, observaciones, proveedorId, costoUnitario } = req.body;

        if (!tipo || !cantidad || !motivo) {
            return res.status(400).json({ message: "Tipo, cantidad y motivo son requeridos" });
        }

        const inventario = await Inventario.findById(id);
        if (!inventario) {
            return res.status(404).json({ message: "Inventario no encontrado" });
        }

        const cantidadAnterior = inventario.cantidadActual;
        let cantidadNueva;

        // Calcular nueva cantidad según el tipo de movimiento
        switch (tipo) {
            case "entrada":
            case "devolucion":
                cantidadNueva = cantidadAnterior + cantidad;
                break;
            case "salida":
            case "venta":
                cantidadNueva = cantidadAnterior - cantidad;
                if (cantidadNueva < 0) {
                    return res.status(400).json({ message: "Stock insuficiente" });
                }
                break;
            case "ajuste":
                // En caso de ajuste, la cantidad es el nuevo total
                cantidadNueva = cantidad;
                break;
            default:
                return res.status(400).json({ message: "Tipo de movimiento inválido" });
        }

        // Crear movimiento
        const movimiento = await MovimientoStock.create({
            producto: inventario.producto,
            inventario: inventario._id,
            barberia: barberia._id,
            tipo,
            cantidad: tipo === "ajuste" ? Math.abs(cantidadNueva - cantidadAnterior) : cantidad,
            cantidadAnterior,
            cantidadNueva,
            motivo,
            observaciones,
            proveedor: proveedorId,
            usuario: req.user.id,
            costoUnitario,
            costoTotal: costoUnitario ? costoUnitario * cantidad : undefined,
        });

        // Actualizar inventario
        inventario.cantidadActual = cantidadNueva;
        await inventario.save();

        const movimientoPopulated = await MovimientoStock.findById(movimiento._id)
            .populate("producto", "nombre")
            .populate("proveedor", "nombre")
            .populate("usuario", "nombre");

        res.status(201).json({ movimiento: movimientoPopulated, inventario });
    } catch (error) {
        console.error("Error registrando movimiento:", error);
        res.status(500).json({ message: "Error registrando movimiento" });
    }
};

/**
 * @desc    Obtener historial de movimientos
 * @route   GET /api/barberias/:slug/inventario/movimientos
 * @access  Private (Admin)
 */
const getMovimientos = async (req, res) => {
    try {
        const barberia = req.barberia;
        const { productoId, tipo, page = 1, limit = 50 } = req.query;

        const query = { barberia: barberia._id };

        if (productoId) query.producto = productoId;
        if (tipo) query.tipo = tipo;

        const movimientos = await MovimientoStock.find(query)
            .populate("producto", "nombre imagen")
            .populate("proveedor", "nombre")
            .populate("usuario", "nombre")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await MovimientoStock.countDocuments(query);

        res.json({
            movimientos,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total,
        });
    } catch (error) {
        console.error("Error getting movimientos:", error);
        res.status(500).json({ message: "Error obteniendo movimientos" });
    }
};

/**
 * @desc    Obtener alertas de stock bajo
 * @route   GET /api/barberias/:slug/inventario/alertas
 * @access  Private (Admin)
 */
const getAlertasStock = async (req, res) => {
    try {
        const barberia = req.barberia;

        const inventario = await Inventario.find({
            barberia: barberia._id,
            activo: true,
        }).populate("producto", "nombre imagen precio");

        const alertas = inventario.filter((item) => item.bajoPuntoReorden);

        res.json({ alertas, total: alertas.length });
    } catch (error) {
        console.error("Error getting alertas:", error);
        res.status(500).json({ message: "Error obteniendo alertas" });
    }
};

module.exports = {
    getInventario,
    getInventarioItem,
    createInventario,
    updateInventario,
    registrarMovimiento,
    getMovimientos,
    getAlertasStock,
};
