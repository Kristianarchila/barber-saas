const express = require("express");
const router = express.Router({ mergeParams: true });
const {
    getFinancialReportPDF,
    getCajaReportPDF,
    getInvoicePDF,
} = require("../controllers/pdf.controller");
const { protect, esAdmin } = require("../config/middleware/auth.middleware");
const { getBarberiaBySlug } = require("../config/middleware/barberiaMiddleware");

// Aplicar middlewares
router.use(protect);
router.use(getBarberiaBySlug);

// Reportes PDF (solo admin)
router.get("/financiero", esAdmin, getFinancialReportPDF);
router.get("/caja", esAdmin, getCajaReportPDF);

// Factura (cualquier usuario autenticado puede ver sus facturas)
router.get("/factura/:reservaId", getInvoicePDF);

module.exports = router;
