const IEgresoRepository = require('../../../../domain/repositories/IEgresoRepository');
const EgresoModel = require('../models/Egreso');
const Egreso = require('../../../../domain/entities/Egreso');

/**
 * MongoDB Implementation of IEgresoRepository
 */
class MongoEgresoRepository extends IEgresoRepository {
    async findAll(filtros = {}) {
        const query = { barberiaId: filtros.barberiaId, activo: true };

        if (filtros.fechaInicio && filtros.fechaFin) {
            query.fecha = { $gte: filtros.fechaInicio, $lte: filtros.fechaFin };
        }

        if (filtros.categoria) {
            query.categoria = filtros.categoria;
        }

        const results = await EgresoModel.find(query)
            .sort({ fecha: -1, createdAt: -1 })
            .limit(filtros.limite || 100);

        return results.map(r => this.toDomain(r));
    }

    async findById(id, barberiaId = null) {
        const query = { _id: id };
        if (barberiaId) query.barberiaId = barberiaId;

        const doc = await EgresoModel.findOne(query);
        if (!doc) {
            throw new Error('Egreso no encontrado o sin permisos de acceso');
        }
        return this.toDomain(doc);
    }

    async save(egreso) {
        const data = {
            ...egreso.toObject(),
            barberiaId: egreso.barberiaId
        };
        const saved = await EgresoModel.create(data);
        return this.toDomain(saved);
    }

    async update(id, data, barberiaId = null) {
        const query = { _id: id };
        if (barberiaId) query.barberiaId = barberiaId;

        const updated = await EgresoModel.findOneAndUpdate(query, data, { new: true });
        if (!updated) {
            throw new Error('Egreso no encontrado o sin permisos de acceso');
        }
        return this.toDomain(updated);
    }

    async delete(id, barberiaId = null) {
        const query = { _id: id };
        if (barberiaId) query.barberiaId = barberiaId;

        const deleted = await EgresoModel.findOneAndDelete(query);
        if (!deleted) {
            throw new Error('Egreso no encontrado o sin permisos de acceso');
        }
    }

    async getResumenPorCategoria(barberiaId, fechaInicio, fechaFin) {
        return await EgresoModel.resumenPorCategoria(barberiaId, fechaInicio, fechaFin);
    }

    /**
     * Convert MongoDB document to Domain Entity
     */
    toDomain(mongoDoc) {
        if (!mongoDoc) return null;

        const doc = mongoDoc.toObject ? mongoDoc.toObject() : mongoDoc;

        return new Egreso({
            id: doc._id.toString(),
            barberiaId: doc.barberiaId.toString(),
            descripcion: doc.descripcion,
            montoTotal: doc.montoTotal,
            iva: doc.iva,
            montoNeto: doc.montoNeto,
            categoria: doc.categoria,
            fecha: doc.fecha,
            metodoPago: doc.metodoPago,
            registradoPor: doc.registradoPor,
            proveedor: doc.proveedor,
            nroComprobante: doc.nroComprobante,
            adjuntoUrl: doc.adjuntoUrl,
            activo: doc.activo,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });
    }
}

module.exports = MongoEgresoRepository;
