import { useEffect, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/es";
import {
  getAgendaBarbero,
  completarReserva,
  cancelarReserva,
  getEstadisticasBarbero,
} from "../../services/barberoDashboardService";
import { getMiBalance } from "../../services/transactionService";
import { Card, Button, Badge, Skeleton, Stat, ConfirmModal } from "../../components/ui";
import {
  Users,
  Scissors,
  DollarSign,
  TrendingUp,
  Clock,
  Wallet,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  Calendar,
  ChevronRight,
  BarChart2
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useBarberia } from "../../context/BarberiaContext";
import { toast } from "react-hot-toast";
import { useSSE } from "../../hooks/useSSE";
import { useApiCall } from "../../hooks/useApiCall";
import { useAsyncAction } from "../../hooks/useAsyncAction";
import { ensureArray } from "../../utils/validateData";

dayjs.locale("es");

export default function Dashboard() {
  const { slug } = useParams();
  const { barberia } = useBarberia();
  const [reservas, setReservas] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [balance, setBalance] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, reservaId: null });
  const [shouldRefresh, setShouldRefresh] = useState(false);

  // Conectar a SSE para notificaciones en tiempo real
  const { isConnected } = useSSE({
    enabled: true,
    onEvent: (eventType, data) => {
      console.log('[Dashboard Barbero] Evento SSE:', eventType, data);
      // Refrescar datos cuando hay eventos relevantes
      if (['nueva_reserva', 'cancelacion', 'reserva_completada'].includes(eventType)) {
        setShouldRefresh(true);
      }
    }
  });

  const fecha = dayjs().format("YYYY-MM-DD");

  // Hook para cargar datos del dashboard
  const { execute: cargarDatos, loading, error } = useApiCall(
    async () => {
      const [agendaData, statsData, balanceData] = await Promise.all([
        getAgendaBarbero(fecha),
        getEstadisticasBarbero(),
        getMiBalance().catch(() => null)
      ]);
      return { agendaData, statsData, balanceData };
    },
    {
      errorMessage: 'No se pudo cargar el dashboard',
      onSuccess: ({ agendaData, statsData, balanceData }) => {
        setReservas(ensureArray(agendaData));
        setEstadisticas(statsData);
        setBalance(balanceData);
      }
    }
  );

  // Hook para completar reserva
  const { execute: onCompletar, loading: completando } = useAsyncAction(
    completarReserva,
    {
      successMessage: 'Cita completada',
      errorMessage: 'Error al completar cita',
      onSuccess: () => cargarDatos()
    }
  );

  // Hook para cancelar reserva
  const { execute: handleCancelar, loading: cancelando } = useAsyncAction(
    async () => {
      await cancelarReserva(confirmModal.reservaId);
      setConfirmModal({ isOpen: false, reservaId: null });
    },
    {
      successMessage: 'Cita cancelada',
      errorMessage: 'Error al cancelar cita',
      onSuccess: () => cargarDatos()
    }
  );

  useEffect(() => {
    cargarDatos();
  }, []);

  // Auto-refresh cuando hay cambios
  useEffect(() => {
    if (shouldRefresh) {
      cargarDatos();
      setShouldRefresh(false);
    }
  }, [shouldRefresh]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount || 0);
  };

  if (loading) return (
    <div className="space-y-8 animate-pulse p-4">
      <div className="h-32 bg-gray-100 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl" />)}
      </div>
      <div className="h-96 bg-gray-100 rounded-xl" />
    </div>
  );

  if (error) return (
    <div className="p-12 text-center bg-red-50 border border-red-100 rounded-xl mx-auto max-w-2xl mt-20">
      <h3 className="text-xl font-bold text-gray-900 mb-4">{error}</h3>
      <Button onClick={cargarDatos} variant="primary">Reintentar</Button>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2">
      {/* HEADER BIENVENIDA */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="heading-1 flex items-center gap-3">
            <BarChart2 className="text-blue-600" size={32} />
            Panel de Control
          </h1>
          <p className="body-large text-gray-600 mt-2">
            {barberia?.nombre || "Cargando..."} • {dayjs().format("dddd DD [de] MMMM")}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white border border-gray-100 shadow-sm rounded-2xl p-4 h-fit">
          <div className="text-right">
            <p className="caption text-gray-400">Balance Pendiente</p>
            <p className="text-2xl font-black text-gray-900">{formatCurrency(balance?.pendiente?.totalMontoBarbero)}</p>
          </div>
          <div className="w-px h-10 bg-gray-200" />
          <Link to={`/${slug}/barbero/finanzas`} className="p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-all">
            <ArrowUpRight size={20} />
          </Link>
        </div>
      </header>

      {/* MÉTRICAS PRINCIPALES - Stripe-inspired */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card: Citas Hoy */}
        <div className="card card-padding relative overflow-hidden group hover:shadow-lg transition-all border-none shadow-sm ring-1 ring-gray-100">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6">
              <Calendar size={24} />
            </div>
            <p className="caption text-gray-500">Citas Hoy</p>
            <h3 className="text-3xl font-black text-gray-900 mt-2 tracking-tight">
              {estadisticas?.citas?.hoy || 0}
            </h3>
          </div>
        </div>

        {/* Card: Servicios Mes */}
        <div className="card card-padding relative overflow-hidden group hover:shadow-lg transition-all border-none shadow-sm ring-1 ring-gray-100">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-50/50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 mb-6">
              <Scissors size={24} />
            </div>
            <p className="caption text-gray-500">Servicios Mes</p>
            <h3 className="text-3xl font-black text-gray-900 mt-2 tracking-tight">
              {estadisticas?.citas?.mes || 0}
            </h3>
          </div>
        </div>

        {/* Card: Ganancias Mes */}
        <div className="card card-padding relative overflow-hidden group hover:shadow-lg transition-all border-none shadow-sm ring-1 ring-gray-100">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50/50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-6">
              <DollarSign size={24} />
            </div>
            <p className="caption text-gray-500">Ganancias Mes</p>
            <h3 className="text-3xl font-black text-gray-900 mt-2 tracking-tight">
              {formatCurrency(balance?.total?.totalMontoBarbero || 0)}
            </h3>
          </div>
        </div>

        {/* Card: Tasa Cancelación */}
        <div className="card card-padding relative overflow-hidden group hover:shadow-lg transition-all border-none shadow-sm ring-1 ring-gray-100">
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-50/50 rounded-full -mr-16 -mb-16 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-6">
              <TrendingUp size={24} />
            </div>
            <p className="caption text-gray-500">Tasa Cancelación</p>
            <h3 className="text-3xl font-black text-gray-900 mt-2 tracking-tight">
              {estadisticas?.tasaCancelacion || 0}%
            </h3>
          </div>
        </div>
      </div>

      {/* GRID DE CONTENIDO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* AGENDA DEL DÍA */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="heading-3 flex items-center gap-2">
              <Clock className="text-blue-600" size={20} /> Agenda de Hoy
            </h2>
            <Link to={`/${slug}/barbero/agenda`} className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1">
              Ver Agenda Completa <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ensureArray(reservas).length === 0 ? (
              <div className="col-span-full p-12 text-center bg-gray-50 border border-gray-100 rounded-xl">
                <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">No hay citas programadas para hoy</p>
              </div>
            ) : (
              ensureArray(reservas).map(r => (
                <Card key={r._id} className="p-6 border-gray-200 bg-white hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="px-3 py-1 bg-blue-50 rounded-lg text-blue-600 text-xs font-bold uppercase tracking-wider">
                      {r.hora}
                    </div>
                    <Badge variant={r.estado === 'COMPLETADA' ? 'success' : 'primary'}>
                      {r.estado}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-gray-900 font-bold">{r.servicioId?.nombre}</h4>
                      <p className="text-gray-500 text-sm flex items-center gap-2">
                        <Users size={14} /> {r.nombreCliente}
                      </p>
                    </div>

                    {r.estado === "RESERVADA" && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => onCompletar(r._id)}
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg h-10 font-semibold"
                          disabled={completando || cancelando}
                        >
                          {completando ? 'Completando...' : 'Completar'}
                        </Button>
                        <Button
                          onClick={() => setConfirmModal({ isOpen: true, reservaId: r._id })}
                          variant="ghost"
                          size="sm"
                          className="px-3 border border-gray-200 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-lg"
                          disabled={completando || cancelando}
                        >
                          <XCircle size={18} />
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* SIDEBAR DE ESTADÍSTICAS RÁPIDAS */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-8 border-gray-200 bg-white rounded-xl shadow-sm">
            <h3 className="heading-3 mb-6 flex items-center gap-2">
              <TrendingUp className="text-blue-600" size={20} /> Rendimiento
            </h3>

            <div className="space-y-6">
              <div className="flex justify-between items-center group">
                <div className="space-y-1">
                  <p className="caption text-gray-400">Servicios Totales</p>
                  <p className="text-gray-900 font-bold">{estadisticas?.citas?.total || 0}</p>
                </div>
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <Scissors size={20} />
                </div>
              </div>

              <div className="flex justify-between items-center group">
                <div className="space-y-1">
                  <p className="caption text-gray-400">Ticket Promedio</p>
                  <p className="text-gray-900 font-bold">
                    {formatCurrency(estadisticas?.citas?.mes > 0
                      ? estadisticas?.ingresos?.mes / estadisticas?.citas?.mes
                      : 0)}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                  <DollarSign size={20} />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <p className="caption text-gray-400 mb-4">Servicios Populares</p>
                <div className="space-y-3">
                  {ensureArray(estadisticas?.serviciosPopulares).length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No hay datos suficientes aún</p>
                  ) : (
                    ensureArray(estadisticas?.serviciosPopulares).slice(0, 3).map((s, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 font-medium">{s.nombre}</span>
                        <span className="text-gray-900 font-bold">{s.cantidad}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-blue-600 text-white border-none rounded-xl relative overflow-hidden group shadow-lg">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <TrendingUp size={80} strokeWidth={3} />
            </div>
            <div className="relative z-10 space-y-4">
              <h3 className="font-black text-xl leading-tight">Tu perfil está <br />visible</h3>
              <p className="text-blue-100 text-sm">Mantén tus especialidades actualizadas para atraer más clientes.</p>
              <Link to={`/${slug}/barbero/perfil`}>
                <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-lg mt-2">
                  Actualizar Perfil
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, reservaId: null })}
        onConfirm={handleCancelar}
        title="¿Cancelar cita?"
        message="Esta acción no se puede deshacer. El cliente será notificado de la cancelación."
        confirmText="Sí, cancelar"
        cancelText="No, mantener"
        variant="danger"
      />
    </div>
  );
}

