const ITransactionRepository = require('../../../../domain/repositories/ITransactionRepository');
const TransactionModel = require('../models/Transaction');
const Transaction = require('../../../../domain/entities/Transaction');

/**
 * MongoDB Implementation of ITransactionRepository
 */
class MongoTransactionRepository extends ITransactionRepository {
    async findAll(filtros = {}) {
        const query = { barberiaId: filtros.barberiaId };

        if (filtros.barberoId) query.barberoId = filtros.barberoId;
        if (filtros.estado) query.estado = filtros.estado;
        if (filtros.fechaInicio && filtros.fechaFin) {
            query.fecha = { $gte: filtros.fechaInicio, $lte: filtros.fechaFin };
        }

        const results = await TransactionModel.find(query)
            .populate('barberoId', 'nombre email foto')
            .populate('servicioId', 'nombre precio')
            .populate('reservaId', 'fecha hora nombreCliente')
            .sort({ fecha: -1 })
            .skip(filtros.skip || 0)
            .limit(filtros.limite || 50);

        return results.map(r => this.toDomain(r));
    }

    async findById(id, barberiaId = null) {
        const query = { _id: id };
        if (barberiaId) query.barberiaId = barberiaId;

        const doc = await TransactionModel.findOne(query)
            .populate('barberoId', 'nombre email foto')
            .populate('servicioId', 'nombre precio duracion')
            .populate('reservaId', 'fecha hora nombreCliente emailCliente')
            .populate('historialAjustes.ajustadoPor', 'nombre email');

        if (!doc) {
            throw new Error('Transacción no encontrada o sin permisos de acceso');
        }

        return this.toDomain(doc);
    }

    async findOne(query, barberiaId) {
        if (!barberiaId) {
            throw new Error('barberiaId es requerido para el aislamiento de datos');
        }

        // Enforce barberiaId in query
        const secureQuery = { ...query, barberiaId };
        const doc = await TransactionModel.findOne(secureQuery);
        return doc ? this.toDomain(doc) : null;
    }

    async count(query, barberiaId) {
        if (!barberiaId) {
            throw new Error('barberiaId es requerido para el aislamiento de datos');
        }

        // Enforce barberiaId in query
        const secureQuery = { ...query, barberiaId };
        return await TransactionModel.countDocuments(secureQuery);
    }

    async save(transaction) {
        const data = transaction.toObject();
        delete data.id;

        let doc;
        if (transaction.id) {
            doc = await TransactionModel.findByIdAndUpdate(transaction.id, data, { new: true });
        } else {
            doc = await TransactionModel.create(data);
        }
        return this.toDomain(doc);
    }

    async update(id, data, barberiaId = null) {
        const query = { _id: id };
        if (barberiaId) query.barberiaId = barberiaId;

        const updated = await TransactionModel.findOneAndUpdate(query, data, { new: true });
        if (!updated) {
            throw new Error('Transacción no encontrada o sin permisos de acceso');
        }
        return this.toDomain(updated);
    }

    async delete(id, barberiaId = null) {
        const query = { _id: id };
        if (barberiaId) query.barberiaId = barberiaId;

        const deleted = await TransactionModel.findOneAndDelete(query);
        if (!deleted) {
            throw new Error('Transacción no encontrada o sin permisos de acceso');
        }
    }

    async aggregate(pipeline) {
        return await TransactionModel.aggregate(pipeline);
    }

    /**
     * Convert MongoDB document to Domain Entity
     */
    toDomain(mongoDoc) {
        if (!mongoDoc) return null;

        const doc = mongoDoc.toObject ? mongoDoc.toObject() : mongoDoc;

        return new Transaction({
            id: doc._id.toString(),
            barberiaId: doc.barberiaId.toString(),
            barberoId: doc.barberoId._id ? doc.barberoId._id.toString() : doc.barberoId.toString(),
            reservaId: doc.reservaId._id ? doc.reservaId._id.toString() : doc.reservaId.toString(),
            servicioId: doc.servicioId ? (doc.servicioId._id ? doc.servicioId._id.toString() : doc.servicioId.toString()) : null,
            montosAutomaticos: doc.montosAutomaticos,
            montosFinales: doc.montosFinales,
            historialAjustes: doc.historialAjustes || [],
            extras: doc.extras,
            impuestos: doc.impuestos,
            estado: doc.estado,
            metodoPago: doc.metodoPago,
            notas: doc.notas,
            aprobaciones: doc.aprobaciones,
            fecha: doc.fecha,
            creadoPor: doc.creadoPor ? doc.creadoPor.toString() : null,
            fechaPago: doc.fechaPago,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });
    }
}

module.exports = MongoTransactionRepository;
