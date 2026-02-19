const ICarritoRepository = require('../../../../domain/repositories/ICarritoRepository');
const CarritoModel = require('../models/Carrito');
const Carrito = require('../../../../domain/entities/Carrito');

/**
 * MongoDB Implementation of ICarritoRepository
 */
class MongoCarritoRepository extends ICarritoRepository {
    async findByClientOrSession(barberiaId, clienteId, sessionId) {
        const query = { barberiaId };
        if (clienteId) {
            query.clienteId = clienteId;
        } else if (sessionId) {
            query.sessionId = sessionId;
        } else {
            return null;
        }

        const doc = await CarritoModel.findOne(query);
        return doc ? this.toDomain(doc) : null;
    }

    async findById(id, barberiaId = null) {
        const query = { _id: id };
        if (barberiaId) query.barberiaId = barberiaId;

        const doc = await CarritoModel.findOne(query);
        if (!doc) {
            throw new Error('Carrito no encontrado o sin permisos de acceso');
        }
        return this.toDomain(doc);
    }

    async save(carrito) {
        const data = {
            barberiaId: carrito.barberiaId,
            clienteId: carrito.clienteId,
            sessionId: carrito.sessionId,
            items: carrito.items.map(item => ({
                productoId: item.productoId,
                cantidad: item.cantidad,
                precioUnitario: item.precio
            }))
        };

        let doc;
        if (carrito.id) {
            doc = await CarritoModel.findByIdAndUpdate(carrito.id, data, { new: true });
        } else {
            doc = await CarritoModel.create(data);
        }

        return this.toDomain(doc);
    }

    async delete(id, barberiaId = null) {
        const query = { _id: id };
        if (barberiaId) query.barberiaId = barberiaId;

        const deleted = await CarritoModel.findOneAndDelete(query);
        if (!deleted) {
            throw new Error('Carrito no encontrado o sin permisos de acceso');
        }
    }

    /**
     * Convert MongoDB document to Domain Entity
     */
    toDomain(mongoDoc) {
        if (!mongoDoc) return null;

        const doc = mongoDoc.toObject ? mongoDoc.toObject() : mongoDoc;

        return new Carrito({
            id: doc._id.toString(),
            barberiaId: doc.barberiaId.toString(),
            clienteId: doc.clienteId?.toString(),
            sessionId: doc.sessionId,
            items: doc.items.map(item => ({
                productoId: item.productoId.toString(),
                cantidad: item.cantidad,
                precio: item.precioUnitario
            })),
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });
    }
}

module.exports = MongoCarritoRepository;
