import { useEffect, useState } from "react";
import { getBarberias } from "../../services/superAdminService";
import { DollarSign, TrendingUp, TrendingDown, Users, AlertTriangle, Calendar, RefreshCw, CheckCircle } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const PLAN_PRICES = { basico: 29990, premium: 49990, pro: 79990 };
const money = n => new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(n);

export default function Reportes() {
  const [loading, setLoading] = useState(true);
  const [barberias, setBarberias] = useState([]);
  const [kpis, setKpis] = useState({ mesActual: 0, mesAnterior: 0, crecimiento: 0, mrrActual: 0, mrrAnterior: 0, churn: 0, alertas: [] });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await getBarberias({ limit: 1000 });
      const all = data.barberias || [];
      setBarberias(all);
      calcularKPIs(all);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const calcularKPIs = (data) => {
    const hoy = new Date();
    const keyMes = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const mesActualKey = keyMes(hoy);
    const mesAnteriorKey = keyMes(new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1));
    let mesActual = 0, mesAnterior = 0, mrrActual = 0, mrrAnterior = 0, suspendidasMes = 0;
    data.forEach(b => {
      if (!b.createdAt) return;
      const key = keyMes(new Date(b.createdAt));
      if (key === mesActualKey) mesActual++;
      if (key === mesAnteriorKey) mesAnterior++;
      if (b.estado === "activa" && b.plan !== "trial") {
        const p = PLAN_PRICES[b.plan] || 0;
        if (key === mesActualKey) mrrActual += p;
        if (key === mesAnteriorKey) mrrAnterior += p;
      }
      if (b.estado === "suspendida" && key === mesActualKey) suspendidasMes++;
    });
    const crecimiento = mesAnterior === 0 ? (mesActual > 0 ? 100 : 0) : Math.round(((mesActual - mesAnterior) / mesAnterior) * 100);
    const churn = mesActual === 0 ? 0 : Math.round((suspendidasMes / mesActual) * 100);
    const en7 = new Date(); en7.setDate(en7.getDate() + 7);
    const alertas = data.filter(b => { if (!b.proximoPago || b.estado !== "activa") return false; return new Date(b.proximoPago) <= en7; });
    setKpis({ mesActual, mesAnterior, crecimiento, mrrActual, mrrAnterior, churn, alertas });
  };

  if (loading) return <div className="space-y-6 animate-pulse">{[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl" />)}</div>;

  const mrrGrowth = kpis.mrrAnterior > 0 ? Math.round(((kpis.mrrActual - kpis.mrrAnterior) / kpis.mrrAnterior) * 100) : 0;

  return (
    <div className="space-y-8 animate-slide-in">
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">SuperAdmin / Reportes</p>
          <h1 className="text-3xl font-black text-gray-900">Reportes Globales</h1>
          <p className="text-gray-500 text-sm mt-1">
            {format(new Date(), "MMMM yyyy", { locale: es })} · Análisis del sistema
          </p>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
          <RefreshCw size={16} /> Actualizar
        </button>
      </div>

      {/* MRR HERO */}
      <div className="bg-gradient-to-br from-indigo-700 to-purple-800 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="relative grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-white/10 rounded-lg"><DollarSign size={18} className="text-white" /></div>
              <span className="text-white/60 text-xs font-bold uppercase tracking-widest">MRR Este Mes</span>
            </div>
            <h2 className="text-5xl font-black text-white">{money(kpis.mrrActual)}</h2>
            <div className={`flex items-center gap-2 mt-3 ${mrrGrowth >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {mrrGrowth >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
              <span className="font-black text-lg">{mrrGrowth >= 0 ? '+' : ''}{mrrGrowth}%</span>
              <span className="text-white/40 text-xs">vs mes anterior</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Mes Anterior', value: money(kpis.mrrAnterior) },
              { label: 'Proyección Anual', value: money(kpis.mrrActual * 12) },
              { label: 'Nuevas (mes)', value: kpis.mesActual },
              { label: 'Crecimiento', value: `${kpis.crecimiento}%` },
            ].map(m => (
              <div key={m.label} className="bg-white/10 rounded-xl p-4">
                <p className="text-white/50 text-[10px] uppercase font-bold tracking-wide mb-1">{m.label}</p>
                <p className="text-white font-black text-lg">{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <Users size={20} className="text-blue-500" />, bg: 'bg-blue-50', label: 'Barberías Este Mes', value: kpis.mesActual, color: 'text-blue-700' },
          { icon: <Calendar size={20} className="text-gray-500" />, bg: 'bg-gray-50', label: 'Mes Anterior', value: kpis.mesAnterior, color: 'text-gray-700' },
          { icon: <TrendingUp size={20} className="text-green-500" />, bg: 'bg-green-50', label: 'Crecimiento', value: `${kpis.crecimiento}%`, color: kpis.crecimiento >= 0 ? 'text-green-700' : 'text-red-700' },
          { icon: <AlertTriangle size={20} className="text-orange-500" />, bg: 'bg-orange-50', label: 'Churn Rate', value: `${kpis.churn}%`, color: kpis.churn <= 5 ? 'text-green-700' : 'text-red-700' },
        ].map((c, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2.5 ${c.bg} rounded-xl`}>{c.icon}</div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{c.label}</p>
            </div>
            <p className={`text-2xl font-black ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* ALERTAS */}
      {kpis.alertas.length > 0 ? (
        <div className="bg-white border border-orange-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 bg-orange-50 border-b border-orange-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg"><AlertTriangle size={16} className="text-orange-600" /></div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Barberías en Riesgo de Vencimiento</p>
                <p className="text-xs text-gray-500">Pago vence en los próximos 7 días</p>
              </div>
            </div>
            <span className="text-xs font-black bg-orange-200 text-orange-800 px-3 py-1 rounded-full">{kpis.alertas.length}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {kpis.alertas.map(b => {
              const dias = Math.ceil((new Date(b.proximoPago) - new Date()) / (1000 * 60 * 60 * 24));
              return (
                <div key={b._id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-white font-black text-sm">{b.nombre.charAt(0)}</div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{b.nombre}</p>
                      <p className="text-xs text-gray-400">{b.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-black border ${dias <= 3 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                      {dias}d restantes
                    </span>
                    <p className="text-xs text-gray-400">{format(new Date(b.proximoPago), 'dd MMM', { locale: es })}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={24} className="text-green-500" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">¡Sin alertas activas!</h3>
          <p className="text-gray-400 text-sm">No hay barberías en riesgo de vencimiento</p>
        </div>
      )}

      {/* DISTRIBUCIÓN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: 'Por Estado', rows: [
              { l: 'Activas', v: barberias.filter(b => b.estado === 'activa').length, c: 'text-green-600' },
              { l: 'En Trial', v: barberias.filter(b => b.estado === 'trial').length, c: 'text-yellow-600' },
              { l: 'Suspendidas', v: barberias.filter(b => b.estado === 'suspendida').length, c: 'text-red-600' },
            ]
          },
          {
            title: 'Por Plan', rows: [
              { l: 'Trial', v: barberias.filter(b => b.plan === 'trial').length, c: 'text-gray-600' },
              { l: 'Básico', v: barberias.filter(b => b.plan === 'basico').length, c: 'text-blue-600' },
              { l: 'Premium', v: barberias.filter(b => b.plan === 'premium').length, c: 'text-purple-600' },
              { l: 'Pro', v: barberias.filter(b => b.plan === 'pro').length, c: 'text-yellow-600' },
            ]
          },
          {
            title: 'Resumen Global', rows: [
              { l: 'Total Barberías', v: barberias.length, c: 'text-gray-900' },
              { l: 'Generando Ingresos', v: barberias.filter(b => b.estado === 'activa' && b.plan !== 'trial').length, c: 'text-green-600' },
              { l: 'Tasa Conversión', v: barberias.length > 0 ? `${Math.round((barberias.filter(b => b.estado === 'activa' && b.plan !== 'trial').length / barberias.length) * 100)}%` : '0%', c: 'text-blue-600' },
            ]
          },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">{s.title}</p>
            <div className="space-y-3">
              {s.rows.map(r => (
                <div key={r.l} className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{r.l}</span>
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
