const ICajaRepository = require('../../../../domain/repositories/ICajaRepository');
const CajaModel = require('../models/Caja');
const Caja = require('../../../../domain/entities/Caja');

/**
 * MongoDB Implementation of ICajaRepository
 */
class MongoCajaRepository extends ICajaRepository {
    async findOpenByBarberia(barberiaId) {
        const doc = await CajaModel.findOne({
            barberiaId,
            estado: 'ABIERTA'
        });
        return doc ? this.toDomain(doc) : null;
    }

    async findById(id, barberiaId = null) {
        const query = { _id: id };
        if (barberiaId) query.barberiaId = barberiaId;

        const doc = await CajaModel.findOne(query);
        if (!doc) {
            throw new Error('Caja no encontrada o sin permisos de acceso');
        }
        return this.toDomain(doc);
    }

    async findAll(filtros = {}) {
        const query = { barberiaId: filtros.barberiaId };

        if (filtros.estado) query.estado = filtros.estado;
        if (filtros.fechaInicio && filtros.fechaFin) {
            query.fecha = { $gte: filtros.fechaInicio, $lte: filtros.fechaFin };
        }

        const results = await CajaModel.find(query)
            .sort({ fecha: -1, createdAt: -1 })
            .limit(filtros.limite || 30);

        return results.map(r => this.toDomain(r));
    }

    async save(caja) {
        const data = caja.toObject();
        delete data.id; // Avoid ID issues on create

        let doc;
        if (caja.id) {
            doc = await CajaModel.findByIdAndUpdate(caja.id, data, { new: true });
        } else {
            doc = await CajaModel.create(data);
        }

        return this.toDomain(doc);
    }

    async update(id, data, barberiaId = null) {
        const query = { _id: id };
        if (barberiaId) query.barberiaId = barberiaId;

        const updated = await CajaModel.findOneAndUpdate(query, data, { new: true });
        if (!updated) {
            throw new Error('Caja no encontrada o sin permisos de acceso');
        }
        return this.toDomain(updated);
    }

    async delete(id, barberiaId = null) {
        const query = { _id: id };
        if (barberiaId) query.barberiaId = barberiaId;

        const deleted = await CajaModel.findOneAndDelete(query);
        if (!deleted) {
            throw new Error('Caja no encontrada o sin permisos de acceso');
        }
    }

    /**
     * Convert MongoDB document to Domain Entity
     */
    toDomain(mongoDoc) {
        if (!mongoDoc) return null;

        const doc = mongoDoc.toObject ? mongoDoc.toObject() : mongoDoc;

        return new Caja({
            id: doc._id.toString(),
            barberiaId: doc.barberiaId.toString(),
            fecha: doc.fecha,
            turno: doc.turno,
            responsable: doc.responsable,
            horaApertura: doc.horaApertura,
            horaCierre: doc.horaCierre,
            montoInicial: doc.montoInicial,
            montoEsperado: doc.montoEsperado,
            montoReal: doc.montoReal,
            diferencia: doc.diferencia,
            ingresos: doc.ingresos || [],
            egresos: doc.egresos || [],
            arqueo: doc.arqueo,
            observaciones: doc.observaciones,
            estado: doc.estado,
            tieneDescuadre: doc.tieneDescuadre,
            nivelDescuadre: doc.nivelDescuadre,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });
    }
}

module.exports = MongoCajaRepository;
