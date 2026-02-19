import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

/**
 * Hook para conexión SSE (Server-Sent Events)
 * Establece conexión en tiempo real para recibir notificaciones
 * 
 * @param {Object} options - Opciones de configuración
 * @param {boolean} options.enabled - Si la conexión está habilitada
 * @param {Function} options.onEvent - Callback para eventos personalizados
 * @returns {Object} - Estado de conexión { isConnected, error }
 */
export function useSSE(options = {}) {
    const { enabled = true, onEvent } = options;
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const eventSourceRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);

    useEffect(() => {
        if (!enabled) {
            console.log('[SSE] Deshabilitado');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('[SSE] No hay token, no se puede conectar');
            setError('No autenticado');
            return;
        }

        const connect = () => {
            try {
                console.log('[SSE] Intentando conectar...');

                // Crear conexión SSE con token en URL (EventSource no soporta headers custom)
                let apiUrl = import.meta.env.VITE_API_URL || '';

                // Si la URL termina en /api, la limpiamos para no duplicar
                apiUrl = apiUrl.replace(/\/api\/?$/, '');

                // Construir URL final asegurando que empiece por /api/sse si es relativa
                const url = `${apiUrl}/api/sse/connect?token=${token}`;

                const eventSource = new EventSource(url);
                eventSourceRef.current = eventSource;

                // Evento: Conexión establecida
                eventSource.addEventListener('connected', (e) => {
                    const data = JSON.parse(e.data);
                    console.log('✅ [SSE] Conectado:', data);
                    setIsConnected(true);
                    setError(null);
                    reconnectAttemptsRef.current = 0;
                });

                // Evento: Nueva reserva (para barberos)
                eventSource.addEventListener('nueva_reserva', (e) => {
                    const data = JSON.parse(e.data);
                    toast.success(
                        `📅 Nueva reserva: ${data.clienteNombre} - ${data.hora}`,
                        {
                            duration: 6000,
                            position: 'top-right'
                        }
                    );
                    onEvent?.('nueva_reserva', data);
                });

                // Evento: Nueva reserva (para admins)
                eventSource.addEventListener('nueva_reserva_admin', (e) => {
                    const data = JSON.parse(e.data);
                    toast.success(
                        `📋 Nueva reserva: ${data.clienteNombre} con ${data.barberoNombre}`,
                        {
                            duration: 6000,
                            position: 'top-right'
                        }
                    );
                    onEvent?.('nueva_reserva_admin', data);
                });

                // Evento: Cancelación
                eventSource.addEventListener('cancelacion', (e) => {
                    const data = JSON.parse(e.data);
                    toast.error(
                        `❌ Cancelación: ${data.clienteNombre} - ${data.hora}`,
                        {
                            duration: 6000,
                            position: 'top-right'
                        }
                    );
                    onEvent?.('cancelacion', data);
                });

                // Evento: Reserva completada
                eventSource.addEventListener('reserva_completada', (e) => {
                    const data = JSON.parse(e.data);
                    toast.success(
                        `💰 Servicio completado: ${data.clienteNombre} (+$${data.ganancia})`,
                        {
                            duration: 6000,
                            position: 'top-right'
                        }
                    );
                    onEvent?.('reserva_completada', data);
                });

                // Evento: Mensaje general
                eventSource.addEventListener('message', (e) => {
                    console.log('[SSE] Mensaje:', e.data);
                });

                // Error de conexión
                eventSource.onerror = (err) => {
                    console.error('[SSE] Error de conexión:', err);
                    setIsConnected(false);

                    eventSource.close();
                    reconnectAttemptsRef.current++;

                    // Backoff exponencial para reconexión
                    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);

                    if (reconnectAttemptsRef.current <= 5) {
                        setError(`Reconectando en ${delay / 1000}s...`);
                        reconnectTimeoutRef.current = setTimeout(() => {
                            console.log(`[SSE] Intento de reconexión ${reconnectAttemptsRef.current}...`);
                            connect();
                        }, delay);
                    } else {
                        setError('Error de conexión. Recarga la página.');
                    }
                };

                // Conexión abierta
                eventSource.onopen = () => {
                    console.log('[SSE] Conexión abierta');
                };

            } catch (err) {
                console.error('[SSE] Error al crear conexión:', err);
                setError(err.message);
            }
        };

        connect();

        // Cleanup
        return () => {
            console.log('[SSE] Limpiando conexión...');
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [enabled, onEvent]);

    return { isConnected, error };
}
