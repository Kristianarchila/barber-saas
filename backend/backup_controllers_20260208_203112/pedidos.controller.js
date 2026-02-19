const Pedido = require('../models/Pedido');
const Producto = require('../models/Producto');
const Barberia = require('../models/Barberia');

// Crear pedido
exports.crearPedido = async (req, res) => {
    try {
        const { slug } = req.params;
        const { items, datosEntrega, metodoPago, tipoEntrega, notas } = req.body;

        const barberia = await Barberia.findOne({ slug });
        if (!barberia) {
            return res.status(404).json({ message: 'Barbería no encontrada' });
        }

        // Verificar stock y calcular totales
        let subtotal = 0;
        const itemsProcesados = [];

        for (const item of items) {
            const producto = await Producto.findById(item.productoId);

            if (!producto) {
                return res.status(404).json({
                    message: `Producto ${item.productoId} no encontrado`
                });
            }

            if (!producto.verificarDisponibilidad(item.cantidad)) {
                return res.status(400).json({
                    message: `Stock insuficiente para ${producto.nombre}`
                });
            }

            const precioUnitario = producto.precioEfectivo;
            const subtotalItem = precioUnitario * item.cantidad;

            itemsProcesados.push({
                productoId: producto._id,
                nombre: producto.nombre,
                precio: precioUnitario,
                cantidad: item.cantidad,
                subtotal: subtotalItem,
                imagenUrl: producto.imagenes[0]
            });

            subtotal += subtotalItem;
        }

        // Calcular impuestos (ejemplo: 10%)
        const impuestos = subtotal * 0.10;
        const total = subtotal + impuestos;

        // Crear pedido
        const pedido = await Pedido.create({
            barberiaId: barberia._id,
            clienteId: req.user?._id,
            items: itemsProcesados,
            subtotal,
            impuestos,
            total,
            metodoPago,
            datosEntrega,
            tipoEntrega,
            notas
        });

        // Reducir stock de productos
        for (const item of itemsProcesados) {
            await Producto.findByIdAndUpdate(item.productoId, {
                $inc: {
                    stock: -item.cantidad,
                    'metadata.ventas': item.cantidad
                }
            });
        }

        // TODO: Enviar email de confirmación
        // TODO: Notificar al admin

        res.status(201).json({
            message: 'Pedido creado exitosamente',
            pedido
        });
    } catch (error) {
        console.error('Error creando pedido:', error);
        res.status(500).json({ message: 'Error al crear pedido' });
    }
};

// Obtener pedido por ID
exports.obtenerPedido = async (req, res) => {
    try {
        const { slug, id } = req.params;

        const barberia = await Barberia.findOne({ slug });
        if (!barberia) {
            return res.status(404).json({ message: 'Barbería no encontrada' });
        }

        const pedido = await Pedido.findOne({
            _id: id,
            barberiaId: barberia._id
        }).populate('items.productoId', 'nombre imagenes');

        if (!pedido) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        // Verificar permisos
        if (req.user.rol !== 'BARBERIA_ADMIN' &&
            pedido.clienteId?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'No autorizado' });
        }

        res.json(pedido);
    } catch (error) {
        console.error('Error obteniendo pedido:', error);
        res.status(500).json({ message: 'Error al obtener pedido' });
    }
};

// Obtener pedidos del cliente
exports.obtenerMisPedidos = async (req, res) => {
    try {
        const { slug } = req.params;
        const { estado, limite = 10, pagina = 1 } = req.query;

        const barberia = await Barberia.findOne({ slug });
        if (!barberia) {
            return res.status(404).json({ message: 'Barbería no encontrada' });
        }

        const query = {
            barberiaId: barberia._id,
            clienteId: req.user._id
        };

        if (estado) {
            query.estado = estado;
        }

        const pedidos = await Pedido.find(query)
            .sort('-createdAt')
            .limit(parseInt(limite))
            .skip((parseInt(pagina) - 1) * parseInt(limite));

        const total = await Pedido.countDocuments(query);

        res.json({
            pedidos,
            paginacion: {
                total,
                pagina: parseInt(pagina),
                limite: parseInt(limite),
                totalPaginas: Math.ceil(total / parseInt(limite))
            }
        });
    } catch (error) {
        console.error('Error obteniendo pedidos:', error);
        res.status(500).json({ message: 'Error al obtener pedidos' });
    }
};

