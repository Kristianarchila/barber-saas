const IWaitingListRepository = require('../../../../domain/repositories/IWaitingListRepository');
const WaitingListModel = require('../models/WaitingList');
const crypto = require('crypto');

/**
 * MongoWaitingListRepository
 * MongoDB implementation of IWaitingListRepository
 */
class MongoWaitingListRepository extends IWaitingListRepository {
    /**
     * Create a new waiting list entry
     */
    async create(data) {
        const entry = new WaitingListModel(data);
        await entry.save();
        return entry;
    }

    /**
     * Find waiting list entry by ID
     */
    async findById(id) {
        return await WaitingListModel.findById(id)
            .populate('barberoId', 'nombre email')
            .populate('servicioId', 'nombre duracion precio')
            .populate('clienteId', 'nombre email telefono');
    }

    /**
     * Find waiting list entry by token
     */
    async findByToken(token) {
        return await WaitingListModel.findOne({ token })
            .populate('barberoId', 'nombre email')
            .populate('servicioId', 'nombre duracion precio')
            .populate('clienteId', 'nombre email telefono');
    }

    /**
     * Find all active waiting list entries for a barberia
     */
    async findActiveByBarberia(barberiaId, filters = {}) {
        const query = {
            barberiaId,
            estado: filters.estado || 'ACTIVA'
        };

        if (filters.barberoId) {
            query.barberoId = filters.barberoId;
        }

        if (filters.servicioId) {
            query.servicioId = filters.servicioId;
        }

        const entries = await WaitingListModel.find(query)
            .populate('barberoId', 'nombre email')
            .populate('servicioId', 'nombre duracion precio')
            .populate('clienteId', 'nombre email telefono')
            .sort({ prioridad: 1, createdAt: 1 });

        // Calculate positions
        entries.forEach((entry, index) => {
            entry._posicion = index + 1;
        });

        return entries;
    }

    /**
     * Find matching entries for a specific slot
     */
    async findMatchingEntries(barberiaId, barberoId, servicioId, fecha, hora) {
        const dayjs = require('dayjs');
        const fechaObj = dayjs(fecha);
        const diaSemana = fechaObj.format('dddd').toLowerCase();

        // Map English day names to Spanish
        const dayMap = {
            'monday': 'lunes',
            'tuesday': 'martes',
            'wednesday': 'miercoles',
            'thursday': 'jueves',
            'friday': 'viernes',
            'saturday': 'sabado',
            'sunday': 'domingo'
        };
        const diaSemanaEs = dayMap[diaSemana] || diaSemana;

        const query = {
            barberiaId,
            barberoId,
            servicioId,
            estado: 'ACTIVA',
            // Fecha preferida debe ser cercana (dentro de 7 días)
            fechaPreferida: {
                $gte: fechaObj.subtract(3, 'day').toDate(),
                $lte: fechaObj.add(3, 'day').toDate()
            },
            // Hora debe estar dentro del rango
            'rangoHorario.inicio': { $lte: hora },
            'rangoHorario.fin': { $gte: hora },
            // Día de la semana debe coincidir (o no tener preferencia)
            $or: [
                { diasPreferidos: { $size: 0 } },
                { diasPreferidos: diaSemanaEs }
            ]
        };

        return await WaitingListModel.find(query)
            .populate('barberoId', 'nombre email')
            .populate('servicioId', 'nombre duracion precio')
            .populate('clienteId', 'nombre email telefono')
            .sort({ prioridad: 1, createdAt: 1 });
    }

    /**
     * Update waiting list entry
     */
    async update(id, data) {
        return await WaitingListModel.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, runValidators: true }
        );
    }

    /**
     * Mark as notified
     */
    async markAsNotified(id, token, expiresInHours = 48) {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000);

        return await WaitingListModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    estado: 'NOTIFICADA',
                    token: token || crypto.randomBytes(32).toString('hex'),
                    notificadoEn: now,
                    expiraEn: expiresAt
                }
            },
            { new: true }
        );
    }

    /**
     * Mark as converted
     */
    async markAsConverted(id, reservaId) {
        return await WaitingListModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    estado: 'CONVERTIDA',
                    reservaId,
                    convertidaEn: new Date()
                }
            },
            { new: true }
        );
    }

    /**
     * Mark as expired
     */
    async markAsExpired(id) {
        return await WaitingListModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    estado: 'EXPIRADA'
                }
            },
            { new: true }
        );
    }

    /**
     * Mark as cancelled
     */
    async markAsCancelled(id) {
        return await WaitingListModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    estado: 'CANCELADA',
                    canceladaEn: new Date()
                }
            },
            { new: true }
        );
    }

    /**
     * Find expired notifications
     */
    async findExpiredNotifications() {
        return await WaitingListModel.find({
            estado: 'NOTIFICADA',
            expiraEn: { $lt: new Date() }
        });
    }

    /**
     * Get position in queue
     */
    async getPosition(id) {
        const entry = await WaitingListModel.findById(id);
        if (!entry) return null;

        const position = await WaitingListModel.countDocuments({
            barberiaId: entry.barberiaId,
            barberoId: entry.barberoId,
            servicioId: entry.servicioId,
            estado: 'ACTIVA',
            $or: [
                { prioridad: { $lt: entry.prioridad } },
                {
                    prioridad: entry.prioridad,
                    createdAt: { $lt: entry.createdAt }
                }
            ]
        });

        return position + 1;
    }

    /**
     * Count active entries for a client
     */
    async countActiveByClient(clienteEmail, barberiaId) {
        return await WaitingListModel.countDocuments({
            clienteEmail: clienteEmail.toLowerCase(),
            barberiaId,
            estado: 'ACTIVA'
        });
    }

    /**
     * Delete entry
     */
    async delete(id) {
        return await WaitingListModel.findByIdAndDelete(id);
    }
}

module.exports = MongoWaitingListRepository;
