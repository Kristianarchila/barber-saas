const IClienteRepository = require('../../../../domain/repositories/IClienteRepository');
const UserModel = require('../models/User');
const Cliente = require('../../../../domain/entities/Cliente');

/**
 * MongoDB Implementation of IClienteRepository
 * Note: Using User model as it represents clients in the current schema
 */
class MongoClienteRepository extends IClienteRepository {
    async save(cliente, session = null) {
        const clienteData = this.toMongoDocument(cliente);

        // When using session, create() requires array syntax
        const savedCliente = session
            ? (await UserModel.create([clienteData], { session }))[0]
            : await UserModel.create(clienteData);

        return this.toDomain(savedCliente);
    }

    async findById(id, barberiaId = null) {
        const query = { _id: id, role: 'CLIENTE' };

        // If barberiaId provided, enforce ownership validation
        if (barberiaId) {
            query.barberiaId = barberiaId;
        }

        const cliente = await UserModel.findOne(query);

        if (!cliente) {
            throw new Error('Cliente no encontrado o sin permisos de acceso');
        }

        return this.toDomain(cliente);
    }

    async findByEmail(email, barberiaId) {
        const cliente = await UserModel.findOne({
            email: email.toLowerCase(),
            barberiaId,
            role: 'CLIENTE'
        });

        return cliente ? this.toDomain(cliente) : null;
    }

    async findByBarberiaId(barberiaId, filters = {}) {
        const query = {
            barberiaId,
            role: 'CLIENTE',
            ...filters
        };

        const clientes = await UserModel.find(query).sort({ nombre: 1 });
        return clientes.map(c => this.toDomain(c));
    }

    async update(id, data, barberiaId = null, session = null) {
        const query = { _id: id, role: 'CLIENTE' };

        // If barberiaId provided, enforce ownership validation
        if (barberiaId) {
            query.barberiaId = barberiaId;
        }

        const options = { new: true };
        if (session) options.session = session;

        const updated = await UserModel.findOneAndUpdate(query, data, options);

        if (!updated) {
            throw new Error('Cliente no encontrado o sin permisos de acceso');
        }

        return this.toDomain(updated);
    }

    async delete(id, barberiaId = null) {
        const query = { _id: id, role: 'CLIENTE' };

        // If barberiaId provided, enforce ownership validation
        if (barberiaId) {
            query.barberiaId = barberiaId;
        }

        const deleted = await UserModel.findOneAndDelete(query);

        if (!deleted) {
            throw new Error('Cliente no encontrado o sin permisos de acceso');
        }
    }

    async search(barberiaId, searchTerm) {
        const regex = new RegExp(searchTerm, 'i');
        const clientes = await UserModel.find({
            barberiaId,
            role: 'CLIENTE',
            $or: [
                { nombre: regex },
                { email: regex }
            ]
        }).sort({ nombre: 1 });

        return clientes.map(c => this.toDomain(c));
    }

    /**
     * Convert MongoDB document to Domain Entity
     */
    toDomain(mongoDoc) {
        if (!mongoDoc) return null;

        return new Cliente({
            id: mongoDoc._id.toString(),
            nombre: mongoDoc.nombre,
            email: mongoDoc.email,
            telefono: mongoDoc.telefono || null,
            barberiaId: mongoDoc.barberiaId,
            notas: mongoDoc.notas || '',
            preferencias: mongoDoc.preferencias || {},
            historialVisitas: mongoDoc.historialVisitas || 0,
            ultimaVisita: mongoDoc.ultimaVisita || null,
            createdAt: mongoDoc.createdAt,
            updatedAt: mongoDoc.updatedAt
        });
    }

    /**
     * Convert Domain Entity to MongoDB document
     */
    toMongoDocument(cliente) {
        return {
            nombre: cliente.nombre,
            email: cliente.email.value,
            telefono: cliente.telefono ? cliente.telefono.value : null,
            barberiaId: cliente.barberiaId,
            role: 'CLIENTE',
            notas: cliente.notas,
            preferencias: cliente.preferencias,
            historialVisitas: cliente.historialVisitas,
            ultimaVisita: cliente.ultimaVisita
        };
    }
}

module.exports = MongoClienteRepository;
