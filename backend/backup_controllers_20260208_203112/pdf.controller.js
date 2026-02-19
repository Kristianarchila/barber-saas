const {
    generateFinancialReport,
    generateCajaReport,
    generateInvoice,
} = require("../services/pdf.service");
const Reserva = require("../models/Reserva");
const Transaction = require("../models/Transaction");

/**
 * @desc    Generar reporte financiero en PDF
 * @route   GET /api/barberias/:slug/reportes/pdf/financiero
 * @access  Private (Admin)
 */
const getFinancialReportPDF = async (req, res) => {
    try {
        const barberia = req.barberia;
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Se requieren fechas de inicio y fin" });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        // Obtener datos para el reporte
        const reservas = await Reserva.find({
            barberiaId: barberia._id,
            fecha: { $gte: start, $lte: end },
            estado: { $nin: ["CANCELADA"] },
        }).populate("servicioId", "nombre precio");

        const transactions = await Transaction.find({
            barberia: barberia._id,
            fecha: { $gte: start, $lte: end },
        });

        // Calcular totales
        const totalIngresos = transactions
            .filter((t) => t.tipo === "ingreso")
            .reduce((sum, t) => sum + t.monto, 0);
        const totalGastos = transactions
            .filter((t) => t.tipo === "egreso")
            .reduce((sum, t) => sum + t.monto, 0);
        const gananciaNeta = totalIngresos - totalGastos;

        // Ingresos por servicio
        const ingresosPorServicio = reservas.reduce((acc, reserva) => {
            if (reserva.servicioId) {
                const nombre = reserva.servicioId.nombre;
                const precio = reserva.servicioId.precio;

                const existing = acc.find((item) => item.servicio === nombre);
                if (existing) {
                    existing.cantidad++;
                    existing.ingresos += precio;
                } else {
                    acc.push({ servicio: nombre, cantidad: 1, ingresos: precio });
                }
            }
            return acc;
        }, []);

        const data = {
            totalIngresos,
            totalGastos,
            gananciaNeta,
            totalReservas: reservas.length,
            totalVentas: 0, // Agregar cuando tengas implementado ventas
            ingresosPorServicio,
        };

        const pdfBuffer = await generateFinancialReport(barberia, data, start, end);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=reporte-financiero-${barberia.slug}-${start.toISOString().split("T")[0]}.pdf`
        );
        res.send(pdfBuffer);
    } catch (error) {
        console.error("Error generating financial report PDF:", error);
        res.status(500).json({ message: "Error generando reporte PDF" });
    }
};

/**
 * @desc    Generar reporte de cierre de caja en PDF
 * @route   GET /api/barberias/:slug/reportes/pdf/caja
 * @access  Private (Admin)
 */
const getCajaReportPDF = async (req, res) => {
    try {
        const barberia = req.barberia;
        const { fecha } = req.query;

        if (!fecha) {
            return res.status(400).json({ message: "Se requiere fecha" });
        }

        const date = new Date(fecha);
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // Obtener movimientos del día
        const movimientos = await Transaction.find({
            barberia: barberia._id,
            fecha: { $gte: startOfDay, $lte: endOfDay },
        }).sort({ createdAt: 1 });

        const pdfBuffer = await generateCajaReport(barberia, movimientos, date);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=cierre-caja-${barberia.slug}-${date.toISOString().split("T")[0]}.pdf`
        );
        res.send(pdfBuffer);
    } catch (error) {
        console.error("Error generating caja report PDF:", error);
        res.status(500).json({ message: "Error generando reporte de caja PDF" });
    }
};

/**
 * @desc    Generar factura/recibo de reserva en PDF
 * @route   GET /api/barberias/:slug/reportes/pdf/factura/:reservaId
 * @access  Private
 */
const getInvoicePDF = async (req, res) => {
    try {
        const barberia = req.barberia;
        const { reservaId } = req.params;

        const reserva = await Reserva.findById(reservaId)
            .populate("servicioId", "nombre precio")
            .populate("barberoId", "nombre");

        if (!reserva) {
            return res.status(404).json({ message: "Reserva no encontrada" });
        }

        const pdfBuffer = await generateInvoice(reserva, barberia);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=factura-${reserva._id}.pdf`
        );
        res.send(pdfBuffer);
    } catch (error) {
        console.error("Error generating invoice PDF:", error);
        res.status(500).json({ message: "Error generando factura PDF" });
    }
};

module.exports = {
    getFinancialReportPDF,
    getCajaReportPDF,
    getInvoicePDF,
};