// Obtener todos los pedidos (Admin)
exports.obtenerTodosPedidos = async (req, res) => {
    try {
        const { slug } = req.params;
        const { estado, fechaInicio, fechaFin, limite = 20, pagina = 1 } = req.query;
        const barberiaId = req.user.barberiaId;

        const query = { barberiaId };

        if (estado) {
            query.estado = estado;
        }

        if (fechaInicio && fechaFin) {
            query.createdAt = {
                $gte: new Date(fechaInicio),
                $lte: new Date(fechaFin)
            };
        }

        const pedidos = await Pedido.find(query)
            .populate('clienteId', 'nombre email')
            .sort('-createdAt')
            .limit(parseInt(limite))
            .skip((parseInt(pagina) - 1) * parseInt(limite));

        const total = await Pedido.countDocuments(query);

        res.json({
            pedidos,
            paginacion: {
                total,
                pagina: parseInt(pagina),
                limite: parseInt(limite),
                totalPaginas: Math.ceil(total / parseInt(limite))
            }
        });
    } catch (error) {
        console.error('Error obteniendo pedidos:', error);
        res.status(500).json({ message: 'Error al obtener pedidos' });
    }
};

// Actualizar estado del pedido (Admin)
exports.actualizarEstado = async (req, res) => {
    try {
        const { slug, id } = req.params;
        const { estado } = req.body;
        const barberiaId = req.user.barberiaId;

        const pedido = await Pedido.findOne({ _id: id, barberiaId });

        if (!pedido) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        await pedido.cambiarEstado(estado);

        // TODO: Enviar notificación al cliente

        res.json({
            message: 'Estado actualizado exitosamente',
            pedido
        });
    } catch (error) {
        console.error('Error actualizando estado:', error);
        res.status(400).json({ message: error.message || 'Error al actualizar estado' });
    }
};

// Cancelar pedido
exports.cancelarPedido = async (req, res) => {
    try {
        const { slug, id } = req.params;

        const barberia = await Barberia.findOne({ slug });
        if (!barberia) {
            return res.status(404).json({ message: 'Barbería no encontrada' });
        }

        const pedido = await Pedido.findOne({
            _id: id,
            barberiaId: barberia._id
        });

        if (!pedido) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        // Verificar permisos
        const esAdmin = req.user.rol === 'BARBERIA_ADMIN';
        const esCliente = pedido.clienteId?.toString() === req.user._id.toString();

        if (!esAdmin && !esCliente) {
            return res.status(403).json({ message: 'No autorizado' });
        }

        // Solo se puede cancelar si está pendiente o confirmado
        if (!['pendiente', 'confirmado'].includes(pedido.estado)) {
            return res.status(400).json({
                message: 'No se puede cancelar un pedido en este estado'
            });
        }

        await pedido.cambiarEstado('cancelado');

        // Devolver stock
        for (const item of pedido.items) {
            await Producto.findByIdAndUpdate(item.productoId, {
                $inc: {
                    stock: item.cantidad,
                    'metadata.ventas': -item.cantidad
                }
            });
        }

        res.json({
            message: 'Pedido cancelado exitosamente',
            pedido
        });
    } catch (error) {
        console.error('Error cancelando pedido:', error);
        res.status(500).json({ message: error.message || 'Error al cancelar pedido' });
    }
};

// Obtener estadísticas de ventas (Admin)
exports.obtenerEstadisticas = async (req, res) => {
    try {
        const { slug } = req.params;
        const { fechaInicio, fechaFin } = req.query;
        const barberiaId = req.user.barberiaId;

        const stats = await Pedido.obtenerEstadisticas(
            barberiaId,
            fechaInicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            fechaFin || new Date()
        );

        res.json(stats[0] || {
            totalPedidos: 0,
            totalIngresos: 0,
            promedioTicket: 0,
            productosVendidos: 0
        });
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({ message: 'Error al obtener estadísticas' });
    }
};

module.exports = exports;
