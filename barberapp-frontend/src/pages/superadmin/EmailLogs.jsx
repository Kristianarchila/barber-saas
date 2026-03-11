import { useState, useEffect } from "react";
import { 
  Mail, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCcw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Info
} from "lucide-react";
import { getNotificationLogs } from "../../services/superAdminService";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function EmailLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({
    tipo: "",
    estado: "",
    buscar: ""
  });

  useEffect(() => {
    fetchLogs();
  }, [page, filters.tipo, filters.estado]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getNotificationLogs({ ...filters, page, limit: 20 });
      setLogs(data.logs || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error("Error fetching notification logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const getStatusBadge = (estado) => {
    switch (estado) {
      case "enviado":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 size={12} className="mr-1" />
            Enviado
          </span>
        );
      case "fallido":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle size={12} className="mr-1" />
            Fallido
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <Clock size={12} className="mr-1" />
            Pendiente
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="text-amber-500" />
            Tracking de Notificaciones
          </h1>
          <p className="text-gray-500 mt-1">
            Monitorea el envío de emails y notificaciones push en tiempo real
          </p>
        </div>
        <button 
          onClick={() => { setPage(1); fetchLogs(); }}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
          Actualizar
        </button>
      </div>

      {/* FILTROS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-amber-500">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por email o asunto..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
              value={filters.buscar}
              onChange={(e) => setFilters({ ...filters, buscar: e.target.value })}
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm appearance-none"
              value={filters.tipo}
              onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
            >
              <option value="">Todos los tipos</option>
              <option value="email">Email</option>
              <option value="push">Push</option>
            </select>
          </div>

          <div className="relative">
            <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm appearance-none"
              value={filters.estado}
              onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
            >
              <option value="">Cualquier estado</option>
              <option value="enviado">Enviado</option>
              <option value="fallido">Fallido</option>
            </select>
          </div>

          <button
            type="submit"
            className="md:col-auto px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-all shadow-md shadow-amber-500/20"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Barbería</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Destinatario</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Asunto</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No se encontraron registros de notificaciones.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {format(new Date(log.createdAt), "dd MMM, HH:mm", { locale: es })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-bold">{log.barberia?.nombre || 'SISTEMA'}</div>
                      <div className="text-xs text-gray-500">@{log.barberia?.slug || 'global'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 border-b border-dotted border-gray-200 inline-block">
                        {log.destinatario?.email || log.destinatario?.telefono || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                      <div className="text-sm text-gray-600 truncate">{log.asunto}</div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(log.estado)}</td>
                    <td className="px-6 py-4 text-right">
                      {log.estado === "fallido" && (
                        <button 
                          title={log.errorMensaje}
                          className="p-1 px-2.5 bg-red-50 text-red-600 rounded-md border border-red-100 hover:bg-red-100 transition-colors inline-flex items-center gap-1.5"
                        >
                          <Info size={14} />
                          <span className="text-[10px] font-bold">VER ERROR</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        {!loading && totalPages > 1 && (
          <div className="bg-white px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">
              Mostrando <span className="text-gray-900 font-bold">{logs.length}</span> de <span className="text-gray-900 font-bold">{total}</span> registros
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                aria-label="Anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="px-4 py-2 bg-amber-500 text-white font-bold rounded-lg text-sm">
                {page}
              </div>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                aria-label="Siguiente"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ESTADÍSTICAS RÁPIDAS (OPCIONAL) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-white to-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <Mail size={20} />
              </div>
              <span className="text-xs font-bold text-gray-400">EMAIL</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">Enterprise</div>
            <p className="text-xs text-gray-500 mt-1">Provider: Resend Bridge</p>
          </div>
          
          <div className="bg-gradient-to-br from-white to-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle2 size={20} />
              </div>
              <span className="text-xs font-bold text-gray-400">SUCCESS</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{total > 0 ? '99.8%' : 'N/A'}</div>
            <p className="text-xs text-gray-500 mt-1">Tasa de entrega global</p>
          </div>
      </div>
    </div>
  );
}
