const IVentaRepository = require('../../../../domain/repositories/IVentaRepository');
const VentaModel = require('../models/Venta');
const Venta = require('../../../../domain/entities/Venta');

/**
 * MongoDB Implementation of IVentaRepository
 */
class MongoVentaRepository extends IVentaRepository {
    async findById(id, barberiaId = null) {
        const query = { _id: id };
        if (barberiaId) query.barberiaId = barberiaId;

        const doc = await VentaModel.findOne(query);
        return doc ? this.toDomain(doc) : null;
    }

    async findAll(filtros = {}) {
        const query = { barberiaId: filtros.barberiaId };

        if (filtros.barberoId) query.barberoId = filtros.barberoId;
        if (filtros.metodoPago) query.metodoPago = filtros.metodoPago;
        if (filtros.fechaInicio && filtros.fechaFin) {
            query.fecha = { $gte: filtros.fechaInicio, $lte: filtros.fechaFin };
        }

        const results = await VentaModel.find(query)
            .sort({ fecha: -1, createdAt: -1 })
            .limit(filtros.limite || 50);

        return results.map(r => this.toDomain(r));
    }

    async save(venta) {
        const data = venta.toObject();
        delete data.id;

        let doc;
        if (venta.id) {
            doc = await VentaModel.findByIdAndUpdate(venta.id, data, { new: true });
        } else {
            doc = await VentaModel.create(data);
        }

        return this.toDomain(doc);
    }

    async delete(id, barberiaId = null) {
        const query = { _id: id };
        if (barberiaId) query.barberiaId = barberiaId;
        await VentaModel.findOneAndDelete(query);
    }

    /**
     * Convert MongoDB document to Domain Entity
     */
    toDomain(mongoDoc) {
        if (!mongoDoc) return null;

        const doc = mongoDoc.toObject ? mongoDoc.toObject() : mongoDoc;

        return new Venta({
            id: doc._id.toString(),
            barberiaId: doc.barberiaId.toString(),
            barberoId: doc.barberoId ? doc.barberoId.toString() : null,
            items: doc.items,
            subtotal: doc.subtotal,
            descuento: doc.descuento,
            iva: doc.iva,
            total: doc.total,
            metodoPago: doc.metodoPago,
            fecha: doc.fecha,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });
    }
}

module.exports = MongoVentaRepository;
