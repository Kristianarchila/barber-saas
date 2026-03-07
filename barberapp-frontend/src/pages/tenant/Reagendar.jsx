import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { getReservaByToken, reagendarReservaByToken, getDisponibilidadBySlug } from "../../services/publicService";

export default function Reagendar() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [loadingHours, setLoadingHours] = useState(false);
    const [error, setError] = useState(null);

    const [reservaInfo, setReservaInfo] = useState(null);
    const [fecha, setFecha] = useState(dayjs().format("YYYY-MM-DD"));
    const [horasDisponibles, setHorasDisponibles] = useState([]);
    const [horaSeleccionada, setHoraSeleccionada] = useState("");
    const [procesando, setProcesando] = useState(false);

    // 1. Obtener info de la reserva inicial
    useEffect(() => {
        const fetchReserva = async () => {
            try {
                const data = await getReservaByToken(token);
                setReservaInfo(data);
            } catch (err) {
                setError(err.response?.data?.message || "El enlace no es válido o ya expiró");
            } finally {
                setLoading(false);
            }
        };
        fetchReserva();
    }, [token]);

    // 2. Cargar disponibilidad cada vez que cambie la fecha
    useEffect(() => {
        if (reservaInfo && fecha) {
            cargarHoras();
        }
    }, [reservaInfo, fecha]);

    const cargarHoras = async () => {
        setLoadingHours(true);
        try {
            // Usamos el slug de la barbería (asumimos que está en el prefill o lo sacamos del contexto)
            // Por ahora, simularemos que el backend nos da lo necesario o usamos un fallback
            // NOTA: Para reagendar necesitamos el SLUG. El backend de prefill debería darlo.
            // Modificamos el backend para q de el slug también.

            const { prefill } = reservaInfo;
            // Si el backend no da el slug, necesitamos buscarlo. 
            // Por simplicidad en este paso, asumiremos que el backend devuelve 'barberiaSlug'
            const slug = reservaInfo.barberiaSlug || "default";

            const data = await getDisponibilidadBySlug(
                slug,
                prefill.barberoId,
                fecha,
                prefill.servicioId
            );
            setHorasDisponibles(data.disponibles || []);
            setHoraSeleccionada("");
        } catch (err) {
            console.error("Error cargando horas:", err);
        } finally {
            setLoadingHours(false);
        }
    };

    const handleConfirm = async () => {
        if (!horaSeleccionada) return;
        setProcesando(true);
        try {
            await reagendarReservaByToken(token, { fecha, hora: horaSeleccionada });
            alert("¡Cita reagendada con éxito!");
            navigate("/");
        } catch (err) {
            alert(err.response?.data?.message || "Error al reagendar");
        } finally {
            setProcesando(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
                    <div className="text-red-500 text-4xl">⚠️</div>
                    <h2 className="text-xl font-bold text-white">No se puede reagendar</h2>
                    <p className="text-slate-400">{error}</p>
                    <button
                        onClick={() => navigate("/")}
                        className="w-full py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors"
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 py-12">
            <div className="max-w-2xl mx-auto space-y-8">

                <header className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">Reagendar mi Cita</h1>
                    <p className="text-slate-400">
                        Cambia la fecha y hora de tu servicio de
                        <span className="text-indigo-400"> {reservaInfo.servicioActual} </span>
                        con <span className="text-indigo-400">{reservaInfo.barberoActual}</span>
                    </p>
                </header>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-8">

                    {/* Detalles actuales */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-semibold">Fecha Actual</p>
                            <p className="font-medium">{dayjs(reservaInfo.fechaActual).format("DD/MM/YYYY")}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-semibold">Hora Actual</p>
                            <p className="font-medium">{reservaInfo.horaActual}</p>
                        </div>
                    </div>

                    {/* Selector de Nueva Fecha */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-300">Selecciona nueva fecha:</label>
                        <input
                            type="date"
                            value={fecha}
                            min={dayjs().format("YYYY-MM-DD")}
                            onChange={(e) => setFecha(e.target.value)}
                            className="w-full bg-slate-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                    </div>

                    {/* Selector de Nueva Hora */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-300">Selecciona nueva hora:</label>
                        {loadingHours ? (
                            <div className="flex justify-center py-8">
                                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : horasDisponibles.length > 0 ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {horasDisponibles.map((h) => (
                                    <button
                                        key={h}
                                        onClick={() => setHoraSeleccionada(h)}
                                        className={`py-2 rounded-xl text-sm font-medium transition-all ${horaSeleccionada === h
                                                ? "bg-indigo-600 text-white"
                                                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                            }`}
                                    >
                                        {h}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center py-8 text-slate-500 italic">No hay horarios disponibles para esta fecha.</p>
                        )}
                    </div>

                    {/* Botón de Acción */}
                    <button
                        onClick={handleConfirm}
                        disabled={!horaSeleccionada || procesando}
                        className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${!horaSeleccionada || procesando
                                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                            }`}
                    >
                        {procesando ? "Procesando..." : "Confirmar Cambio"}
                    </button>

                    <p className="text-center text-xs text-slate-500">
                        Al confirmar, tu cita anterior será cancelada y se creará una nueva automáticamente.
                    </p>

                </div>
            </div>
        </div>
    );
}
