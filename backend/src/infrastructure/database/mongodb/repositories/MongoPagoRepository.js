const IPagoRepository = require('../../../../domain/repositories/IPagoRepository');
const PagoModel = require('../models/Pago');
const Pago = require('../../../../domain/entities/Pago');

/**
 * MongoDB Implementation of IPagoRepository
 */
class MongoPagoRepository extends IPagoRepository {
    async findAll(filtros = {}) {
        const query = { barberiaId: filtros.barberiaId };

        if (filtros.fechaInicio && filtros.fechaFin) {
            query.fecha = { $gte: filtros.fechaInicio, $lte: filtros.fechaFin };
        }

        if (filtros.barberoId) {
            query.barberoId = filtros.barberoId;
        }

        const results = await PagoModel.find(query)
            .populate('reservaId', 'nombreCliente emailCliente')
            .populate('barberoId', 'nombre')
            .sort({ fecha: -1, createdAt: -1 })
            .limit(filtros.limite || 100);

        return results.map(r => this.toDomain(r));
    }

    async findById(id, barberiaId = null) {
        const query = { _id: id };
        if (barberiaId) query.barberiaId = barberiaId;

        const doc = await PagoModel.findOne(query)
            .populate('reservaId')
            .populate('barberoId');

        if (!doc) {
            throw new Error('Pago no encontrado o sin permisos de acceso');
        }

        return this.toDomain(doc);
    }

    async save(pago) {
        const data = pago.toObject();
        delete data.id;

        const doc = await PagoModel.create(data);
        return this.toDomain(doc);
    }

    /**
     * Convert MongoDB document to Domain Entity
     */
    toDomain(mongoDoc) {
        if (!mongoDoc) return null;

        const doc = mongoDoc.toObject ? mongoDoc.toObject() : mongoDoc;

        return new Pago({
            id: doc._id.toString(),
            barberiaId: doc.barberiaId.toString(),
            reservaId: doc.reservaId._id ? doc.reservaId._id.toString() : doc.reservaId.toString(),
            barberoId: doc.barberoId._id ? doc.barberoId._id.toString() : doc.barberoId.toString(),
            fecha: doc.fecha,
            montoTotal: doc.montoTotal,
            detallesPago: doc.detallesPago || [],
            registradoPor: doc.registradoPor,
            iva: doc.iva,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });
    }
}

module.exports = MongoPagoRepository;
