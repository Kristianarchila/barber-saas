import { useEffect, useState } from "react";
import {
    getClienteStats,
    bloquearCliente,
    desbloquearCliente,
    resetCancelaciones,
    getResumenStats
} from "../../services/clienteStatsService";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";

export default function ClientesStats() {
    const [stats, setStats] = useState([]);
    const [resumen, setResumen] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtro, setFiltro] = useState("todos"); // todos, bloqueados, activos
    const [busqueda, setBusqueda] = useState("");
    const [modalBloqueo, setModalBloqueo] = useState(null);
    const [formBloqueo, setFormBloqueo] = useState({ motivo: "", diasBloqueo: 7 });
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        cargarDatos();
    }, [filtro]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            setError(null);

            const filters = {};
            if (filtro === "bloqueados") filters.bloqueado = true;
            if (filtro === "activos") filters.bloqueado = false;

            const [statsData, resumenData] = await Promise.all([
                getClienteStats(filters),
                getResumenStats()
            ]);

            setStats(statsData.stats || statsData);
            setResumen(resumenData);
        } catch (err) {
            setError("Error al cargar estadísticas de clientes");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleBloquear = async () => {
        if (!formBloqueo.motivo) {
            alert("Debes especificar un motivo");
            return;
        }

        try {
            setProcessing(true);
            await bloquearCliente(modalBloqueo.email, formBloqueo);
            await cargarDatos();
            setModalBloqueo(null);
            setFormBloqueo({ motivo: "", diasBloqueo: 7 });
        } catch (error) {
            alert("Error al bloquear cliente: " + (error.response?.data?.message || error.message));
        } finally {
            setProcessing(false);
        }
    };

    const handleDesbloquear = async (email) => {
        if (!confirm("¿Estás seguro de desbloquear a este cliente?")) return;

        try {
            setProcessing(true);
            await desbloquearCliente(email);
            await cargarDatos();
        } catch (error) {
            alert("Error al desbloquear cliente: " + (error.response?.data?.message || error.message));
        } finally {
            setProcessing(false);
        }
    };

    const handleResetCancelaciones = async (email) => {
        if (!confirm("¿Estás seguro de resetear el contador de cancelaciones?")) return;

        try {
            setProcessing(true);
            await resetCancelaciones(email);
            await cargarDatos();
        } catch (error) {
            alert("Error al resetear cancelaciones: " + (error.response?.data?.message || error.message));
        } finally {
            setProcessing(false);
        }
    };

    const statsFiltrados = stats.filter(s => {
        if (!busqueda) return true;
        const searchLower = busqueda.toLowerCase();
        return (
            s.email?.toLowerCase().includes(searchLower) ||
            s.telefono?.includes(busqueda)
        );
    });

    const formatearFecha = (fecha) => {
        if (!fecha) return "-";
        return new Date(fecha).toLocaleDateString("es-CL", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const calcularDiasRestantes = (fechaDesbloqueo) => {
        if (!fechaDesbloqueo) return 0;
        const diff = new Date(fechaDesbloqueo) - new Date();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    if (loading) {
        return <LoadingSpinner label="Cargando estadísticas..." fullPage />;
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12">
                <ErrorMessage
                    title="Error al cargar"
                    message={error}
                    onRetry={cargarDatos}
                />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-12">
                <h1 className="text-5xl font-black text-white mb-2 tracking-tight">Estadísticas de Clientes</h1>
                <p className="text-gray-400 text-lg">Monitorea cancelaciones y gestiona bloqueos</p>
            </div>

            {/* Resumen Cards */}
            {resumen && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-neutral-900/50 backdrop-blur-xl rounded-[2rem] p-6 border border-neutral-800/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral-500 text-sm font-bold uppercase tracking-widest mb-1">Total Clientes</p>
                                <p className="text-4xl font-black text-white">{resumen.totalClientes || 0}</p>
                            </div>
                            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                                <span className="text-3xl">👥</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-neutral-900/50 backdrop-blur-xl rounded-[2rem] p-6 border border-neutral-800/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral-500 text-sm font-bold uppercase tracking-widest mb-1">Bloqueados</p>
                                <p className="text-4xl font-black text-red-400">{resumen.clientesBloqueados || 0}</p>
                            </div>
                            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center">
                                <span className="text-3xl">🚫</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-neutral-900/50 backdrop-blur-xl rounded-[2rem] p-6 border border-neutral-800/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral-500 text-sm font-bold uppercase tracking-widest mb-1">Cancelaciones (Mes)</p>
                                <p className="text-4xl font-black text-yellow-400">{resumen.cancelacionesEsteMes || 0}</p>
                            </div>
                            <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center">
                                <span className="text-3xl">⚠️</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filtros y Búsqueda */}
            <div className="bg-neutral-900/50 backdrop-blur-xl rounded-[2rem] p-6 border border-neutral-800/50 mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Buscar por email o teléfono..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full bg-neutral-800/50 border border-neutral-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFiltro("todos")}
                            className={`px-6 py-4 rounded-2xl font-bold text-sm transition-all ${filtro === "todos"
                                    ? "bg-blue-600 text-white"
                                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                                }`}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setFiltro("activos")}
                            className={`px-6 py-4 rounded-2xl font-bold text-sm transition-all ${filtro === "activos"
                                    ? "bg-green-600 text-white"
                                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                                }`}
                        >
                            Activos
                        </button>
                        <button
                            onClick={() => setFiltro("bloqueados")}
                            className={`px-6 py-4 rounded-2xl font-bold text-sm transition-all ${filtro === "bloqueados"
                                    ? "bg-red-600 text-white"
                                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                                }`}
                        >
                            Bloqueados
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabla de Clientes */}
            {statsFiltrados.length === 0 ? (
                <div className="bg-neutral-900/50 backdrop-blur-xl rounded-[2.5rem] p-20 text-center border border-neutral-800/50">
                    <div className="w-24 h-24 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-8">
                        <span className="text-5xl">📊</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">No hay clientes</h2>
                    <p className="text-neutral-500 mb-8 max-w-sm mx-auto">
                        {busqueda ? "No se encontraron clientes con ese criterio" : "Aún no hay estadísticas de clientes"}
                    </p>
                </div>
            ) : (
                <div className="bg-neutral-900/50 backdrop-blur-xl rounded-[2rem] border border-neutral-800/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-neutral-800">
                                    <th className="text-left p-6 text-neutral-500 font-black uppercase tracking-widest text-xs">Cliente</th>
                                    <th className="text-center p-6 text-neutral-500 font-black uppercase tracking-widest text-xs">Reservas</th>
                                    <th className="text-center p-6 text-neutral-500 font-black uppercase tracking-widest text-xs">Completadas</th>
                                    <th className="text-center p-6 text-neutral-500 font-black uppercase tracking-widest text-xs">Canceladas</th>
                                    <th className="text-center p-6 text-neutral-500 font-black uppercase tracking-widest text-xs">Este Mes</th>
                                    <th className="text-center p-6 text-neutral-500 font-black uppercase tracking-widest text-xs">Estado</th>
                                    <th className="text-center p-6 text-neutral-500 font-black uppercase tracking-widest text-xs">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {statsFiltrados.map((cliente) => (
                                    <tr key={cliente.email} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors">
                                        <td className="p-6">
                                            <div>
                                                <p className="text-white font-bold">{cliente.email}</p>
                                                {cliente.telefono && (
                                                    <p className="text-neutral-500 text-sm">{cliente.telefono}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className="text-white font-bold">{cliente.totalReservas || 0}</span>
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className="text-green-400 font-bold">{cliente.reservasCompletadas || 0}</span>
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className="text-red-400 font-bold">{cliente.reservasCanceladas || 0}</span>
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className={`font-bold ${cliente.cancelacionesEsteMes >= 3 ? "text-red-400" : "text-yellow-400"
                                                }`}>
                                                {cliente.cancelacionesEsteMes || 0}
                                            </span>
                                        </td>
                                        <td className="p-6 text-center">
                                            {cliente.bloqueado ? (
                                                <div className="inline-flex flex-col items-center">
                                                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-red-500/10 text-red-400">
                                                        Bloqueado
                                                    </span>
                                                    {cliente.fechaDesbloqueo && (
                                                        <span className="text-xs text-neutral-500 mt-1">
                                                            {calcularDiasRestantes(cliente.fechaDesbloqueo)} días
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-green-500/10 text-green-400">
                                                    Activo
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center justify-center gap-2">
                                                {cliente.bloqueado ? (
                                                    <button
                                                        onClick={() => handleDesbloquear(cliente.email)}
                                                        disabled={processing}
                                                        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-xs transition-all disabled:opacity-50"
                                                    >
                                                        Desbloquear
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => setModalBloqueo(cliente)}
                                                        disabled={processing}
                                                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs transition-all disabled:opacity-50"
                                                    >
                                                        Bloquear
                                                    </button>
                                                )}
                                                {cliente.cancelacionesEsteMes > 0 && (
                                                    <button
                                                        onClick={() => handleResetCancelaciones(cliente.email)}
                                                        disabled={processing}
                                                        className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-xl font-bold text-xs transition-all disabled:opacity-50"
                                                    >
                                                        Reset
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal de Bloqueo */}
            {modalBloqueo && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl">
                        <h3 className="text-2xl font-black text-white mb-2 uppercase">Bloquear Cliente</h3>
                        <p className="text-neutral-400 mb-6">{modalBloqueo.email}</p>

                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="text-xs font-black text-neutral-500 uppercase tracking-widest mb-2 block">
                                    Motivo del Bloqueo
                                </label>
                                <textarea
                                    value={formBloqueo.motivo}
                                    onChange={(e) => setFormBloqueo({ ...formBloqueo, motivo: e.target.value })}
                                    className="w-full bg-neutral-800/50 border border-neutral-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-red-500/50 transition-all resize-none"
                                    rows={3}
                                    placeholder="Ej: Exceso de cancelaciones, comportamiento inapropiado..."
                                />
                            </div>

                            <div>
                                <label className="text-xs font-black text-neutral-500 uppercase tracking-widest mb-2 block">
                                    Días de Bloqueo
                                </label>
                                <input
                                    type="number"
                                    value={formBloqueo.diasBloqueo}
                                    onChange={(e) => setFormBloqueo({ ...formBloqueo, diasBloqueo: parseInt(e.target.value) })}
                                    className="w-full bg-neutral-800/50 border border-neutral-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-red-500/50 transition-all"
                                    min={1}
                                    max={365}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    setModalBloqueo(null);
                                    setFormBloqueo({ motivo: "", diasBloqueo: 7 });
                                }}
                                className="flex-1 px-6 py-4 bg-neutral-800 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-neutral-700 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleBloquear}
                                disabled={processing || !formBloqueo.motivo}
                                className="flex-1 px-6 py-4 bg-red-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-red-900/20 hover:bg-red-500 transition-all disabled:opacity-50"
                            >
                                {processing ? "Bloqueando..." : "Confirmar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
