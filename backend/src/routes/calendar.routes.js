const express = require('express');
const router = express.Router();
const { protect } = require('../config/middleware/auth.middleware');
const container = require('../shared/Container');

// Connect to Google
router.get('/connect/google', protect, async (req, res, next) => {
    try {
        const adapter = container.googleCalendarAdapter;
        const state = JSON.stringify({ userId: req.user.id, barberiaId: req.user.barberiaId });
        const url = adapter.getAuthUrl(Buffer.from(state).toString('base64'));
        res.redirect(url);
    } catch (error) {
        next(error);
    }
});

// Callback for Google
router.get('/callback/google', async (req, res, next) => {
    try {
        const { code, state } = req.query;
        const decodedState = JSON.parse(Buffer.from(state, 'base64').toString());

        const adapter = container.googleCalendarAdapter;
        const tokens = await adapter.getTokens(code);

        // Save tokens in database
        const calendarSyncRepository = container.calendarSyncRepository;

        // In a real scenario, we'd fetch the user's email from Google here
        // For now, we use a placeholder or decode it from the ID token if available
        const connectedEmail = "conectado@gmail.com";

        await calendarSyncRepository.save({
            barberoId: decodedState.userId,
            barberiaId: decodedState.barberiaId,
            provider: 'google',
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiryDate: new Date(Date.now() + (tokens.expires_in * 1000)),
            email: connectedEmail
        });

        res.send('<h1>Conexión exitosa!</h1><p>Ya puedes cerrar esta ventana.</p><script>window.close()</script>');
    } catch (error) {
        res.status(500).send(`Error en la conexión: ${error.message}`);
    }
});

// Get connection status
router.get('/status', protect, async (req, res, next) => {
    try {
        const repo = container.calendarSyncRepository;
        const sync = await repo.findByBarberoId(req.user.id);

        if (!sync) {
            return res.json({ connected: false });
        }

        res.json({
            connected: true,
            provider: sync.provider,
            email: sync.email,
            lastSync: sync.updatedAt
        });
    } catch (error) {
        next(error);
    }
});

// Disconnect
router.post('/disconnect', protect, async (req, res, next) => {
    try {
        const repo = container.calendarSyncRepository;
        await repo.deleteByBarberoId(req.user.id, req.body.provider);
        res.json({ message: 'Desconectado exitosamente' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
