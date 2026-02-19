const IBarberoRepository = require('../../../../domain/repositories/IBarberoRepository');
const BarberoModel = require('../models/Barbero');
const Barbero = require('../../../../domain/entities/Barbero');
const cacheService = require('../../../cache/CacheService');

/**
 * MongoDB Implementation of IBarberoRepository
 */
class MongoBarberoRepository extends IBarberoRepository {
    async save(barbero) {
        const barberoData = this.toMongoDocument(barbero);
        const savedBarbero = await BarberoModel.create(barberoData);

        // Invalidar caché de barberos
        cacheService.delByPattern(`${barbero.barberiaId}:barberos`);

        return this.toDomain(savedBarbero);
    }

    async findById(id, barberiaId) {
        if (!barberiaId) {
            throw new Error('barberiaId es requerido para el aislamiento de datos');
        }
        const query = { _id: id, barberiaId };

        const barbero = await BarberoModel.findOne(query)
            .populate('usuario', 'nombre email activo');

        if (!barbero) {
            throw new Error('Barbero no encontrado o sin permisos de acceso');
        }

        return this.toDomain(barbero);
    }

    async findByUsuarioId(usuarioId, barberiaId) {
        if (!barberiaId) {
            throw new Error('barberiaId es requerido para el aislamiento de datos');
        }
        const barbero = await BarberoModel.findOne({
            usuario: usuarioId,
            barberiaId
        }).populate('usuario', 'nombre email activo');

        return barbero ? this.toDomain(barbero) : null;
    }

    async findByBarberiaId(barberiaId, options = {}) {
        // Generar key de caché
        const cacheKey = cacheService.generateKey(
            barberiaId,
            'barberos',
            JSON.stringify(options)
        );

        // Intentar obtener del caché
        return cacheService.wrap(
            cacheKey,
            async () => {
                const query = { barberiaId };
                if (options.onlyActive) {
                    query.activo = true;
                }

                let dbQuery = BarberoModel.find(query).sort({ createdAt: 1 });

                if (options.populateUser) {
                    dbQuery = dbQuery.populate('usuario', 'nombre email activo');
                }

                const barberos = await dbQuery.lean();
                return barberos.map(b => this.toDomain(b));
            },
            600 // 10 minutos de caché
        );
    }

    async findAll(barberiaId, options = {}) {
        return this.findByBarberiaId(barberiaId, options);
    }

    async update(id, data, barberiaId) {
        if (!barberiaId) {
            throw new Error('barberiaId es requerido para el aislamiento de datos');
        }
        // Map domain-like fields to mongo fields if necessary
        const mongoData = { ...data };
        if (data.usuarioId) mongoData.usuario = data.usuarioId;

        const query = { _id: id, barberiaId };

        const updated = await BarberoModel.findOneAndUpdate(query, mongoData, { new: true })
            .populate('usuario', 'nombre email activo');

        if (!updated) {
            throw new Error('Barbero no encontrado o sin permisos de acceso');
        }

        // Invalidar caché
        cacheService.delByPattern(`${barberiaId}:barberos`);

        return this.toDomain(updated);
    }

    async delete(id, barberiaId) {
        if (!barberiaId) {
            throw new Error('barberiaId es requerido para el aislamiento de datos');
        }
        const query = { _id: id, barberiaId };

        const deleted = await BarberoModel.findOneAndDelete(query);

        if (!deleted) {
            throw new Error('Barbero no encontrado o sin permisos de acceso');
        }

        // Invalidar caché
        cacheService.delByPattern(`${barberiaId}:barberos`);
    }

    /**
     * Convert MongoDB document to Domain entity
     */
    toDomain(mongoDoc) {
        if (!mongoDoc) return null;

        const doc = mongoDoc.toObject ? mongoDoc.toObject() : mongoDoc;

        const barbero = new Barbero({
            id: doc._id.toString(),
            usuarioId: doc.usuario?._id?.toString() || doc.usuario?.toString(),
            nombre: doc.nombre,
            barberiaId: doc.barberiaId?.toString(),
            sucursalId: doc.sucursalId?.toString(),
            foto: doc.foto,
            descripcion: doc.descripcion,
            especialidades: doc.especialidades,
            experiencia: doc.experiencia,
            activo: doc.activo,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });

        // Attach populated user data if available
        if (doc.usuario && typeof doc.usuario === 'object' && doc.usuario.email) {
            barbero.usuario = {
                nombre: doc.usuario.nombre,
                email: doc.usuario.email,
                activo: doc.usuario.activo
            };
        }

        return barbero;
    }

    /**
     * Convert Domain entity to MongoDB document
     */
    toMongoDocument(barbero) {
        return {
            usuario: barbero.usuarioId,
            nombre: barbero.nombre,
            barberiaId: barbero.barberiaId,
            sucursalId: barbero.sucursalId,
            foto: barbero.foto,
            descripcion: barbero.descripcion,
            especialidades: barbero.especialidades,
            experiencia: barbero.experiencia,
            activo: barbero.activo
        };
    }

    /**
     * Count barberos with filters
     * @param {object} filters 
     * @returns {Promise<number>}
     */
    async count(filters = {}) {
        return await BarberoModel.countDocuments(filters);
    }

    /**
     * Count barberos by barberia ID
     * @param {string} barberiaId 
     * @returns {Promise<number>}
     */
    async countByBarberiaId(barberiaId) {
        return await BarberoModel.countDocuments({ barberiaId });
    }
}

module.exports = MongoBarberoRepository;
