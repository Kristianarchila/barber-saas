const express = require('express');
const router = express.Router();
const { protect } = require('../config/middleware/auth.middleware');
const { getInstance: getSSEManager } = require('../infrastructure/sse/SSEManager');

/**
 * SSE Endpoint - Establece conexión de eventos en tiempo real
 * GET /api/sse/connect?token=JWT_TOKEN
 * 
 * Acepta token por query param porque EventSource no soporta headers custom
 */
router.get('/connect', async (req, res) => {
    try {
        // Extraer token de query params
        const token = req.query.token;

        if (!token) {
            return res.status(401).json({ message: 'Token requerido' });
        }

        // Verificar token manualmente
        const jwt = require('jsonwebtoken');
        const User = require('../infrastructure/database/mongodb/models/User');

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ message: 'Token inválido' });
        }

        // Buscar usuario
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        const userId = user._id.toString();
        const barberiaId = user.barberiaId?.toString();
        const rol = user.rol;

        if (!barberiaId) {
            return res.status(400).json({ message: 'Usuario sin barbería asignada' });
        }

        const sseManager = getSSEManager();
        sseManager.addClient(userId, barberiaId, rol, res);

        // Enviar evento inicial de conexión exitosa
        sseManager.sendToUser(userId, 'connected', {
            message: 'Conectado al sistema de notificaciones en tiempo real',
            timestamp: new Date().toISOString(),
            userId,
            rol
        });
    } catch (error) {
        console.error('[SSE] Error en endpoint connect:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

/**
 * SSE Stats - Estadísticas de conexiones activas
 * GET /api/sse/stats
 * 
 * Solo accesible para SUPER_ADMIN
 */
router.get('/stats', protect, (req, res) => {
    // Solo SUPER_ADMIN puede ver stats
    if (req.user.rol !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'No autorizado' });
    }

    const sseManager = getSSEManager();
    res.json(sseManager.getStats());
});

/**
 * Test endpoint - Enviar notificación de prueba
 * POST /api/sse/test
 * 
 * Solo para desarrollo/testing
 */
if (process.env.NODE_ENV === 'development') {
    router.post('/test', protect, (req, res) => {
        const { event, data } = req.body;
        const userId = req.user._id.toString();

        const sseManager = getSSEManager();
        const sent = sseManager.sendToUser(userId, event || 'test', data || { message: 'Test notification' });

        res.json({
            success: sent,
            message: sent ? 'Notificación enviada' : 'Usuario no conectado'
        });
    });
}

module.exports = router;
