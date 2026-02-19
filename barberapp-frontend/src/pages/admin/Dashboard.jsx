import { useEffect, useState } from "react";
import { useSSE } from "../../hooks/useSSE";
import { useNavigate, Link, useParams } from "react-router-dom";
import { getDashboardAdmin, completarReserva, cancelarReserva } from "../../services/dashboardService";
import { Button } from "../../components/ui";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import { DollarSign, Calendar, Users, TrendingUp, CheckCircle, XCircle, Clock, Plus, ArrowUp, ArrowDown, BarChart2, Settings } from "lucide-react";
import { useApiCall } from "../../hooks/useApiCall";
import { useAsyncAction } from "../../hooks/useAsyncAction";
import { ensureArray } from "../../utils/validateData";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [shouldRefresh, setShouldRefresh] = useState(false);

  // Conectar a SSE para notificaciones en tiempo real
  const { isConnected } = useSSE({
    enabled: true,
    onEvent: (eventType, data) => {
      console.log('[Dashboard Admin] Evento SSE:', eventType, data);
      // Refrescar métricas cuando hay eventos relevantes
      if (['nueva_reserva_admin', 'cancelacion', 'reserva_completada'].includes(eventType)) {
        setShouldRefresh(true);
      }
    }
  });

  const hoyStr = new Date().toISOString().split("T")[0];
  const [fechaInicio, setFechaInicio] = useState(hoyStr);
  const [fechaFin, setFechaFin] = useState(hoyStr);

  const navigate = useNavigate();
  const { slug } = useParams();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Hook para cargar dashboard
  const { execute: fetchDashboard, loading, error } = useApiCall(
    async () => {
      return await getDashboardAdmin({ fechaInicio, fechaFin });
    },
    {
      errorMessage: 'No pudimos cargar los datos del panel',
      onSuccess: (res) => setData(res)
    }
  );

  // Hook para completar reserva
  const { execute: handleCompletar, loading: completando } = useAsyncAction(
    completarReserva,
    {
      successMessage: 'Reserva completada',
      errorMessage: 'Error al completar reserva',
      confirmMessage: '¿Deseas marcar esta cita como completada?',
      onSuccess: () => fetchDashboard()
    }
  );

  // Hook para cancelar reserva
  const { execute: handleCancelar, loading: cancelando } = useAsyncAction(
    cancelarReserva,
    {
      successMessage: 'Reserva cancelada',
      errorMessage: 'Error al cancelar reserva',
      confirmMessage: '¿Deseas cancelar esta cita?',
      onSuccess: () => fetchDashboard()
    }
  );

  useEffect(() => {
    if (user.rol !== "BARBERIA_ADMIN") {
      navigate("/login");
      return;
    }
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaInicio, fechaFin]);

  // Auto-refresh cuando hay cambios
  useEffect(() => {
    if (shouldRefresh) {
      fetchDashboard();
      setShouldRefresh(false);
    }
  }, [shouldRefresh]);

  const formatearMoneda = (valor) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0
    }).format(valor || 0);

  if (loading && !data) {
    return <LoadingSpinner label="Cargando tu panel de control..." fullPage />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <ErrorMessage
          title="Error en el Dashboard"
          message={error}
          onRetry={fetchDashboard}
        />
      </div>
    );
  }

  const reservas = ensureArray(data?.ultimasReservas);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2">
      {/* HEADER SECTION */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="heading-1 flex items-center gap-3">
            <BarChart2 className="text-blue-600" size={32} />
            Panel Operativo
          </h1>
          <p className="body-large text-gray-600 mt-2">
            Métricas de rendimiento y gestión de citas diaria
          </p>
        </div>

        {/* Date Range Picker - Refined Design */}
        <div className="flex items-center gap-2 bg-white border border-gray-100 shadow-sm rounded-2xl p-2 h-fit">
          <div className="flex flex-col px-3 border-r border-gray-100">
            <label className="caption text-gray-400 font-bold uppercase tracking-tighter mb-0.5">Desde</label>
            <input
              type="date"
              className="border-none p-0 text-sm font-bold focus:ring-0 w-32 outline-none"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>
          <div className="flex flex-col px-3">
            <label className="caption text-gray-400 font-bold uppercase tracking-tighter mb-0.5">Hasta</label>
            <input
              type="date"
              className="border-none p-0 text-sm font-bold focus:ring-0 w-32 outline-none"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* KPI CARDS - Stripe-inspired high contrast */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card: Ingresos */}
        <div className="card card-padding relative overflow-hidden group hover:shadow-lg transition-all border-none shadow-sm ring-1 ring-gray-100">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6">
              <DollarSign size={24} />
            </div>
            <p className="caption text-gray-500 font-bold uppercase tracking-widest">Ingresos Totales</p>
            <h3 className="text-3xl font-black text-gray-900 mt-2 tracking-tight">
              {formatearMoneda(data?.ingresosPeriodo || 0)}
            </h3>
            <div className="mt-4 flex items-center gap-2 bg-green-50 w-fit px-2 py-1 rounded-lg">
              <ArrowUp size={14} className="text-green-600" />
              <span className="text-xs font-bold text-green-600">+12% vs ayer</span>
            </div>
          </div>
        </div>

        {/* Card: Citas */}
        <div className="card card-padding relative overflow-hidden group hover:shadow-lg transition-all border-none shadow-sm ring-1 ring-gray-100">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-50/50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 mb-6">
              <Calendar size={24} />
            </div>
            <p className="caption text-gray-500 font-bold uppercase tracking-widest">Citas Registradas</p>
            <h3 className="text-3xl font-black text-gray-900 mt-2 tracking-tight">
              {data?.totalReservas || 0}
            </h3>
            <div className="mt-4 flex items-center gap-2 bg-green-50 w-fit px-2 py-1 rounded-lg">
              <ArrowUp size={14} className="text-green-600" />
              <span className="text-xs font-bold text-green-600">+5 nuevas</span>
            </div>
          </div>
        </div>

        {/* Card: Clientes */}
        <div className="card card-padding relative overflow-hidden group hover:shadow-lg transition-all border-none shadow-sm ring-1 ring-gray-100">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50/50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-6">
              <Users size={24} />
            </div>
            <p className="caption text-gray-500 font-bold uppercase tracking-widest">Nuevos Clientes</p>
            <h3 className="text-3xl font-black text-gray-900 mt-2 tracking-tight">
              {data?.nuevosClientes || 0}
            </h3>
            <div className="mt-4 flex items-center gap-2 bg-amber-50 w-fit px-2 py-1 rounded-lg">
              <TrendingUp size={14} className="text-amber-600" />
              <span className="text-xs font-bold text-amber-600">Periodo activo</span>
            </div>
          </div>
        </div>

        {/* Card: Conversión */}
        <div className="card card-padding relative overflow-hidden group hover:shadow-lg transition-all border-none shadow-sm ring-1 ring-gray-100">
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-50/50 rounded-full -mr-16 -mb-16 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-6">
              <TrendingUp size={24} />
            </div>
            <p className="caption text-gray-500 font-bold uppercase tracking-widest">Tasa de Conversión</p>
            <h3 className="text-3xl font-black text-gray-900 mt-2 tracking-tight">
              {data?.tasaConversion || 0}%
            </h3>
            <div className="mt-4 flex items-center gap-2 bg-purple-50 w-fit px-2 py-1 rounded-lg">
              <CheckCircle size={14} className="text-purple-600" />
              <span className="text-xs font-bold text-purple-600">Meta alcanzada</span>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS - Bold grid layout */}
      <section className="space-y-4">
        <h2 className="caption text-gray-400 font-bold uppercase tracking-widest ml-1">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link to={`/${slug}/admin/reservas`} className="group card card-padding hover:ring-2 hover:ring-blue-600/10 hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus size={24} />
              </div>
              <div>
                <h3 className="body font-bold text-gray-900">Nueva Cita</h3>
                <p className="caption text-gray-500">Agendar servicio</p>
              </div>
            </div>
          </Link>

          <Link to={`/${slug}/admin/clientes`} className="group card card-padding hover:ring-2 hover:ring-green-600/10 hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <div>
                <h3 className="body font-bold text-gray-900">Clientes</h3>
                <p className="caption text-gray-500">Base de datos</p>
              </div>
            </div>
          </Link>

          <Link to={`/${slug}/admin/finanzas`} className="group card card-padding hover:ring-2 hover:ring-amber-600/10 hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp size={24} />
              </div>
              <div>
                <h3 className="body font-bold text-gray-900">Finanzas</h3>
                <p className="caption text-gray-500">Reporte de ingresos</p>
              </div>
            </div>
          </Link>

          <Link to={`/${slug}/admin/site-config`} className="group card card-padding hover:ring-2 hover:ring-purple-600/10 hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Settings size={24} />
              </div>
              <div>
                <h3 className="body font-bold text-gray-900">Sitio Web</h3>
                <p className="caption text-gray-500">Configurar marca</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* AGENDA SECTION */}
      <section className="card shadow-sm border-none ring-1 ring-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="heading-4">Cronograma de Agenda</h2>
            <p className="body-small text-gray-500 mt-1">
              Últimas <strong>{reservas.length}</strong> reservas registradas
            </p>
          </div>
          <Link to={`/${slug}/admin/reservas`} className="btn btn-ghost btn-sm text-blue-600">
            Ver todas <Plus size={14} className="ml-1" />
          </Link>
        </div>

        <div className="card-body p-0">
          {reservas.length === 0 ? (
            <div className="text-center py-24 bg-white">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <Calendar size={40} />
              </div>
              <h3 className="heading-3 text-gray-400">Sin actividad en este rango</h3>
              <p className="body-small text-gray-400 mt-2">Prueba cambiando las fechas o registra una nueva cita.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table whitespace-nowrap">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th>Horario</th>
                    <th>Cliente</th>
                    <th>Profesional</th>
                    <th>Servicio</th>
                    <th>Estatus</th>
                    <th className="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ensureArray(reservas).map((reserva) => (
                    <tr key={reserva._id} className="group hover:bg-gray-50/80 transition-all border-b border-gray-50 last:border-0">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm border border-blue-100">
                            <Clock size={16} />
                          </div>
                          <div>
                            <p className="body-small font-bold text-gray-900">{reserva.fecha}</p>
                            <p className="caption text-gray-500">{reserva.hora}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold border border-gray-200 text-xs">
                            {reserva.clienteNombre?.charAt(0) || "C"}
                          </div>
                          <p className="body-small font-bold text-gray-900">{reserva.clienteNombre}</p>
                        </div>
                      </td>
                      <td className="body-small text-gray-600 font-medium">{reserva.barberoId?.nombre || "Sin asignar"}</td>
                      <td>
                        <p className="body-small font-bold text-black">{reserva.servicioId?.nombre || "N/A"}</p>
                        <p className="caption text-gray-400 uppercase tracking-tighter">{reserva.servicioId?.duracion || "—"} min</p>
                      </td>
                      <td>
                        {reserva.estado === "COMPLETADA" && <span className="badge badge-success">Completada</span>}
                        {reserva.estado === "CONFIRMADA" && <span className="badge badge-primary">Confirmada</span>}
                        {reserva.estado === "RESERVADA" && <span className="badge badge-warning">Reservada</span>}
                        {reserva.estado === "CANCELADA" && <span className="badge badge-error">Cancelada</span>}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2 pr-2">
                          {reserva.estado !== "COMPLETADA" && reserva.estado !== "CANCELADA" && (
                            <>
                              <button
                                onClick={() => handleCompletar(reserva._id)}
                                className="btn btn-ghost btn-sm text-green-600 opacity-0 group-hover:opacity-100 hover:bg-green-50"
                                title="Completar"
                                disabled={completando || cancelando}
                              >
                                {completando ? '...' : <CheckCircle size={18} />}
                              </button>
                              <button
                                onClick={() => handleCancelar(reserva._id)}
                                className="btn btn-ghost btn-sm text-red-600 opacity-0 group-hover:opacity-100 hover:bg-red-50"
                                title="Cancelar"
                                disabled={completando || cancelando}
                              >
                                {cancelando ? '...' : <XCircle size={18} />}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
