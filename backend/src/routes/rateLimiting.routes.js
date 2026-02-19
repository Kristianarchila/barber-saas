/**
 * Rate Limiting Management Routes
 * 
 * SuperAdmin endpoints to manage IP blacklist
 */

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../config/middleware/auth.middleware');
const {
    getBlacklistStatus,
    manualBlacklist,
    removeFromBlacklist
} = require('../config/rateLimiting');

// All routes require SUPER_ADMIN
router.use(protect);
router.use(authorize('SUPER_ADMIN'));

/**
 * GET /api/superadmin/rate-limiting/blacklist
 * Get list of blacklisted IPs
 */
router.get('/blacklist', (req, res) => {
    try {
        const blacklist = getBlacklistStatus();

        res.json({
            success: true,
            count: blacklist.length,
            blacklist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error obteniendo lista de IPs bloqueadas',
            error: error.message
        });
    }
});

/**
 * POST /api/superadmin/rate-limiting/blacklist
 * Manually blacklist an IP
 */
router.post('/blacklist', (req, res) => {
    try {
        const { ip, durationHours = 24 } = req.body;

        if (!ip) {
            return res.status(400).json({
                success: false,
                message: 'IP es requerida'
            });
        }

        const durationMs = durationHours * 60 * 60 * 1000;
        manualBlacklist(ip, durationMs);

        res.json({
            success: true,
            message: `IP ${ip} bloqueada por ${durationHours} horas`,
            ip,
            expiresAt: new Date(Date.now() + durationMs).toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error bloqueando IP',
            error: error.message
        });
    }
});

/**
 * DELETE /api/superadmin/rate-limiting/blacklist/:ip
 * Remove IP from blacklist
 */
router.delete('/blacklist/:ip', (req, res) => {
    try {
        const { ip } = req.params;
        const removed = removeFromBlacklist(ip);

        if (removed) {
            res.json({
                success: true,
                message: `IP ${ip} removida de la lista de bloqueo`
            });
        } else {
            res.status(404).json({
                success: false,
                message: `IP ${ip} no estaba en la lista de bloqueo`
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error removiendo IP',
            error: error.message
        });
    }
});

module.exports = router;
