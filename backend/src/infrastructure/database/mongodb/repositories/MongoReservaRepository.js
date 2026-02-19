const mongoose = require('mongoose');
const IReservaRepository = require('../../../../domain/repositories/IReservaRepository');
const ReservaModel = require('../models/Reserva');
const Reserva = require('../../../../domain/entities/Reserva');

/**
 * MongoDB Implementation of IReservaRepository
 */
class MongoReservaRepository extends IReservaRepository {
    async save(reserva, session = null) {
        const reservaData = this.toMongoDocument(reserva);

        // When using session, create() requires array syntax
        const savedReserva = session
            ? (await ReservaModel.create([reservaData], { session }))[0]
            : await ReservaModel.create(reservaData);

        return this.toDomain(savedReserva);
    }

    async findById(id, barberiaId) {
        if (!barberiaId) {
            throw new Error('barberiaId es requerido para el aislamiento de datos');
        }
        const query = { _id: id, barberiaId };

        const reserva = await ReservaModel.findOne(query)
            .populate('barberoId')
            .populate('servicioId')
            .populate('clienteId');

        // Return null if not found - let the caller handle 404
        return reserva ? this.toDomain(reserva) : null;
    }

    async findByBarberoAndDate(barberoId, fecha, barberiaId) {
        if (!barberiaId) {
            throw new Error('barberiaId es requerido para el aislamiento de datos');
        }

        const startOfDay = new Date(fecha);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(fecha);
        endOfDay.setHours(23, 59, 59, 999);

        const reservas = await ReservaModel.find({
            barberoId,
            barberiaId,
            fecha: { $gte: startOfDay, $lte: endOfDay },
            estado: { $in: ['RESERVADA', 'COMPLETADA'] }
        });

        return reservas.map(r => this.toDomain(r));
    }

    /**
     * Find reservations for a barber within a date range (for weekly/monthly views)
     * @param {string} barberoId - Barber ID
     * @param {string} fechaInicio - Start date (YYYY-MM-DD)
     * @param {string} fechaFin - End date (YYYY-MM-DD)
     * @param {string} barberiaId - Barberia ID for tenant isolation
     * @returns {Promise<Array<Reserva>>} List of reservations
     */
    async findByBarberoAndDateRange(barberoId, fechaInicio, fechaFin, barberiaId) {
        if (!barberiaId) {
            throw new Error('barberiaId es requerido para el aislamiento de datos');
        }

        const startDate = new Date(fechaInicio);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(fechaFin);
        endDate.setHours(23, 59, 59, 999);

        const reservas = await ReservaModel.find({
            barberoId,
            barberiaId,
            fecha: { $gte: startDate, $lte: endDate },
            estado: { $in: ['RESERVADA', 'COMPLETADA'] }
        })
            .populate('servicioId')
            .populate('clienteId')
            .sort({ fecha: 1, hora: 1 });

        return reservas.map(r => this.toDomain(r));
    }

    async findByBarberoId(barberoId, barberiaId, filters = {}) {
        if (!barberiaId) {
            throw new Error('barberiaId es requerido para el aislamiento de datos');
        }

        const query = { barberoId, barberiaId, ...filters };
        const reservas = await ReservaModel.find(query)
            .populate('barberoId')
            .populate('servicioId')
            .populate('clienteId')
            .sort({ fecha: -1, hora: 1 });

        return reservas.map(r => this.toDomain(r));
    }

    async findByBarberiaId(barberiaId, filters = {}) {
        const query = { barberiaId };

        // Handle date range filters
        if (filters.fechaInicio || filters.fechaFin) {
            query.fecha = {};
            if (filters.fechaInicio) {
                const start = new Date(filters.fechaInicio);
                start.setHours(0, 0, 0, 0);
                query.fecha.$gte = start;
            }
            if (filters.fechaFin) {
                const end = new Date(filters.fechaFin);
                end.setHours(23, 59, 59, 999);
                query.fecha.$lte = end;
            }
        }

        // Handle other filters
        if (filters.estado) query.estado = filters.estado;

        const dbQuery = ReservaModel.find(query)
            .populate('barberoId')
            .populate('servicioId')
            .populate('clienteId');

        if (filters.sort) dbQuery.sort(filters.sort);
        else dbQuery.sort({ fecha: -1, hora: -1 });

        if (filters.limit) dbQuery.limit(filters.limit);

        const reservas = await dbQuery;
        return reservas.map(r => this.toDomain(r));
    }

    // Alias for compatibility
    async findAll(barberiaId, filters = {}) {
        return this.findByBarberiaId(barberiaId, filters);
    }

    async findByCancelToken(token) {
        const reserva = await ReservaModel.findOne({ cancelToken: token })
            .populate('barberoId')
            .populate('servicioId');

        return reserva ? this.toDomain(reserva) : null;
    }

