import { useEffect, useState, useMemo } from "react";
import dayjs from "dayjs";
import "dayjs/locale/es";
import {
  getAgendaBarbero,
  getAgendaBarberoRange,
  completarReserva,
  cancelarReserva,
} from "../../services/barberoDashboardService";
import { Card, Button, Badge, Skeleton, ConfirmModal } from "../../components/ui";
import { ErrorAlert } from "../../components/ErrorComponents";
import { useApiCall } from "../../hooks/useApiCall";
import { useAsyncAction } from "../../hooks/useAsyncAction";
import { ensureArray } from "../../utils/validateData";
import ViewSwitcher from "../../components/calendar/ViewSwitcher";
import WeeklyView from "../../components/calendar/WeeklyView";
import MonthlyView from "../../components/calendar/MonthlyView";
import {
  Users,
  Scissors,
  DollarSign,
  Clock,
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Filter,
  CalendarCheck,
  Search
} from "lucide-react";
import WhatsAppButton from "../../components/WhatsAppButton";

dayjs.locale("es");

export default function Agenda() {
  // View state
  const [currentView, setCurrentView] = useState('day'); // 'day', 'week', 'month'

  // Date states
  const [fecha, setFecha] = useState(dayjs().format("YYYY-MM-DD"));
  const [weekStart, setWeekStart] = useState(dayjs().startOf('week').format("YYYY-MM-DD"));
  const [monthStart, setMonthStart] = useState(dayjs().startOf('month').format("YYYY-MM-DD"));

  // Data states
  const [reservas, setReservas] = useState([]);
  const [stats, setStats] = useState({ total: 0, compl: 0, pend: 0 });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, reservaId: null });

  // Calculate date range based on current view
  const dateRange = useMemo(() => {
    if (currentView === 'week') {
      const start = dayjs(weekStart);
      const end = start.add(6, 'day');
      return {
        fechaInicio: start.format('YYYY-MM-DD'),
        fechaFin: end.format('YYYY-MM-DD')
      };
    } else if (currentView === 'month') {
      const start = dayjs(monthStart).startOf('month').startOf('week');
      const end = start.add(41, 'day'); // 6 weeks
      return {
        fechaInicio: start.format('YYYY-MM-DD'),
        fechaFin: end.format('YYYY-MM-DD')
      };
    }
    return null;
  }, [currentView, weekStart, monthStart]);

  // Hook para cargar agenda (single date or range)
  const { execute: cargarAgenda, loading, error } = useApiCall(
    async () => {
      if (currentView === 'day') {
        return await getAgendaBarbero(fecha);
      } else {
        return await getAgendaBarberoRange(dateRange.fechaInicio, dateRange.fechaFin);
      }
    },
    {
      errorMessage: 'Error al cargar la agenda. Por favor, intenta nuevamente.',
      onSuccess: (data) => {
        const arrayReservas = ensureArray(data);
        setReservas(arrayReservas);

        setStats({
          total: arrayReservas.length,
          compl: arrayReservas.filter(r => r.estado === 'COMPLETADA').length,
          pend: arrayReservas.filter(r => r.estado === 'RESERVADA').length
        });
      }
    }
  );

  // Hook para completar reserva
  const { execute: onCompletar, loading: completando } = useAsyncAction(
    completarReserva,
    {
      successMessage: '✅ Reserva completada exitosamente',
      errorMessage: 'Error al completar la reserva',
      onSuccess: () => cargarAgenda()
    }
  );

  // Hook para cancelar reserva
  const { execute: onCancelar, loading: cancelando } = useAsyncAction(
    cancelarReserva,
    {
      successMessage: 'Reserva cancelada',
      errorMessage: 'Error al cancelar la reserva',
      onSuccess: () => {
        setConfirmModal({ isOpen: false, reservaId: null });
        cargarAgenda();
      }
    }
  );

  // Load data when view or dates change
  useEffect(() => {
    cargarAgenda();
  }, [currentView, fecha, weekStart, monthStart]);

  // Navigation handlers
  const handlePrevious = () => {
    if (currentView === 'day') {
      setFecha(dayjs(fecha).subtract(1, 'day').format('YYYY-MM-DD'));
    } else if (currentView === 'week') {
      setWeekStart(dayjs(weekStart).subtract(1, 'week').format('YYYY-MM-DD'));
    } else if (currentView === 'month') {
      setMonthStart(dayjs(monthStart).subtract(1, 'month').format('YYYY-MM-DD'));
    }
  };

  const handleNext = () => {
    if (currentView === 'day') {
      setFecha(dayjs(fecha).add(1, 'day').format('YYYY-MM-DD'));
    } else if (currentView === 'week') {
      setWeekStart(dayjs(weekStart).add(1, 'week').format('YYYY-MM-DD'));
    } else if (currentView === 'month') {
      setMonthStart(dayjs(monthStart).add(1, 'month').format('YYYY-MM-DD'));
    }
  };

  const handleToday = () => {
    const today = dayjs();
    setFecha(today.format('YYYY-MM-DD'));
    setWeekStart(today.startOf('week').format('YYYY-MM-DD'));
    setMonthStart(today.startOf('month').format('YYYY-MM-DD'));
  };

  const handleViewChange = (newView) => {
    setCurrentView(newView);
  };

  const handleDateClick = (dateKey) => {
    setFecha(dateKey);
    setCurrentView('day');
  };

  const handleReservaClick = (reserva) => {
    // Could open a modal or navigate to detail view
    console.log('Reserva clicked:', reserva);
  };

  const handleCancelar = () => {
    if (confirmModal.reservaId) {
      onCancelar(confirmModal.reservaId);
    }
  };

  // Get current date label
  const getCurrentLabel = () => {
    if (currentView === 'day') {
      return dayjs(fecha).format('dddd, D [de] MMMM [de] YYYY');
    } else if (currentView === 'week') {
      const start = dayjs(weekStart);
      const end = start.add(6, 'day');
      return `${start.format('D MMM')} - ${end.format('D MMM YYYY')}`;
    } else if (currentView === 'month') {
      return dayjs(monthStart).format('MMMM YYYY');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount || 0);
  };

  // Filter reservas for daily view
  const reservasDia = useMemo(() => {
    if (currentView !== 'day') return [];
    return ensureArray(reservas).filter(r =>
      dayjs(r.fecha).format('YYYY-MM-DD') === fecha
    ).sort((a, b) => a.hora.localeCompare(b.hora));
  }, [reservas, fecha, currentView]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      {/* HEADER AGENDA */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="heading-1 flex items-center gap-3">
            <CalendarCheck className="text-blue-600" size={32} />
            Mi Agenda
          </h1>
          <p className="body-large text-gray-600 mt-2 capitalize">{getCurrentLabel()}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
          {/* View Switcher */}
          <ViewSwitcher currentView={currentView} onViewChange={handleViewChange} />

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 bg-white border border-gray-100 shadow-sm rounded-2xl p-2">
            <Button
              onClick={handlePrevious}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft size={20} />
            </Button>

            <Button
              onClick={handleToday}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-4"
            >
              Hoy
            </Button>

            <Button
              onClick={handleNext}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            >
              <ChevronRight size={20} />
            </Button>
          </div>

          {/* Date Picker (only for day view) */}
          {currentView === 'day' && (
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-2">
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="border-none p-2 text-sm font-semibold text-gray-900 outline-none cursor-pointer bg-transparent"
              />
            </div>
          )}
        </div>
      </header>

      {/* ERROR DISPLAY */}
      {error && (
        <ErrorAlert
          title="Error al cargar agenda"
          message={error}
          onRetry={() => cargarAgenda()}
          variant="error"
        />
      )}

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card card-padding relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <p className="caption text-gray-400 mb-1">Total Citas</p>
              <p className="text-3xl font-black text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <CalendarIcon size={24} />
            </div>
          </div>
        </div>

        <div className="card card-padding relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-50/50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <p className="caption text-gray-400 mb-1">Completadas</p>
              <p className="text-3xl font-black text-green-600">{stats.compl}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
              <CheckCircle size={24} />
            </div>
          </div>
        </div>

        <div className="card card-padding relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50/50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <p className="caption text-gray-400 mb-1">Pendientes</p>
              <p className="text-3xl font-black text-orange-600">{stats.pend}</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
              <Clock size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* CALENDAR VIEWS */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : (
        <>
          {/* DAILY VIEW */}
          {currentView === 'day' && (
            <div className="space-y-4">
              <h2 className="heading-3">Citas del Día</h2>
              {reservasDia.length === 0 ? (
                <Card className="p-12 text-center">
                  <CalendarIcon className="mx-auto text-gray-300 mb-4" size={48} />
                  <p className="text-gray-500 font-medium">No hay citas programadas para este día</p>
                  <p className="text-gray-400 text-sm mt-2">¡Disfruta tu día libre!</p>
                </Card>
              ) : (
                reservasDia.map((r) => (
                  <Card key={r._id} className="p-6 hover:shadow-lg transition-all border-l-4 border-l-blue-500">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-16 h-16 bg-blue-50 rounded-xl flex flex-col items-center justify-center">
                          <span className="text-xs text-gray-500">{dayjs(r.fecha).format('MMM')}</span>
                          <span className="text-2xl font-bold text-blue-600">{dayjs(r.fecha).format('DD')}</span>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock size={16} className="text-gray-400" />
                            <span className="font-bold text-gray-900">{r.hora}</span>
                            <Badge variant={r.estado === 'COMPLETADA' ? 'success' : r.estado === 'CANCELADA' ? 'destructive' : 'primary'}>
                              {r.estado}
                            </Badge>
                          </div>

                          <h4 className="text-gray-900 font-bold">{r.servicioId?.nombre}</h4>
                          <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
                            <Users size={14} /> {r.nombreCliente}
                          </p>
                          {r.telefonoCliente && (
                            <WhatsAppButton
                              phoneNumber={r.telefonoCliente}
                              message={`Hola ${r.nombreCliente}, te contacto sobre tu cita del ${dayjs(r.fecha).format('DD/MM/YYYY')} a las ${r.hora}`}
                              className="mt-2"
                              label={r.telefonoCliente}
                            />
                          )}
                        </div>
                      </div>

                      {r.estado === "RESERVADA" && (
                        <div className="flex gap-2 w-full md:w-auto">
                          <Button
                            onClick={() => onCompletar(r._id)}
                            size="sm"
                            className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white rounded-lg h-10 font-semibold"
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
          )}

          {/* WEEKLY VIEW */}
          {currentView === 'week' && (
            <div>
              <h2 className="heading-3 mb-4">Vista Semanal</h2>
              <WeeklyView
                reservas={reservas}
                weekStart={weekStart}
                onReservaClick={handleReservaClick}
              />
            </div>
          )}

          {/* MONTHLY VIEW */}
          {currentView === 'month' && (
            <div>
              <h2 className="heading-3 mb-4">Vista Mensual</h2>
              <MonthlyView
                reservas={reservas}
                monthStart={monthStart}
                onDateClick={handleDateClick}
              />
            </div>
          )}
        </>
      )}

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
