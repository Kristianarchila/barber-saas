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
import {
    Users, Search, Shield, ShieldOff, CheckCircle2, XCircle,
    RotateCcw, Calendar, TrendingDown, AlertTriangle, RefreshCw, X
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function ClientesStats() {
    const [stats, setStats] = useState([]);
    const [resumen, setResumen] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtro, setFiltro] = useState("todos");
    const [busqueda, setBusqueda] = useState("");
    const [modalBloqueo, setModalBloqueo] = useState(null);
    const [formBloqueo, setFormBloqueo] = useState({ motivo: "", diasBloqueo: 7 });
    const [processing, setProcessing] = useState(false);

    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const formatISO = (d) => d.toISOString().split('T')[0];

    const PERIODOS = [
        { key: 'hoy', label: 'Hoy', desde: formatISO(hoy), hasta: formatISO(hoy) },
        { key: '7d', label: '7 días', desde: formatISO(new Date(Date.now() - 6 * 86400000)), hasta: formatISO(hoy) },
        { key: '30d', label: '30 días', desde: formatISO(new Date(Date.now() - 29 * 86400000)), hasta: formatISO(hoy) },
        { key: 'mes', label: 'Este mes', desde: formatISO(primerDiaMes), hasta: formatISO(hoy) },
        { key: 'todo', label: 'Todo', desde: null, hasta: null },
        { key: 'custom', label: 'Rango personalizado', desde: null, hasta: null },
    ];

    const [periodo, setPeriodo] = useState('mes');
    const [fechaInicio, setFechaInicio] = useState(formatISO(primerDiaMes));
    const [fechaFin, setFechaFin] = useState(formatISO(hoy));

    useEffect(() => { cargarDatos(); }, [filtro, fechaInicio, fechaFin]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            setError(null);
            const filters = {};
            if (filtro === "bloqueados") filters.bloqueado = true;
            if (filtro === "activos") filters.bloqueado = false;
            if (periodo !== 'todo') {
                if (fechaInicio) filters.fechaInicio = fechaInicio;
                if (fechaFin) filters.fechaFin = fechaFin;
            }
            const [statsData, resumenData] = await Promise.all([
                getClienteStats(filters),
                getResumenStats()
            ]);
            setStats(Array.isArray(statsData.data) ? statsData.data : []);
            setResumen(resumenData?.data || resumenData);
        } catch (err) {
            setError("Error al cargar estadísticas de clientes");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleBloquear = async () => {
        if (!formBloqueo.motivo) { toast.error("Debes especificar un motivo"); return; }
        try {
            setProcessing(true);
            await bloquearCliente(modalBloqueo.email, formBloqueo);
            toast.success("Cliente bloqueado correctamente");
            await cargarDatos();
            setModalBloqueo(null);
            setFormBloqueo({ motivo: "", diasBloqueo: 7 });
        } catch (error) {
            toast.error("Error al bloquear: " + (error.response?.data?.message || error.message));
        } finally { setProcessing(false); }
    };

    const handleDesbloquear = async (email) => {
        if (!window.confirm("¿Desbloquear a este cliente?")) return;
        try {
            setProcessing(true);
            await desbloquearCliente(email);
            toast.success("Cliente desbloqueado");
            await cargarDatos();
        } catch (error) {
            toast.error("Error: " + (error.response?.data?.message || error.message));
        } finally { setProcessing(false); }
    };

    const handleResetCancelaciones = async (email) => {
        if (!window.confirm("¿Resetear el contador de cancelaciones?")) return;
        try {
            setProcessing(true);
            await resetCancelaciones(email);
            toast.success("Contador reseteado");
            await cargarDatos();
        } catch (error) {
            toast.error("Error: " + (error.response?.data?.message || error.message));
        } finally { setProcessing(false); }
    };

    const statsFiltrados = stats.filter(s => {
        if (!busqueda) return true;
        const q = busqueda.toLowerCase();
        return s.email?.toLowerCase().includes(q) || s.telefono?.includes(busqueda);
    });

    const calcularDiasRestantes = (fechaDesbloqueo) => {
        if (!fechaDesbloqueo) return 0;
        return Math.max(0, Math.ceil((new Date(fechaDesbloqueo) - new Date()) / 86400000));
    };

    const cancelRatioColor = (ratio) => {
        if (ratio >= 50) return "text-red-600 font-bold";
        if (ratio >= 25) return "text-amber-600 font-bold";
        return "text-gray-600";
    };

    if (loading) return <LoadingSpinner label="Cargando estadísticas..." fullPage />;
    if (error) return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <ErrorMessage title="Error al cargar" message={error} onRetry={cargarDatos} />
        </div>
    );

    return (
        <div className="space-y-8 animate-slide-in">

            {/* ── HEADER ── */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="heading-1 flex items-center gap-3">
                        <Users className="text-blue-600" size={32} />
                        Estadísticas de Clientes
                    </h1>
                    <p className="body-large text-gray-600 mt-2">
                        Monitorea el comportamiento y gestiona bloqueos en tiempo real
                    </p>
                </div>
                <button
                    onClick={cargarDatos}
                    className="btn btn-ghost self-start md:self-center"
                >
                    <RefreshCw size={16} />
                    Actualizar
                </button>
            </header>

            {/* ── KPI CARDS ── */}
            {resumen && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {/* Total */}
                    <div className="card card-padding flex items-center gap-5 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-all">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                            <Users size={26} />
                        </div>
                        <div>
                            <p className="caption text-gray-500 font-bold uppercase tracking-widest">Total Clientes</p>
                            <p className="text-4xl font-black text-gray-900 tabular-nums">{resumen.totalClientes ?? 0}</p>
                            <p className="body-small text-gray-400 mt-0.5">registrados en total</p>
                        </div>
                    </div>

                    {/* Bloqueados */}
                    <div className="card card-padding flex items-center gap-5 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-all">
                        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 flex-shrink-0">
                            <Shield size={26} />
                        </div>
                        <div className="flex-1">
                            <p className="caption text-gray-500 font-bold uppercase tracking-widest">Bloqueados</p>
                            <p className="text-4xl font-black text-red-500 tabular-nums">{resumen.clientesBloqueados ?? 0}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-red-400 rounded-full transition-all duration-700"
                                        style={{ width: `${Math.min(100, resumen.porcentajeBloqueados ?? 0)}%` }}
                                    />
                                </div>
                                <span className="caption text-gray-400 tabular-nums">{resumen.porcentajeBloqueados ?? 0}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Activos */}
                    <div className="card card-padding flex items-center gap-5 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-all">
                        <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
                            <CheckCircle2 size={26} />
                        </div>
                        <div>
                            <p className="caption text-gray-500 font-bold uppercase tracking-widest">Activos</p>
                            <p className="text-4xl font-black text-green-600 tabular-nums">{resumen.clientesActivos ?? 0}</p>
                            <p className="body-small text-gray-400 mt-0.5">sin restricciones</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── SELECTOR DE PERÍODO ── */}
            <div className="card card-padding shadow-sm ring-1 ring-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="caption text-gray-500 font-bold uppercase tracking-widest">Período</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {PERIODOS.map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => {
                                    setPeriodo(key);
                                    const p = PERIODOS.find(p => p.key === key);
                                    if (key !== 'custom') {
                                        setFechaInicio(p.desde ?? '');
                                        setFechaFin(p.hasta ?? '');
                                    }
                                }}
                                className={`px-3.5 py-1.5 rounded-lg text-sm font-bold transition-all ${periodo === key
                                    ? 'bg-blue-600 text-white shadow'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {periodo === 'custom' && (
                        <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
                            <input
                                type="date"
                                value={fechaInicio}
                                onChange={e => setFechaInicio(e.target.value)}
                                max={fechaFin || undefined}
                                className="input text-sm py-1.5"
                            />
                            <span className="text-gray-400 text-sm font-bold">→</span>
                            <input
                                type="date"
                                value={fechaFin}
                                onChange={e => setFechaFin(e.target.value)}
                                min={fechaInicio || undefined}
                                max={formatISO(hoy)}
                                className="input text-sm py-1.5"
                            />
                        </div>
                    )}

                    {periodo !== 'todo' && periodo !== 'custom' && fechaInicio && (
                        <span className="sm:ml-auto caption text-gray-400 tabular-nums">
                            {fechaInicio === fechaFin ? fechaInicio : `${fechaInicio} → ${fechaFin}`}
                        </span>
                    )}
                </div>
            </div>

            {/* ── BUSCADOR Y FILTROS ── */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por email o teléfono..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="input pl-11 pr-10"
                    />
                    {busqueda && (
                        <button onClick={() => setBusqueda("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors">
                            <X size={16} />
                        </button>
                    )}
                </div>

                <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                    {[
                        { key: "todos", label: "Todos", count: stats.length },
                        { key: "activos", label: "Activos" },
                        { key: "bloqueados", label: "Bloqueados" },
                    ].map(({ key, label, count }) => (
                        <button
                            key={key}
                            onClick={() => setFiltro(key)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filtro === key
                                ? key === "bloqueados"
                                    ? "bg-red-500 text-white shadow"
                                    : key === "activos"
                                        ? "bg-green-500 text-white shadow"
                                        : "bg-blue-600 text-white shadow"
                                : "text-gray-500 hover:text-gray-800"
                                }`}
                        >
                            {label}
                            {count !== undefined && (
                                <span className={`ml-1.5 text-xs ${filtro === key ? "text-white/70" : "text-gray-400"}`}>
                                    {count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── TABLA / ESTADO VACÍO ── */}
            {statsFiltrados.length === 0 ? (
                <div className="card card-padding py-24 text-center shadow-sm">
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5 text-gray-400">
                        <Users size={36} />
                    </div>
                    <h3 className="heading-3 text-gray-800 mb-2">
                        {busqueda ? "Sin resultados" : "No hay clientes aún"}
                    </h3>
                    <p className="body text-gray-400 max-w-xs mx-auto">
                        {busqueda
                            ? `No se encontraron clientes con "${busqueda}"`
                            : "Las estadísticas aparecerán aquí cuando los clientes realicen reservas"}
                    </p>
                </div>
            ) : (
                <div className="card shadow-sm ring-1 ring-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <p className="body-small text-gray-500">
                            <span className="font-bold text-gray-900">{statsFiltrados.length}</span> cliente{statsFiltrados.length !== 1 && "s"}
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="text-left px-6 py-3 caption text-gray-500 font-bold uppercase tracking-widest">Cliente</th>
                                    <th className="text-center px-4 py-3 caption text-gray-500 font-bold uppercase tracking-widest">Reservas</th>
                                    <th className="text-center px-4 py-3 caption text-gray-500 font-bold uppercase tracking-widest">Completadas</th>
                                    <th className="text-center px-4 py-3 caption text-gray-500 font-bold uppercase tracking-widest">Canceladas</th>
                                    <th className="text-center px-4 py-3 caption text-gray-500 font-bold uppercase tracking-widest">Este mes</th>
                                    <th className="text-center px-4 py-3 caption text-gray-500 font-bold uppercase tracking-widest">Estado</th>
                                    <th className="text-right px-6 py-3 caption text-gray-500 font-bold uppercase tracking-widest">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {statsFiltrados.map((cliente) => {
                                    const cancelRatio = cliente.totalReservas > 0
                                        ? Math.round((cliente.reservasCanceladas / cliente.totalReservas) * 100)
                                        : 0;
                                    const isHighRisk = cliente.cancelacionesEsteMes >= 3;

                                    return (
                                        <tr key={cliente.email} className="hover:bg-gray-50/70 transition-colors group">
                                            {/* Cliente */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 ${cliente.bloqueado
                                                        ? "bg-red-100 text-red-500"
                                                        : "bg-blue-100 text-blue-600"
                                                        }`}>
                                                        {(cliente.email?.[0] || "?").toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="body font-semibold text-gray-900 leading-tight">{cliente.email}</p>
                                                        {cliente.telefono && (
                                                            <p className="caption text-gray-400 mt-0.5">{cliente.telefono}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Reservas */}
                                            <td className="px-4 py-4 text-center">
                                                <span className="body font-bold text-gray-900 tabular-nums">{cliente.totalReservas || 0}</span>
                                            </td>

                                            {/* Completadas */}
                                            <td className="px-4 py-4 text-center">
                                                <span className="inline-flex items-center gap-1.5 text-green-600 font-bold tabular-nums">
                                                    <CheckCircle2 size={14} />
                                                    {cliente.reservasCompletadas || 0}
                                                </span>
                                            </td>

                                            {/* Canceladas */}
                                            <td className="px-4 py-4 text-center">
                                                <div className="flex flex-col items-center gap-0.5">
                                                    <span className={`tabular-nums ${cancelRatioColor(cancelRatio)}`}>
                                                        {cliente.reservasCanceladas || 0}
                                                    </span>
                                                    {cancelRatio > 0 && (
                                                        <span className="caption text-gray-400 tabular-nums">{cancelRatio}%</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Este mes */}
                                            <td className="px-4 py-4 text-center">
                                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-black tabular-nums ${isHighRisk
                                                    ? "bg-red-100 text-red-600 ring-1 ring-red-200"
                                                    : cliente.cancelacionesEsteMes > 0
                                                        ? "bg-amber-100 text-amber-600"
                                                        : "bg-gray-100 text-gray-400"
                                                    }`}>
                                                    {isHighRisk && <AlertTriangle size={12} className="mr-0.5" />}
                                                    {cliente.cancelacionesEsteMes || 0}
                                                </span>
                                            </td>

                                            {/* Estado */}
                                            <td className="px-4 py-4 text-center">
                                                {cliente.bloqueado ? (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="inline-flex items-center gap-1.5 badge bg-red-50 text-red-600 ring-1 ring-red-200">
                                                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                                            Bloqueado
                                                        </span>
                                                        {cliente.fechaDesbloqueo && (
                                                            <span className="caption text-gray-400">
                                                                {calcularDiasRestantes(cliente.fechaDesbloqueo)}d restantes
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="badge bg-green-50 text-green-600 ring-1 ring-green-200 inline-flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                                        Activo
                                                    </span>
                                                )}
                                            </td>

                                            {/* Acciones */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                    {cliente.bloqueado ? (
                                                        <button
                                                            onClick={() => handleDesbloquear(cliente.email)}
                                                            disabled={processing}
                                                            className="btn btn-sm bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 disabled:opacity-50"
                                                        >
                                                            <ShieldOff size={14} />
                                                            Desbloquear
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => setModalBloqueo(cliente)}
                                                            disabled={processing}
                                                            className="btn btn-sm bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-gray-200 disabled:opacity-50"
                                                        >
                                                            <Shield size={14} />
                                                            Bloquear
                                                        </button>
                                                    )}
                                                    {cliente.cancelacionesEsteMes > 0 && (
                                                        <button
                                                            onClick={() => handleResetCancelaciones(cliente.email)}
                                                            disabled={processing}
                                                            title="Resetear contador"
                                                            className="btn btn-sm bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-600 border border-gray-200 disabled:opacity-50"
                                                        >
                                                            <RotateCcw size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── MODAL DE BLOQUEO ── */}
            {modalBloqueo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="card card-padding w-full max-w-md relative shadow-2xl">
                        <button
                            type="button"
                            onClick={() => { setModalBloqueo(null); setFormBloqueo({ motivo: "", diasBloqueo: 7 }); }}
                            className="absolute top-5 right-5 p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-400 hover:text-gray-800"
                        >
                            <X size={18} />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-red-50 rounded-xl">
                                <Shield className="text-red-500" size={22} />
                            </div>
                            <div>
                                <h3 className="heading-3">Bloquear Cliente</h3>
                                <p className="body-small text-gray-500">{modalBloqueo.email}</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="label">Motivo del bloqueo <span className="text-red-500">*</span></label>
                                <textarea
                                    value={formBloqueo.motivo}
                                    onChange={(e) => setFormBloqueo({ ...formBloqueo, motivo: e.target.value })}
                                    className="input resize-none"
                                    rows={3}
                                    placeholder="Ej: Exceso de cancelaciones sin previo aviso..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="label">Duración del bloqueo</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={formBloqueo.diasBloqueo}
                                        onChange={(e) => setFormBloqueo({ ...formBloqueo, diasBloqueo: parseInt(e.target.value) })}
                                        className="input pr-14"
                                        min={1} max={365}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 body-small text-gray-400 pointer-events-none">días</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
                            <button
                                onClick={() => { setModalBloqueo(null); setFormBloqueo({ motivo: "", diasBloqueo: 7 }); }}
                                className="btn btn-ghost flex-1"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleBloquear}
                                disabled={processing || !formBloqueo.motivo}
                                className="btn flex-1 bg-red-600 hover:bg-red-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? "Bloqueando..." : "Confirmar bloqueo"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
