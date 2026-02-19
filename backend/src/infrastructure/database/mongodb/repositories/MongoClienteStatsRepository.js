const IClienteStatsRepository = require('../../../../domain/repositories/IClienteStatsRepository');
const ClienteStatsModel = require('../models/ClienteStats');
const ClienteStats = require('../../../../domain/entities/ClienteStats');

/**
 * @file MongoClienteStatsRepository.js
 * @description MongoDB implementation of IClienteStatsRepository
 */

class MongoClienteStatsRepository extends IClienteStatsRepository {
    /**
     * Finds client stats by email and barberia
     * @param {string} email
     * @param {string} barberiaId
     * @returns {Promise<ClienteStats|null>}
     */
    async findByEmail(email, barberiaId) {
        if (!barberiaId) {
            throw new Error('barberiaId es requerido para el aislamiento de datos');
        }

        const stats = await ClienteStatsModel.findOne({
            email: email.toLowerCase(),
            barberiaId
        });

        return stats ? this.toDomain(stats) : null;
    }

    /**
     * Finds or creates client stats
     * @param {string} email
     * @param {string} barberiaId
     * @param {string} telefono
     * @returns {Promise<ClienteStats>}
     */
    async findOrCreate(email, barberiaId, telefono = null) {
        if (!barberiaId) {
            throw new Error('barberiaId es requerido para el aislamiento de datos');
        }

        let stats = await ClienteStatsModel.findOne({
            email: email.toLowerCase(),
            barberiaId
        });

        if (!stats) {
            stats = await ClienteStatsModel.create({
                email: email.toLowerCase(),
                telefono,
                barberiaId,
                totalReservas: 0,
                reservasCompletadas: 0,
                reservasCanceladas: 0,
                cancelacionesEsteMes: 0
            });
        }

        return this.toDomain(stats);
    }

    /**
     * Saves a new client stats record
     * @param {ClienteStats} clienteStats
     * @returns {Promise<ClienteStats>}
     */
    async save(clienteStats) {
        const statsData = this.toMongoDocument(clienteStats);
        const savedStats = await ClienteStatsModel.create(statsData);
        return this.toDomain(savedStats);
    }

    /**
     * Updates client stats
     * @param {string} id
     * @param {Object} data
     * @returns {Promise<ClienteStats>}
     */
    async update(id, data) {
        const updated = await ClienteStatsModel.findByIdAndUpdate(
            id,
            data,
            { new: true, runValidators: true }
        );

        if (!updated) {
            throw new Error('ClienteStats no encontrado');
        }

        return this.toDomain(updated);
    }

    /**
     * Increments reservation counter
     * @param {string} email
     * @param {string} barberiaId
     * @returns {Promise<ClienteStats>}
     */
    async incrementReserva(email, barberiaId) {
        const stats = await this.findOrCreate(email, barberiaId);

        const updated = await ClienteStatsModel.findByIdAndUpdate(
            stats.id,
            {
                $inc: { totalReservas: 1 },
                $set: { ultimaReserva: new Date() }
            },
            { new: true }
        );

        return this.toDomain(updated);
    }

    /**
     * Increments cancellation counters
     * @param {string} email
     * @param {string} barberiaId
     * @returns {Promise<ClienteStats>}
     */
    async incrementCancelacion(email, barberiaId) {
        const stats = await this.findOrCreate(email, barberiaId);

        const updated = await ClienteStatsModel.findByIdAndUpdate(
            stats.id,
            {
                $inc: {
                    reservasCanceladas: 1,
                    cancelacionesEsteMes: 1
                },
                $set: { ultimaCancelacion: new Date() }
            },
            { new: true }
        );

        return this.toDomain(updated);
    }

    /**
     * Increments completed reservation counter
     * @param {string} email
     * @param {string} barberiaId
     * @returns {Promise<ClienteStats>}
     */
    async incrementCompletada(email, barberiaId) {
        const stats = await this.findOrCreate(email, barberiaId);

        const updated = await ClienteStatsModel.findByIdAndUpdate(
            stats.id,
            {
                $inc: { reservasCompletadas: 1 }
            },
            { new: true }
        );

        return this.toDomain(updated);
    }

    /**
     * Blocks a client
     * @param {string} email
     * @param {string} barberiaId
     * @param {string} motivo
     * @param {number} diasBloqueo
     * @returns {Promise<ClienteStats>}
     */
    async bloquear(email, barberiaId, motivo, diasBloqueo) {
        const stats = await this.findOrCreate(email, barberiaId);

        const fechaBloqueo = new Date();
        const fechaDesbloqueo = new Date(Date.now() + diasBloqueo * 24 * 60 * 60 * 1000);

        const updated = await ClienteStatsModel.findByIdAndUpdate(
            stats.id,
            {
                bloqueado: true,
                motivoBloqueo: motivo,
                fechaBloqueo,
                fechaDesbloqueo
            },
            { new: true }
        );

        return this.toDomain(updated);
    }

