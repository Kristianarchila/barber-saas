const IUserRepository = require('../../../../domain/repositories/IUserRepository');
const UserModel = require('../models/User');
const User = require('../../../../domain/entities/User');

/**
 * MongoDB Implementation of IUserRepository
 */
class MongoUserRepository extends IUserRepository {
    async save(userData) {
        // If it's already an entity, use toObject or mapping
        const data = userData.toObject ? userData.toObject() : userData;
        const user = await UserModel.create(data);
        return this.toDomain(user);
    }

    async findById(id, barberiaId) {
        if (!barberiaId) {
            throw new Error('barberiaId es requerido para el aislamiento de datos');
        }
        const query = {
            _id: id,
            $or: [
                { barberiaId: barberiaId },
                { barberiaIds: barberiaId }
            ]
        };

        const user = await UserModel.findOne(query).select('+password');
        if (!user && barberiaId) {
            throw new Error('Usuario no encontrado o sin permisos de acceso');
        }
        return user ? this.toDomain(user) : null;
    }

    async findByEmail(email, options = {}) {
        let query = UserModel.findOne({ email: email.toLowerCase() }).select('+password');

        if (options.populateBarberia) {
            query = query.populate('barberiaId', 'slug nombre');
        }

        const user = await query;
        return user ? this.toDomain(user) : null;
    }

    async findByBarberiaId(barberiaId, filters = {}) {
        const query = { barberiaId, ...filters };
        const users = await UserModel.find(query).sort({ createdAt: -1 });
        return users.map(u => this.toDomain(u));
    }

    async findOne(filters = {}, barberiaId = null) {
        // SECURITY: If barberiaId provided, enforce tenant isolation
        if (barberiaId) {
            filters.$or = [
                { barberiaId: barberiaId },
                { barberiaIds: barberiaId }
            ];
        }
        const user = await UserModel.findOne(filters).select('-password');
        return user ? this.toDomain(user) : null;
    }

    async findByRole(role, options = {}) {
        let query = UserModel.find({ rol: role }).sort({ createdAt: -1 });

        // Support population of related entities
        if (options.populateBarberia) {
            query = query.populate('barberiaId', 'nombre slug direccion');
        }

        if (options.populateBarberias) {
            query = query.populate('barberiaIds', 'nombre slug direccion');
        }

        const users = await query;

        // Return domain entities with populated data preserved
        return users.map(user => {
            const domainUser = this.toDomain(user);

            // Preserve populated barberiaIds for multi-location admins
            if (user.barberiaIds && user.barberiaIds.length > 0 && user.barberiaIds[0].nombre) {
                domainUser.populatedBarberiaIds = user.barberiaIds.map(b => ({
                    _id: b._id.toString(),
                    nombre: b.nombre,
                    slug: b.slug,
                    direccion: b.direccion
                }));
            }

            return domainUser;
        });
    }

    async update(id, data, barberiaId) {
        if (!barberiaId) {
            throw new Error('barberiaId es requerido para el aislamiento de datos');
        }
        const query = {
            _id: id,
            $or: [
                { barberiaId: barberiaId },
                { barberiaIds: barberiaId }
            ]
        };

        const updated = await UserModel.findOneAndUpdate(query, data, { new: true });
        if (!updated && barberiaId) {
            throw new Error('Usuario no encontrado o sin permisos de acceso');
        }
        return this.toDomain(updated);
    }

    async delete(id, barberiaId) {
        if (!barberiaId) {
            throw new Error('barberiaId es requerido para el aislamiento de datos');
        }
        const query = {
            _id: id,
            $or: [
                { barberiaId: barberiaId },
                { barberiaIds: barberiaId }
            ]
        };

        const deleted = await UserModel.findOneAndDelete(query);
        if (!deleted && barberiaId) {
            throw new Error('Usuario no encontrado o sin permisos de acceso');
        }
    }

    /**
     * Find users by account status (for SuperAdmin)
     */
    async findByStatus(status) {
        const users = await UserModel.find({ estadoCuenta: status }).sort({ createdAt: -1 });
        return users.map(u => this.toDomain(u));
    }

    /**
     * Update user without barberiaId requirement (for SuperAdmin operations)
     */
    async updateById(id, data) {
        const updated = await UserModel.findByIdAndUpdate(id, data, { new: true });
        if (!updated) {
            throw new Error('Usuario no encontrado');
        }
        return this.toDomain(updated);
    }

    /**
     * Convert MongoDB document to Domain Entity
     */
    toDomain(mongoDoc) {
        if (!mongoDoc) return null;

        const doc = mongoDoc.toObject ? mongoDoc.toObject() : mongoDoc;

        const user = new User({
            id: doc._id.toString(),
            nombre: doc.nombre,
            email: doc.email,
            // SECURITY: Only include password if it was explicitly selected (e.g., during login)
            password: doc.password || undefined,
            rol: doc.rol,
            barberiaId: doc.barberiaId?._id?.toString() || doc.barberiaId?.toString() || null,
            barberiaIds: doc.barberiaIds ? doc.barberiaIds.map(id => id?._id?.toString() || id?.toString()) : [],
            barberoId: doc.barberoId?._id?.toString() || doc.barberoId?.toString() || null,
            activo: doc.activo,
            estadoCuenta: doc.estadoCuenta || 'ACTIVA',
            fechaAprobacion: doc.fechaAprobacion,
            aprobadoPor: doc.aprobadoPor?.toString() || null,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });

        // Carry over populated data if exists
        if (doc.barberiaId && doc.barberiaId.slug) {
            user.barberia = doc.barberiaId;
        }

        return user;
    }
}

module.exports = MongoUserRepository;

