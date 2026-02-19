const IHorarioRepository = require('../../../../domain/repositories/IHorarioRepository');
const HorarioModel = require('../models/Horario');
const Horario = require('../../../../domain/entities/Horario');

/**
 * MongoDB Implementation of IHorarioRepository
 */
class MongoHorarioRepository extends IHorarioRepository {
    async save(horario) {
        const horarioData = this.toMongoDocument(horario);
        const savedHorario = await HorarioModel.create(horarioData);
        return this.toDomain(savedHorario);
    }

    async findById(id, barberiaId = null) {
        const query = { _id: id };
        // Note: Horario doesn't have direct barberiaId, validated through barbero

        const horario = await HorarioModel.findOne(query);
        if (!horario) {
            throw new Error('Horario no encontrado o sin permisos de acceso');
        }
        return this.toDomain(horario);
    }

    async findByBarberoId(barberoId) {
        const horarios = await HorarioModel.find({ barberoId }).sort({ diaSemana: 1 });
        return horarios.map(h => this.toDomain(h));
    }

    async findByBarberoAndDay(barberoId, diaSemana) {
        const horario = await HorarioModel.findOne({ barberoId, diaSemana });
        return horario ? this.toDomain(horario) : null;
    }

    async update(id, data, barberiaId = null) {
        const query = { _id: id };

        const updated = await HorarioModel.findOneAndUpdate(query, data, { new: true });
        if (!updated) {
            throw new Error('Horario no encontrado o sin permisos de acceso');
        }
        return this.toDomain(updated);
    }

    async delete(id, barberiaId = null) {
        const query = { _id: id };

        const deleted = await HorarioModel.findOneAndDelete(query);
        if (!deleted) {
            throw new Error('Horario no encontrado o sin permisos de acceso');
        }
    }

    /**
     * Convert MongoDB document to Domain entity
     */
    toDomain(mongoDoc) {
        if (!mongoDoc) return null;

        const doc = mongoDoc.toObject ? mongoDoc.toObject() : mongoDoc;

        return new Horario({
            id: doc._id.toString(),
            barberoId: doc.barberoId.toString(),
            diaSemana: doc.diaSemana,
            horaInicio: doc.horaInicio,
            horaFin: doc.horaFin,
            duracionTurno: doc.duracionTurno,
            activo: doc.activo,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });
    }

    /**
     * Convert Domain entity to MongoDB document
     */
    toMongoDocument(horario) {
        return {
            barberoId: horario.barberoId,
            diaSemana: horario.diaSemana,
            horaInicio: horario.horaInicio,
            horaFin: horario.horaFin,
            duracionTurno: horario.duracionTurno,
            activo: horario.activo
        };
    }
}

module.exports = MongoHorarioRepository;
