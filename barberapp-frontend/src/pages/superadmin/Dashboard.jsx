import { useEffect, useState } from "react";
import { getDashboardSuperAdmin } from "../../services/superAdminService";
import {
    TrendingUp, TrendingDown, DollarSign, Users,
    AlertCircle, Calendar, ArrowUpRight, Activity,
    CheckCircle, Clock, Zap
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// ─── KPI CARD ─────────────────────────────────────────────────────────────────
function KPICard({ icon, label, value, change, trend, sub, color = "text-gray-900", bg = "bg-gray-50", accent }) {
    return (
        <div className={`bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all ${accent || 'border-gray-100'}`}>
            <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 ${bg} rounded-xl`}>{icon}</div>
                {change !== undefined && (
                    <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {trend === 'up' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {change}
                    </span>
                )}
            </div>
            <p className={`text-3xl font-black ${color}`}>{value}</p>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-1">{label}</p>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
    );
}

// ─── ALERT ROW ────────────────────────────────────────────────────────────────
function AlertRow({ b }) {
    const urgent = b.diasRestantes <= 3;
    return (
        <div className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0 group">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-white font-black text-sm">
                    {b.nombre.charAt(0)}
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-900">{b.nombre}</p>
                    <p className="text-xs text-gray-400">{b.email}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-black ${urgent ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
                    {b.diasRestantes}d restantes
                </span>
                <p className="text-xs text-gray-400">{new Date(b.proximoPago).toLocaleDateString('es-ES')}</p>
            </div>
        </div>
    );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function SuperAdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchStats(); }, []);

    async function fetchStats() {
        try {
            setLoading(true);
            const res = await getDashboardSuperAdmin();
            setData(res);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <DashboardSkeleton />;

    const mrrGrowth = data.mrr?.growth || 0;
    const convRate = data.trial > 0 ? Math.round((data.activas / (data.activas + data.trial)) * 100) : 0;

    return (
        <div className="space-y-8 animate-slide-in">
            {/* HEADER */}
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">SuperAdmin / Dashboard</p>
                    <h1 className="text-3xl font-black text-gray-900">Vista General del Sistema</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {format(new Date(), "EEEE, d 'de' MMMM yyyy", { locale: es })}
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-xl">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-black text-green-700 uppercase tracking-wide">Sistema Operativo</span>
                </div>
            </div>

            {/* MRR HERO */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/3 rounded-full blur-2xl" />
                <div className="relative grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-white/10 rounded-lg"><DollarSign size={18} className="text-white" /></div>
                            <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Monthly Recurring Revenue</span>
                        </div>
                        <h2 className="text-6xl font-black text-white tracking-tighter">
                            ${(data.mrr?.total || 0).toLocaleString()}
                        </h2>
                        <div className={`flex items-center gap-2 mt-3 ${mrrGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {mrrGrowth >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                            <span className="font-black text-lg">{mrrGrowth >= 0 ? '+' : ''}{mrrGrowth}%</span>
                            <span className="text-white/40 text-xs">vs mes anterior</span>
                        </div>
                        <p className="text-white/40 text-xs mt-2">
                            Proyección anual: <span className="text-white/70 font-bold">${((data.mrr?.arr || 0)).toLocaleString()}</span>
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Total Barberías', value: data.totalBarberias, icon: <Users size={16} className="text-white/60" /> },
                            { label: 'Conversión', value: `${convRate}%`, icon: <Zap size={16} className="text-white/60" /> },
                            { label: 'Churn Rate', value: `${data.churnRate || 0}%`, icon: <Activity size={16} className="text-white/60" /> },
                            { label: 'En Trial', value: data.trial, icon: <Clock size={16} className="text-white/60" /> },
                        ].map(m => (
                            <div key={m.label} className="bg-white/10 rounded-xl p-4">
                                <div className="flex items-center gap-1.5 mb-2">{m.icon}<p className="text-white/50 text-[10px] uppercase font-bold tracking-wide">{m.label}</p></div>
                                <p className="text-white font-black text-2xl">{m.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* KPI GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard icon={<CheckCircle size={20} className="text-green-500" />} bg="bg-green-50" label="Barberías Activas" value={data.activas} change={`+${data.trends?.activas || 0}`} trend="up" color="text-green-700" />
                <KPICard icon={<Clock size={20} className="text-yellow-500" />} bg="bg-yellow-50" label="En Trial" value={data.trial} color="text-yellow-700" />
                <KPICard icon={<ArrowUpRight size={20} className="text-blue-500" />} bg="bg-blue-50" label="Nuevas Este Mes" value={data.nuevasEsteMes} change={`+${data.trends?.nuevas || 0}`} trend="up" color="text-blue-700" />
                <KPICard icon={<AlertCircle size={20} className="text-red-500" />} bg="bg-red-50" label="Suspendidas" value={data.suspendidas} color="text-red-700" />
            </div>

            {/* ALERTS + EMPTY STATE */}
            {data.proximasVencer?.length > 0 ? (
                <div className="bg-white border border-yellow-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 bg-yellow-50 border-b border-yellow-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 rounded-lg"><AlertCircle size={18} className="text-yellow-600" /></div>
                            <div>
                                <p className="font-bold text-gray-900 text-sm">Alertas de Vencimiento</p>
                                <p className="text-xs text-gray-500">{data.proximasVencer.length} barberías requieren atención</p>
                            </div>
                        </div>
                        <span className="text-xs font-black bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full">{data.proximasVencer.length} alertas</span>
                    </div>
                    <div className="px-6 py-2">
                        {data.proximasVencer.map(b => <AlertRow key={b.id} b={b} />)}
                    </div>
                </div>
            ) : (
                <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={28} className="text-green-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">¡Todo en orden!</h3>
                    <p className="text-gray-400 text-sm">No hay barberías próximas a vencer</p>
                </div>
            )}
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="h-8 w-64 bg-gray-200 rounded-xl" />
            <div className="h-56 bg-gray-200 rounded-2xl" />
            <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl" />)}
            </div>
        </div>
    );
}