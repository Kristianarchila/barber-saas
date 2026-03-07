const Vale = require("../models/Vale");

/**
 * MongoDB repository for Vale (barbero advance payments)
 */
class MongoValeRepository {

    async create({ barberiaId, barberoId, fecha, descripcion, monto, metodoPago, autorizadoPor }) {
        const vale = await Vale.create({
            barberiaId, barberoId, fecha, descripcion, monto,
            metodoPago: metodoPago || "EFECTIVO",
            autorizadoPor,
            estado: "PENDIENTE",
            activo: true
        });
        return vale.toObject();
    }

    async findByBarberiaId(barberiaId, { fechaInicio, fechaFin, barberoId, estado } = {}) {
        const query = { barberiaId, activo: true };
        if (fechaInicio && fechaFin) {
            query.fecha = { $gte: fechaInicio, $lte: fechaFin };
        }
        if (barberoId) query.barberoId = barberoId;
        if (estado) query.estado = estado;

        return Vale.find(query)
            .populate("barberoId", "nombre apellido")
            .sort({ fecha: -1 })
            .lean();
    }

    async findById(id, barberiaId) {
        return Vale.findOne({ _id: id, barberiaId, activo: true }).lean();
    }

    async update(id, barberiaId, data) {
        return Vale.findOneAndUpdate(
            { _id: id, barberiaId, activo: true },
            { $set: data },
            { new: true }
        ).lean();
    }

    async delete(id, barberiaId) {
        return Vale.findOneAndUpdate(
            { _id: id, barberiaId },
            { $set: { activo: false } },
            { new: true }
        ).lean();
    }

    /**
     * Aggregation for the financial report
     */
    async totalPorPeriodo(barberiaId, fechaInicio, fechaFin) {
        const result = await Vale.aggregate([
            {
                $match: {
                    barberiaId: require("mongoose").Types.ObjectId.createFromHexString
                        ? require("mongoose").Types.ObjectId.createFromHexString(barberiaId.toString())
                        : new (require("mongoose").Types.ObjectId)(barberiaId.toString()),
                    fecha: { $gte: fechaInicio, $lte: fechaFin },
                    activo: true
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$monto" },
                    cantidad: { $sum: 1 }
                }
            }
        ]);
        return result[0] || { total: 0, cantidad: 0 };
    }
}

module.exports = MongoValeRepository;
