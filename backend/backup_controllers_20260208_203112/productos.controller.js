const Producto = require('../models/Producto');
const Barberia = require('../models/Barberia');

// Obtener todos los productos de una barbería (público)
exports.obtenerProductos = async (req, res) => {
    try {
        const { slug } = req.params;
        const { categoria, destacado, busqueda, ordenar, limite = 20, pagina = 1 } = req.query;

        const barberia = await Barberia.findOne({ slug });
        if (!barberia) {
            return res.status(404).json({ message: 'Barbería no encontrada' });
        }

        const filtros = {
            categoria,
            destacado: destacado === 'true',
            busqueda,
            ordenar,
            limite: parseInt(limite),
            saltar: (parseInt(pagina) - 1) * parseInt(limite)
        };

        const productos = await Producto.buscarProductos(barberia._id, filtros);
        const total = await Producto.countDocuments({ barberiaId: barberia._id, activo: true });

        res.json({
            productos,
            paginacion: {
                total,
                pagina: parseInt(pagina),
                limite: parseInt(limite),
                totalPaginas: Math.ceil(total / parseInt(limite))
            }
        });
    } catch (error) {
        console.error('Error obteniendo productos:', error);
        res.status(500).json({ message: 'Error al obtener productos' });
    }
};

// Obtener un producto específico
exports.obtenerProducto = async (req, res) => {
    try {
        const { slug, id } = req.params;

        const barberia = await Barberia.findOne({ slug });
        if (!barberia) {
            return res.status(404).json({ message: 'Barbería no encontrada' });
        }

        const producto = await Producto.findOne({ _id: id, barberiaId: barberia._id });

        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json(producto);
    } catch (error) {
        console.error('Error obteniendo producto:', error);
        res.status(500).json({ message: 'Error al obtener producto' });
    }
};

// Crear producto (Admin)
exports.crearProducto = async (req, res) => {
    try {
        const { slug } = req.params;
        const barberiaId = req.user.barberiaId;

        const barberia = await Barberia.findOne({ _id: barberiaId, slug });
        if (!barberia) {
            return res.status(404).json({ message: 'Barbería no encontrada' });
        }

        const productoData = {
            ...req.body,
            barberiaId: barberia._id
        };

        const producto = await Producto.create(productoData);

        res.status(201).json({
            message: 'Producto creado exitosamente',
            producto
        });
    } catch (error) {
        console.error('Error creando producto:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Error de validación',
                errors: Object.values(error.errors).map(e => e.message)
            });
        }

        res.status(500).json({ message: 'Error al crear producto', error: error.message });
    }
};

// Actualizar producto (Admin)
exports.actualizarProducto = async (req, res) => {
    try {
        const { slug, id } = req.params;
        const barberiaId = req.user.barberiaId;

        const producto = await Producto.findOne({ _id: id, barberiaId });

        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Actualizar campos permitidos
        const camposPermitidos = [
            'nombre', 'descripcion', 'categoria', 'precio', 'precioDescuento',
            'stock', 'imagenes', 'destacado', 'activo', 'especificaciones'
        ];

        camposPermitidos.forEach(campo => {
            if (req.body[campo] !== undefined) {
                producto[campo] = req.body[campo];
            }
        });

        await producto.save();

        res.json({
            message: 'Producto actualizado exitosamente',
            producto
        });
    } catch (error) {
        console.error('Error actualizando producto:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Error de validación',
                errors: Object.values(error.errors).map(e => e.message)
            });
        }

        res.status(500).json({ message: 'Error al actualizar producto' });
    }
};

// Actualizar stock (Admin)
exports.actualizarStock = async (req, res) => {
    try {
        const { slug, id } = req.params;
        const { cantidad } = req.body;
        const barberiaId = req.user.barberiaId;

        const producto = await Producto.findOne({ _id: id, barberiaId });

        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        await producto.actualizarStock(cantidad);

        res.json({
            message: 'Stock actualizado exitosamente',
            producto
        });
    } catch (error) {
        console.error('Error actualizando stock:', error);
        res.status(500).json({ message: error.message || 'Error al actualizar stock' });
    }
};

// Eliminar producto (Admin)
exports.eliminarProducto = async (req, res) => {
    try {
        const { slug, id } = req.params;
        const barberiaId = req.user.barberiaId;

        const producto = await Producto.findOne({ _id: id, barberiaId });

        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Soft delete: marcar como inactivo
        producto.activo = false;
        await producto.save();

        res.json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        console.error('Error eliminando producto:', error);
        res.status(500).json({ message: 'Error al eliminar producto' });
    }
};

// Obtener productos por categoría
exports.obtenerPorCategoria = async (req, res) => {
    try {
        const { slug, categoria } = req.params;
        const { limite = 20, pagina = 1 } = req.query;

        const barberia = await Barberia.findOne({ slug });
        if (!barberia) {
            return res.status(404).json({ message: 'Barbería no encontrada' });
        }

        const productos = await Producto.find({
            barberiaId: barberia._id,
            categoria,
            activo: true
        })
            .limit(parseInt(limite))
            .skip((parseInt(pagina) - 1) * parseInt(limite))
            .sort('-createdAt');

        const total = await Producto.countDocuments({
            barberiaId: barberia._id,
            categoria,
            activo: true
        });

        res.json({
            productos,
            paginacion: {
                total,
                pagina: parseInt(pagina),
                limite: parseInt(limite),
                totalPaginas: Math.ceil(total / parseInt(limite))
            }
        });
    } catch (error) {
        console.error('Error obteniendo productos por categoría:', error);
        res.status(500).json({ message: 'Error al obtener productos' });
    }
};

// Obtener productos destacados
exports.obtenerDestacados = async (req, res) => {
    try {
        const { slug } = req.params;
        const { limite = 8 } = req.query;

        const barberia = await Barberia.findOne({ slug });
        if (!barberia) {
            return res.status(404).json({ message: 'Barbería no encontrada' });
        }

        const productos = await Producto.find({
            barberiaId: barberia._id,
            destacado: true,
            activo: true
        })
            .limit(parseInt(limite))
            .sort('-metadata.ventas');

        res.json(productos);
    } catch (error) {
        console.error('Error obteniendo productos destacados:', error);
        res.status(500).json({ message: 'Error al obtener productos destacados' });
    }
};

module.exports = exports;
