const IInventarioRepository = require('../../../../domain/repositories/IInventarioRepository');
const InventarioModel = require('../models/Inventario');
const Inventario = require('../../../../domain/entities/Inventario');

/**
 * MongoDB Implementation of IInventarioRepository
 */
class MongoInventarioRepository extends IInventarioRepository {
    async findByBarberiaId(barberiaId, filtros = {}) {
        const query = { barberia: barberiaId };
        if (filtros.activo !== undefined) query.activo = filtros.activo;

        const results = await InventarioModel.find(query)
            .populate("producto", "nombre descripcion precio imagenes categoria")
            .sort({ "producto.nombre": 1 });

        return results.map(r => this.toDomain(r));
    }

    async findById(id, barberiaId = null) {
        const query = { _id: id };
        if (barberiaId) query.barberia = barberiaId;

        const item = await InventarioModel.findOne(query).populate("producto");
        if (!item) {
            throw new Error('Inventario no encontrado o sin permisos de acceso');
        }
        return this.toDomain(item);
    }

    async findByProductoId(productoId, barberiaId) {
        const item = await InventarioModel.findOne({
            producto: productoId,
            barberia: barberiaId
        }).populate("producto");
        return item ? this.toDomain(item) : null;
    }

    async save(inventario) {
        const data = {
            producto: inventario.productoId,
            barberia: inventario.barberiaId,
            cantidadActual: inventario.cantidadActual,
            stockMinimo: inventario.stockMinimo,
            stockMaximo: inventario.stockMaximo,
            ubicacion: inventario.ubicacion,
            unidadMedida: inventario.unidadMedida,
            activo: inventario.activo
        };
        const saved = await InventarioModel.create(data);
        return this.toDomain(saved);
    }

    async update(id, data, barberiaId = null) {
        const query = { _id: id };
        if (barberiaId) query.barberia = barberiaId;

        const updated = await InventarioModel.findOneAndUpdate(query, data, { new: true });
        if (!updated) {
            throw new Error('Inventario no encontrado o sin permisos de acceso');
        }
        return this.toDomain(updated);
    }

    async delete(id, barberiaId = null) {
        const query = { _id: id };
        if (barberiaId) query.barberia = barberiaId;

        const deleted = await InventarioModel.findOneAndDelete(query);
        if (!deleted) {
            throw new Error('Inventario no encontrado o sin permisos de acceso');
        }
    }

    /**
     * Convert MongoDB document to Domain Entity
     */
    toDomain(mongoDoc) {
        if (!mongoDoc) return null;

        const doc = mongoDoc.toObject ? mongoDoc.toObject() : mongoDoc;

        const inventario = new Inventario({
            id: doc._id.toString(),
            productoId: doc.producto?._id?.toString() || doc.producto?.toString(),
            barberiaId: doc.barberia?._id?.toString() || doc.barberia?.toString(),
            cantidadActual: doc.cantidadActual,
            stockMinimo: doc.stockMinimo,
            stockMaximo: doc.stockMaximo,
            ubicacion: doc.ubicacion,
            unidadMedida: doc.unidadMedida,
            activo: doc.activo,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });

        if (doc.producto && doc.producto.nombre) {
            inventario.producto = doc.producto;
        }

        return inventario;
    }
}

module.exports = MongoInventarioRepository;
