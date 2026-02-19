import { useState, useEffect } from "react";
import {
    Calendar,
    CheckCircle2,
    XCircle,
    RefreshCcw,
    ExternalLink,
    AlertCircle,
    Smartphone
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../../services/api";
import { useApiCall } from "../../hooks/useApiCall";
import { useAsyncAction } from "../../hooks/useAsyncAction";
import { toast } from "react-hot-toast";

const CalendarConfig = () => {
    const [connections, setConnections] = useState({
        google: { connected: false, email: null, lastSync: null },
        outlook: { connected: false, email: null, lastSync: null }
    });

    // Hook para obtener estado de conexión
    const { execute: fetchStatus, loading } = useApiCall(
        async () => {
            const response = await api.get('/calendar/status');
            return response.data;
        },
        {
            errorMessage: 'Error al obtener estado de sincronización',
            showErrorToast: false, // No mostrar toast, solo log
            onSuccess: (data) => {
                if (data.connected) {
                    setConnections(prev => ({
                        ...prev,
                        [data.provider]: {
                            connected: true,
                            email: data.email,
                            lastSync: data.lastSync
                        }
                    }));
                }
            }
        }
    );

    useEffect(() => {
        fetchStatus();
    }, []);

    const handleConnect = (provider) => {
        // En un entorno real, esto abriría una ventana emergente para OAuth
        const width = 600;
        const height = 700;
        const left = (window.innerWidth / 2) - (width / 2);
        const top = (window.innerHeight / 2) - (height / 2);

        const win = window.open(
            `/api/calendar/connect/${provider}`,
            `Conectar ${provider}`,
            `width=${width},height=${height},top=${top},left=${left}`
        );

        // Check for closure to refresh status
        const timer = setInterval(() => {
            if (win.closed) {
                clearInterval(timer);
                fetchStatus();
            }
        }, 1000);
    };

    // Hook para desconectar calendario
    const { execute: handleDisconnect } = useAsyncAction(
        async (provider) => {
            await api.post('/calendar/disconnect', { provider });
            return provider;
        },
        {
            successMessage: 'Calendario desconectado exitosamente',
            errorMessage: 'Error al desconectar calendario',
            onSuccess: (provider) => {
                setConnections(prev => ({
                    ...prev,
                    [provider]: { connected: false, email: null }
                }));
            }
        }
    );

    const confirmDisconnect = (provider) => {
        if (window.confirm(`¿Estás seguro de que deseas desconectar ${provider}?`)) {
            handleDisconnect(provider);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-10">
            <div>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">Sincronización de Calendario</h1>
                <p className="text-neutral-500 font-medium">Conecta tus agendas personales para evitar duplicidades y tener todas tus citas en un solo lugar.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Google Calendar Card */}
                <ProviderCard
                    name="Google Calendar"
                    icon="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg"
                    connected={connections.google.connected}
                    email={connections.google.email}
                    onConnect={() => handleConnect('google')}
                    onDisconnect={() => confirmDisconnect('google')}
                />

                {/* Outlook Card */}
                <ProviderCard
                    name="Outlook / Hotmail"
                    icon="https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg"
                    connected={connections.outlook.connected}
                    email={connections.outlook.email}
                    onConnect={() => handleConnect('outlook')}
                    onDisconnect={() => confirmDisconnect('outlook')}
                />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border-2 border-blue-100 rounded-3xl p-8 flex gap-6 items-start">
                <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex-shrink-0 flex items-center justify-center">
                    <AlertCircle size={24} />
                </div>
                <div>
                    <h4 className="font-black uppercase tracking-tighter text-blue-900 mb-2">¿Cómo funciona?</h4>
                    <ul className="text-sm text-blue-800 space-y-2 font-medium opacity-80">
                        <li>• Las nuevas reservas se añadirán automáticamente a tu calendario personal.</li>
                        <li>• Si cancelas una reserva en el sistema, se eliminará de tu Google/Outlook Calendar.</li>
                        <li>• Los clientes podrán añadir sus citas a sus propios calendarios con un clic.</li>
                    </ul>
                </div>
            </div>

            <div className="pt-10 border-t border-black/5 flex flex-col items-center gap-4 py-8">
                <Smartphone size={32} className="text-black/20" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Powered by BarberSync™ Engine</p>
            </div>
        </div>
    );
};

const ProviderCard = ({ name, icon, connected, email, onConnect, onDisconnect }) => (
    <div className={`p-8 rounded-[2.5rem] border-2 transition-all ${connected ? 'border-green-500 bg-green-50/20' : 'border-black/5 bg-white hover:border-black/10'}`}>
        <div className="flex justify-between items-start mb-10">
            <img src={icon} className="w-12 h-12" alt={name} />
            {connected ? (
                <div className="px-3 py-1 bg-green-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 size={10} /> Conectado
                </div>
            ) : (
                <div className="px-3 py-1 bg-neutral-100 text-neutral-400 rounded-full text-[8px] font-black uppercase tracking-widest">
                    Desconectado
                </div>
            )}
        </div>

        <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">{name}</h3>
        <p className="text-sm font-medium text-neutral-500 mb-8">
            {connected ? `Sincronizado con ${email}` : 'Sincroniza tus reservas de forma automática.'}
        </p>

        {connected ? (
            <button
                onClick={onDisconnect}
                className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-100 transition-all"
            >
                Desconectar Cuenta
            </button>
        ) : (
            <button
                onClick={onConnect}
                className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-neutral-900 transition-all flex items-center justify-center gap-3"
            >
                Conectar Ahora <ExternalLink size={14} />
            </button>
        )}
    </div>
);

export default CalendarConfig;
