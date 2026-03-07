/**
 * Dashboard Controller
 *
 * Uses cacheService.wrap() with a 60s TTL per tenant+daterange.
 * Single-flight pattern prevents concurrent cold-cache DB hammering.
 */
const container = require('../shared/Container');
const cacheService = require('../infrastructure/cache/CacheService');

// In-flight promises to prevent concurrent DB calls on cold cache (stampede protection)
const inflight = Object.create(null);
const DASHBOARD_TTL = 60;

exports.getDashboardStats = async (req, res, next) => {
    try {
        if (!req.user || !req.user.barberiaId) {
            return res.status(400).json({ message: 'Usuario no tiene una barbería asociada' });
        }

        const barberiaId = req.user.barberiaId.toString();
        const { fechaInicio, fechaFin } = req.query;
        const key = `dashboard:${barberiaId}:${fechaInicio || 'cur'}:${fechaFin || 'cur'}`;

        // ── 1. Warm cache hit ──────────────────────────────────────────────
        const cached = cacheService.get(key);
        if (cached !== undefined) {
            return res.json(cached);
        }

        // ── 2. Single-flight: if another request is already fetching, join it ─
        if (inflight[key]) {
            return res.json(await inflight[key]);
        }

        // ── 3. Cold: fetch from DB, set cache, release inflight ────────────
        const fetch = async () => {
            const stats = await container.getDashboardStatsUseCase.execute(barberiaId, { fechaInicio, fechaFin });
            cacheService.set(key, stats, DASHBOARD_TTL);
            return stats;
        };

        inflight[key] = fetch();
        try {
            return res.json(await inflight[key]);
        } finally {
            delete inflight[key];
        }

    } catch (error) {
        next(error);
    }
};
