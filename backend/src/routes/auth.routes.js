// src/routes/auth.routes.js
const express = require("express");
const router = express.Router();
const { register, login, logout } = require("../controllers/auth.controller");
const { protect } = require("../config/middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");
const { registerSchema, loginSchema } = require("../validation/schemas/auth.schemas");
const { authLimiter } = require("../middleware/rateLimit.middleware");

// Public routes - WITH RATE LIMITING to prevent brute-force attacks
router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);

module.exports = router;
