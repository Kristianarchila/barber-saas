import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Plus, Search, Calendar, History, ShieldAlert,
  Eye, X, User, CreditCard, ExternalLink,
  CheckCircle, ChevronDown, RefreshCw, Store
} from "lucide-react";
import {
  getBarberias,
  cambiarEstadoBarberia,
  extenderPlazoBarberia,
  getHistorialBarberia
} from "../../services/superAdminService";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
const STATUS = {
  activa: { dot: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Activa' },
  trial: { dot: 'bg-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', label: 'Trial' },
  suspendida: { dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Suspendida' },
};

function StatusBadge({ estado }) {
  const s = STATUS[estado] || STATUS.suspendida;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ─── DETAIL DRAWER ────────────────────────────────────────────────────────────
function DetailDrawer({ b, onClose, onCambiarEstado, onExtender }) {
  const [extending, setExtending] = useState(false);
  const url = `${import.meta.env.VITE_FRONTEND_URL || 'http://localhost'}/${b.slug}`;

  const handleExtender = async (dias) => {
    setExtending(true);
    await onExtender(b._id, dias);
    setExtending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center text-white font-black text-2xl">{b.nombre.charAt(0)}</div>
              <div>
                <h2 className="text-xl font-black text-gray-900">{b.nombre}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge estado={b.estado} />
                  <span className="text-xs text-gray-400 font-mono">{b.plan || 'trial'}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-xl transition-all">
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Info */}
          <Section title="Información">
            <InfoRow label="Email" value={b.email || '—'} />
            <InfoRow label="Slug" value={b.slug} mono />
            <InfoRow label="Alta" value={b.createdAt ? format(new Date(b.createdAt), "dd MMM yyyy", { locale: es }) : '—'} />
          </Section>

          {/* Suscripción */}
          <Section title="Suscripción">
            <InfoRow label="Estado" value={b.estado} />
            <InfoRow label="Plan" value={b.plan || 'trial'} />
            <InfoRow label="Próximo Pago" value={b.proximoPago ? format(new Date(b.proximoPago), "dd MMM yyyy", { locale: es }) : 'Sin fecha'} />
          </Section>

          {/* URL Pública */}
          <Section title="URL Pública">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center justify-between gap-2">
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 font-mono hover:underline truncate">{url}</a>
              <button onClick={() => navigator.clipboard.writeText(url)} className="text-xs text-gray-400 hover:text-gray-700 flex-shrink-0">📋</button>
            </div>
          </Section>

          {/* Extender */}
          <Section title="Extender Plazo">
            <div className="flex gap-2">
              {[7, 15, 30].map(d => (
                <button key={d} onClick={() => handleExtender(d)} disabled={extending} className="flex-1 py-2 text-xs font-bold bg-white border border-gray-200 rounded-xl hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all disabled:opacity-50">
                  +{d}d
                </button>
              ))}
            </div>
          </Section>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 space-y-2">
          {b.estado !== 'activa' ? (
            <button onClick={() => onCambiarEstado(b._id, 'activa')} className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl transition-all">
              <CheckCircle size={16} /> Activar Barbería
            </button>
          ) : (
            <button onClick={() => onCambiarEstado(b._id, 'suspendida')} className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-all">
              <ShieldAlert size={16} /> Suspender Barbería
            </button>
          )}
          <a href={url} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-50 transition-all">
            <ExternalLink size={16} /> Ver Página Pública
          </a>
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
function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={`text-sm font-semibold text-gray-900 ${mono ? 'font-mono text-xs bg-gray-50 px-2 py-0.5 rounded' : ''}`}>{value}</span>
    </div>
  );
}

// ─── HISTORIAL MODAL ──────────────────────────────────────────────────────────
function HistorialModal({ historial, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="font-black text-gray-900">Historial</h3>
            <p className="text-xs text-gray-400 mt-0.5">{historial.nombre}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all"><X size={18} className="text-gray-500" /></button>
        </div>
        <div className="p-6 max-h-96 overflow-y-auto space-y-3">
          {historial.historial.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Sin historial registrado</p>
          ) : historial.historial.map((h, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 bg-gray-300 rounded-full mt-1.5 flex-shrink-0" />
                {i < historial.historial.length - 1 && <div className="w-px flex-1 bg-gray-100 mt-1" />}
              </div>
              <div className="pb-3 flex-1">
                <p className="text-sm font-bold text-gray-900">{h.accion}</p>
                {h.notas && <p className="text-xs text-gray-500 mt-0.5">"{h.notas}"</p>}
                <p className="text-xs text-gray-400 mt-1">{format(new Date(h.fecha), "dd MMM yyyy, HH:mm", { locale: es })}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-100">
          <button onClick={onClose} className="w-full py-2.5 text-sm font-semibold text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">Cerrar</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function Barberias() {
  const [barberias, setBarberias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [historial, setHistorial] = useState(null);
  const [barberiaSeleccionada, setBarberiaSeleccionada] = useState(null);
  const debounce = useRef(null);

  const cargarBarberias = async () => {
    try {
      setLoading(true);
      const data = await getBarberias({ estado: filtroEstado || undefined, busqueda: busqueda || undefined });
      setBarberias(data.barberias || []);
    } catch (err) { setError("No se pudieron cargar las barberías"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(cargarBarberias, 300);
  }, [filtroEstado, busqueda]);

  const cambiarEstado = async (id, estado) => {
    if (!id || !confirm(`¿Cambiar estado a ${estado}?`)) return;
    try {
      await cambiarEstadoBarberia(id, estado);
      cargarBarberias();
      if (barberiaSeleccionada?._id === id) setBarberiaSeleccionada(null);
    } catch (e) { console.error(e); }
  };

  const extender = async (id, dias) => {
    if (!id) return;
    try {
      await extenderPlazoBarberia(id, dias, `Extensión manual de ${dias} días`);
      cargarBarberias();
    } catch (e) { console.error(e); }
  };

  const verHistorial = async (id) => {
    if (!id) return;
    try {
      const data = await getHistorialBarberia(id);
      setHistorial(data);
    } catch (e) { console.error(e); }
  };

  const stats = [
    { label: 'Total', value: barberias.length, bg: 'bg-gray-50', color: 'text-gray-900', icon: <Store size={18} className="text-gray-500" /> },
    { label: 'Activas', value: barberias.filter(b => b.estado === 'activa').length, bg: 'bg-green-50', color: 'text-green-700', icon: <CheckCircle size={18} className="text-green-500" /> },
    { label: 'En Trial', value: barberias.filter(b => b.estado === 'trial').length, bg: 'bg-yellow-50', color: 'text-yellow-700', icon: <Calendar size={18} className="text-yellow-500" /> },
    { label: 'Suspendidas', value: barberias.filter(b => b.estado === 'suspendida').length, bg: 'bg-red-50', color: 'text-red-700', icon: <ShieldAlert size={18} className="text-red-500" /> },
  ];

  return (
    <div className="space-y-8 animate-slide-in">
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">SuperAdmin / Barberías</p>
          <h1 className="text-3xl font-black text-gray-900">Barberías</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de licencias y suscripciones</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={cargarBarberias} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <Link to="/superadmin/dashboard/barberias/crear" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-all">
            <Plus size={16} /> Nueva Barbería
          </Link>
        </div>
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
            placeholder="Buscar por nombre, slug o email..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-all"
          />
        </div>
        <div className="relative">
          <select
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-gray-400 transition-all cursor-pointer"
          >
            <option value="">Todos los estados</option>
            <option value="activa">Activas</option>
            <option value="trial">En Trial</option>
            <option value="suspendida">Suspendidas</option>
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* ERROR */}
      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}

      {/* TABLE */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{barberias.length} barbería{barberias.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                {['Barbería', 'Estado', 'Plan', 'Próximo Pago', ''].map((h, i) => (
                  <th key={i} className={`px-5 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest ${i === 4 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : barberias.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Store size={32} className="text-gray-200" />
                      <p className="text-gray-400 text-sm">No se encontraron barberías</p>
                    </div>
                  </td>
                </tr>
              ) : barberias.map(b => (
                <tr key={b._id} className="border-b border-gray-50 hover:bg-gray-50 transition-all group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-white font-black text-sm">{b.nombre.charAt(0)}</div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{b.nombre}</p>
                        <p className="text-xs text-gray-400 font-mono">{b.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4"><StatusBadge estado={b.estado} /></td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-lg uppercase">{b.plan || 'trial'}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {b.proximoPago ? format(new Date(b.proximoPago), 'dd MMM yyyy', { locale: es }) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => verHistorial(b._id)} className="p-2 hover:bg-gray-100 rounded-lg transition-all" title="Historial">
                        <History size={15} className="text-gray-500" />
                      </button>
                      <button onClick={() => setBarberiaSeleccionada(b)} className="p-2 hover:bg-gray-100 rounded-lg transition-all" title="Ver detalles">
                        <Eye size={15} className="text-gray-500" />
                      </button>
                      <button onClick={() => extender(b._id, 30)} className="px-3 py-1.5 text-xs font-bold bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-all">
                        +30d
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL DRAWER */}
      {barberiaSeleccionada && (
        <DetailDrawer
          b={barberiaSeleccionada}
          onClose={() => setBarberiaSeleccionada(null)}
          onCambiarEstado={cambiarEstado}
          onExtender={extender}
        />
      )}

      {/* HISTORIAL MODAL */}
      {historial && <HistorialModal historial={historial} onClose={() => setHistorial(null)} />}
    </div>
  );
}