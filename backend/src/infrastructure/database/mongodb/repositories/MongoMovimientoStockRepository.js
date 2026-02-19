const IMovimientoStockRepository = require('../../../../domain/repositories/IMovimientoStockRepository');
const MovimientoStockModel = require('../models/MovimientoStock');
const MovimientoStock = require('../../../../domain/entities/MovimientoStock');

/**
 * MongoDB Implementation of IMovimientoStockRepository
 */
class MongoMovimientoStockRepository extends IMovimientoStockRepository {
    async save(movimiento) {
        const data = {
            producto: movimiento.productoId,
            inventario: movimiento.inventarioId,
            barberia: movimiento.barberiaId,
            tipo: movimiento.tipo,
            cantidad: movimiento.cantidad,
            cantidadAnterior: movimiento.cantidadAnterior,
            cantidadNueva: movimiento.cantidadNueva,
            motivo: movimiento.motivo,
            proveedor: movimiento.proveedorId,
            pedido: movimiento.pedidoId,
            usuario: movimiento.usuarioId,
            observaciones: movimiento.observaciones,
            costoUnitario: movimiento.costoUnitario,
            costoTotal: movimiento.costoTotal
        };
        const saved = await MovimientoStockModel.create(data);
        return this.toDomain(saved);
    }

    async findAll(filtros = {}) {
        const query = { barberia: filtros.barberiaId };
        if (filtros.productoId) query.producto = filtros.productoId;
        if (filtros.tipo) query.tipo = filtros.tipo;

        const results = await MovimientoStockModel.find(query)
            .populate("producto", "nombre imagenes")
            .populate("proveedor", "nombre")
            .populate("usuario", "nombre")
            .sort({ createdAt: -1 })
            .limit(filtros.limite || 50)
            .skip(filtros.saltar || 0);

        return results.map(r => this.toDomain(r));
    }

    async count(filtros = {}) {
        const query = { barberia: filtros.barberiaId };
        if (filtros.productoId) query.producto = filtros.productoId;
        if (filtros.tipo) query.tipo = filtros.tipo;

        return await MovimientoStockModel.countDocuments(query);
    }

    async findById(id, barberiaId = null) {
        const query = { _id: id };
        if (barberiaId) query.barberia = barberiaId;

        const doc = await MovimientoStockModel.findOne(query)
            .populate("producto", "nombre imagenes")
            .populate("proveedor", "nombre")
            .populate("usuario", "nombre");

        if (!doc) {
            throw new Error('Movimiento de stock no encontrado o sin permisos de acceso');
        }
        return this.toDomain(doc);
    }

    async update(id, data, barberiaId = null) {
        const query = { _id: id };
        if (barberiaId) query.barberia = barberiaId;

        const updated = await MovimientoStockModel.findOneAndUpdate(query, data, { new: true });
        if (!updated) {
            throw new Error('Movimiento de stock no encontrado o sin permisos de acceso');
        }
        return this.toDomain(updated);
    }

    async delete(id, barberiaId = null) {
        const query = { _id: id };
        if (barberiaId) query.barberia = barberiaId;

        const deleted = await MovimientoStockModel.findOneAndDelete(query);
        if (!deleted) {
            throw new Error('Movimiento de stock no encontrado o sin permisos de acceso');
        }
    }

    /**
     * Convert MongoDB document to Domain Entity
     */
    toDomain(mongoDoc) {
        if (!mongoDoc) return null;

        const doc = mongoDoc.toObject ? mongoDoc.toObject() : mongoDoc;

        const movimiento = new MovimientoStock({
            id: doc._id.toString(),
            productoId: doc.producto?._id?.toString() || doc.producto?.toString(),
            inventarioId: doc.inventario?._id?.toString() || doc.inventario?.toString(),
            barberiaId: doc.barberia?._id?.toString() || doc.barberia?.toString(),
            tipo: doc.tipo,
            cantidad: doc.cantidad,
            cantidadAnterior: doc.cantidadAnterior,
            cantidadNueva: doc.cantidadNueva,
            motivo: doc.motivo,
            proveedorId: doc.proveedor?._id?.toString() || doc.proveedor?.toString(),
            pedidoId: doc.pedido?._id?.toString() || doc.pedido?.toString(),
            usuarioId: doc.usuario?._id?.toString() || doc.usuario?.toString(),
            observaciones: doc.observaciones,
            costoUnitario: doc.costoUnitario,
            costoTotal: doc.costoTotal,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });

        // Add populated data if exists
        if (doc.producto && doc.producto.nombre) movimiento.producto = doc.producto;
        if (doc.proveedor && doc.proveedor.nombre) movimiento.proveedor = doc.proveedor;
        if (doc.usuario && doc.usuario.nombre) movimiento.usuario = doc.usuario;

        return movimiento;
    }
}

module.exports = MongoMovimientoStockRepository;
