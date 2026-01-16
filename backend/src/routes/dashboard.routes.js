const express = require("express");
const router = express.Router();
const { protect } = require("../config/middleware/auth.middleware");
const { getDashboardStats } = require("../controllers/dashboard.controller");

router.get("/", protect, getDashboardStats);

module.exports = router;
