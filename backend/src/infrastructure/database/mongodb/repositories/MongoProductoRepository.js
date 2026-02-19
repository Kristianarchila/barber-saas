const IProductoRepository = require('../../../../domain/repositories/IProductoRepository');
const ProductoModel = require('../models/Producto');
const Producto = require('../../../../domain/entities/Producto');

/**
 * MongoDB Implementation of IProductoRepository
 */
class MongoProductoRepository extends IProductoRepository {
    async save(producto) {
        const data = producto.toObject ? producto.toObject() : producto;
        const saved = await ProductoModel.create(data);
        return this.toDomain(saved);
    }

    async findById(id, barberiaId = null) {
        const query = { _id: id };
        if (barberiaId) query.barberiaId = barberiaId;

        const producto = await ProductoModel.findOne(query);
        if (!producto) {
            throw new Error('Producto no encontrado o sin permisos de acceso');
        }
        return this.toDomain(producto);
    }

    async findByBarberiaId(barberiaId, filtros = {}) {
        const query = { barberiaId, activo: true };

        if (filtros.categoria) {
            query.categoria = filtros.categoria;
        }

        if (filtros.destacado !== undefined) {
            query.destacado = filtros.destacado;
        }

        if (filtros.busqueda) {
            query.$text = { $search: filtros.busqueda };
        }

        const results = await ProductoModel.find(query)
            .sort(filtros.ordenar || '-createdAt')
            .limit(filtros.limite || 20)
            .skip(filtros.saltar || 0);

        return results.map(r => this.toDomain(r));
    }

    async count(filtros = {}) {
        const query = { activo: true };
        if (filtros.barberiaId) query.barberiaId = filtros.barberiaId;
        if (filtros.categoria) query.categoria = filtros.categoria;

        return await ProductoModel.countDocuments(query);
    }

    async update(id, data, barberiaId = null) {
        const query = { _id: id };
        if (barberiaId) query.barberiaId = barberiaId;

        const updated = await ProductoModel.findOneAndUpdate(query, data, { new: true, runValidators: true });
        if (!updated) {
            throw new Error('Producto no encontrado o sin permisos de acceso');
        }
        return this.toDomain(updated);
    }

    async delete(id, barberiaId = null) {
        const query = { _id: id };
        if (barberiaId) query.barberiaId = barberiaId;

        const deleted = await ProductoModel.findOneAndDelete(query);
        if (!deleted) {
            throw new Error('Producto no encontrado o sin permisos de acceso');
        }
    }

    /**
     * Convert MongoDB document to Domain Entity
     */
    toDomain(mongoDoc) {
        if (!mongoDoc) return null;

        const doc = mongoDoc.toObject ? mongoDoc.toObject() : mongoDoc;

        return new Producto({
            id: doc._id.toString(),
            barberiaId: doc.barberiaId.toString(),
            nombre: doc.nombre,
            descripcion: doc.descripcion,
            categoria: doc.categoria,
            precio: doc.precio,
            precioDescuento: doc.precioDescuento,
            stock: doc.stock,
            imagenes: doc.imagenes,
            destacado: doc.destacado,
            activo: doc.activo,
            especificaciones: doc.especificaciones,
            metadata: doc.metadata,
            sku: doc.sku,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });
    }
}

module.exports = MongoProductoRepository;
