const IBloqueoRepository = require('../../../../domain/repositories/IBloqueoRepository');
const BloqueoModel = require('../models/Bloqueo');
const Bloqueo = require('../../../../domain/entities/Bloqueo');

/**
 * @file MongoBloqueoRepository.js
 * @description MongoDB implementation of IBloqueoRepository
 */

class MongoBloqueoRepository extends IBloqueoRepository {
    /**
     * Saves a new bloqueo
     * @param {Bloqueo} bloqueo
     * @returns {Promise<Bloqueo>}
     */
    async save(bloqueo) {
        const bloqueoData = this.toMongoDocument(bloqueo);
        const savedBloqueo = await BloqueoModel.create(bloqueoData);
        return this.toDomain(savedBloqueo);
    }

    /**
     * Finds a bloqueo by ID
     * @param {string} id
     * @param {string} barberiaId - For multi-tenant isolation
     * @returns {Promise<Bloqueo|null>}
     */
    async findById(id, barberiaId) {
        if (!barberiaId) {
            throw new Error('barberiaId es requerido para el aislamiento de datos');
        }

        const bloqueo = await BloqueoModel.findOne({ _id: id, barberiaId });
        return bloqueo ? this.toDomain(bloqueo) : null;
    }

    /**
     * Finds all bloqueos for a barberia
     * @param {string} barberiaId
     * @param {Object} filters - Optional filters (activo, tipo, barberoId)
     * @returns {Promise<Bloqueo[]>}
     */
    async findByBarberiaId(barberiaId, filters = {}) {
        const query = { barberiaId };

        if (filters.activo !== undefined) {
            query.activo = filters.activo;
        }

        if (filters.tipo) {
            query.tipo = filters.tipo;
        }

        if (filters.barberoId !== undefined) {
            query.barberoId = filters.barberoId;
        }

        const bloqueos = await BloqueoModel.find(query)
            .sort({ fechaInicio: -1 })
            .populate('creadoPor', 'nombre email');

        return bloqueos.map(b => this.toDomain(b));
    }

    /**
     * Finds bloqueos that affect a specific date range
     * @param {string} barberiaId
     * @param {Date} fechaInicio
     * @param {Date} fechaFin
     * @param {string} barberoId - Optional, filter by barbero
     * @returns {Promise<Bloqueo[]>}
     */
    async findByDateRange(barberiaId, fechaInicio, fechaFin, barberoId = null) {
        const query = {
            barberiaId,
            activo: true,
            $or: [
                // Bloqueo starts within range
                {
                    fechaInicio: { $gte: fechaInicio, $lte: fechaFin }
                },
                // Bloqueo ends within range
                {
                    fechaFin: { $gte: fechaInicio, $lte: fechaFin }
                },
                // Bloqueo encompasses the entire range
                {
                    fechaInicio: { $lte: fechaInicio },
                    fechaFin: { $gte: fechaFin }
                }
            ]
        };

        // Filter by barbero or include barberia-wide blocks
        if (barberoId) {
            query.$and = [
                {
                    $or: [
                        { barberoId: barberoId },
                        { barberoId: null }
                    ]
                }
            ];
        }

        const bloqueos = await BloqueoModel.find(query).sort({ fechaInicio: 1 });
        return bloqueos.map(b => this.toDomain(b));
    }

    /**
     * Finds active bloqueos for a specific date
     * @param {string} barberiaId
     * @param {Date} fecha
     * @param {string} barberoId - Optional, filter by barbero
     * @returns {Promise<Bloqueo[]>}
     */
    async findActiveByDate(barberiaId, fecha, barberoId = null) {
        const fechaStart = new Date(fecha);
        fechaStart.setHours(0, 0, 0, 0);

        const fechaEnd = new Date(fecha);
        fechaEnd.setHours(23, 59, 59, 999);

        const query = {
            barberiaId,
            activo: true,
            fechaInicio: { $lte: fechaEnd },
            fechaFin: { $gte: fechaStart }
        };

        // Filter by barbero or include barberia-wide blocks
        if (barberoId) {
            query.$or = [
                { barberoId: barberoId },
                { barberoId: null }
            ];
        }

        const bloqueos = await BloqueoModel.find(query);
        return bloqueos.map(b => this.toDomain(b));
    }

    /**
     * Updates a bloqueo
     * @param {string} id
     * @param {Object} data
     * @param {string} barberiaId - For multi-tenant isolation
     * @returns {Promise<Bloqueo>}
     */
    async update(id, data, barberiaId) {
        if (!barberiaId) {
            throw new Error('barberiaId es requerido para el aislamiento de datos');
        }

        const updated = await BloqueoModel.findOneAndUpdate(
            { _id: id, barberiaId },
            data,
            { new: true, runValidators: true }
        );

        if (!updated) {
            throw new Error('Bloqueo no encontrado o sin permisos de acceso');
        }

        return this.toDomain(updated);
    }

    /**
     * Deletes a bloqueo (soft delete by setting activo = false)
     * @param {string} id
     * @param {string} barberiaId - For multi-tenant isolation
     * @returns {Promise<void>}
     */
    async delete(id, barberiaId) {
        if (!barberiaId) {
            throw new Error('barberiaId es requerido para el aislamiento de datos');
        }

        const result = await BloqueoModel.findOneAndUpdate(
            { _id: id, barberiaId },
            { activo: false },
            { new: true }
        );

        if (!result) {
            throw new Error('Bloqueo no encontrado o sin permisos de acceso');
        }
    }

    /**
     * Counts bloqueos by barberia
     * @param {string} barberiaId
     * @param {Object} filters - Optional filters
     * @returns {Promise<number>}
     */
    async countByBarberiaId(barberiaId, filters = {}) {
        const query = { barberiaId };

        if (filters.activo !== undefined) {
            query.activo = filters.activo;
        }

        if (filters.tipo) {
            query.tipo = filters.tipo;
        }

        return await BloqueoModel.countDocuments(query);
    }

    /**
     * Converts MongoDB document to Domain entity
     * @param {Object} mongoDoc
     * @returns {Bloqueo}
     */
    toDomain(mongoDoc) {
        return new Bloqueo({
            id: mongoDoc._id.toString(),
            barberiaId: mongoDoc.barberiaId.toString(),
            barberoId: mongoDoc.barberoId?.toString() || null,
            tipo: mongoDoc.tipo,
            fechaInicio: mongoDoc.fechaInicio,
            fechaFin: mongoDoc.fechaFin,
            horaInicio: mongoDoc.horaInicio,
            horaFin: mongoDoc.horaFin,
            motivo: mongoDoc.motivo,
            todoElDia: mongoDoc.todoElDia,
            activo: mongoDoc.activo,
            creadoPor: mongoDoc.creadoPor?.toString(),
            createdAt: mongoDoc.createdAt,
            updatedAt: mongoDoc.updatedAt
        });
    }

    /**
     * Converts Domain entity to MongoDB document
     * @param {Bloqueo} bloqueo
     * @returns {Object}
     */
    toMongoDocument(bloqueo) {
        return {
            barberiaId: bloqueo.barberiaId,
            barberoId: bloqueo.barberoId,
            tipo: bloqueo.tipo,
            fechaInicio: bloqueo.fechaInicio,
            fechaFin: bloqueo.fechaFin,
            horaInicio: bloqueo.horaInicio,
            horaFin: bloqueo.horaFin,
            motivo: bloqueo.motivo,
            todoElDia: bloqueo.todoElDia,
            activo: bloqueo.activo,
            creadoPor: bloqueo.creadoPor
        };
    }
}

module.exports = MongoBloqueoRepository;
