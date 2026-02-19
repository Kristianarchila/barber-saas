import { useState, useEffect, useCallback, useRef } from 'react';
import {
    Search, RefreshCw, ShieldAlert, ShieldCheck, Shield,
    ChevronLeft, ChevronRight, Eye, X, Download,
    AlertTriangle, Activity, Clock, Users, Zap,
    CheckCircle, XCircle, MinusCircle, ChevronDown
} from 'lucide-react';
import { getAuditLogs, getBarberias } from '../../services/superAdminService';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// ─── SEVERITY CONFIG ──────────────────────────────────────────────────────────
const SEVERITY = {
    CRITICAL: { label: 'Crítico', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500', icon: <ShieldAlert size={12} /> },
    HIGH: { label: 'Alto', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500', icon: <AlertTriangle size={12} /> },
    MEDIUM: { label: 'Medio', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500', icon: <Shield size={12} /> },
    LOW: { label: 'Bajo', bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400', icon: <ShieldCheck size={12} /> },
};

const RESULT = {
    SUCCESS: { label: 'Éxito', bg: 'bg-green-50', text: 'text-green-700', icon: <CheckCircle size={14} /> },
    FAILED: { label: 'Fallido', bg: 'bg-red-50', text: 'text-red-700', icon: <XCircle size={14} /> },
    BLOCKED: { label: 'Bloqueado', bg: 'bg-orange-50', text: 'text-orange-700', icon: <MinusCircle size={14} /> },
};

const QUICK_RANGES = [
    { label: 'Hoy', hours: 24 },
    { label: '7 días', hours: 168 },
    { label: '30 días', hours: 720 },
    { label: 'Todo', hours: null },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function SeverityBadge({ severity }) {
    const cfg = SEVERITY[severity] || SEVERITY.LOW;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

function ResultBadge({ result }) {
    const cfg = RESULT[result] || { label: result, bg: 'bg-gray-50', text: 'text-gray-600', icon: null };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${cfg.bg} ${cfg.text}`}>
            {cfg.icon} {cfg.label}
        </span>
    );
}

function KPICard({ icon, label, value, sub, color = 'text-gray-900', bg = 'bg-gray-50' }) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
            <div className={`p-3 ${bg} rounded-xl`}>{icon}</div>
            <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
                <p className={`text-2xl font-black ${color}`}>{value}</p>
                {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

// ─── DETAIL DRAWER ────────────────────────────────────────────────────────────
function DetailDrawer({ log, onClose }) {
    if (!log) return null;
    const sev = SEVERITY[log.severity] || SEVERITY.LOW;
    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col animate-slide-in-right overflow-hidden">
                {/* Header */}
                <div className={`p-6 border-b border-gray-100 ${sev.bg}`}>
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <SeverityBadge severity={log.severity} />
                                <ResultBadge result={log.result} />
                            </div>
                            <h2 className="text-lg font-black text-gray-900">{log.action}</h2>
                            <p className="text-sm text-gray-500 mt-1">{log.message}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/60 rounded-xl transition-all">
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Timestamp */}
                    <Section title="Timestamp">
                        <InfoRow label="Fecha" value={format(new Date(log.createdAt), "dd MMM yyyy 'a las' HH:mm:ss", { locale: es })} />
                        <InfoRow label="Hace" value={formatDistanceToNow(new Date(log.createdAt), { locale: es, addSuffix: true })} />
                    </Section>

                    {/* Actor */}
                    <Section title="Actor">
                        {log.userId ? (
                            <>
                                <InfoRow label="Nombre" value={log.userId.nombre} />
                                <InfoRow label="Email" value={log.userId.email} />
                            </>
                        ) : (
                            <InfoRow label="Usuario" value="Anónimo / Sistema" />
                        )}
                        {log.request?.ip && <InfoRow label="IP" value={log.request.ip} mono />}
                        {log.request?.userAgent && <InfoRow label="User Agent" value={log.request.userAgent} mono small />}
                    </Section>

                    {/* Entidad */}
                    {log.barberiaId && (
                        <Section title="Entidad">
                            <InfoRow label="Barbería" value={log.barberiaId.nombre} />
                            {log.resourceType && <InfoRow label="Tipo" value={log.resourceType} />}
                            {log.resourceId && <InfoRow label="ID Recurso" value={log.resourceId} mono />}
                        </Section>
                    )}

                    {/* Metadata JSON */}
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <Section title="Metadata">
                            <pre className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs text-gray-700 overflow-x-auto font-mono">
                                {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                        </Section>
                    )}
                </div>
            </div>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{title}</p>
            <div className="space-y-2">{children}</div>
        </div>
    );
}

function InfoRow({ label, value, mono = false, small = false }) {
    return (
        <div className="flex justify-between items-start gap-4">
            <span className="text-xs text-gray-400 font-medium shrink-0">{label}</span>
            <span className={`text-right text-gray-900 font-semibold break-all ${mono ? 'font-mono text-[11px] bg-gray-50 px-2 py-0.5 rounded' : small ? 'text-[11px]' : 'text-sm'}`}>
                {value}
            </span>
        </div>
    );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [barberias, setBarberias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedLog, setSelectedLog] = useState(null);
    const [activeRange, setActiveRange] = useState(3); // "Todo" por defecto
    const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, pages: 1 });
    const [kpis, setKpis] = useState({ total: 0, failed: 0, critical: 0, blocked: 0 });
    const debounceRef = useRef(null);

    const [filters, setFilters] = useState({
        barberiaId: '',
        severity: '',
        action: '',
        result: '',
        startDate: '',
        endDate: '',
        search: '',
    });

    useEffect(() => { loadBarberias(); }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setPagination(p => ({ ...p, page: 1 }));
            loadLogs();
        }, 300);
        return () => clearTimeout(debounceRef.current);
    }, [filters, pagination.page]);

    const loadBarberias = async () => {
        try {
            const data = await getBarberias();
            setBarberias(data.barberias || []);
        } catch (err) { console.error(err); }
    };

    const loadLogs = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAuditLogs({ ...filters, page: pagination.page, limit: pagination.limit });
            setLogs(data.logs || []);
            setPagination(p => ({ ...p, total: data.pagination?.total || 0, pages: data.pagination?.pages || 1 }));
            // Compute KPIs from response
            const all = data.logs || [];
            setKpis({
                total: data.pagination?.total || 0,
                failed: all.filter(l => l.result === 'FAILED').length,
                critical: all.filter(l => l.severity === 'CRITICAL').length,
                blocked: all.filter(l => l.result === 'BLOCKED').length,
            });
        } catch (err) {
            setError('Error al cargar logs: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = (key, value) => {
        setFilters(p => ({ ...p, [key]: value }));
    };

    const handleQuickRange = (idx) => {
        setActiveRange(idx);
        const range = QUICK_RANGES[idx];
        if (!range.hours) {
            handleFilter('startDate', '');
        } else {
            const d = new Date();
            d.setHours(d.getHours() - range.hours);
            handleFilter('startDate', d.toISOString().split('T')[0]);
        }
    };

    const clearFilters = () => {
        setFilters({ barberiaId: '', severity: '', action: '', result: '', startDate: '', endDate: '', search: '' });
        setActiveRange(3);
    };

    const activeFilterCount = Object.values(filters).filter(Boolean).length;

    return (
        <div className="space-y-6 animate-slide-in">
            {/* ── HEADER ── */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">SuperAdmin</span>
                        <span className="text-gray-300">/</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Auditoría</span>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900">Security Audit Log</h1>
                    <p className="text-gray-500 text-sm mt-1">Monitoreo en tiempo real de eventos de seguridad del sistema</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { }}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                    >
                        <Download size={16} /> Exportar
                    </button>
                    <button
                        onClick={loadLogs}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-all"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refrescar
                    </button>
                </div>
            </div>

            {/* ── KPI STRIP ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard icon={<Activity size={20} className="text-blue-500" />} label="Total eventos" value={pagination.total.toLocaleString()} sub="en el rango actual" bg="bg-blue-50" color="text-blue-700" />
                <KPICard icon={<XCircle size={20} className="text-red-500" />} label="Intentos fallidos" value={kpis.failed} sub="en esta página" bg="bg-red-50" color="text-red-700" />
                <KPICard icon={<ShieldAlert size={20} className="text-orange-500" />} label="Eventos críticos" value={kpis.critical} sub="en esta página" bg="bg-orange-50" color="text-orange-700" />
                <KPICard icon={<MinusCircle size={20} className="text-yellow-500" />} label="Bloqueados" value={kpis.blocked} sub="en esta página" bg="bg-yellow-50" color="text-yellow-700" />
            </div>

            {/* ── FILTERS ── */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                {/* Quick range chips */}
                <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-gray-50">
                    <Clock size={14} className="text-gray-400" />
                    <span className="text-xs font-semibold text-gray-400 mr-2">Rango:</span>
                    {QUICK_RANGES.map((r, i) => (
                        <button
                            key={r.label}
                            onClick={() => handleQuickRange(i)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${activeRange === i ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {r.label}
                        </button>
                    ))}
                    {activeFilterCount > 0 && (
                        <button onClick={clearFilters} className="ml-auto flex items-center gap-1 text-xs text-red-500 font-semibold hover:text-red-700">
                            <X size={12} /> Limpiar filtros ({activeFilterCount})
                        </button>
                    )}
                </div>

                {/* Filter row */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 p-5">
                    {/* Search */}
                    <div className="lg:col-span-2 relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar acción, usuario, IP..."
                            value={filters.search}
                            onChange={e => handleFilter('search', e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-all"
                        />
                    </div>

                    {/* Barbería */}
                    <FilterSelect label="Barbería" value={filters.barberiaId} onChange={v => handleFilter('barberiaId', v)}>
                        <option value="">Todas las barberías</option>
                        {barberias.map(b => <option key={b._id} value={b._id}>{b.nombre}</option>)}
                    </FilterSelect>

                    {/* Severidad */}
                    <FilterSelect label="Severidad" value={filters.severity} onChange={v => handleFilter('severity', v)}>
                        <option value="">Toda severidad</option>
                        <option value="CRITICAL">🔴 Crítico</option>
                        <option value="HIGH">🟠 Alto</option>
                        <option value="MEDIUM">🟡 Medio</option>
                        <option value="LOW">⚪ Bajo</option>
                    </FilterSelect>

                    {/* Resultado */}
                    <FilterSelect label="Resultado" value={filters.result} onChange={v => handleFilter('result', v)}>
                        <option value="">Todos</option>
                        <option value="SUCCESS">✅ Éxito</option>
                        <option value="FAILED">❌ Fallido</option>
                        <option value="BLOCKED">🚫 Bloqueado</option>
                    </FilterSelect>

                    {/* Acción */}
                    <FilterSelect label="Acción" value={filters.action} onChange={v => handleFilter('action', v)}>
                        <option value="">Todas las acciones</option>
                        <option value="CROSS_TENANT_ATTEMPT">Cross-Tenant</option>
                        <option value="LOGIN_FAILED">Login Fallido</option>
                        <option value="DELETE_BARBERO">Eliminar Barbero</option>
                        <option value="CANCEL_RESERVA">Cancelar Reserva</option>
                        <option value="CHANGE_PLAN">Cambio de Plan</option>
                        <option value="UPDATE_BARBERIA_CONFIG">Cambio Config</option>
                    </FilterSelect>
                </div>
            </div>

            {/* ── ERROR ── */}
            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
                    <AlertTriangle size={18} /> {error}
                </div>
            )}

            {/* ── TABLE ── */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                {/* Table meta */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                    <p className="text-sm text-gray-500">
                        <span className="font-bold text-gray-900">{logs.length}</span> de <span className="font-bold text-gray-900">{pagination.total.toLocaleString()}</span> eventos
                    </p>
                    <span className="text-xs text-gray-400 font-mono">Página {pagination.page}/{pagination.pages}</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {['Fecha y Hora', 'Severidad', 'Acción', 'Entidad', 'Usuario', 'Resultado', ''].map((h, i) => (
                                    <th key={i} className={`px-5 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest ${i === 6 ? 'text-right' : ''}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <tr key={i} className="border-b border-gray-50">
                                        {Array.from({ length: 7 }).map((_, j) => (
                                            <td key={j} className="px-5 py-4">
                                                <div className={`h-4 bg-gray-100 rounded animate-pulse ${j === 0 ? 'w-32' : j === 1 ? 'w-16' : j === 2 ? 'w-40' : 'w-24'}`} />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                                <ShieldCheck size={28} className="text-gray-300" />
                                            </div>
                                            <p className="text-gray-500 font-semibold">Sin eventos en este rango</p>
                                            <p className="text-gray-400 text-sm">Ajusta los filtros para ver más resultados</p>
                                            <button onClick={clearFilters} className="mt-2 text-sm text-blue-600 font-semibold hover:underline">
                                                Limpiar filtros
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logs.map(log => (
                                    <tr
                                        key={log.id || log._id}
                                        onClick={() => setSelectedLog(log)}
                                        className="border-b border-gray-50 hover:bg-gray-50 transition-all cursor-pointer group"
                                    >
                                        {/* Fecha */}
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-semibold text-gray-900 tabular-nums">
                                                {format(new Date(log.createdAt), 'dd MMM, HH:mm:ss', { locale: es })}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {formatDistanceToNow(new Date(log.createdAt), { locale: es, addSuffix: true })}
                                            </p>
                                        </td>

                                        {/* Severidad */}
                                        <td className="px-5 py-4">
                                            <SeverityBadge severity={log.severity} />
                                        </td>

                                        {/* Acción */}
                                        <td className="px-5 py-4 max-w-[200px]">
                                            <p className="text-sm font-bold text-gray-900 truncate">{log.action}</p>
                                            <p className="text-xs text-gray-400 truncate mt-0.5">{log.message}</p>
                                        </td>

                                        {/* Entidad */}
                                        <td className="px-5 py-4">
                                            {log.barberiaId ? (
                                                <div>
                                                    <p className="text-sm font-semibold text-indigo-600">{log.barberiaId.nombre}</p>
                                                    {log.resourceType && <p className="text-xs text-gray-400 font-mono mt-0.5">{log.resourceType}</p>}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg font-mono">Sistema</span>
                                            )}
                                        </td>

                                        {/* Usuario */}
                                        <td className="px-5 py-4">
                                            {log.userId ? (
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{log.userId.nombre}</p>
                                                    <p className="text-xs text-gray-400 truncate">{log.userId.email}</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="text-xs text-gray-500 font-semibold">Anónimo</p>
                                                    {log.request?.ip && <p className="text-xs text-gray-400 font-mono">{log.request.ip}</p>}
                                                </div>
                                            )}
                                        </td>

                                        {/* Resultado */}
                                        <td className="px-5 py-4">
                                            <ResultBadge result={log.result} />
                                        </td>

                                        {/* Ver */}
                                        <td className="px-5 py-4 text-right">
                                            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-100 rounded-lg">
                                                <Eye size={16} className="text-gray-500" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── PAGINATION ── */}
                {pagination.pages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50">
                        <button
                            disabled={pagination.page === 1 || loading}
                            onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft size={16} /> Anterior
                        </button>

                        {/* Page numbers */}
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
                                const page = i + 1;
                                return (
                                    <button
                                        key={page}
                                        onClick={() => setPagination(p => ({ ...p, page }))}
                                        className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${pagination.page === page ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                            {pagination.pages > 7 && <span className="text-gray-400 px-2">...</span>}
                        </div>

                        <button
                            disabled={pagination.page === pagination.pages || loading}
                            onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            Siguiente <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* ── DETAIL DRAWER ── */}
            {selectedLog && <DetailDrawer log={selectedLog} onClose={() => setSelectedLog(null)} />}
        </div>
    );
}

// ─── FILTER SELECT ────────────────────────────────────────────────────────────
function FilterSelect({ label, value, onChange, children }) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-gray-400 transition-all pr-8 cursor-pointer"
            >
                {children}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
    );
}
