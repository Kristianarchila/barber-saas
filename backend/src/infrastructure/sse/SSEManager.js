/**
 * SSE Manager - Singleton para gestionar conexiones SSE
 * Maneja conexiones de Server-Sent Events para notificaciones en tiempo real
 */
class SSEManager {
    constructor() {
        if (SSEManager.instance) {
            return SSEManager.instance;
        }

        this.clients = new Map(); // userId -> { res, barberiaId, rol }
        this.heartbeatInterval = null;

        SSEManager.instance = this;
        this.startHeartbeat();
    }

    /**
     * Agregar cliente SSE
     * @param {string} userId - ID del usuario
     * @param {string} barberiaId - ID de la barbería
     * @param {string} rol - Rol del usuario (BARBERO, BARBERIA_ADMIN)
     * @param {Response} res - Express response object
     */
    addClient(userId, barberiaId, rol, res) {
        // Configurar headers SSE
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no' // Nginx compatibility
        });

        // Enviar comentario inicial para establecer conexión
        res.write(': connected\n\n');

        // Guardar cliente
        this.clients.set(userId, { res, barberiaId, rol });

        console.log(`✅ [SSE] Cliente conectado: ${userId} (${rol}) - Total: ${this.clients.size}`);

        // Cleanup al cerrar conexión
        res.on('close', () => {
            this.removeClient(userId);
        });
    }

    /**
     * Remover cliente
     */
    removeClient(userId) {
        this.clients.delete(userId);
        console.log(`🔌 [SSE] Cliente desconectado: ${userId} - Total: ${this.clients.size}`);
    }

    /**
     * Enviar evento a un usuario específico
     * @param {string} userId - ID del usuario
     * @param {string} event - Nombre del evento
     * @param {Object} data - Datos del evento
     */
    sendToUser(userId, event, data) {
        const client = this.clients.get(userId);
        if (!client) {
            console.log(`⚠️ [SSE] Cliente no conectado: ${userId}`);
            return false;
        }

        try {
            client.res.write(`event: ${event}\n`);
            client.res.write(`data: ${JSON.stringify(data)}\n\n`);
            return true;
        } catch (error) {
            console.error(`❌ [SSE] Error enviando a ${userId}:`, error.message);
            this.removeClient(userId);
            return false;
        }
    }

    /**
     * Enviar evento a todos los usuarios de una barbería
     * @param {string} barberiaId - ID de la barbería
     * @param {string} event - Nombre del evento
     * @param {Object} data - Datos del evento
     * @param {string[]} excludeRoles - Roles a excluir (opcional)
     */
    sendToBarberia(barberiaId, event, data, excludeRoles = []) {
        let sent = 0;

        this.clients.forEach((client, userId) => {
            if (client.barberiaId === barberiaId && !excludeRoles.includes(client.rol)) {
                if (this.sendToUser(userId, event, data)) {
                    sent++;
                }
            }
        });

        console.log(`📤 [SSE] Evento "${event}" enviado a ${sent} clientes de barbería ${barberiaId}`);
        return sent;
    }

    /**
     * Broadcast a todos los clientes conectados
     * @param {string} event - Nombre del evento
     * @param {Object} data - Datos del evento
     */
    broadcast(event, data) {
        let sent = 0;
        this.clients.forEach((client, userId) => {
            if (this.sendToUser(userId, event, data)) {
                sent++;
            }
        });
        console.log(`📡 [SSE] Broadcast "${event}" enviado a ${sent} clientes`);
        return sent;
    }

    /**
     * Heartbeat para mantener conexiones vivas
     */
    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            this.clients.forEach((client, userId) => {
                try {
                    client.res.write(': heartbeat\n\n');
                } catch (error) {
                    this.removeClient(userId);
                }
            });
        }, 30000); // Cada 30 segundos
    }

    /**
     * Obtener estadísticas
     */
    getStats() {
        const stats = {
            totalClients: this.clients.size,
            byRole: {},
            byBarberia: {}
        };

        this.clients.forEach(client => {
            stats.byRole[client.rol] = (stats.byRole[client.rol] || 0) + 1;
            stats.byBarberia[client.barberiaId] = (stats.byBarberia[client.barberiaId] || 0) + 1;
        });

        return stats;
    }

    /**
     * Cleanup al cerrar servidor
     */
    shutdown() {
        clearInterval(this.heartbeatInterval);
        this.clients.forEach((client, userId) => {
            try {
                client.res.end();
            } catch (error) {
                // Ignorar errores al cerrar
            }
        });
        this.clients.clear();
        console.log('🛑 [SSE] Manager cerrado');
    }
}

// Singleton instance
let instance = null;

module.exports = {
    getInstance: () => {
        if (!instance) {
            instance = new SSEManager();
        }
        return instance;
    }
};
