import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import notificationsService from "../../services/notificationsService";

export default function NotificacionesConfig() {
    const { slug } = useParams();
    const [settings, setSettings] = useState({
        emailEnabled: true,
        pushEnabled: true,
        whatsappEnabled: false,
        reminderHoursBefore: 24,
        confirmacionReserva: true,
        recordatorioReserva: true,
        cancelacionReserva: true,
    });
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [pushSubscribed, setPushSubscribed] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadSettings();
        loadLogs();
        checkPushSubscription();
    }, [slug]);

    const loadSettings = async () => {
        try {
            const data = await notificationsService.getNotificationSettings(slug);
            setSettings(data.notificaciones);
        } catch (error) {
            console.error("Error loading settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadLogs = async (currentPage = 1) => {
        try {
            const data = await notificationsService.getNotificationLogs(slug, {
                page: currentPage,
                limit: 20,
            });
            setLogs(data.logs);
            setTotalPages(data.totalPages);
            setPage(currentPage);
        } catch (error) {
            console.error("Error loading logs:", error);
        }
    };

    const checkPushSubscription = () => {
        setPushSubscribed(notificationsService.hasPermission());
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            await notificationsService.updateNotificationSettings(slug, settings);
            alert("Configuración guardada exitosamente");
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Error al guardar configuración");
        } finally {
            setSaving(false);
        }
    };

    const handleEnablePush = async () => {
        try {
            const granted = await notificationsService.requestPermission();
            if (granted) {
                await notificationsService.subscribeToPush(slug);
                setPushSubscribed(true);
                alert("¡Notificaciones push activadas!");
            } else {
                alert("Necesitas dar permisos de notificación");
            }
        } catch (error) {
            console.error("Error enabling push:", error);
            alert("Error al activar notificaciones push");
        }
    };

    const handleDisablePush = async () => {
        try {
            await notificationsService.unsubscribeFromPush(slug);
            setPushSubscribed(false);
            alert("Notificaciones push desactivadas");
        } catch (error) {
            console.error("Error disabling push:", error);
            alert("Error al desactivar notificaciones push");
        }
    };

    const handleSendTest = async () => {
        try {
            const result = await notificationsService.sendTestNotification(slug);
            alert(`Notificación enviada: ${result.sent} exitosas, ${result.failed} fallidas`);
            loadLogs();
        } catch (error) {
            console.error("Error sending test:", error);
            alert("Error al enviar notificación de prueba");
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <p>Cargando configuración...</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-medium mb-6">Configuración de Notificaciones</h1>

            {/* Configuración General */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-medium mb-4">Canales de Notificación</h2>

                {/* Push Notifications */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h3 className="font-medium">📱 Notificaciones Push</h3>
                            <p className="text-sm text-gray-600">
                                Notificaciones en tiempo real en el navegador
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.pushEnabled}
                                onChange={(e) =>
                                    setSettings({ ...settings, pushEnabled: e.target.checked })
                                }
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    {settings.pushEnabled && (
                        <div className="mt-3">
                            {!pushSubscribed ? (
                                <button
                                    onClick={handleEnablePush}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                                >
                                    Activar notificaciones push
                                </button>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <span className="text-green-600 text-sm">✓ Activadas</span>
                                    <button
                                        onClick={handleDisablePush}
                                        className="text-red-600 text-sm hover:underline"
                                    >
                                        Desactivar
                                    </button>
                                    <button
                                        onClick={handleSendTest}
                                        className="bg-gray-100 px-3 py-1 rounded text-sm hover:bg-gray-200"
                                    >
                                        Enviar prueba
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Email */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium">📧 Correo Electrónico</h3>
                            <p className="text-sm text-gray-600">
                                Emails automáticos a clientes
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.emailEnabled}
                                onChange={(e) =>
                                    setSettings({ ...settings, emailEnabled: e.target.checked })
                                }
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>

                {/* WhatsApp */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium">💬 WhatsApp (Próximamente)</h3>
                            <p className="text-sm text-gray-600">
                                Mensajes vía WhatsApp Business
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.whatsappEnabled}
                                onChange={(e) =>
                                    setSettings({ ...settings, whatsappEnabled: e.target.checked })
                                }
                                disabled
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 opacity-50"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Tipos de Notificaciones */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-medium mb-4">Tipos de Notificaciones</h2>

                <div className="space-y-3">
                    <label className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={settings.confirmacionReserva}
                            onChange={(e) =>
                                setSettings({ ...settings, confirmacionReserva: e.target.checked })
                            }
                            className="w-5 h-5 text-blue-600"
                        />
                        <span>Confirmación de reserva</span>
                    </label>

                    <label className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={settings.recordatorioReserva}
                            onChange={(e) =>
                                setSettings({ ...settings, recordatorioReserva: e.target.checked })
                            }
                            className="w-5 h-5 text-blue-600"
                        />
                        <span>Recordatorio de reserva</span>
                    </label>

                    <label className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={settings.cancelacionReserva}
                            onChange={(e) =>
                                setSettings({ ...settings, cancelacionReserva: e.target.checked })
                            }
                            className="w-5 h-5 text-blue-600"
                        />
                        <span>Cancelación de reserva</span>
                    </label>
                </div>

                {/* Tiempo de recordatorio */}
                <div className="mt-6">
                    <label className="block text-sm font-medium mb-2">
                        Enviar recordatorio (horas antes):
                    </label>
                    <select
                        value={settings.reminderHoursBefore}
                        onChange={(e) =>
                            setSettings({ ...settings, reminderHoursBefore: Number(e.target.value) })
                        }
                        className="border rounded-lg px-3 py-2 w-full max-w-xs"
                    >
                        <option value={1}>1 hora</option>
                        <option value={2}>2 horas</option>
                        <option value={6}>6 horas</option>
                        <option value={12}>12 horas</option>
                        <option value={24}>24 horas</option>
                        <option value={48}>48 horas</option>
                    </select>
                </div>
            </div>

            {/* Botón Guardar */}
            <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
                {saving ? "Guardando..." : "Guardar Configuración"}
            </button>

            {/* Historial de Notificaciones */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-medium mb-4">Historial de Notificaciones</h2>

                {logs.length === 0 ? (
                    <p className="text-gray-600">No hay notificaciones enviadas aún</p>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Tipo</th>
                                        <th className="px-4 py-2 text-left">Destinatario</th>
                                        <th className="px-4 py-2 text-left">Asunto</th>
                                        <th className="px-4 py-2 text-left">Estado</th>
                                        <th className="px-4 py-2 text-left">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => (
                                        <tr key={log._id} className="border-t">
                                            <td className="px-4 py-2">
                                                {log.tipo === "email" && "📧"}
                                                {log.tipo === "push" && "📱"}
                                                {log.tipo === "whatsapp" && "💬"}
                                            </td>
                                            <td className="px-4 py-2">
                                                {log.destinatario?.user?.nombre || log.destinatario?.email || "-"}
                                            </td>
                                            <td className="px-4 py-2">{log.asunto}</td>
                                            <td className="px-4 py-2">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs ${log.estado === "enviado"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                        }`}
                                                >
                                                    {log.estado}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">
                                                {new Date(log.createdAt).toLocaleString("es-ES")}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-4">
                                <button
                                    onClick={() => loadLogs(page - 1)}
                                    disabled={page === 1}
                                    className="px-3 py-1 border rounded disabled:opacity-50"
                                >
                                    Anterior
                                </button>
                                <span className="px-3 py-1">
                                    Página {page} de {totalPages}
                                </span>
                                <button
                                    onClick={() => loadLogs(page + 1)}
                                    disabled={page === totalPages}
                                    className="px-3 py-1 border rounded disabled:opacity-50"
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
