const Carrito = require('../models/Carrito');
const Producto = require('../models/Producto');
const Barberia = require('../models/Barberia');

// Obtener carrito actual
exports.obtenerCarrito = async (req, res) => {
    try {
        const { slug } = req.params;

        const barberia = await Barberia.findOne({ slug });
        if (!barberia) {
            return res.status(404).json({ message: 'Barbería no encontrada' });
        }

        const clienteId = req.user?._id;
        const sessionId = req.session?.id || req.headers['x-session-id'];

        const carrito = await Carrito.obtenerOCrear(barberia._id, clienteId, sessionId)
            .populate('items.productoId', 'nombre precio precioDescuento imagenes stock activo');

        // Verificar disponibilidad de productos
        const itemsActualizados = carrito.items.filter(item => {
            if (!item.productoId || !item.productoId.activo) {
                return false;
            }
            if (item.productoId.stock < item.cantidad) {
                item.cantidad = item.productoId.stock;
            }
            return item.productoId.stock > 0;
        });

        if (itemsActualizados.length !== carrito.items.length) {
            carrito.items = itemsActualizados;
            await carrito.save();
        }

        res.json(carrito);
    } catch (error) {
        console.error('Error obteniendo carrito:', error);
        res.status(500).json({ message: 'Error al obtener carrito' });
    }
};

// Agregar producto al carrito
exports.agregarProducto = async (req, res) => {
    try {
        const { slug } = req.params;
        const { productoId, cantidad = 1 } = req.body;

        if (!productoId || cantidad < 1) {
            return res.status(400).json({ message: 'Datos inválidos' });
        }

        const barberia = await Barberia.findOne({ slug });
        if (!barberia) {
            return res.status(404).json({ message: 'Barbería no encontrada' });
        }

        const producto = await Producto.findOne({
            _id: productoId,
            barberiaId: barberia._id
        });

        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        if (!producto.verificarDisponibilidad(cantidad)) {
            return res.status(400).json({
                message: 'Stock insuficiente',
                stockDisponible: producto.stock
            });
        }

        const clienteId = req.user?._id;
        const sessionId = req.session?.id || req.headers['x-session-id'];

        const carrito = await Carrito.obtenerOCrear(barberia._id, clienteId, sessionId);

        await carrito.agregarProducto(
            productoId,
            cantidad,
            producto.precioEfectivo
        );

        const carritoActualizado = await Carrito.findById(carrito._id)
            .populate('items.productoId', 'nombre precio precioDescuento imagenes');

        res.json({
            message: 'Producto agregado al carrito',
            carrito: carritoActualizado
        });
    } catch (error) {
        console.error('Error agregando producto:', error);
        res.status(500).json({ message: error.message || 'Error al agregar producto' });
    }
};

// Actualizar cantidad de un producto
exports.actualizarCantidad = async (req, res) => {
    try {
        const { slug, itemId } = req.params;
        const { cantidad } = req.body;

        if (!cantidad || cantidad < 1) {
            return res.status(400).json({ message: 'Cantidad inválida' });
        }

        const barberia = await Barberia.findOne({ slug });
        if (!barberia) {
            return res.status(404).json({ message: 'Barbería no encontrada' });
        }

        const clienteId = req.user?._id;
        const sessionId = req.session?.id || req.headers['x-session-id'];

        const carrito = await Carrito.obtenerOCrear(barberia._id, clienteId, sessionId)
            .populate('items.productoId');

        const item = carrito.items.find(i => i._id.toString() === itemId);

        if (!item) {
            return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
        }

        // Verificar stock
        if (!item.productoId.verificarDisponibilidad(cantidad)) {
            return res.status(400).json({
                message: 'Stock insuficiente',
                stockDisponible: item.productoId.stock
            });
        }

        await carrito.actualizarCantidad(item.productoId._id, cantidad);

        const carritoActualizado = await Carrito.findById(carrito._id)
            .populate('items.productoId', 'nombre precio precioDescuento imagenes');

        res.json({
            message: 'Cantidad actualizada',
            carrito: carritoActualizado
        });
    } catch (error) {
        console.error('Error actualizando cantidad:', error);
        res.status(500).json({ message: error.message || 'Error al actualizar cantidad' });
    }
};

// Remover producto del carrito
exports.removerProducto = async (req, res) => {
    try {
        const { slug, itemId } = req.params;

        const barberia = await Barberia.findOne({ slug });
        if (!barberia) {
            return res.status(404).json({ message: 'Barbería no encontrada' });
        }

        const clienteId = req.user?._id;
        const sessionId = req.session?.id || req.headers['x-session-id'];

        const carrito = await Carrito.obtenerOCrear(barberia._id, clienteId, sessionId);

        const item = carrito.items.find(i => i._id.toString() === itemId);

        if (!item) {
            return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
        }

        await carrito.removerProducto(item.productoId);

        const carritoActualizado = await Carrito.findById(carrito._id)
            .populate('items.productoId', 'nombre precio precioDescuento imagenes');

        res.json({
            message: 'Producto removido del carrito',
            carrito: carritoActualizado
        });
    } catch (error) {
        console.error('Error removiendo producto:', error);
        res.status(500).json({ message: 'Error al remover producto' });
    }
};

// Vaciar carrito
exports.vaciarCarrito = async (req, res) => {
    try {
        const { slug } = req.params;

        const barberia = await Barberia.findOne({ slug });
        if (!barberia) {
            return res.status(404).json({ message: 'Barbería no encontrada' });
        }

        const clienteId = req.user?._id;
        const sessionId = req.session?.id || req.headers['x-session-id'];

        const carrito = await Carrito.obtenerOCrear(barberia._id, clienteId, sessionId);

        await carrito.vaciar();

        res.json({ message: 'Carrito vaciado exitosamente' });
    } catch (error) {
        console.error('Error vaciando carrito:', error);
        res.status(500).json({ message: 'Error al vaciar carrito' });
    }
};

// Migrar carrito de sesión a usuario (cuando hace login)
exports.migrarCarrito = async (req, res) => {
    try {
        const { slug } = req.params;
        const { sessionId } = req.body;

        if (!req.user) {
            return res.status(401).json({ message: 'No autenticado' });
        }

        const barberia = await Barberia.findOne({ slug });
        if (!barberia) {
            return res.status(404).json({ message: 'Barbería no encontrada' });
        }

        const carrito = await Carrito.migrarCarrito(
            sessionId,
            req.user._id,
            barberia._id
        );

        if (!carrito) {
            return res.json({ message: 'No hay carrito para migrar' });
        }

        const carritoActualizado = await Carrito.findById(carrito._id)
            .populate('items.productoId', 'nombre precio precioDescuento imagenes');

        res.json({
            message: 'Carrito migrado exitosamente',
            carrito: carritoActualizado
        });
    } catch (error) {
        console.error('Error migrando carrito:', error);
        res.status(500).json({ message: 'Error al migrar carrito' });
    }
};

module.exports = exports;