    /**
     * Unblocks a client
     * @param {string} email
     * @param {string} barberiaId
     * @returns {Promise<ClienteStats>}
     */
    async desbloquear(email, barberiaId) {
        const stats = await this.findByEmail(email, barberiaId);

        if (!stats) {
            throw new Error('ClienteStats no encontrado');
        }

        const updated = await ClienteStatsModel.findByIdAndUpdate(
            stats.id,
            {
                bloqueado: false,
                motivoBloqueo: null,
                fechaBloqueo: null,
                fechaDesbloqueo: null
            },
            { new: true }
        );

        return this.toDomain(updated);
    }

    /**
     * Resets monthly cancellation counters for all clients
     * @returns {Promise<void>}
     */
    async resetMonthlyCancelaciones() {
        await ClienteStatsModel.updateMany(
            {},
            { $set: { cancelacionesEsteMes: 0 } }
        );
    }

    /**
     * Finds all blocked clients for a barberia
     * @param {string} barberiaId
     * @returns {Promise<ClienteStats[]>}
     */
    async findBloqueados(barberiaId) {
        if (!barberiaId) {
            throw new Error('barberiaId es requerido para el aislamiento de datos');
        }

        const bloqueados = await ClienteStatsModel.find({
            barberiaId,
            bloqueado: true
        }).sort({ fechaBloqueo: -1 });

        return bloqueados.map(s => this.toDomain(s));
    }

    /**
     * Finds all client stats for a barberia
     * @param {string} barberiaId
     * @param {Object} filters
     * @returns {Promise<ClienteStats[]>}
     */
    async findByBarberiaId(barberiaId, filters = {}) {
        if (!barberiaId) {
            throw new Error('barberiaId es requerido para el aislamiento de datos');
        }

        const query = { barberiaId };

        if (filters.bloqueado !== undefined) {
            query.bloqueado = filters.bloqueado;
        }

        if (filters.email) {
            query.email = { $regex: filters.email, $options: 'i' };
        }

        const stats = await ClienteStatsModel.find(query)
            .sort({ totalReservas: -1 })
            .limit(filters.limit || 100);

        return stats.map(s => this.toDomain(s));
    }

    /**
     * Counts client stats by barberia
     * @param {string} barberiaId
     * @param {Object} filters
     * @returns {Promise<number>}
     */
    async countByBarberiaId(barberiaId, filters = {}) {
        if (!barberiaId) {
            throw new Error('barberiaId es requerido para el aislamiento de datos');
        }

        const query = { barberiaId };

        if (filters.bloqueado !== undefined) {
            query.bloqueado = filters.bloqueado;
        }

        return await ClienteStatsModel.countDocuments(query);
    }

    /**
     * Finds clients that should be automatically unblocked
     * @returns {Promise<ClienteStats[]>}
     */
    async findToUnblock() {
        const now = new Date();

        const toUnblock = await ClienteStatsModel.find({
            bloqueado: true,
            fechaDesbloqueo: { $lte: now }
        });

        return toUnblock.map(s => this.toDomain(s));
    }

    /**
     * Converts MongoDB document to Domain entity
     * @param {Object} mongoDoc
     * @returns {ClienteStats}
     */
    toDomain(mongoDoc) {
        return new ClienteStats({
            id: mongoDoc._id.toString(),
            email: mongoDoc.email,
            telefono: mongoDoc.telefono,
            barberiaId: mongoDoc.barberiaId.toString(),
            totalReservas: mongoDoc.totalReservas,
            reservasCompletadas: mongoDoc.reservasCompletadas,
            reservasCanceladas: mongoDoc.reservasCanceladas,
            cancelacionesEsteMes: mongoDoc.cancelacionesEsteMes,
            ultimaCancelacion: mongoDoc.ultimaCancelacion,
            ultimaReserva: mongoDoc.ultimaReserva,
            bloqueado: mongoDoc.bloqueado,
            motivoBloqueo: mongoDoc.motivoBloqueo,
            fechaBloqueo: mongoDoc.fechaBloqueo,
            fechaDesbloqueo: mongoDoc.fechaDesbloqueo,
            createdAt: mongoDoc.createdAt,
            updatedAt: mongoDoc.updatedAt
        });
    }

    /**
     * Converts Domain entity to MongoDB document
     * @param {ClienteStats} clienteStats
     * @returns {Object}
     */
    toMongoDocument(clienteStats) {
        return {
            email: clienteStats.email,
            telefono: clienteStats.telefono,
            barberiaId: clienteStats.barberiaId,
            totalReservas: clienteStats.totalReservas,
            reservasCompletadas: clienteStats.reservasCompletadas,
            reservasCanceladas: clienteStats.reservasCanceladas,
            cancelacionesEsteMes: clienteStats.cancelacionesEsteMes,
            ultimaCancelacion: clienteStats.ultimaCancelacion,
            ultimaReserva: clienteStats.ultimaReserva,
            bloqueado: clienteStats.bloqueado,
            motivoBloqueo: clienteStats.motivoBloqueo,
            fechaBloqueo: clienteStats.fechaBloqueo,
            fechaDesbloqueo: clienteStats.fechaDesbloqueo
        };
    }
}

module.exports = MongoClienteStatsRepository;
