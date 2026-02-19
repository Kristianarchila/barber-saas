import { useState, useEffect, useRef } from 'react';
import { Search, RefreshCw, Edit, CreditCard, TrendingUp, ChevronDown, X } from 'lucide-react';
import { getDashboardSuperAdmin } from '../../services/superAdminService';
import GestionSuscripcionModal from '../../components/superadmin/GestionSuscripcionModal';

const PLAN_COLOR = {
    FREE: { bg: 'bg-gray-100', text: 'text-gray-600' },
    BASIC: { bg: 'bg-blue-50', text: 'text-blue-700' },
    PRO: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
    trial: { bg: 'bg-purple-50', text: 'text-purple-700' },
};
const STATUS_COLOR = {
    ACTIVE: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
    TRIALING: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    CANCELED: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
    PAST_DUE: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
    INCOMPLETE: { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' },
};

function PlanBadge({ plan }) {
    const c = PLAN_COLOR[plan] || PLAN_COLOR.FREE;
    return <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${c.bg} ${c.text}`}>{plan || 'FREE'}</span>;
}
function StatusBadge({ status }) {
    const c = STATUS_COLOR[status] || STATUS_COLOR.INCOMPLETE;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${c.bg} ${c.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
            {status || 'N/A'}
        </span>
    );
}

export default function Suscripciones() {
    const [barberias, setBarberias] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [planFilter, setPlanFilter] = useState('');
    const [selectedBarberia, setSelectedBarberia] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const debounce = useRef(null);

    useEffect(() => { loadBarberias(); }, []);
    useEffect(() => {
        if (debounce.current) clearTimeout(debounce.current);
        debounce.current = setTimeout(() => applyFilters(), 200);
    }, [search, planFilter, barberias]);

    const loadBarberias = async () => {
        try {
            setLoading(true);
            const data = await getDashboardSuperAdmin();
            setBarberias(data.barberias || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const applyFilters = () => {
        let list = [...barberias];
        if (search) { const t = search.toLowerCase(); list = list.filter(b => b.nombre?.toLowerCase().includes(t) || b.email?.toLowerCase().includes(t)); }
        if (planFilter) list = list.filter(b => b.plan === planFilter);
        setFiltered(list);
    };

    const plans = [...new Set(barberias.map(b => b.plan).filter(Boolean))];
    const stats = [
        { label: 'Total', value: barberias.length, bg: 'bg-gray-50', color: 'text-gray-900', icon: <CreditCard size={18} className="text-gray-500" /> },
        { label: 'FREE', value: barberias.filter(b => b.plan === 'FREE').length, bg: 'bg-gray-50', color: 'text-gray-700', icon: <span className="text-base">🆓</span> },
        { label: 'BASIC', value: barberias.filter(b => b.plan === 'BASIC').length, bg: 'bg-blue-50', color: 'text-blue-700', icon: <TrendingUp size={18} className="text-blue-500" /> },
        { label: 'PRO', value: barberias.filter(b => b.plan === 'PRO').length, bg: 'bg-yellow-50', color: 'text-yellow-700', icon: <span className="text-base">⭐</span> },
    ];

    return (
        <div className="space-y-8 animate-slide-in">
            {/* HEADER */}
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">SuperAdmin / Suscripciones</p>
                    <h1 className="text-3xl font-black text-gray-900">Gestión de Suscripciones</h1>
                    <p className="text-gray-500 text-sm mt-1">Administra planes y pagos de todas las barberías</p>
                </div>
                <button onClick={loadBarberias} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Actualizar
                </button>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(s => (
                    <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 ${s.bg} rounded-xl`}>{s.icon}</div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{s.label}</p>
                                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* FILTERS */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[240px]">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-all"
                    />
                </div>
                <div className="relative">
                    <select
                        value={planFilter}
                        onChange={e => setPlanFilter(e.target.value)}
                        className="appearance-none pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-gray-400 transition-all cursor-pointer"
                    >
                        <option value="">Todos los planes</option>
                        {plans.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {(search || planFilter) && (
                    <button onClick={() => { setSearch(''); setPlanFilter(''); }} className="flex items-center gap-1 text-xs text-red-500 font-semibold hover:text-red-700">
                        <X size={12} /> Limpiar
                    </button>
                )}
            </div>

            {/* TABLE */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 bg-gray-50">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                        {filtered.length} barbería{filtered.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-50">
                                {['Barbería', 'Email', 'Plan', 'Estado', 'Método', ''].map((h, i) => (
                                    <th key={i} className={`px-5 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest ${i === 5 ? 'text-right' : ''}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i} className="border-b border-gray-50">
                                        {Array.from({ length: 6 }).map((_, j) => (
                                            <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                                        ))}
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="6" className="py-16 text-center text-gray-400 text-sm">No se encontraron barberías</td></tr>
                            ) : filtered.map(b => (
                                <tr key={b._id} className="border-b border-gray-50 hover:bg-gray-50 transition-all group">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center text-white font-black text-sm">{b.nombre?.charAt(0)}</div>
                                            <span className="font-bold text-gray-900 text-sm">{b.nombre}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-gray-500 text-sm">{b.email}</td>
                                    <td className="px-5 py-4"><PlanBadge plan={b.plan} /></td>
                                    <td className="px-5 py-4"><StatusBadge status={b.subscriptionStatus} /></td>
                                    <td className="px-5 py-4 text-gray-400 text-xs font-mono">{b.paymentMethod || 'STRIPE'}</td>
                                    <td className="px-5 py-4 text-right">
                                        <button
                                            onClick={() => { setSelectedBarberia(b); setModalOpen(true); }}
                                            className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all ml-auto"
                                        >
                                            <Edit size={13} /> Gestionar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedBarberia && (
                <GestionSuscripcionModal open={modalOpen} onClose={() => { setModalOpen(false); setSelectedBarberia(null); }} barberia={selectedBarberia} onSuccess={() => { loadBarberias(); setModalOpen(false); setSelectedBarberia(null); }} />
            )}
        </div>
    );
}
