/**
 * PDF Controller (Hexagonal Architecture Version)
 * Delegates to existing PDF service
 */
const {
    generateFinancialReport,
    generateCajaReport,
    generateInvoice,
} = require("../services/pdf.service");

const getFinancialReportPDF = async (req, res) => {
    try {
        const { barberia } = req;
        const { mes } = req.query;

        const pdfBuffer = await generateFinancialReport(barberia._id, mes);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=reporte-financiero-${mes}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error("Error generating financial report PDF:", error);
        res.status(500).json({ message: "Error generando reporte PDF" });
    }
};

const getCajaReportPDF = async (req, res) => {
    try {
        const { barberia } = req;
        const { cajaId } = req.query;

        const pdfBuffer = await generateCajaReport(cajaId);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=cierre-caja-${cajaId}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error("Error generating caja report PDF:", error);
        res.status(500).json({ message: "Error generando reporte de caja PDF" });
    }
};

const getInvoicePDF = async (req, res) => {
    try {
        const { reservaId } = req.params;

        const pdfBuffer = await generateInvoice(reservaId);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=factura-${reservaId}.pdf`);
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
