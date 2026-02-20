// src/routes/auth.routes.js
const express = require("express");
const router = express.Router();
const { register, login, logout, requestPasswordReset, resetPassword } = require("../controllers/auth.controller");
const { protect } = require("../config/middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");
const { registerSchema, loginSchema, requestPasswordResetSchema, resetPasswordSchema } = require("../validation/schemas/auth.schemas");
const { authLimiter } = require("../middleware/rateLimit.middleware");

// Public routes - WITH RATE LIMITING
router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/forgot-password", authLimiter, validate(requestPasswordResetSchema), requestPasswordReset);
router.post("/reset-password", authLimiter, validate(resetPasswordSchema), resetPassword);

module.exports = router;
