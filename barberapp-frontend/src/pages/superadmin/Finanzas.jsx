import { useEffect, useState } from "react";
import { getBarberias } from "../../services/superAdminService";
import { DollarSign, TrendingUp, Package, Zap, Calendar, RefreshCw, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const PLAN_PRICES = { basico: 29990, premium: 49990, pro: 79990 };
const fmt = n => new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(n);

function MetricCard({ icon, label, value, sub, bg = "bg-gray-50", color = "text-gray-900" }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2.5 ${bg} rounded-xl`}>{icon}</div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</p>
      </div>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function Finanzas() {
  const [barberias, setBarberias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ totalMRR: 0, byPlan: { basico: { count: 0, mrr: 0 }, premium: { count: 0, mrr: 0 }, pro: { count: 0, mrr: 0 } }, proximosPagos: [] });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await getBarberias({ limit: 1000 });
      const all = data.barberias || [];
      setBarberias(all);
      calculateMetrics(all);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const calculateMetrics = (list) => {
    let totalMRR = 0;
    const byPlan = { basico: { count: 0, mrr: 0 }, premium: { count: 0, mrr: 0 }, pro: { count: 0, mrr: 0 } };
    list.forEach(b => {
      if (b.estado === "activa" && b.plan !== "trial") {
        const p = PLAN_PRICES[b.plan] || 0;
        totalMRR += p;
        if (byPlan[b.plan]) { byPlan[b.plan].count++; byPlan[b.plan].mrr += p; }
      }
    });
    const hoy = new Date(), en30 = new Date(); en30.setDate(en30.getDate() + 30);
    const proximosPagos = list.filter(b => { if (!b.proximoPago) return false; const f = new Date(b.proximoPago); return f >= hoy && f <= en30; }).sort((a, b) => new Date(a.proximoPago) - new Date(b.proximoPago)).slice(0, 10);
    setMetrics({ totalMRR, byPlan, proximosPagos });
  };

  if (loading) return <div className="space-y-6 animate-pulse">{[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl" />)}</div>;

  const activas = barberias.filter(b => b.estado === 'activa').length;
  const generando = barberias.filter(b => b.estado === 'activa' && b.plan !== 'trial').length;

  return (
    <div className="space-y-8 animate-slide-in">
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">SuperAdmin / Finanzas</p>
          <h1 className="text-3xl font-black text-gray-900">Panel Financiero</h1>
          <p className="text-gray-500 text-sm mt-1">Métricas de ingresos y suscripciones activas</p>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
          <RefreshCw size={16} /> Actualizar
        </button>
      </div>

      {/* MRR HERO */}
      <div className="bg-gradient-to-br from-emerald-600 to-green-700 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="relative grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-white/10 rounded-lg"><DollarSign size={18} className="text-white" /></div>
              <span className="text-white/60 text-xs font-bold uppercase tracking-widest">MRR Total</span>
            </div>
            <h2 className="text-5xl font-black text-white">{fmt(metrics.totalMRR)}</h2>
            <p className="text-white/50 text-sm mt-2">Proyección anual: <span className="text-white/80 font-bold">{fmt(metrics.totalMRR * 12)}</span></p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Activas', value: activas, color: 'text-white' },
              { label: 'Generando', value: generando, color: 'text-white' },
              { label: 'Conversión', value: barberias.length > 0 ? `${Math.round((generando / barberias.length) * 100)}%` : '0%', color: 'text-white' },
              { label: 'Total', value: barberias.length, color: 'text-white' },
            ].map(m => (
              <div key={m.label} className="bg-white/10 rounded-xl p-4">
                <p className="text-white/50 text-[10px] uppercase font-bold tracking-wide mb-1">{m.label}</p>
                <p className={`font-black text-2xl ${m.color}`}>{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PLAN BREAKDOWN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard icon={<Package size={20} className="text-blue-500" />} bg="bg-blue-50" label="Plan Básico" value={metrics.byPlan.basico.count} sub={`${fmt(metrics.byPlan.basico.mrr)}/mes`} color="text-blue-700" />
        <MetricCard icon={<TrendingUp size={20} className="text-purple-500" />} bg="bg-purple-50" label="Plan Premium" value={metrics.byPlan.premium.count} sub={`${fmt(metrics.byPlan.premium.mrr)}/mes`} color="text-purple-700" />
        <MetricCard icon={<Zap size={20} className="text-yellow-500" />} bg="bg-yellow-50" label="Plan Pro" value={metrics.byPlan.pro.count} sub={`${fmt(metrics.byPlan.pro.mrr)}/mes`} color="text-yellow-700" />
      </div>

      {/* PRÓXIMOS PAGOS */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><Calendar size={16} className="text-blue-500" /></div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Próximos Pagos</p>
              <p className="text-xs text-gray-400">Vencimientos en los próximos 30 días</p>
            </div>
          </div>
          <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">{metrics.proximosPagos.length} pagos</span>
        </div>

        {metrics.proximosPagos.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-400 text-sm">No hay pagos programados en los próximos 30 días</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Barbería', 'Plan', 'Monto', 'Fecha', 'Días'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {metrics.proximosPagos.map(b => {
                  const dias = Math.ceil((new Date(b.proximoPago) - new Date()) / (1000 * 60 * 60 * 24));
                  return (
                    <tr key={b._id} className="hover:bg-gray-50 transition-all">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center text-white font-bold text-xs">{b.nombre.charAt(0)}</div>
                          <span className="font-semibold text-gray-900 text-sm">{b.nombre}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm capitalize">{b.plan}</td>
                      <td className="px-6 py-4 text-green-600 font-bold text-sm">{fmt(PLAN_PRICES[b.plan] || 0)}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{format(new Date(b.proximoPago), 'dd MMM yyyy', { locale: es })}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-black px-2 py-1 rounded-full ${dias <= 7 ? 'bg-red-50 text-red-600' : dias <= 14 ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'}`}>
                          {dias}d
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ESTADO BREAKDOWN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: 'Por Estado', rows: [
              { label: 'Activas', v: barberias.filter(b => b.estado === 'activa').length, c: 'text-green-600' },
              { label: 'En Trial', v: barberias.filter(b => b.estado === 'trial').length, c: 'text-yellow-600' },
              { label: 'Suspendidas', v: barberias.filter(b => b.estado === 'suspendida').length, c: 'text-red-600' },
            ]
          },
          {
            title: 'Por Plan', rows: [
              { label: 'Trial', v: barberias.filter(b => b.plan === 'trial').length, c: 'text-gray-600' },
              { label: 'Básico', v: barberias.filter(b => b.plan === 'basico').length, c: 'text-blue-600' },
              { label: 'Premium', v: barberias.filter(b => b.plan === 'premium').length, c: 'text-purple-600' },
              { label: 'Pro', v: barberias.filter(b => b.plan === 'pro').length, c: 'text-yellow-600' },
            ]
          },
          {
            title: 'Resumen', rows: [
              { label: 'Total Barberías', v: barberias.length, c: 'text-gray-900' },
              { label: 'Generando Ingresos', v: generando, c: 'text-green-600' },
              { label: 'Tasa Conversión', v: barberias.length > 0 ? `${Math.round((generando / barberias.length) * 100)}%` : '0%', c: 'text-blue-600' },
            ]
          },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">{s.title}</p>
            <div className="space-y-3">
              {s.rows.map(r => (
                <div key={r.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{r.label}</span>
                  <span className={`font-black text-sm ${r.c}`}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}