    async findByReviewToken(token) {
        const reserva = await ReservaModel.findOne({ reviewToken: token })
            .populate('barberoId')
            .populate('servicioId');

        return reserva ? this.toDomain(reserva) : null;
    }

    async update(id, data, barberiaId, session = null) {
        if (!barberiaId) {
            throw new Error('barberiaId es requerido para el aislamiento de datos');
        }
        const query = { _id: id, barberiaId };

        const options = { new: true };
        if (session) options.session = session;

        const updated = await ReservaModel.findOneAndUpdate(query, data, options)
            .populate('barberoId')
            .populate('servicioId')
            .populate('clienteId');

        if (!updated) {
            throw new Error('Reserva no encontrada o sin permisos de acceso');
        }

        return this.toDomain(updated);
    }

    async delete(id, barberiaId, session = null) {
        if (!barberiaId) {
            throw new Error('barberiaId es requerido para el aislamiento de datos');
        }
        const query = { _id: id, barberiaId };

        const options = session ? { session } : {};
        const deleted = await ReservaModel.findOneAndDelete(query, options);

        if (!deleted) {
            throw new Error('Reserva no encontrada o sin permisos de acceso');
        }
    }

    async checkAvailability(barberoId, fecha, hora, horaFin, barberiaId, excludeReservaId = null) {
        if (!barberiaId) {
            throw new Error('barberiaId es requerido para el aislamiento de datos');
        }

        const startOfDay = new Date(fecha);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(fecha);
        endOfDay.setHours(23, 59, 59, 999);

        const query = {
            barberoId,
            barberiaId,
            fecha: { $gte: startOfDay, $lte: endOfDay },
            estado: { $in: ['RESERVADA', 'COMPLETADA'] },
            $or: [
                { hora: { $lt: horaFin }, horaFin: { $gt: hora } }
            ]
        };

        if (excludeReservaId) {
            query._id = { $ne: excludeReservaId };
        }

        const conflicto = await ReservaModel.findOne(query);
        return !conflicto;
    }

    async findByClientEmail(email, barberiaId) {
        if (!barberiaId) {
            throw new Error('barberiaId es requerido para el aislamiento de datos');
        }

        const reservas = await ReservaModel.find({ emailCliente: email, barberiaId })
            .populate('barberoId')
            .populate('servicioId')
            .sort({ fecha: -1 });

        return reservas.map(r => this.toDomain(r));
    }

    async count(barberiaId, filters = {}) {
        const query = { barberiaId, ...filters };
        return await ReservaModel.countDocuments(query);
    }

    async getEstadisticasBarbero(barberoId, barberiaId) {
        // 🔒 CRITICAL: Enforce multi-tenant isolation
        if (!barberiaId) {
            throw new Error('barberiaId es requerido para el aislamiento de datos');
        }

        const id = new mongoose.Types.ObjectId(barberoId);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - hoy.getDay());

        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

        // Contadores de citas completadas
        const [citasHoy, citasSemana, citasMes, totalCitas] = await Promise.all([
            ReservaModel.countDocuments({
                barberoId: id,
                barberiaId, // 🔒 TENANT ISOLATION
                fecha: { $gte: hoy },
                estado: 'COMPLETADA'
            }),
            ReservaModel.countDocuments({
                barberoId: id,
                barberiaId, // 🔒 TENANT ISOLATION
                fecha: { $gte: inicioSemana },
                estado: 'COMPLETADA'
            }),
            ReservaModel.countDocuments({
                barberoId: id,
                barberiaId, // 🔒 TENANT ISOLATION
                fecha: { $gte: inicioMes },
                estado: 'COMPLETADA'
            }),
            ReservaModel.countDocuments({
                barberoId: id,
                barberiaId, // 🔒 TENANT ISOLATION
                estado: 'COMPLETADA'
            })
        ]);

        // Citas canceladas para calcular tasa de cancelación
        const citasCanceladasMes = await ReservaModel.countDocuments({
            barberoId: id,
            barberiaId, // 🔒 TENANT ISOLATION
            fecha: { $gte: inicioMes },
            estado: 'CANCELADA'
        });

        const totalCitasMes = await ReservaModel.countDocuments({
            barberoId: id,
            barberiaId, // 🔒 TENANT ISOLATION
            fecha: { $gte: inicioMes }
        });

        const tasaCancelacion = totalCitasMes > 0
            ? ((citasCanceladasMes / totalCitasMes) * 100).toFixed(1)
            : 0;

        // Ingresos usando aggregation
        const ingresosData = await ReservaModel.aggregate([
            {
                $match: {
                    barberoId: id,
                    barberiaId: new mongoose.Types.ObjectId(barberiaId), // 🔒 TENANT ISOLATION
                    estado: 'COMPLETADA'
                }
            },
            {
                $facet: {
                    hoy: [
                        { $match: { fecha: { $gte: hoy } } },
                        { $group: { _id: null, total: { $sum: '$precioSnapshot.precioFinal' } } }
                    ],
                    semana: [
                        { $match: { fecha: { $gte: inicioSemana } } },
                        { $group: { _id: null, total: { $sum: '$precioSnapshot.precioFinal' } } }
                    ],
                    mes: [
                        { $match: { fecha: { $gte: inicioMes } } },
                        { $group: { _id: null, total: { $sum: '$precioSnapshot.precioFinal' } } }
                    ]
                }
            }
        ]);

