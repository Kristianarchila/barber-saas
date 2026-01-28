import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus, Search, Filter, Calendar,
  History, UserPlus, ShieldAlert,
  Eye, X, User, CreditCard, ExternalLink,
  CheckCircle, MoreHorizontal, Sparkles
} from "lucide-react";
import {
  getBarberias,
  cambiarEstadoBarberia,
  extenderPlazoBarberia,
  getHistorialBarberia
} from "../../services/superAdminService";

export default function Barberias() {
  const [barberias, setBarberias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [busqueda, setBusqueda] = useState("");

  // Estados para Modales/Paneles
  const [historial, setHistorial] = useState(null);
  const [barberiaSeleccionada, setBarberiaSeleccionada] = useState(null);

  const cargarBarberias = async () => {
    try {
      setLoading(true);
      const data = await getBarberias({
        estado: filtroEstado || undefined,
        busqueda: busqueda || undefined
      });
      setBarberias(data.barberias || []);
    } catch (err) {
      setError("No se pudieron cargar las barberías");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarBarberias();
  }, [filtroEstado, busqueda]);

  const cambiarEstado = async (id, estado) => {
    if (!confirm(`¿Cambiar estado a ${estado}?`)) return;
    await cambiarEstadoBarberia(id, estado);
    cargarBarberias();
    if (barberiaSeleccionada?._id === id) setBarberiaSeleccionada(null);
  };

  const extender = async (id, dias) => {
    await extenderPlazoBarberia(id, dias, `Extensión manual de ${dias} días`);
    alert(`Se han añadido ${dias} días con éxito.`);
    cargarBarberias();
  };

  const verHistorial = async (id) => {
    const data = await getHistorialBarberia(id);
    setHistorial(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Sparkles className="text-white" size={24} />
              </div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                Sistemas <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">Activos</span>
              </h1>
            </div>
            <p className="text-gray-600 text-sm font-medium ml-15">Panel de control y monitoreo de licencias</p>
          </div>

          <Link
            to="/superadmin/dashboard/barberias/crear"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-4 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 active:scale-95"
          >
            <Plus size={20} /> Nueva Barbería
          </Link>
        </div>

        {/* --- FILTROS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-purple-100 shadow-xl shadow-purple-100/50">
          <div className="relative md:col-span-2">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-purple-400" size={20} />
            <input
              className="w-full bg-white border-2 border-purple-100 p-4 pl-14 rounded-2xl text-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-gray-900 placeholder:text-gray-400 font-medium"
              placeholder="Buscar por nombre, slug o dueño..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <select
            className="bg-white border-2 border-purple-100 p-4 rounded-2xl text-sm text-gray-700 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 font-medium cursor-pointer"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="">Todos los Estados</option>
            <option value="activa">Activas</option>
            <option value="trial">Periodo Trial</option>
            <option value="suspendida">Suspendidas</option>
          </select>
        </div>

        {/* --- TABLA PRINCIPAL --- */}
        <div className="bg-white/90 backdrop-blur-xl border-2 border-purple-100 rounded-3xl overflow-hidden shadow-2xl shadow-purple-100/50">
          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-200 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
              </div>
              <p className="text-purple-600 font-bold animate-pulse text-sm uppercase tracking-widest mt-6">Cargando sistemas...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-50 to-purple-100/50 border-b-2 border-purple-100">
                    <th className="px-8 py-6 text-left text-xs font-black text-purple-900 uppercase tracking-wider">Cliente</th>
                    <th className="px-8 py-6 text-left text-xs font-black text-purple-900 uppercase tracking-wider">Suscripción</th>
                    <th className="px-8 py-6 text-center text-xs font-black text-purple-900 uppercase tracking-wider">Vencimiento</th>
                    <th className="px-8 py-6 text-right text-xs font-black text-purple-900 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100">
                  {barberias.map((b) => (
                    <tr key={b._id} className="hover:bg-purple-50/50 transition-all duration-200 group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 group-hover:scale-110 transition-all">
                            {b.nombre.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 group-hover:text-purple-700 transition-colors">{b.nombre}</p>
                            <p className="text-xs text-gray-500 font-medium">ID: {b.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase border-2 ${b.estado === 'activa' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          b.estado === 'trial' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                          <div className={`w-2 h-2 rounded-full ${b.estado === 'activa' ? 'bg-emerald-500' :
                            b.estado === 'trial' ? 'bg-amber-500' :
                              'bg-rose-500'
                            }`} />
                          {b.estado}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-sm font-bold text-gray-900">
                            {b.proximoPago ? new Date(b.proximoPago).toLocaleDateString() : "INFINITO"}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">Próximo pago</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setBarberiaSeleccionada(b)}
                            className="p-3 bg-purple-100 hover:bg-purple-600 text-purple-600 hover:text-white rounded-xl transition-all border-2 border-purple-200 hover:border-purple-600 hover:shadow-lg hover:shadow-purple-500/30"
                            title="Ver detalles"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => verHistorial(b._id)}
                            className="p-3 bg-purple-100 hover:bg-purple-600 text-purple-600 hover:text-white rounded-xl transition-all border-2 border-purple-200 hover:border-purple-600 hover:shadow-lg hover:shadow-purple-500/30"
                            title="Ver historial"
                          >
                            <History size={18} />
                          </button>
                          <button
                            onClick={() => extender(b._id, 30)}
                            className="px-5 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl text-xs font-black uppercase transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105"
                          >
                            +30 Días
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* --- PANEL LATERAL DE INSPECCIÓN --- */}
        {barberiaSeleccionada && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-purple-900/20 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setBarberiaSeleccionada(null)} />
            <div className="absolute inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl border-l-4 border-purple-600 p-10 flex flex-col animate-in slide-in-from-right duration-500">

              <div className="flex justify-between items-start mb-10">
                <div className="h-24 w-24 bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl flex items-center justify-center text-5xl font-black text-white shadow-2xl shadow-purple-500/40 uppercase">
                  {barberiaSeleccionada.nombre.charAt(0)}
                </div>
                <button onClick={() => setBarberiaSeleccionada(null)} className="p-3 bg-purple-100 hover:bg-rose-100 text-purple-600 hover:text-rose-600 rounded-2xl transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 space-y-8 overflow-y-auto pr-2">
                <section>
                  <h2 className="text-3xl font-black text-gray-900 mb-2">{barberiaSeleccionada.nombre}</h2>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 font-mono text-xs rounded-lg font-bold">ID_{barberiaSeleccionada.slug}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600 text-xs font-bold uppercase">{barberiaSeleccionada.plan || 'Plan Standard'}</span>
                  </div>
                </section>

                {/* STATS */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border-2 border-purple-200 shadow-lg">
                    <p className="text-xs text-purple-600 uppercase font-black tracking-wide">Uso del Sistema</p>
                    <p className="text-3xl font-black text-purple-900 mt-2">88%</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border-2 border-purple-200 shadow-lg">
                    <p className="text-xs text-purple-600 uppercase font-black tracking-wide">Staff Activo</p>
                    <p className="text-3xl font-black text-purple-900 mt-2">{barberiaSeleccionada.barberosCount || 4}</p>
                  </div>
                </div>

                {/* URL PÚBLICA */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-purple-600 uppercase tracking-wide flex items-center gap-2">
                    <ExternalLink size={16} className="text-purple-600" /> URL Pública
                  </h3>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border-2 border-blue-200 shadow-lg">
                    <p className="text-xs text-blue-600 font-bold uppercase mb-2">Página de Reservas</p>
                    <a
                      href={`${import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173'}/${barberiaSeleccionada.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-700 font-mono font-bold hover:text-blue-900 hover:underline break-all flex items-center gap-2"
                    >
                      <span>{`${import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173'}/${barberiaSeleccionada.slug}`}</span>
                      <ExternalLink size={14} className="flex-shrink-0" />
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173'}/${barberiaSeleccionada.slug}`);
                        alert('URL copiada al portapapeles');
                      }}
                      className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-xs font-bold transition-all"
                    >
                      📋 Copiar URL
                    </button>
                  </div>
                </div>

                {/* DUEÑO */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-purple-600 uppercase tracking-wide flex items-center gap-2">
                    <User size={16} className="text-purple-600" /> Titular de Licencia
                  </h3>
                  <div className="bg-purple-50/50 p-6 rounded-2xl border-2 border-purple-100 space-y-4">
                    <div>
                      <p className="text-xs text-purple-600 font-bold uppercase mb-1">Correo Electrónico</p>
                      <p className="text-sm text-gray-900 font-semibold">{barberiaSeleccionada.email || 'contacto@barber.com'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-purple-600 font-bold uppercase mb-1">Fecha de Alta</p>
                      <p className="text-sm text-gray-900 font-semibold">
                        {barberiaSeleccionada.createdAt
                          ? new Date(barberiaSeleccionada.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                          : 'No disponible'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* SUSCRIPCIÓN */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-purple-600 uppercase tracking-wide flex items-center gap-2">
                    <CreditCard size={16} className="text-purple-600" /> Salud de Suscripción
                  </h3>
                  <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl border-2 border-purple-200 shadow-lg">
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <p className="text-xs text-purple-600 font-bold uppercase mb-1">Estado Actual</p>
                        <p className="text-2xl font-black text-purple-900 capitalize">{barberiaSeleccionada.estado}</p>
                      </div>
                      <span className={`px-4 py-2 text-xs font-black rounded-xl uppercase border-2 ${barberiaSeleccionada.estado === 'activa'
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        : barberiaSeleccionada.estado === 'trial'
                          ? 'bg-amber-100 text-amber-700 border-amber-200'
                          : 'bg-rose-100 text-rose-700 border-rose-200'
                        }`}>
                        {barberiaSeleccionada.estado === 'activa' ? 'Al día' : barberiaSeleccionada.estado}
                      </span>
                    </div>
                    {barberiaSeleccionada.proximoPago && (
                      <div className="mt-3 pt-3 border-t border-purple-200">
                        <p className="text-xs text-purple-600 font-bold uppercase mb-1">Próximo Pago</p>
                        <p className="text-sm text-gray-900 font-semibold">
                          {new Date(barberiaSeleccionada.proximoPago).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ACCIONES */}
              <div className="mt-8 pt-8 border-t-2 border-purple-100 space-y-3">
                {/* Botón principal de activar/suspender */}
                {barberiaSeleccionada.estado !== 'activa' ? (
                  <button
                    onClick={() => cambiarEstado(barberiaSeleccionada._id, 'activa')}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-wide transition-all shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105"
                  >
                    <CheckCircle size={20} /> Activar Barbería
                  </button>
                ) : (
                  <button
                    onClick={() => cambiarEstado(barberiaSeleccionada._id, 'suspendida')}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-wide transition-all shadow-xl shadow-rose-500/30 hover:shadow-rose-500/50 hover:scale-105"
                  >
                    <ShieldAlert size={20} /> Suspender Barbería
                  </button>
                )}

                {/* Botones secundarios */}
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`${import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173'}/${barberiaSeleccionada.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-purple-100 hover:bg-purple-600 text-purple-700 hover:text-white py-4 rounded-2xl font-bold text-xs uppercase border-2 border-purple-200 hover:border-purple-600 transition-all hover:shadow-lg"
                  >
                    <ExternalLink size={16} /> Ver Página
                  </a>
                  <button className="flex items-center justify-center gap-2 bg-purple-100 hover:bg-purple-600 text-purple-700 hover:text-white py-4 rounded-2xl font-bold text-xs uppercase border-2 border-purple-200 hover:border-purple-600 transition-all hover:shadow-lg">
                    <MoreHorizontal size={16} /> Más
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- MODAL HISTORIAL --- */}
        {historial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-purple-900/30 backdrop-blur-xl animate-in fade-in" onClick={() => setHistorial(null)}></div>
            <div className="relative bg-white border-4 border-purple-200 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
              <div className="p-8 border-b-2 border-purple-100 bg-gradient-to-r from-purple-50 to-purple-100 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                    <History className="text-purple-600" size={28} />
                    Logs del Sistema
                  </h2>
                  <p className="text-purple-600 text-sm font-bold mt-1">Historial de {historial.nombre}</p>
                </div>
                <button onClick={() => setHistorial(null)} className="p-3 bg-white hover:bg-purple-100 text-purple-600 rounded-2xl transition-all border-2 border-purple-200">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4">
                {historial.historial.map((h, i) => (
                  <div key={i} className="relative pl-10 border-l-4 border-purple-200 py-2">
                    <div className="absolute -left-[13px] top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-4 border-purple-600 rounded-full shadow-lg" />
                    <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl border-2 border-purple-100 hover:border-purple-300 hover:shadow-lg transition-all">
                      <p className="text-sm font-black text-purple-700 uppercase tracking-wide">{h.accion}</p>
                      <p className="text-sm text-gray-700 mt-2 font-medium">"{h.notas}"</p>
                      <div className="flex items-center gap-2 mt-4 text-xs text-purple-600 font-bold">
                        <Calendar size={14} /> {new Date(h.fecha).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-8 bg-gradient-to-r from-purple-50 to-purple-100 border-t-2 border-purple-200">
                <button
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wide transition-all shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105"
                  onClick={() => setHistorial(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}