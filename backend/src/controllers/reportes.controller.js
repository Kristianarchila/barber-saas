/**
 * Reportes Controller (Hexagonal Architecture Version)
 */
const container = require('../shared/Container');
const { buildReporteHTML } = require('../templates/reporteFinanciero.template');

exports.obtenerResumenGeneral = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { mes, fechaInicio, fechaFin } = req.query;
        const reporte = await container.getResumenGeneralUseCase.execute(barberiaId, { mes, fechaInicio, fechaFin });
        res.json(reporte);
    } catch (error) { next(error); }
};

exports.obtenerRendimientoBarberos = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { mes } = req.query;
        const rendimiento = await container.getRendimientoBarberosUseCase.execute(barberiaId, { mes });
        res.json(rendimiento);
    } catch (error) { next(error); }
};

exports.obtenerServiciosMasVendidos = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { mes } = req.query;
        const result = await container.getServiciosMasVendidosUseCase.execute(barberiaId, { mes });
        res.json(result);
    } catch (error) { next(error); }
};

exports.obtenerAnalisisPagos = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { mes } = req.query;
        const analisis = await container.getAnalisisPagosUseCase.execute(barberiaId, { mes });
        res.json(analisis);
    } catch (error) { next(error); }
};

exports.obtenerTendenciasIngresos = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { mes } = req.query;
        const tendencias = await container.getTendenciasIngresosUseCase.execute(barberiaId, { mes });
        res.json(tendencias);
    } catch (error) { next(error); }
};

// ─────────────────────────────────────────────────────────────────────────────
// REPORTE FINANCIERO UNIFICADO (Ingresos + Egresos + Vales)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /admin/reportes/financiero?fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD
 * Returns JSON with ingresos, egresos, vales and neto for the period.
 */
exports.obtenerReporteFinanciero = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { fechaInicio, fechaFin } = req.query;

        if (!fechaInicio || !fechaFin) {
            return res.status(400).json({ message: "fechaInicio y fechaFin son requeridos" });
        }

        const reporte = await container.getReporteFinancieroUseCase.execute(
            barberiaId, { fechaInicio, fechaFin }
        );

        res.json(reporte);
    } catch (error) {
        next(error);
    }
};

/**
 * GET /admin/reportes/financiero/pdf?fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD
 * Streams a downloadable PDF with the financial report.
 */
exports.descargarReporteFinancieroPDF = async (req, res, next) => {
    try {
        const { barberiaId } = req.user;
        const { fechaInicio, fechaFin } = req.query;

        if (!fechaInicio || !fechaFin) {
            return res.status(400).json({ message: "fechaInicio y fechaFin son requeridos" });
        }

        const reporte = await container.getReporteFinancieroUseCase.execute(
            barberiaId, { fechaInicio, fechaFin }
        );

        const html = buildReporteHTML(reporte);

        const htmlPdf = require("html-pdf-node");
        const pdfBuffer = await htmlPdf.generatePdf(
            { content: html },
            { format: "A4", margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" }, printBackground: true }
        );

        const filename = `reporte-financiero-${fechaInicio}-${fechaFin}.pdf`;
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.send(pdfBuffer);

    } catch (error) {
        next(error);
    }
};
