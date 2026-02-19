const IProveedorRepository = require('../../../../domain/repositories/IProveedorRepository');
const ProveedorModel = require('../models/Proveedor');
const Proveedor = require('../../../../domain/entities/Proveedor');

/**
 * MongoDB Implementation of IProveedorRepository
 */
class MongoProveedorRepository extends IProveedorRepository {
    async findAll(filtros = {}) {
        const query = { barberia: filtros.barberiaId };
        if (filtros.activo !== undefined) query.activo = filtros.activo;

        const results = await ProveedorModel.find(query)
            .populate("productos", "nombre imagenes")
            .sort({ nombre: 1 });

        return results.map(r => this.toDomain(r));
    }

    async findById(id, barberiaId = null) {
        const query = { _id: id };
        if (barberiaId) query.barberia = barberiaId;

        const item = await ProveedorModel.findOne(query).populate("productos");
        if (!item) {
            throw new Error('Proveedor no encontrado o sin permisos de acceso');
        }
        return this.toDomain(item);
    }

    async save(proveedor) {
        const data = {
            ...proveedor.toObject(),
            barberia: proveedor.barberiaId
        };
        const saved = await ProveedorModel.create(data);
        return this.toDomain(saved);
    }

    async update(id, data, barberiaId = null) {
        const query = { _id: id };
        if (barberiaId) query.barberia = barberiaId;

        const updated = await ProveedorModel.findOneAndUpdate(query, data, { new: true });
        if (!updated) {
            throw new Error('Proveedor no encontrado o sin permisos de acceso');
        }
        return this.toDomain(updated);
    }

    async delete(id, barberiaId = null) {
        const query = { _id: id };
        if (barberiaId) query.barberia = barberiaId;

        const deleted = await ProveedorModel.findOneAndDelete(query);
        if (!deleted) {
            throw new Error('Proveedor no encontrado o sin permisos de acceso');
        }
    }

    /**
     * Convert MongoDB document to Domain Entity
     */
    toDomain(mongoDoc) {
        if (!mongoDoc) return null;

        const doc = mongoDoc.toObject ? mongoDoc.toObject() : mongoDoc;

        return new Proveedor({
            id: doc._id.toString(),
            barberiaId: doc.barberia?._id?.toString() || doc.barberia?.toString(),
            nombre: doc.nombre,
            contacto: doc.contacto,
            telefono: doc.telefono,
            email: doc.email,
            direccion: doc.direccion,
            sitioWeb: doc.sitioWeb,
            productos: doc.productos || [],
            activo: doc.activo,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });
    }
}

module.exports = MongoProveedorRepository;
