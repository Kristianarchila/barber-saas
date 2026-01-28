import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function EmailConfigForm() {
    const [emailNotificaciones, setEmailNotificaciones] = useState("");
    const [nombreParaEmails, setNombreParaEmails] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        // Cargar configuración actual
        fetchCurrentConfig();
    }, []);

    const fetchCurrentConfig = async () => {
        try {
            const token = localStorage.getItem("token");
            const user = JSON.parse(localStorage.getItem("user") || "{}");

            if (!user.barberiaId) return;

            // Obtener datos de la barbería actual
            const response = await axios.get(`${API_URL}/barberias/${user.barberiaId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const config = response.data?.barberia?.configuracion || {};
            setEmailNotificaciones(config.emailNotificaciones || "");
            setNombreParaEmails(config.nombreParaEmails || "");
        } catch (error) {
            console.error("Error al cargar configuración:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const token = localStorage.getItem("token");

            const response = await axios.patch(
                `${API_URL}/barberias/configuracion/email`,
                {
                    emailNotificaciones: emailNotificaciones.trim() || null,
                    nombreParaEmails: nombreParaEmails.trim() || null
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setMessage({
                type: "success",
                text: response.data.message || "Configuración actualizada correctamente"
            });

            // Limpiar mensaje después de 3 segundos
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } catch (error) {
            setMessage({
                type: "error",
                text: error.response?.data?.message || "Error al actualizar la configuración"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] uppercase font-black text-gray-500 mb-2">
                        Email de Notificaciones
                    </label>
                    <input
                        type="email"
                        value={emailNotificaciones}
                        onChange={(e) => setEmailNotificaciones(e.target.value)}
                        placeholder="ejemplo@tubarberia.com"
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                        Deja vacío para usar el email principal de la barbería
                    </p>
                </div>

                <div>
                    <label className="block text-[10px] uppercase font-black text-gray-500 mb-2">
                        Nombre para Emails
                    </label>
                    <input
                        type="text"
                        value={nombreParaEmails}
                        onChange={(e) => setNombreParaEmails(e.target.value)}
                        placeholder="Mi Barbería"
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                        Nombre que aparecerá como remitente en los emails
                    </p>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl border ${message.type === "success"
                    ? "bg-green-500/10 border-green-500/20 text-green-400"
                    : "bg-red-500/10 border-red-500/20 text-red-400"
                    }`}>
                    <p className="text-sm font-medium">{message.text}</p>
                </div>
            )}

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            Guardando...
                        </>
                    ) : (
                        <>
                            💾 Guardar Configuración
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