        const ingresosHoy = ingresosData[0]?.hoy[0]?.total || 0;
        const ingresosSemana = ingresosData[0]?.semana[0]?.total || 0;
        const ingresosMes = ingresosData[0]?.mes[0]?.total || 0;

        // Clientes únicos del mes
        const clientesUnicos = await ReservaModel.distinct('nombreCliente', {
            barberoId: id,
            barberiaId, // 🔒 TENANT ISOLATION
            fecha: { $gte: inicioMes },
            estado: 'COMPLETADA'
        });

        // Servicio más popular del mes
        const serviciosPopulares = await ReservaModel.aggregate([
            {
                $match: {
                    barberoId: id,
                    barberiaId: new mongoose.Types.ObjectId(barberiaId), // 🔒 TENANT ISOLATION
                    fecha: { $gte: inicioMes },
                    estado: 'COMPLETADA'
                }
            },
            {
                $lookup: {
                    from: 'servicios',
                    localField: 'servicioId',
                    foreignField: '_id',
                    as: 'servicio'
                }
            },
            { $unwind: '$servicio' },
            {
                $group: {
                    _id: '$servicio.nombre',
                    cantidad: { $sum: 1 }
                }
            },
            { $sort: { cantidad: -1 } },
            { $limit: 3 }
        ]);

        return {
            citas: {
                hoy: citasHoy,
                semana: citasSemana,
                mes: citasMes,
                total: totalCitas
            },
            ingresos: {
                hoy: ingresosHoy,
                semana: ingresosSemana,
                mes: ingresosMes
            },
            tasaCancelacion: parseFloat(tasaCancelacion),
            clientesUnicosMes: clientesUnicos.length,
            serviciosPopulares: serviciosPopulares.map(s => ({
                nombre: s._id,
                cantidad: s.cantidad
            })),
            promedioCitasPorDia: citasMes > 0 ? (citasMes / new Date().getDate()).toFixed(1) : 0
        };
    }

    /**
     * Convert MongoDB document to Domain Entity
     */
    toDomain(mongoDoc) {
        if (!mongoDoc) return null;

        const doc = mongoDoc.toObject ? mongoDoc.toObject() : mongoDoc;
        const duracion = this.calculateDuration(doc.hora, doc.horaFin);

        return new Reserva({
            id: doc._id.toString(),
            barberoId: doc.barberoId?._id?.toString() || doc.barberoId?.toString(),
            clienteId: doc.clienteId?._id?.toString() || doc.clienteId?.toString(),
            nombreCliente: doc.nombreCliente,
            emailCliente: doc.emailCliente,
            barberiaId: doc.barberiaId?.toString(),
            servicioId: doc.servicioId?._id?.toString() || doc.servicioId?.toString(),
            fecha: doc.fecha,
            hora: doc.hora,
            duracion: duracion,
            precio: doc.precioSnapshot?.precioFinal || 0,
            estado: doc.estado,
            cancelToken: doc.cancelToken,
            reviewToken: doc.reviewToken,
            depositoPagado: doc.depositoPagado,
            montoDeposito: doc.montoDeposito || 0,
            precioSnapshot: doc.precioSnapshot,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });
    }

    /**
     * Convert Domain Entity to MongoDB document
     */
    toMongoDocument(reserva) {
        return {
            barberoId: reserva.barberoId,
            clienteId: reserva.clienteId,
            nombreCliente: reserva.nombreCliente,
            emailCliente: reserva.emailCliente.value,
            barberiaId: reserva.barberiaId,
            servicioId: reserva.servicioId,
            fecha: new Date(reserva.timeSlot.date),
            hora: reserva.timeSlot.startTime,
            horaFin: reserva.timeSlot.endTime,
            estado: reserva.estado,
            cancelToken: reserva.cancelToken,
            reviewToken: reserva.reviewToken,
            depositoPagado: reserva.depositoPagado,
            montoDeposito: reserva.montoDeposito.amount,
            precioSnapshot: {
                precioBase: reserva.precio.amount,
                precioFinal: reserva.precio.amount,
                fechaSnapshot: new Date()
            }
        };
    }

    /**
     * Calculate duration in minutes from start and end time
     */
    calculateDuration(horaInicio, horaFin) {
        if (!horaInicio || !horaFin) return 0;
        const [startH, startM] = horaInicio.split(':').map(Number);
        const [endH, endM] = horaFin.split(':').map(Number);
        return (endH * 60 + endM) - (startH * 60 + startM);
    }
}

module.exports = MongoReservaRepository;
