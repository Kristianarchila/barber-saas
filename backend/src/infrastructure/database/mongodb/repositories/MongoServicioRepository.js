const IServicioRepository = require('../../../../domain/repositories/IServicioRepository');
const ServicioModel = require('../models/Servicio');
const Servicio = require('../../../../domain/entities/Servicio');

/**
 * MongoDB Implementation of IServicioRepository
 */
class MongoServicioRepository extends IServicioRepository {
    async save(servicio) {
        const servicioData = this.toMongoDocument(servicio);
        const savedServicio = await ServicioModel.create(servicioData);
        return this.toDomain(savedServicio);
    }

    async findById(id, barberiaId) {
        if (!barberiaId) {
            throw new Error('barberiaId es requerido para el aislamiento de datos');
        }
        const query = { _id: id, barberiaId };

        const servicio = await ServicioModel.findOne(query);
        if (!servicio) {
            throw new Error('Servicio no encontrado o sin permisos de acceso');
        }
        return this.toDomain(servicio);
    }

    async findByBarberiaId(barberiaId, onlyActive = false) {
        const query = { barberiaId };
        if (onlyActive) {
            query.activo = true;
        }

        const servicios = await ServicioModel.find(query).sort({ nombre: 1 });
        return servicios.map(s => this.toDomain(s));
    }

    async findAll(barberiaId, onlyActive = false) {
        return this.findByBarberiaId(barberiaId, onlyActive);
    }

    async update(id, data, barberiaId) {
        if (!barberiaId) {
            throw new Error('barberiaId es requerido para el aislamiento de datos');
        }
        const query = { _id: id, barberiaId };

        const updated = await ServicioModel.findOneAndUpdate(query, data, { new: true });
        if (!updated) {
            throw new Error('Servicio no encontrado o sin permisos de acceso');
        }
        return this.toDomain(updated);
    }

    async delete(id, barberiaId) {
        if (!barberiaId) {
            throw new Error('barberiaId es requerido para el aislamiento de datos');
        }
        const query = { _id: id, barberiaId };

        const deleted = await ServicioModel.findOneAndDelete(query);
        if (!deleted) {
            throw new Error('Servicio no encontrado o sin permisos de acceso');
        }
    }

    async exists(id) {
        const count = await ServicioModel.countDocuments({ _id: id });
        return count > 0;
    }

    /**
     * Convert MongoDB document to Domain Entity
     */
    toDomain(mongoDoc) {
        if (!mongoDoc) return null;

        return new Servicio({
            id: mongoDoc._id.toString(),
            nombre: mongoDoc.nombre,
            descripcion: mongoDoc.descripcion,
            duracion: mongoDoc.duracion,
            precio: mongoDoc.precio,
            imagen: mongoDoc.imagen,
            barberiaId: mongoDoc.barberiaId,
            activo: mongoDoc.activo,
            createdAt: mongoDoc.createdAt,
            updatedAt: mongoDoc.updatedAt
        });
    }

    /**
     * Convert Domain Entity to MongoDB document
     */
    toMongoDocument(servicio) {
        return {
            nombre: servicio.nombre,
            descripcion: servicio.descripcion,
            duracion: servicio.duracion,
            precio: servicio.precio.amount,
            imagen: servicio.imagen,
            barberiaId: servicio.barberiaId,
            activo: servicio.activo
        };
    }

    /**
     * Count servicios by barberia ID
     * @param {string} barberiaId 
     * @returns {Promise<number>}
     */
    async countByBarberiaId(barberiaId) {
        return await ServicioModel.countDocuments({ barberiaId });
    }
}

module.exports = MongoServicioRepository;
