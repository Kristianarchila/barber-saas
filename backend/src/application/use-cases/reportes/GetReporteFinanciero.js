const mongoose = require("mongoose");
const Reserva = require("../../../infrastructure/database/mongodb/models/Reserva");
const Egreso = require("../../../infrastructure/database/mongodb/models/Egreso");
const Vale = require("../../../infrastructure/database/mongodb/models/Vale");
const Barberia = require("../../../infrastructure/database/mongodb/models/Barberia");

/**
 * GetReporteFinanciero
 *
 * Genera el reporte financiero unificado que combina:
 *   1. INGRESOS  — reservas completadas/confirmadas, agrupadas por servicio
 *   2. EGRESOS   — gastos registrados en el período
 *   3. VALES     — adelantos entregados a barberos en el período
 *
 * Formato idéntico al reporte de Capitan Barber:
 *   DETALLE INGRESOS → SERVICIO
 *   DETALLE EGRESOS  → COMPRA + VALE
 *   DETALLE USUARIOS → vales por barbero
 */
class GetReporteFinanciero {
    async execute(barberiaId, { fechaInicio, fechaFin }) {
        if (!fechaInicio || !fechaFin) {
            throw new Error("fechaInicio y fechaFin son requeridos");
        }

        const bId = new mongoose.Types.ObjectId(barberiaId.toString());

        // Reserva.fecha is a Date — convert string boundaries to Date for proper $gte/$lte comparison
        const fechaInicioDate = new Date(fechaInicio + "T00:00:00.000Z");
        const fechaFinDate = new Date(fechaFin + "T23:59:59.999Z");

        // Fetch in parallel for performance
        const [barberia, ingresosPorServicio, egresos, vales] = await Promise.all([
            Barberia.findById(barberiaId).select("nombre direccion").lean(),
            this._getIngresosPorServicio(bId, fechaInicioDate, fechaFinDate),
            this._getEgresos(bId, fechaInicio, fechaFin),   // Egreso.fecha is String
            this._getVales(bId, fechaInicio, fechaFin),     // Vale.fecha is String
        ]);

        // Totals
        const totalIngresos = ingresosPorServicio.reduce((s, i) => s + i.totalNeto, 0);
        const totalComisiones = ingresosPorServicio.reduce((s, i) => s + i.totalComision, 0);
        const totalEgresos = egresos.reduce((s, e) => s + e.montoTotal, 0);
        const totalVales = vales.reduce((s, v) => s + v.monto, 0);
        const totalEgresosGeneral = totalEgresos + totalVales;
        const neto = totalIngresos - totalEgresosGeneral;

        return {
            meta: {
                barberia: barberia?.nombre || "—",
                direccion: barberia?.direccion || "—",
                fechaInicio,
                fechaFin,
                fechaEmision: new Date().toISOString().split("T")[0]
            },
            ingresos: {
                servicios: ingresosPorServicio,
                totalBruto: ingresosPorServicio.reduce((s, i) => s + i.subtotal, 0),
                totalComisiones,
                total: totalIngresos
            },
            egresos: {
                compras: egresos,
                vales,
                totalCompras: totalEgresos,
                totalVales,
                total: totalEgresosGeneral
            },
            neto
        };
    }

    async _getIngresosPorServicio(bId, fechaInicio, fechaFin) {
        const rows = await Reserva.aggregate([
            {
                $match: {
                    barberiaId: bId,
                    fecha: { $gte: fechaInicio, $lte: fechaFin },
                    estado: { $in: ["COMPLETADA", "RESERVADA"] }
                }
            },
            {
                $lookup: {
                    from: "servicios",
                    localField: "servicioId",
                    foreignField: "_id",
                    as: "servicio"
                }
            },
            { $unwind: { path: "$servicio", preserveNullAndEmptyArrays: true } },

            {
                $group: {
                    _id: "$servicioId",
                    nombre: { $first: "$servicio.nombre" },
                    cant: { $sum: 1 },
                    unitario: { $first: "$precio" },
                    subtotal: { $sum: "$precio" },
                    montoComision: { $first: "$comision" },
                    totalComision: { $sum: "$comision" }
                }
            },
            { $sort: { subtotal: -1 } }
        ]);

        return rows.map(r => ({
            nombre: r.nombre || "Servicio eliminado",
            cant: r.cant,
            unitario: r.unitario || 0,
            subtotal: r.subtotal || 0,
            montoComision: r.montoComision || 0,
            totalComision: r.totalComision || 0,
            totalNeto: (r.subtotal || 0) - (r.totalComision || 0)
        }));
    }

    async _getEgresos(bId, fechaInicio, fechaFin) {
        // Egreso.fecha is a String (YYYY-MM-DD) — no activo field in schema
        return Egreso.find({
            barberiaId: bId,
            fecha: { $gte: fechaInicio, $lte: fechaFin }
        }).select("descripcion monto montoTotal categoria tipoDocumento nombreProveedor").lean();
    }

    async _getVales(bId, fechaInicio, fechaFin) {
        return Vale.find({
            barberiaId: bId,
            fecha: { $gte: fechaInicio, $lte: fechaFin },
            activo: true
        })
            .populate("barberoId", "nombre apellido")
            .lean();
    }
}

module.exports = GetReporteFinanciero;
