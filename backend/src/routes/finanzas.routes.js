const express = require("express");
const router = express.Router();
const { protect } = require("../config/middleware/auth.middleware");
const { getResumenFinanzas } = require("../controllers/finanzas.controller");

// Resumen finanzas admin
router.get("/resumen", protect, getResumenFinanzas);

module.exports = router;
