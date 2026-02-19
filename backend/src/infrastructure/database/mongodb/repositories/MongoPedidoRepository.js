const mongoose = require('mongoose');
const IPedidoRepository = require('../../../../domain/repositories/IPedidoRepository');
const PedidoModel = require('../models/Pedido');
const Pedido = require('../../../../domain/entities/Pedido');

/**
 * MongoDB Implementation of IPedidoRepository
 */
class MongoPedidoRepository extends IPedidoRepository {
    async save(pedido) {
        const data = pedido.toObject ? pedido.toObject() : pedido;
        const saved = await PedidoModel.create(data);
        return this.toDomain(saved);
    }

    async findById(id, barberiaId = null) {
        const query = { _id: id };
        if (barberiaId) query.barberiaId = barberiaId;

        const pedido = await PedidoModel.findOne(query).populate('items.productoId', 'nombre imagenes');
        if (!pedido) {
            throw new Error('Pedido no encontrado o sin permisos de acceso');
        }
        return this.toDomain(pedido);
    }

    async findAll(filtros = {}) {
        const query = {};
        if (filtros.barberiaId) query.barberiaId = filtros.barberiaId;
        if (filtros.estado) query.estado = filtros.estado;
        if (filtros.fechaInicio && filtros.fechaFin) {
            query.createdAt = {
                $gte: new Date(filtros.fechaInicio),
                $lte: new Date(filtros.fechaFin)
            };
        }

        const items = await PedidoModel.find(query)
            .populate('clienteId', 'nombre email')
            .sort('-createdAt')
            .limit(filtros.limite || 20)
            .skip(filtros.saltar || 0);

        return items.map(i => this.toDomain(i));
    }

    async findByClienteId(clienteId, filtros = {}) {
        const query = { clienteId };
        if (filtros.barberiaId) query.barberiaId = filtros.barberiaId;
        if (filtros.estado) query.estado = filtros.estado;

        const items = await PedidoModel.find(query)
            .sort('-createdAt')
            .limit(filtros.limite || 10)
            .skip(filtros.saltar || 0);

        return items.map(i => this.toDomain(i));
    }

    async count(filtros = {}) {
        const query = {};
        if (filtros.barberiaId) query.barberiaId = filtros.barberiaId;
        if (filtros.clienteId) query.clienteId = filtros.clienteId;
        if (filtros.estado) query.estado = filtros.estado;

        return await PedidoModel.countDocuments(query);
    }

    async update(id, data, barberiaId = null) {
        const query = { _id: id };
        if (barberiaId) query.barberiaId = barberiaId;

        const updated = await PedidoModel.findOneAndUpdate(query, data, { new: true });
        if (!updated) {
            throw new Error('Pedido no encontrado o sin permisos de acceso');
        }
        return this.toDomain(updated);
    }

    async delete(id, barberiaId = null) {
        const query = { _id: id };
        if (barberiaId) query.barberiaId = barberiaId;

        const deleted = await PedidoModel.findOneAndDelete(query);
        if (!deleted) {
            throw new Error('Pedido no encontrado o sin permisos de acceso');
        }
    }

    async getEstadisticas(barberiaId, fechaInicio, fechaFin) {
        const stats = await PedidoModel.aggregate([
            {
                $match: {
                    barberiaId: mongoose.Types.ObjectId(barberiaId),
                    createdAt: {
                        $gte: new Date(fechaInicio),
                        $lte: new Date(fechaFin)
                    },
                    estado: { $ne: 'cancelado' }
                }
            },
            {
                $group: {
                    _id: null,
                    totalPedidos: { $sum: 1 },
                    totalIngresos: { $sum: '$total' },
                    promedioTicket: { $avg: '$total' },
                    productosVendidos: { $sum: { $size: '$items' } }
                }
            }
        ]);

        return stats[0] || {
            totalPedidos: 0,
            totalIngresos: 0,
            promedioTicket: 0,
            productosVendidos: 0
        };
    }

    /**
     * Convert MongoDB document to Domain Entity
     */
    toDomain(mongoDoc) {
        if (!mongoDoc) return null;

        const doc = mongoDoc.toObject ? mongoDoc.toObject() : mongoDoc;

        const pedido = new Pedido({
            id: doc._id.toString(),
            barberiaId: doc.barberiaId.toString(),
            clienteId: doc.clienteId ? doc.clienteId.toString() : null,
            numeroPedido: doc.numeroPedido,
            items: doc.items.map(item => ({
                ...item,
                productoId: item.productoId?._id?.toString() || item.productoId?.toString()
            })),
            subtotal: doc.subtotal,
            descuento: doc.descuento,
            impuestos: doc.impuestos,
            total: doc.total,
            estado: doc.estado,
            metodoPago: doc.metodoPago,
            estadoPago: doc.estadoPago,
            datosEntrega: doc.datosEntrega,
            tipoEntrega: doc.tipoEntrega,
            tracking: doc.tracking,
            notas: doc.notas,
            notasInternas: doc.notasInternas,
            stripePaymentIntentId: doc.stripePaymentIntentId,
            cuponAplicado: doc.cuponAplicado,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });

        // Carry over populated data if exists
        if (doc.clienteId && doc.clienteId.nombre) {
            pedido.cliente = doc.clienteId;
        }

        return pedido;
    }
}

module.exports = MongoPedidoRepository;
